import type { ReactNode } from "react";

/**
 * Website builder shell — always phone-width (via MobileAppShell parent).
 * Extra bottom padding so sticky editor actions clear the tab bar.
 */
export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="editor-mobile-shell min-h-0 min-w-0 overflow-x-hidden bg-brand-mist">
      {children}
    </div>
  );
}
