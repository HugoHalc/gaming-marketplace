import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5"
      aria-label="BoostingPedia home"
    >
      <span className="relative grid size-10 place-items-center overflow-hidden rounded-lg">
        <Image
          src="/brand/boostingpedia-mark.png"
          alt=""
          width={40}
          height={48}
          priority
          className="h-10 w-auto object-contain drop-shadow-[0_0_14px_rgba(0,230,90,.24)] transition-transform duration-200 group-hover:scale-[1.04]"
        />
      </span>
      <span className="text-[15px] font-black italic tracking-[-0.035em] text-white sm:text-base">
        BOOSTING<span className="text-green-400">PEDIA</span>
      </span>
    </Link>
  );
}
