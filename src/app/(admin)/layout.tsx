import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireSuperadmin } from "@/platform/auth/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireSuperadmin();
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminNav />
      {children}
    </div>
  );
}