"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import {
  ChevronRight,
  CircleHelp,
  Gamepad2,
  Home,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Swords,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MobileSiteMenuProps {
  signedIn: boolean;
}

const publicLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Games", href: "/games", icon: Gamepad2 },
  { label: "How it works", href: "/#how-it-works", icon: ShieldCheck },
  { label: "Meet our boosters", href: "/boosters/rocket-league", icon: Swords },
  { label: "FAQ", href: "/#faq", icon: CircleHelp },
];

export function MobileSiteMenu({ signedIn }: MobileSiteMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      closeRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  const close = () => setOpen(false);

  const drawer =
    mounted
      ? createPortal(
          <div
            className={`fixed inset-0 z-[9999] lg:hidden ${
              open ? "visible" : "invisible delay-[260ms]"
            }`}
            aria-hidden={!open}
          >
            <button
              type="button"
              onClick={close}
              className={`absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-200 ${
                open ? "opacity-100" : "opacity-0"
              }`}
              aria-label="Close menu"
            />

            <aside
              className={`absolute right-0 top-0 flex h-[100dvh] w-full max-w-[430px] flex-col border-l border-white/[0.07] bg-[#050807] transition-transform duration-[260ms] ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
            >
              <div className="flex min-h-20 shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] px-5 pt-[max(.5rem,env(safe-area-inset-top))]">
                <Link href="/" onClick={close} className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 place-items-center overflow-hidden rounded-xl bg-[#0B100D]">
                    <img
                      src="/brand/boostingpedia-mark.png"
                      alt=""
                      className="h-11 w-auto object-contain"
                    />
                  </span>
                  <span className="truncate text-[15px] font-black italic tracking-[-0.035em] text-white">
                    BOOSTING<span className="text-[#39E56F]">PEDIA</span>
                  </span>
                </Link>

                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-[#0E1411] text-[#A0AAA4]"
                  aria-label="Close menu"
                >
                  <X className="size-[19px]" strokeWidth={1.8} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
                {signedIn ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/dashboard"
                      onClick={close}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#39E56F] px-4 text-sm font-bold text-[#050807] transition-colors hover:bg-[#20C95A]"
                    >
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      onClick={close}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.09] bg-[#0E1411] px-4 text-sm font-bold text-[#F4F7F5]"
                    >
                      <ListOrdered className="size-4" />
                      Orders
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/register"
                      onClick={close}
                      className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#39E56F] px-4 text-sm font-bold text-[#050807] transition-colors hover:bg-[#20C95A]"
                    >
                      Sign up
                    </Link>
                    <Link
                      href="/login"
                      onClick={close}
                      className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/[0.09] bg-[#0E1411] px-4 text-sm font-bold text-[#F4F7F5]"
                    >
                      Sign in
                    </Link>
                  </div>
                )}

                <nav className="mt-6" aria-label="Mobile menu">
                  {publicLinks.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={close}
                        className="group flex min-h-[58px] items-center gap-4 border-b border-white/[0.05] text-[#D7DDD9] transition-colors hover:text-[#F4F7F5]"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg text-[#667069] transition-colors group-hover:text-[#82F5A4]">
                          <Icon className="size-[19px]" strokeWidth={1.7} />
                        </span>
                        <span className="min-w-0 flex-1 text-[15px] font-medium">
                          {item.label}
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-[#4E5651]" />
                      </Link>
                    );
                  })}
                </nav>

                {signedIn ? (
                  <>
                    <div className="my-5 h-px bg-white/[0.06]" />

                    <Link
                      href="/dashboard/profile"
                      onClick={close}
                      className="group flex min-h-[56px] items-center gap-4 text-[#D7DDD9]"
                    >
                      <span className="grid size-9 place-items-center text-[#667069]">
                        <Settings className="size-[19px]" strokeWidth={1.7} />
                      </span>
                      <span className="flex-1 text-[15px] font-medium">
                        Account Settings
                      </span>
                      <ChevronRight className="size-4 text-[#4E5651]" />
                    </Link>

                    <form action="/auth/signout" method="post">
                      <button
                        type="submit"
                        className="flex min-h-[56px] w-full items-center gap-4 text-left text-[#A0AAA4]"
                      >
                        <span className="grid size-9 place-items-center text-[#667069]">
                          <LogOut className="size-[19px]" strokeWidth={1.7} />
                        </span>
                        <span className="text-[15px] font-medium">Log out</span>
                      </button>
                    </form>
                  </>
                ) : null}

                <div className="mt-7 rounded-xl border border-[#39E56F]/10 bg-[#39E56F]/[0.025] px-4 py-4">
                  <p className="font-gaming-label text-[9px] uppercase tracking-[0.14em] text-[#82F5A4]">
                    BoostingPedia
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#A0AAA4]">
                    Professional gaming services, secure checkout and clear order tracking.
                  </p>
                </div>
              </div>
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-xl border border-[#FFFFFF14] bg-[#090D0B] text-[#F4F7F5] transition-colors hover:bg-[#131B17] lg:hidden"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="size-[18px]" strokeWidth={1.9} />
      </button>

      {drawer}
    </>
  );
}
