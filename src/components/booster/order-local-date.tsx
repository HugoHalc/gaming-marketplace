"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Hydration uses the same ISO date, then formats in the user's browser locale/timezone. */
export function OrderLocalDate({ timestamp }: { timestamp: string }) {
  const client = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  if (!Number.isFinite(Date.parse(timestamp))) return null;
  return <time dateTime={timestamp} title={timestamp}>{client ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp)) : timestamp.slice(0, 10)}</time>;
}
