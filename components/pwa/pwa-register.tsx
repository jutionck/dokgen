"use client";

import { useEffect } from "react";

/**
 * Daftarkan service worker untuk PWA.
 * Hanya diaktifkan pada production (next start / Vercel) agar tidak
 * mengganggu hot-reload di development.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
