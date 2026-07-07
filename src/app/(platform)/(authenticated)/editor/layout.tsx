import type { ReactNode } from "react";

export default function EditorLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-50">{children}</div>;
}