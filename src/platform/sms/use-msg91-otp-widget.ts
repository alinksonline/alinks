"use client";

import { useCallback, useEffect, useState } from "react";

type WidgetClient = typeof import("@/platform/sms/msg91-widget-client");

export function useMsg91OtpWidget(widgetId: string | undefined, widgetToken: string | undefined) {
  const enabled = Boolean(widgetId && widgetToken);
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [localhostHint, setLocalhostHint] = useState<string | null>(null);
  const [client, setClient] = useState<WidgetClient | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!enabled) {
      setReady(false);
      setInitError(null);
      setLocalhostHint(null);
      setClient(null);
      void import("@/platform/sms/msg91-widget-client").then((mod) => {
        if (!cancelled) mod.teardownMsg91Widget();
      });
      return () => {
        cancelled = true;
      };
    }

    void import("@/platform/sms/msg91-widget-client").then(async (mod) => {
      if (cancelled) return;
      setClient(mod);

      if (!mod.isMsg91WidgetClientAllowed()) {
        mod.teardownMsg91Widget();
        const hint = mod.msg91WidgetLocalhostHint();
        setLocalhostHint(hint);
        setInitError(hint);
        setReady(false);
        return;
      }

      try {
        await mod.initializeMsg91Widget(widgetId!, widgetToken!);
        if (!cancelled) {
          setReady(true);
          setInitError(null);
          setLocalhostHint(null);
        }
      } catch (e) {
        if (!cancelled) {
          setInitError(e instanceof Error ? e.message : "MSG91 widget failed to initialize");
          setReady(false);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, widgetId, widgetToken]);

  const sendOtp = useCallback(
    (phone10: string) => {
      if (!ready || !client?.isMsg91WidgetMethodsReady()) {
        return Promise.reject(new Error(initError ?? "MSG91 widget is not ready yet"));
      }
      return client.msg91WidgetSendOtp(phone10);
    },
    [ready, initError, client],
  );

  const resendOtp = useCallback(() => {
    if (!ready || !client?.isMsg91WidgetMethodsReady()) {
      return Promise.reject(new Error(initError ?? "MSG91 widget is not ready yet"));
    }
    return client.msg91WidgetRetryOtp();
  }, [ready, initError, client]);

  const verifyOtp = useCallback(
    (otp: string) => {
      if (!ready || !client?.isMsg91WidgetMethodsReady()) {
        return Promise.reject(new Error(initError ?? "MSG91 widget is not ready yet"));
      }
      return client.msg91WidgetVerifyOtp(otp);
    },
    [ready, initError, client],
  );

  return { enabled, ready, initError, localhostHint, sendOtp, resendOtp, verifyOtp };
}