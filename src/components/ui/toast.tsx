"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/core/utils/cn";

export type ToastTone = "success" | "error" | "info" | "warning";

export type ToastInput = {
  title?: string;
  description?: string;
  tone?: ToastTone;
  /** ms — default 3800 */
  duration?: number;
};

type ToastItem = ToastInput & {
  id: string;
  tone: ToastTone;
  duration: number;
};

type ToastApi = {
  push: (input: ToastInput | string) => string;
  success: (message: string, description?: string) => string;
  error: (message: string, description?: string) => string;
  info: (message: string, description?: string) => string;
  warning: (message: string, description?: string) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

let externalApi: ToastApi | null = null;

function normalize(input: ToastInput | string): Omit<ToastItem, "id"> {
  if (typeof input === "string") {
    return { title: input, tone: "info", duration: 3800 };
  }
  return {
    title: input.title,
    description: input.description,
    tone: input.tone ?? "info",
    duration: input.duration ?? 3800,
  };
}

/** Imperative toast — works outside React after ToastProvider mounts. */
export const toast: ToastApi = {
  push(input) {
    if (!externalApi) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[toast] ToastProvider not mounted");
      }
      return "";
    }
    return externalApi.push(input);
  },
  success(message, description) {
    return toast.push({ title: message, description, tone: "success" });
  },
  error(message, description) {
    return toast.push({ title: message, description, tone: "error" });
  },
  info(message, description) {
    return toast.push({ title: message, description, tone: "info" });
  },
  warning(message, description) {
    return toast.push({ title: message, description, tone: "warning" });
  },
  dismiss(id) {
    externalApi?.dismiss(id);
  },
};

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) return toast;
  return ctx;
}

const TONE_STYLES: Record<ToastTone, string> = {
  success:
    "border-brand-turquoise/30 bg-brand-surface text-brand-ink shadow-accent dark:border-brand-turquoise/40",
  error:
    "border-red-400/40 bg-brand-surface text-brand-ink shadow-soft dark:border-red-400/50",
  info: "border-brand-purple/25 bg-brand-surface text-brand-ink shadow-soft dark:border-brand-purple/35",
  warning:
    "border-amber-400/40 bg-brand-surface text-brand-ink shadow-soft dark:border-amber-400/50",
};

const TONE_DOT: Record<ToastTone, string> = {
  success: "bg-brand-turquoise",
  error: "bg-red-500",
  info: "bg-brand-purple",
  warning: "bg-amber-500",
};

const TONE_LABEL: Record<ToastTone, string> = {
  success: "Success",
  error: "Error",
  info: "Info",
  warning: "Notice",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (input: ToastInput | string) => {
      const id = `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      const base = normalize(input);
      const item: ToastItem = { id, ...base };
      setItems((prev) => [...prev.slice(-4), item]);
      if (item.duration > 0) {
        const timer = setTimeout(() => dismiss(id), item.duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      push,
      dismiss,
      success: (message, description) => push({ title: message, description, tone: "success" }),
      error: (message, description) => push({ title: message, description, tone: "error" }),
      info: (message, description) => push({ title: message, description, tone: "info" }),
      warning: (message, description) => push({ title: message, description, tone: "warning" }),
    }),
    [push, dismiss],
  );

  useEffect(() => {
    externalApi = api;
    return () => {
      externalApi = null;
      timers.current.forEach((t) => clearTimeout(t));
      timers.current.clear();
    };
  }, [api]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="flex w-full max-w-app flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              role="status"
              className={cn(
                "pointer-events-auto animate-toast-in flex items-start gap-3 rounded-2xl border px-3.5 py-3 backdrop-blur-md",
                TONE_STYLES[item.tone],
              )}
            >
              <span
                className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", TONE_DOT[item.tone])}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[9px] font-semibold uppercase tracking-wider text-brand-muted">
                  {TONE_LABEL[item.tone]}
                </p>
                {item.title ? (
                  <p className="mt-0.5 text-[13px] font-semibold leading-snug text-brand-ink">
                    {item.title}
                  </p>
                ) : null}
                {item.description ? (
                  <p className="mt-0.5 text-[12px] leading-relaxed text-brand-muted">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="shrink-0 rounded-lg px-1.5 py-0.5 text-[11px] font-semibold text-brand-muted transition hover:bg-brand-mist hover:text-brand-ink"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
