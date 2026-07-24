"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  canEnableFoodModule,
  channelAllowedForFoodType,
  resolveFoodType,
  type FoodChannel,
} from "@/core/config/food-compat";
import {
  foodChannelModuleSku,
  missingModuleMessage,
} from "@/core/config/module-gates";
import { getSession } from "@/platform/auth/session";
import { hasModule, listEntitledSkus } from "@/platform/billing/entitlements";
import { assertBusinessOwnership } from "@/platform/business/require-business";
import { getPlatformDb } from "@/platform/db/client";
import { businesses, foodOrderTickets, foodTables } from "@/platform/db/schema";
import { writeToTenantStorage } from "@/tenant/storage/write-service";

export type FoodOrderItem = { id?: string; name: string; qty: number; price: number };

export type FoodTicketStatus =
  | "new"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

function orderCode(): string {
  return `F${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export async function getFoodChannelsForBusiness(businessId: string) {
  const db = getPlatformDb();
  if (!db) return null;
  const biz = (await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1))[0];
  if (!biz) return null;
  const foodType = resolveFoodType(biz.industryType, biz.vertical);
  const entitled = await listEntitledSkus(businessId);
  const hasPickup = entitled.includes("food.pickup");
  const hasDelivery = entitled.includes("food.delivery");
  const hasDineIn = entitled.includes("food.dine_in");
  const typeOkDineIn = canEnableFoodModule(foodType, "food.dine_in");
  return {
    foodType,
    dineInAllowed: typeOkDineIn,
    /** Module purchased / entitled (Select modules). */
    modulePickup: hasPickup,
    moduleDelivery: hasDelivery,
    moduleDineIn: hasDineIn && typeOkDineIn,
    pickupEnabled: biz.foodPickupEnabled && hasPickup,
    deliveryEnabled: biz.foodDeliveryEnabled && hasDelivery,
    dineInEnabled: biz.foodDineInEnabled && hasDineIn && typeOkDineIn,
    pickupInstructions: biz.foodPickupInstructions,
    deliveryInstructions: biz.foodDeliveryInstructions,
    entitledSkus: entitled,
  };
}

export async function getPublicFoodChannels(handle: string) {
  const db = getPlatformDb();
  if (!db) return null;
  const biz = (await db.select().from(businesses).where(eq(businesses.handle, handle)).limit(1))[0];
  if (!biz || !biz.isPublished) return null;
  const foodType = resolveFoodType(biz.industryType, biz.vertical);
  const entitled = await listEntitledSkus(biz.id);
  const hasPickup = entitled.includes("food.pickup");
  const hasDelivery = entitled.includes("food.delivery");
  const hasDineIn = entitled.includes("food.dine_in");
  return {
    businessId: biz.id,
    foodType,
    pickupEnabled:
      biz.foodPickupEnabled &&
      hasPickup &&
      channelAllowedForFoodType(foodType, "pickup"),
    deliveryEnabled:
      biz.foodDeliveryEnabled &&
      hasDelivery &&
      channelAllowedForFoodType(foodType, "delivery"),
    dineInEnabled:
      biz.foodDineInEnabled &&
      hasDineIn &&
      canEnableFoodModule(foodType, "food.dine_in"),
    pickupInstructions: biz.foodPickupInstructions,
    deliveryInstructions: biz.foodDeliveryInstructions,
  };
}

export async function updateFoodChannelsAction(input: {
  businessId: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  dineInEnabled: boolean;
  pickupInstructions?: string;
  deliveryInstructions?: string;
}) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(input.businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const biz = (
      await db.select().from(businesses).where(eq(businesses.id, input.businessId)).limit(1)
    )[0];
    if (!biz) return { success: false as const, error: "Not found" };

    const foodType = resolveFoodType(biz.industryType, biz.vertical);
    if (input.dineInEnabled && !canEnableFoodModule(foodType, "food.dine_in")) {
      return {
        success: false as const,
        error: "Restaurant Dine-in is not available for cloud kitchen / catering-only types.",
      };
    }

    // Paid SKUs required — do not auto-grant entitlements from channel toggles
    if (input.pickupEnabled && !(await hasModule(input.businessId, "food.pickup"))) {
      return { success: false as const, error: missingModuleMessage("food.pickup") };
    }
    if (input.deliveryEnabled && !(await hasModule(input.businessId, "food.delivery"))) {
      return { success: false as const, error: missingModuleMessage("food.delivery") };
    }
    if (
      input.dineInEnabled &&
      canEnableFoodModule(foodType, "food.dine_in") &&
      !(await hasModule(input.businessId, "food.dine_in"))
    ) {
      return { success: false as const, error: missingModuleMessage("food.dine_in") };
    }

    await db
      .update(businesses)
      .set({
        foodPickupEnabled: input.pickupEnabled,
        foodDeliveryEnabled: input.deliveryEnabled,
        foodDineInEnabled: input.dineInEnabled && canEnableFoodModule(foodType, "food.dine_in"),
        foodPickupInstructions: input.pickupInstructions?.trim() || null,
        foodDeliveryInstructions: input.deliveryInstructions?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, input.businessId));

    revalidatePath("/editor/menu");
    revalidatePath("/dashboard/orders");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function listFoodTablesAction(businessId: string) {
  const db = getPlatformDb();
  if (!db) return [];
  return db.select().from(foodTables).where(eq(foodTables.businessId, businessId));
}

export async function addFoodTableAction(businessId: string, label: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const biz = (await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1))[0];
    const foodType = resolveFoodType(biz?.industryType, biz?.vertical);
    if (!canEnableFoodModule(foodType, "food.dine_in")) {
      return { success: false as const, error: "Tables only for restaurant dine-in types" };
    }
    if (!(await hasModule(businessId, "food.dine_in"))) {
      return { success: false as const, error: missingModuleMessage("food.dine_in") };
    }

    const clean = label.trim() || "Table";
    const code = clean
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 12) || `T${Date.now().toString(36).slice(-4).toUpperCase()}`;

    await db.insert(foodTables).values({
      businessId,
      label: clean,
      code,
      isActive: true,
    });

    revalidatePath("/editor/menu");
    return { success: true as const, code };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function deleteFoodTableAction(businessId: string, tableId: string) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };
    await db
      .delete(foodTables)
      .where(and(eq(foodTables.id, tableId), eq(foodTables.businessId, businessId)));
    revalidatePath("/editor/menu");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function resolveFoodTableByCode(handle: string, code: string) {
  const db = getPlatformDb();
  if (!db || !code) return null;
  const biz = (await db.select().from(businesses).where(eq(businesses.handle, handle)).limit(1))[0];
  if (!biz) return null;
  const foodType = resolveFoodType(biz.industryType, biz.vertical);
  if (!biz.foodDineInEnabled || !canEnableFoodModule(foodType, "food.dine_in")) return null;
  if (!(await hasModule(biz.id, "food.dine_in"))) return null;
  return (
    await db
      .select()
      .from(foodTables)
      .where(
        and(
          eq(foodTables.businessId, biz.id),
          eq(foodTables.code, code.toUpperCase()),
          eq(foodTables.isActive, true),
        ),
      )
      .limit(1)
  )[0] ?? null;
}

export async function placeFoodOrderAction(input: {
  handle: string;
  channel: FoodChannel;
  items: FoodOrderItem[];
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  notes?: string;
  tableCode?: string;
}) {
  try {
    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    const biz = (
      await db.select().from(businesses).where(eq(businesses.handle, input.handle)).limit(1)
    )[0];
    if (!biz || !biz.isPublished) return { success: false as const, error: "Not found" };

    const foodType = resolveFoodType(biz.industryType, biz.vertical);
    const channel = input.channel;

    if (channel === "whatsapp") {
      return { success: false as const, error: "Use WhatsApp CTA for chat orders" };
    }
    if (!channelAllowedForFoodType(foodType, channel)) {
      return { success: false as const, error: "Channel not available for this kitchen type" };
    }
    const channelSku = foodChannelModuleSku(channel);
    if (channelSku && !(await hasModule(biz.id, channelSku))) {
      return { success: false as const, error: missingModuleMessage(channelSku) };
    }
    if (channel === "pickup" && !biz.foodPickupEnabled) {
      return { success: false as const, error: "Pickup is not enabled" };
    }
    if (channel === "delivery" && !biz.foodDeliveryEnabled) {
      return { success: false as const, error: "Delivery is not enabled" };
    }
    if (channel === "dine_in") {
      if (!biz.foodDineInEnabled || !canEnableFoodModule(foodType, "food.dine_in")) {
        return { success: false as const, error: "Dine-in is not available" };
      }
    }

    const items = input.items.filter((i) => i.qty > 0 && i.name);
    if (!items.length) return { success: false as const, error: "Add items to order" };

    const name = input.customerName.trim();
    if (name.length < 2) return { success: false as const, error: "Name required" };

    if (channel === "delivery") {
      const phone = (input.customerPhone ?? "").replace(/\D/g, "");
      if (phone.length < 10) return { success: false as const, error: "Phone required for delivery" };
      if (!(input.customerAddress ?? "").trim()) {
        return { success: false as const, error: "Address required for delivery" };
      }
    }

    let tableId: string | null = null;
    let tableLabel: string | null = null;
    if (channel === "dine_in") {
      if (!input.tableCode?.trim()) {
        return { success: false as const, error: "Scan a table QR or enter table code" };
      }
      const table = (
        await db
          .select()
          .from(foodTables)
          .where(
            and(
              eq(foodTables.businessId, biz.id),
              eq(foodTables.code, input.tableCode.trim().toUpperCase()),
              eq(foodTables.isActive, true),
            ),
          )
          .limit(1)
      )[0];
      if (!table) return { success: false as const, error: "Unknown table code" };
      tableId = table.id;
      tableLabel = table.label;
    }

    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const code = orderCode();

    const [ticket] = await db
      .insert(foodOrderTickets)
      .values({
        businessId: biz.id,
        orderCode: code,
        channel,
        status: "new",
        tableId,
        tableLabel,
        items,
        total,
        notes: input.notes?.trim() || null,
        customerName: name,
      })
      .returning();

    // Full row to tenant storage (Orders)
    await writeToTenantStorage(biz.id, "Orders", {
      orderId: ticket.id,
      orderCode: code,
      channel,
      status: "new",
      tableLabel: tableLabel ?? "",
      total,
      items: JSON.stringify(items),
      customerName: name,
      customerPhone: (input.customerPhone ?? "").replace(/\D/g, ""),
      customerAddress: input.customerAddress?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
      paymentMethod: "offline",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
    });

    return {
      success: true as const,
      orderCode: code,
      orderId: ticket.id,
      total,
    };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Order failed" };
  }
}

export async function listFoodOrdersAction(businessId: string, includeDone = false) {
  const db = getPlatformDb();
  if (!db) return [];
  if (includeDone) {
    return db
      .select()
      .from(foodOrderTickets)
      .where(eq(foodOrderTickets.businessId, businessId))
      .orderBy(desc(foodOrderTickets.createdAt))
      .limit(100);
  }
  return db
    .select()
    .from(foodOrderTickets)
    .where(
      and(
        eq(foodOrderTickets.businessId, businessId),
        inArray(foodOrderTickets.status, ["new", "preparing", "ready", "out_for_delivery"]),
      ),
    )
    .orderBy(desc(foodOrderTickets.createdAt))
    .limit(80);
}

export async function updateFoodOrderStatusAction(
  businessId: string,
  orderId: string,
  status: FoodTicketStatus,
) {
  try {
    const session = await getSession();
    if (!session) return { success: false as const, error: "Unauthorized" };
    await assertBusinessOwnership(businessId, session.userId);

    const db = getPlatformDb();
    if (!db) return { success: false as const, error: "Database not connected" };

    await db
      .update(foodOrderTickets)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(foodOrderTickets.id, orderId), eq(foodOrderTickets.businessId, businessId)));

    revalidatePath("/dashboard/orders");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: e instanceof Error ? e.message : "Failed" };
  }
}

