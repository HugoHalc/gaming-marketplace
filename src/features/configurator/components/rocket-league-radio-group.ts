"use client";

import type { KeyboardEvent } from "react";

const RADIO_NAV_KEYS = new Set(["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"]);

export function handleRocketLeagueRadioGroupKeyDown(event: KeyboardEvent<HTMLElement>) {
  if (!RADIO_NAV_KEYS.has(event.key)) return;
  const current = (event.target as HTMLElement).closest<HTMLButtonElement>('button[role="radio"]');
  if (!current) return;
  const radios = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="radio"]:not(:disabled)'));
  const currentIndex = radios.indexOf(current);
  if (currentIndex < 0 || radios.length < 2) return;

  let nextIndex = currentIndex;
  if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = radios.length - 1;
  else if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % radios.length;
  else nextIndex = (currentIndex - 1 + radios.length) % radios.length;

  event.preventDefault();
  radios[nextIndex]?.focus();
  radios[nextIndex]?.click();
}
