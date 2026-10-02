import type { ReactNode } from "react";

/** Shared presentation only; visibility and actions stay with each module. */
export function OrderWorkspaceCard({
  children,
  title,
  className = "",
}: {
  children: ReactNode;
  title?: ReactNode;
  className?: string;
}) {
  return (
    <section
      data-order-workspace-card=""
      className={`min-w-0 rounded-xl border border-white/[0.08] bg-[#0B110E] p-4 text-[#A4AEA8] [overflow-wrap:anywhere] sm:p-5 [&_input]:min-w-0 [&_input]:max-w-full [&_input]:h-11 [&_input]:text-sm [&_textarea]:text-sm [&_dt]:text-xs [&_dd]:text-xs [&_textarea]:min-w-0 [&_textarea]:max-w-full [&_input]:focus-visible:outline-2 [&_textarea]:focus-visible:outline-2 [&_button]:focus-visible:outline-2 [&_input]:focus-visible:outline-[#39E56F] [&_textarea]:focus-visible:outline-[#39E56F] [&_button]:focus-visible:outline-[#39E56F] [&_button]:focus-visible:outline-offset-2 [&_button]:min-h-11 [&_button]:whitespace-normal [&_button]:px-3 [&_button]:py-2 ${className}`}
    >
      {title ? (
        <h2 className="mb-4 text-[15px] font-semibold text-[#F4F7F5]">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
