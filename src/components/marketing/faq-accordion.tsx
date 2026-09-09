"use client";

import Link from "next/link";
import { useId, useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
  href?: string;
  linkLabel?: string;
};

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  const buttonId = useId();
  const panelId = useId();

  return (
    <div className="py-[1.15rem] sm:py-5">
      <button
        id={buttonId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="group flex w-full items-center justify-between gap-6 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/35 focus-visible:ring-offset-4 focus-visible:ring-offset-[#050807]"
      >
        <span className="text-[15px] font-semibold leading-6 text-[#F4F7F5] sm:text-base">
          {item.question}
        </span>
        <span
          aria-hidden="true"
          className={`grid size-7 shrink-0 place-items-center rounded-full border bg-[#090D0B] text-[#A0AAA4] transition-[background-color,border-color,color,transform] duration-200 ease-out group-hover:border-white/[0.12] group-hover:bg-[#0E1411] group-hover:text-[#82F5A4] motion-reduce:transition-none ${
            open
              ? "rotate-45 border-[#39E56F]/30 bg-[#39E56F]/[0.045] text-[#82F5A4]"
              : "border-[#FFFFFF14]"
          }`}
        >
          +
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="pr-9"
      >
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#A0AAA4] sm:mt-[1.1rem] sm:text-[15px]">
          {item.answer}
        </p>
        {item.href && item.linkLabel ? (
          <Link
            href={item.href}
            className="mt-3 inline-flex text-sm font-semibold text-[#82F5A4]/85 underline-offset-4 transition-colors hover:text-[#82F5A4] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/35"
          >
            {item.linkLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
      {items.map((item) => (
        <FaqRow key={item.question} item={item} />
      ))}
    </div>
  );
}
