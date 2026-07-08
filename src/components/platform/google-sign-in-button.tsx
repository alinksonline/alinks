import { isGoogleAuthConfigured } from "@/platform/auth/auth-mode";

export function GoogleSignInButton({ label = "Continue with Google" }: { label?: string }) {
  if (!isGoogleAuthConfigured()) return null;

  return (
    <a
      href="/api/auth/google"
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-brand-ink/12 bg-white px-4 py-3 text-sm font-semibold text-brand-ink shadow-sm transition hover:bg-brand-mist/60"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.083 36 24 36c-5.514 0-10-4.486-10-10s4.486-10 10-10c2.84 0 5.405 1.197 7.188 3.113l5.657-5.657C34.047 10.846 29.268 8 24 8 12.955 8 4 16.955 4 28s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c2.84 0 5.405 1.197 7.188 3.113l5.657-5.657C34.047 10.846 29.268 8 24 8c-7.682 0-14.268 4.337-17.694 10.691z" />
        <path fill="#4CAF50" d="M24 48c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 39.091 26.715 40 24 40c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 43.556 16.227 48 24 48z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C42.022 35.026 44 32.054 44 28c0-1.341-.138-2.65-.389-3.917z" />
      </svg>
      {label}
    </a>
  );
}