"use server";

import { eq } from "drizzle-orm";
import type { CartItem } from "@/core/types/commerce";
import { cartRequiresAddress } from "@/core/utils/order-fulfillment";
import { getPlatformDb } from "@/platform/db/client";
import { businesses } from "@/platform/db/schema";
import { getStorageAdapter } from "@/tenant/storage/get-adapter";
import { writeToTenantStorage } from "@/tenant/storage/write-service";
import { getShopClient } from "@/app/actions/client-auth";

export type PublicOrder = {
  orderId: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryStatus: string;
  canCancel: boolean;
  canModify: boolean;
};

function digits(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function asString(row: Record<string, string | number | boolean>, ...keys: string[]): string {
  for (const key of keys) {
    const v = row[key];
    if (v !== undefined && v !== null && String(v).trim()) return String(v);
  }
  return "";
}

function parseItems(raw: string): CartItem[] {
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapRow(row: Record<string, string | number | boolean>): Omit<PublicOrder, "canCancel" | "canModify"> {
  const items = parseItems(asString(row, "items", "items_json"));
  const totalRaw = row.total ?? row.total_paise;
  const total =
    typeof totalRaw === "number"
      ? totalRaw > 1000 && !row.total
        ? totalRaw / 100
        : totalRaw
      : Number(totalRaw || 0);
  return {
    orderId: asString(row, "orderId", "order_id"),
    createdAt: asString(row, "createdAt", "created_at"),
    items,
    total,
    paymentMethod: asString(row, "paymentMethod", "payment_method"),
    paymentStatus: asString(row, "paymentStatus", "payment_status"),
    orderStatus: asString(row, "orderStatus", "status") || "placed",
    customerName: asString(row, "customerName", "customer_name", "name"),
    customerPhone: digits(asString(row, "customerPhone", "customer_phone", "phone")),
    customerAddress: asString(row, "customerAddress", "customer_address"),
    deliveryStatus: asString(row, "deliveryStatus", "delivery_status") || "pending",
  };
}

function latestByOrderId(
  rows: Omit<PublicOrder, "canCancel" | "canModify">[],
): Omit<PublicOrder, "canCancel" | "canModify">[] {
  const map = new Map<string, Omit<PublicOrder, "canCancel" | "canModify">>();
  for (const row of rows) {
    if (!row.orderId) continue;
    const prev = map.get(row.orderId);
    if (!prev || row.createdAt >= prev.createdAt) map.set(row.orderId, row);
  }
  return Array.from(map.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function loadBusiness(handle: string) {
  const db = getPlatformDb();
  if (!db) return null;
  const row = (await db.select().from(businesses).where(eq(businesses.handle, handle)).limit(1))[0];
  return row ?? null;
}

function orderClosed(order: { orderStatus: string; paymentStatus: string; deliveryStatus: string }): boolean {
  return (
    order.orderStatus === "cancelled" ||
    order.paymentStatus === "declined" ||
    order.deliveryStatus === "delivered" ||
    order.deliveryStatus === "out_for_delivery"
  );
}

function withPolicy(
  order: Omit<PublicOrder, "canCancel" | "canModify">,
  biz: { customerCancelOrders: boolean; customerModifyOrders: boolean },
): PublicOrder {
  const closed = orderClosed(order);
  return {
    ...order,
    canCancel: Boolean(biz.customerCancelOrders) && !closed,
    canModify: Boolean(biz.customerModifyOrders) && !closed,
  };
}

async function requireShopPhone(handle: string): Promise<{ phone: string } | { error: string }> {
  const client = await getShopClient(handle);
  if (!client) return { error: "Log in with the mobile number used at checkout" };
  return { phone: client.phone };
}

export async function lookupOrdersByPhoneAction(handle: string, phone: string) {
  try {
    const session = await requireShopPhone(handle);
    if ("error" in session) return { success: false as const, error: session.error };
    const digitsPhone = session.phone;
    if (digits(phone) && digits(phone) !== digitsPhone) {
      return { success: false as const, error: "Use the logged-in mobile number" };
    }
    const biz = await loadBusiness(handle);
    if (!biz?.isPublished) return { success: false as const, error: "Store not found" };

    const adapter = await getStorageAdapter(biz.id);
    const rows = await adapter.readRows("Orders");
    const matched = latestByOrderId(
      rows.map(mapRow).filter((r) => r.customerPhone === digitsPhone),
    ).map((r) => withPolicy(r, biz));

    return { success: true as const, orders: matched };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Lookup failed" };
  }
}

export async function cancelCustomerOrderAction(input: {
  handle: string;
  orderId: string;
  phone: string;
}) {
  try {
    const session = await requireShopPhone(input.handle);
    if ("error" in session) return { success: false as const, error: session.error };
    const digitsPhone = session.phone;
    const biz = await loadBusiness(input.handle);
    if (!biz?.isPublished) return { success: false as const, error: "Store not found" };
    if (!biz.customerCancelOrders) {
      return { success: false as const, error: "This shop does not allow online cancellation" };
    }

    const adapter = await getStorageAdapter(biz.id);
    const found = latestByOrderId( (await adapter.readRows("Orders")).map(mapRow) ).find(
      (r) => r.orderId === input.orderId && r.customerPhone === digitsPhone,
    );
    if (!found) return { success: false as const, error: "Order not found for this phone number" };
    if (orderClosed(found)) {
      return { success: false as const, error: "This order can no longer be cancelled" };
    }

    await writeToTenantStorage(biz.id, "Orders", {
      orderId: found.orderId,
      total: found.total,
      paymentMethod: found.paymentMethod,
      paymentStatus: found.paymentStatus,
      orderStatus: "cancelled",
      customerName: found.customerName,
      customerPhone: found.customerPhone,
      customerAddress: found.customerAddress,
      items: JSON.stringify(found.items),
      createdAt: new Date().toISOString(),
      notes: "customer_cancelled",
    });

    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Cancel failed" };
  }
}

export async function modifyCustomerOrderAction(input: {
  handle: string;
  orderId: string;
  phone: string;
  items: CartItem[];
  customerAddress?: string;
}) {
  try {
    const session = await requireShopPhone(input.handle);
    if ("error" in session) return { success: false as const, error: session.error };
    const digitsPhone = session.phone;
    const biz = await loadBusiness(input.handle);
    if (!biz?.isPublished) return { success: false as const, error: "Store not found" };
    if (!biz.customerModifyOrders) {
      return { success: false as const, error: "This shop does not allow online changes" };
    }

    const adapter = await getStorageAdapter(biz.id);
    const found = latestByOrderId((await adapter.readRows("Orders")).map(mapRow)).find(
      (r) => r.orderId === input.orderId && r.customerPhone === digitsPhone,
    );
    if (!found) return { success: false as const, error: "Order not found for this phone number" };
    if (orderClosed(found)) {
      return { success: false as const, error: "This order can no longer be changed" };
    }

    const original = new Map(found.items.map((item) => [item.productId, item]));
    const items: CartItem[] = [];
    for (const line of input.items) {
      const qty = Math.floor(Number(line.qty) || 0);
      if (qty <= 0) continue;
      const source = original.get(line.productId);
      if (!source) {
        return { success: false as const, error: "You can only change quantities on items already in this order" };
      }
      items.push({ ...source, qty: Math.min(qty, 99) });
    }
    if (items.length === 0) return { success: false as const, error: "Keep at least one item, or cancel the order" };
    if (cartRequiresAddress(items) && !(input.customerAddress ?? found.customerAddress).trim()) {
      return { success: false as const, error: "Address is required for this order" };
    }

    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    await writeToTenantStorage(biz.id, "Orders", {
      orderId: found.orderId,
      total,
      paymentMethod: found.paymentMethod,
      paymentStatus: found.paymentStatus,
      orderStatus: "modified",
      customerName: found.customerName,
      customerPhone: found.customerPhone,
      customerAddress: (input.customerAddress ?? found.customerAddress).trim(),
      items: JSON.stringify(items),
      createdAt: new Date().toISOString(),
      notes: "customer_modified",
    });

    return { success: true as const, total };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Update failed" };
  }
}
