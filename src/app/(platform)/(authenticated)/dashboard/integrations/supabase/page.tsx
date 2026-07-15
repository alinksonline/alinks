import { redirect } from "next/navigation";

/** Supabase connect lives on Data hub. */
export default function SupabaseIntegrationRedirect() {
  redirect("/dashboard/data");
}
