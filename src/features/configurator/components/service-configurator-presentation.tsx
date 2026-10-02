"use client";

import type { KeyboardEvent, ReactNode } from "react";
import "./service-configurator-presentation.css";

export function handleServiceRadioKeyDown(event: KeyboardEvent<HTMLDivElement>) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
  const target = event.target as HTMLElement;
  const radio = target.closest<HTMLButtonElement>('button[role="radio"]');
  const group = radio?.closest('[role="radiogroup"]');
  if (!radio || !group) return;
  const radios = [...group.querySelectorAll<HTMLButtonElement>('button[role="radio"]')]
    .filter((button) => !button.disabled && button.getAttribute("aria-disabled") !== "true" && button.closest('[role="radiogroup"]') === group);
  const current = radios.indexOf(radio);
  if (current < 0) return;
  const next = event.key === "Home" ? 0 : event.key === "End" ? radios.length - 1
    : (current + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + radios.length) % radios.length;
  event.preventDefault();
  radios[next].focus();
  radios[next].click();
}

export function ServiceConfiguratorPresentation({ children }: { children: ReactNode }) {
  return <div data-service-experience className="bp-service-experience min-w-0" onKeyDown={handleServiceRadioKeyDown}>{children}</div>;
}
