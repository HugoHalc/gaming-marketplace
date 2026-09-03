"use client";

import { useEffect } from "react";

const HEARTBEAT_MS = 30_000;

export function UserPresenceReporter() {
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;

    const reportPresence = () => {
      if (document.visibilityState === "hidden") return;

      void fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone }),
        keepalive: true,
      });
    };

    reportPresence();
    const timer = window.setInterval(reportPresence, HEARTBEAT_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") reportPresence();
    };

    window.addEventListener("focus", reportPresence);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", reportPresence);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
