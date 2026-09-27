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
      className={`rounded-2xl border border-white/[0.07] bg-black/10 p-4 sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}
