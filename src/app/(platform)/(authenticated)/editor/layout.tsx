import type { ReactNode } from "react";

export default function EditorLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-brand-mist">{children}</div>;
}