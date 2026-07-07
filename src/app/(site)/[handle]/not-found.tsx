import Link from "next/link";

export default function SiteNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Site not found</h1>
      <p className="mt-2 text-slate-600">This mini-site is unavailable or not published yet.</p>
      <Link href="/" className="mt-6 text-sm font-semibold text-slate-900 underline">
        Back to ALINKS
      </Link>
    </main>
  );
}