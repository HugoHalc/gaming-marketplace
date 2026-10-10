"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { isTawkMonitoringPath } from "@/lib/tawk-monitoring";

const TAWK_SCRIPT_ID = "boostingpedia-tawk-monitoring";
const TAWK_EMBED_URL =
  "https://embed.tawk.to/6855d398fcaa46190d472212/1iu7k5335";

type TawkApi = {
  autoStart?: boolean;
  hideWidget?: () => void;
  onBeforeLoad?: () => void;
  onLoad?: () => void;
  shutdown?: () => void;
  start?: (options?: { showWidget?: boolean }) => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

let activeRoute: string | null = null;
let restartTimer: number | null = null;

function clearRestartTimer() {
  if (restartTimer === null) return;
  window.clearTimeout(restartTimer);
  restartTimer = null;
}

function stopMonitoring() {
  clearRestartTimer();
  const api = window.Tawk_API;
  api?.hideWidget?.();
  api?.shutdown?.();
}

function startMonitoring(route: string) {
  const api = window.Tawk_API;
  if (!api?.start) return;

  stopMonitoring();
  restartTimer = window.setTimeout(() => {
    restartTimer = null;
    if (activeRoute !== route) return;
    api.start?.();
    api.hideWidget?.();
  }, 0);
}

function configureTawkApi() {
  const api = (window.Tawk_API ??= {});
  api.autoStart = false;
  api.onBeforeLoad = () => {
    api.hideWidget?.();
    if (activeRoute === null) api.shutdown?.();
  };
  api.onLoad = () => {
    api.hideWidget?.();
    const route = activeRoute;
    if (route === null) {
      api.shutdown?.();
      return;
    }
    startMonitoring(route);
  };
}

function loadTawkScript() {
  configureTawkApi();
  if (document.getElementById(TAWK_SCRIPT_ID)) return;

  window.Tawk_LoadStart = new Date();
  const script = document.createElement("script");
  script.id = TAWK_SCRIPT_ID;
  script.async = true;
  script.src = TAWK_EMBED_URL;
  script.charset = "UTF-8";
  script.crossOrigin = "anonymous";
  script.addEventListener("error", () => script.remove(), { once: true });
  document.head.appendChild(script);
}

export function TawkVisitorMonitoring() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    const isAllowed = isTawkMonitoringPath(pathname) && search.length === 0;

    if (!isAllowed) {
      activeRoute = null;
      stopMonitoring();

      const pendingScript = document.getElementById(TAWK_SCRIPT_ID);
      if (pendingScript && !window.Tawk_API?.start) pendingScript.remove();
      return;
    }

    const route = pathname;
    activeRoute = route;
    configureTawkApi();

    if (window.Tawk_API?.start) startMonitoring(route);
    else loadTawkScript();

    return () => {
      if (activeRoute !== route) return;
      activeRoute = null;
      stopMonitoring();
    };
  }, [pathname, search]);

  return null;
}
