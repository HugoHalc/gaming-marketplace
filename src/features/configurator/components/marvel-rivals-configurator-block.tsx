import type { ReactNode } from "react";

export function MarvelRivalsConfiguratorBlock({
  ariaLabel,
  children,
  className = "",
}: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-label={ariaLabel}
      className={`rounded-xl border border-white/[0.08] bg-[#0A0E0C]/75 p-4 sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}
