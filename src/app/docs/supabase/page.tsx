import { redirect } from "next/navigation";

/** Old path — keep for anyone who already has the URL. */
export default function DocsSupabaseRedirect() {
  redirect("/32/doc/supabase");
}
