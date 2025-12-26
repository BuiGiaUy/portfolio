"use client";

import { useEffect } from "react";
import { initSentry } from "@/lib/sentry";

/**
 * SENTRY INITIALIZER COMPONENT
 *
 * This client component initializes Sentry on app mount.
 * Import this in your root layout.
 */
export function SentryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initSentry();
  }, []);

  return <>{children}</>;
}
