import { redirect } from "next/navigation";
import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { canShowFoodMenu } from "@/core/utils/industry-gates";
import { resolveFoodType, FOOD_TYPE_DEFS, canEnableFoodModule } from "@/core/config/food-compat";
import { getEnv } from "@/core/config/env";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getMenuItemsForBusiness } from "@/app/actions/food";
import { getFoodChannelsForBusiness, listFoodTablesAction } from "@/app/actions/food-ops";
import { MenuEditorPanel } from "./menu-editor-panel";
import { FoodChannelsPanel } from "./food-channels-panel";

/** Food menu + ops channels (pickup / delivery / dine-in). */
export default async function MenuEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  if (
    !canShowFoodMenu({
      vertical: business.vertical,
      industryGroup: business.industryGroup,
    })
  ) {
    redirect("/editor");
  }

  const items = await getMenuItemsForBusiness(business.id);
  const foodType = resolveFoodType(business.industryType, business.vertical);
  const typeDef = FOOD_TYPE_DEFS[foodType];
  const channels = await getFoodChannelsForBusiness(business.id);
  const tables = await listFoodTablesAction(business.id);
  const appUrl = getEnv().NEXT_PUBLIC_APP_URL;
  const dineInAllowed = canEnableFoodModule(foodType, "food.dine_in");

  return (
    <>
      <EditorNav
        active="/editor/menu"
        vertical={business.vertical}
        industryGroup={business.industryGroup}
      />
      <PageShell className="py-4 pb-10">
        <p className="premium-label">{typeDef.label}</p>
        <h1 className="premium-heading mt-1 text-lg">{typeDef.catalogLabel} & channels</h1>
        <p className="premium-subtext mt-1.5 max-w-sm">
          Digital menu always works with WhatsApp. Enable pickup, delivery, or Restaurant Dine-in for the
          kitchen ticket board.
          {!typeDef.dineInAllowed
            ? " Dine-in / table QR is blocked for cloud kitchen types."
            : " Dine-in uses table QR codes on your floor."}
        </p>
        <FoodChannelsPanel
          businessId={business.id}
          handle={business.handle}
          dineInAllowed={dineInAllowed}
          appUrl={appUrl}
          tables={tables}
          modules={{
            pickup: channels?.modulePickup ?? false,
            delivery: channels?.moduleDelivery ?? false,
            dineIn: channels?.moduleDineIn ?? false,
          }}
          initial={{
            pickupEnabled: channels?.pickupEnabled ?? false,
            deliveryEnabled: channels?.deliveryEnabled ?? false,
            dineInEnabled: channels?.dineInEnabled ?? false,
            pickupInstructions: channels?.pickupInstructions ?? null,
            deliveryInstructions: channels?.deliveryInstructions ?? null,
          }}
        />
        <MenuEditorPanel businessId={business.id} items={items} handle={business.handle} />
      </PageShell>
    </>
  );
}
