import { EditorNav } from "@/components/editor/editor-nav";
import { ThemeForm } from "./theme-form";
import { PageShell } from "@/components/shared/page-shell";
import type { ThemeConfig } from "@/core/types/page";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";

export default async function ThemeEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);
  const theme = (business.theme as ThemeConfig) ?? {
    mode: "system",
    primaryColor: business.themePrimary,
    accentColor: "#be185d",
    fontFamily: "Inter",
    borderRadius: "12px",
  };

  return (
    <>
      <EditorNav active="/editor/theme" />
      <PageShell maxWidth="md" className="py-8">
        <h1 className="text-xl font-bold">Theme settings</h1>
        <div className="mt-6">
          <ThemeForm businessId={business.id} initialTheme={theme} />
        </div>
      </PageShell>
    </>
  );
}