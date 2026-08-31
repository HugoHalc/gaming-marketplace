import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "font-gaming-label inline-flex items-center rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-xs text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}
