// Presentation only: native checkboxes retain keyboard, focus and form behavior.
export const applicationChoiceClass =
  "relative flex min-h-12 min-w-0 cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-[#0B110E] px-3 py-3 text-sm text-white/85 transition-colors duration-150 hover:border-[#39E56F]/30 hover:bg-[#111B15] has-checked:border-[#39E56F]/70 has-checked:bg-[#10291A] has-checked:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#82F5A4] has-disabled:cursor-not-allowed has-disabled:opacity-45";

export const applicationCheckboxClass = "peer sr-only";

export const applicationCheckboxIndicatorClass =
  "relative size-5 shrink-0 rounded-[4px] border border-white/25 bg-[#080E0A] transition-colors duration-150 peer-checked:border-[#39E56F] peer-checked:bg-[#39E56F] peer-disabled:opacity-50 after:absolute after:left-[6px] after:top-[3px] after:h-[10px] after:w-[5px] after:rotate-45 after:border-b-2 after:border-r-2 after:border-[#07110A] after:opacity-0 after:content-[''] peer-checked:after:opacity-100 forced-colors:border-[ButtonText] forced-colors:peer-checked:bg-[Highlight] forced-colors:after:border-[HighlightText]";
