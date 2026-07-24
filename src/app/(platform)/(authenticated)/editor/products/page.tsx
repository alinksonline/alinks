import { redirect } from "next/navigation";
import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { canShowRetailStore } from "@/core/utils/industry-gates";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getStoreProductsForBusiness } from "@/app/actions/retail";
import { ProductsEditorPanel } from "./products-editor-panel";

/** Retail product catalog — storefront MVP. No multi-outlet POS. */
export default async function ProductsEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  if (
    !canShowRetailStore({
      vertical: business.vertical,
      industryGroup: business.industryGroup,
    })
  ) {
    redirect("/editor");
  }

  const products = await getStoreProductsForBusiness(business.id);

  return (
    <>
      <EditorNav
        active="/editor/products"
        vertical={business.vertical}
        industryGroup={business.industryGroup}
      />
      <PageShell className="py-4 pb-10">
        <p className="premium-label">Retail</p>
        <h1 className="premium-heading mt-1 text-lg">Products</h1>
        <p className="premium-subtext mt-1.5 max-w-sm">
          Open categories — sell kitchen, fashion, electronics, grocery, anything legal. Trade mode is{" "}
          <strong>retail</strong> on the public shop (wholesale UI later). One online shop — not multi-outlet
          POS.
        </p>
        <ProductsEditorPanel
          businessId={business.id}
          handle={business.handle}
          products={products}
          tradeMode={business.tradeMode ?? "retail"}
        />
      </PageShell>
    </>
  );
}
