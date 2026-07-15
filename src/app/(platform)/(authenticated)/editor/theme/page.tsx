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
      <EditorNav active="/editor/theme" vertical={business.vertical} />
      <PageShell className="py-3">
        <h1 className="text-base font-bold tracking-tight text-brand-ink">Theme</h1>
        <p className="mt-0.5 text-[11px] text-brand-muted">
          Full layout base for your public site — 100% of pages use this theme.
        </p>
        <div className="mt-3">
          <ThemeForm
            businessId={business.id}
            initialTheme={{
              mode: theme.mode ?? "light",
              primaryColor: theme.primaryColor || "#0f172a",
              accentColor: theme.accentColor || "#7c3aed",
              fontFamily: theme.fontFamily || "Inter",
              borderRadius: theme.borderRadius || "12px",
            }}
          />
        </div>
      </PageShell>
    </>
  );
}