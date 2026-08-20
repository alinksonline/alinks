"use server";

import { getSession } from "@/platform/auth/session";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { getStorageAdapter } from "@/tenant/storage/get-adapter";
import { writeToTenantStorage } from "@/tenant/storage/write-service";
import { isDeliveryStatus } from "@/core/utils/catalog-mode";

export type ShopOrderRow = {
  orderId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  itemsLabel: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryStatus: string;
  deliveryPartner: string;
  trackingId: string;
  trackingUrl: string;
};

export type ShopClientRow = {
  phone: string;
  name: string;
  orderCount: number;
  lastOrderAt: string;
};

function str(row: Record<string, string | number | boolean>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && String(v).trim()) return String(v);
  }
  return "";
}

function parseItemsLabel(raw: string): string {
  try {
    const items = JSON.parse(raw) as Array<{ name?: string; qty?: number }>;
    if (!Array.isArray(items)) return raw.slice(0, 80);
    return items.map((i) => `${i.qty ?? 1}× ${i.name ?? "item"}`).join(", ");
  } catch {
    return raw.slice(0, 80);
  }
}

export async function listShopOrdersAction(businessId: string, phoneFilter?: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);

    const adapter = await getStorageAdapter(businessId);
    const rows = await adapter.readRows("Orders");
    const latest = new Map<string, ShopOrderRow>();
    for (const row of rows) {
      const orderId = str(row, "orderId", "order_id");
      if (!orderId) continue;
      const createdAt = str(row, "createdAt", "created_at");
      const mapped: ShopOrderRow = {
        orderId,
        createdAt,
        customerName: str(row, "customerName", "customer_name", "name"),
        customerPhone: str(row, "customerPhone", "customer_phone", "phone").replace(/\D/g, "").slice(-10),
        customerAddress: str(row, "customerAddress", "customer_address"),
        itemsLabel: parseItemsLabel(str(row, "items", "items_json")),
        total: Number(row.total ?? (row.total_paise ? Number(row.total_paise) / 100 : 0)),
        paymentMethod: str(row, "paymentMethod", "payment_method"),
        paymentStatus: str(row, "paymentStatus", "payment_status"),
        orderStatus: str(row, "orderStatus", "status") || "placed",
        deliveryStatus: str(row, "deliveryStatus", "delivery_status") || "pending",
        deliveryPartner: str(row, "deliveryPartner", "delivery_partner"),
        trackingId: str(row, "trackingId", "tracking_id"),
        trackingUrl: str(row, "trackingUrl", "tracking_url"),
      };
      const prev = latest.get(orderId);
      if (!prev || createdAt >= prev.createdAt) latest.set(orderId, mapped);
    }
    const want = phoneFilter?.replace(/\D/g, "").slice(-10);
    const orders = Array.from(latest.values())
      .filter((o) => !want || o.customerPhone === want)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return { success: true as const, orders };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Could not load orders" };
  }
}

export async function listShopClientsAction(businessId: string) {
  const listed = await listShopOrdersAction(businessId);
  if (!listed.success) return listed;
  const map = new Map<string, ShopClientRow>();
  for (const o of listed.orders) {
    if (!o.customerPhone) continue;
    const prev = map.get(o.customerPhone);
    if (!prev) {
      map.set(o.customerPhone, {
        phone: o.customerPhone,
        name: o.customerName,
        orderCount: 1,
        lastOrderAt: o.createdAt,
      });
    } else {
      prev.orderCount += 1;
      if (o.createdAt > prev.lastOrderAt) {
        prev.lastOrderAt = o.createdAt;
        prev.name = o.customerName || prev.name;
      }
    }
  }
  const clients = Array.from(map.values()).sort((a, b) => (a.lastOrderAt < b.lastOrderAt ? 1 : -1));
  return { success: true as const, clients };
}

export async function updateShopOrderDeliveryAction(input: {
  businessId: string;
  orderId: string;
  phone: string;
  deliveryStatus: string;
  deliveryPartner?: string;
  trackingId?: string;
  trackingUrl?: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(input.businessId, session.userId);
    if (!isDeliveryStatus(input.deliveryStatus)) {
      return { success: false as const, error: "Unknown delivery status" };
    }

    const listed = await listShopOrdersAction(input.businessId, input.phone);
    if (!listed.success) return listed;
    const found = listed.orders.find((o) => o.orderId === input.orderId);
    if (!found) return { success: false as const, error: "Order not found" };

    await writeToTenantStorage(input.businessId, "Orders", {
      orderId: found.orderId,
      total: found.total,
      paymentMethod: found.paymentMethod,
      paymentStatus: found.paymentStatus,
      orderStatus: found.orderStatus,
      customerName: found.customerName,
      customerPhone: found.customerPhone,
      customerAddress: found.customerAddress,
      items: found.itemsLabel,
      deliveryStatus: input.deliveryStatus,
      deliveryPartner: (input.deliveryPartner ?? found.deliveryPartner).trim(),
      trackingId: (input.trackingId ?? "").trim(),
      trackingUrl: (input.trackingUrl ?? "").trim(),
      createdAt: new Date().toISOString(),
      notes: "tenant_delivery_update",
    });

    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Update failed" };
  }
}
