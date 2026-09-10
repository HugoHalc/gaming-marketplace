"use client";

import { useId, useState } from "react";

interface RocketLeagueFaqItem {
  readonly question: string;
  readonly paragraphs: readonly string[];
}

interface RocketLeagueFaqAccordionProps {
  items: readonly RocketLeagueFaqItem[];
}

export function RocketLeagueFaqAccordion({ items }: RocketLeagueFaqAccordionProps) {
  const baseId = useId();
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );
  };

  return (
    <div className="overflow-hidden rounded-[1.125rem] border border-white/[0.07] bg-[#0B110E]">
      {items.map((item, index) => {
        const isOpen = openItems.includes(index);
        const triggerId = `${baseId}-faq-trigger-${index}`;
        const panelId = `${baseId}-faq-panel-${index}`;

        return (
          <div
            key={item.question}
            className={`border-b border-white/[0.06] transition-colors duration-200 last:border-b-0 motion-reduce:transition-none ${
              isOpen ? "bg-blue-300/[0.04]" : "hover:bg-white/[0.015]"
            }`}
          >
            <button
              id={triggerId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleItem(index)}
              className="flex min-h-16 w-full items-center justify-between gap-5 px-4 py-4 text-left outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-300/40 sm:min-h-[4.25rem] sm:px-5 sm:py-[1.15rem] motion-reduce:transition-none"
            >
              <span className="text-[15px] font-semibold leading-6 text-[#F4F7F5] sm:text-base">
                {item.question}
              </span>
              <span
                aria-hidden="true"
                className={`grid size-7 shrink-0 place-items-center rounded-full border text-base leading-none transition-[border-color,background-color,color,transform] duration-200 motion-reduce:transition-none ${
                  isOpen
                    ? "rotate-45 border-blue-300/25 bg-blue-300/[0.055] text-blue-200"
                    : "border-white/[0.08] bg-black/10 text-[#7E8982]"
                }`}
              >
                +
              </span>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="max-w-[47rem] space-y-3 px-4 pb-5 pr-11 sm:px-5 sm:pb-6 sm:pr-14">
                  {item.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-[#A0AAA4] sm:text-[15px]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
