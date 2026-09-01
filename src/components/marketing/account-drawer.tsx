"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Gamepad2,
  Grid2X2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Rocket,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

interface AccountDrawerProps {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
  unread: number;
}

const quickActions = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/orders", icon: Package },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
] as const;

const navigationItems = [
  { label: "Rocket League", href: "/games/rocket-league", icon: Gamepad2 },
  {
    label: "Rocket League Boosters",
    href: "/boosters/rocket-league",
    icon: UsersRound,
  },
  { label: "How it works", href: "/#how-it-works", icon: Rocket },
  { label: "FAQ", href: "/#faq", icon: CircleHelp },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountDrawer({
  displayName,
  email,
  avatarUrl,
  initials,
  unread,
}: AccountDrawerProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), form button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  function openDrawer(event: ReactMouseEvent<HTMLButtonElement>) {
    lastTriggerRef.current = event.currentTarget;
    setOpen(true);
  }

  function closeDrawer({ restoreFocus = false } = {}) {
    setOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
    }
  }

  const drawer = (
    <div
      className={`fixed inset-0 z-[100] transition-[visibility] duration-0 ${
        open ? "visible" : "invisible delay-[260ms]"
      }`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-[240ms] ease-out motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onMouseDown={() => closeDrawer({ restoreFocus: true })}
        aria-hidden="true"
      />

      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-drawer-title"
        className={`absolute inset-y-0 right-0 flex h-[100dvh] w-[min(92vw,420px)] max-w-full flex-col overflow-hidden border-l border-white/[0.08] bg-[#050807] shadow-[-34px_0_80px_-42px_rgba(0,0,0,.98)] transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(.22,.8,.24,1)] sm:w-[440px] sm:rounded-l-[1.5rem] motion-reduce:transition-none ${
          open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#070A08] px-4 sm:px-5">
          <div>
            <p
              id="account-drawer-title"
              className="font-gaming-label text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A0AAA4]"
            >
              Account
            </p>
            <p className="mt-0.5 text-[11px] text-[#667069]">
              BoostingPedia
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => closeDrawer({ restoreFocus: true })}
            className="grid size-10 place-items-center rounded-full border border-white/[0.08] bg-[#131B17] text-[#667069] transition-[border-color,background-color,color] duration-200 hover:border-white/[0.14] hover:bg-[#18211C] hover:text-[#F4F7F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 motion-reduce:transition-none"
            aria-label="Close account menu"
          >
            <X className="size-4" strokeWidth={1.9} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4 [scrollbar-color:rgba(255,255,255,.12)_transparent] [scrollbar-width:thin] sm:px-5">
          <Link
            href="/dashboard/profile"
            onClick={() => closeDrawer()}
            className="group flex items-center gap-3 rounded-[1.05rem] border border-white/[0.08] bg-[#0E1411] p-3.5 transition-[border-color,background-color] duration-200 hover:border-white/[0.14] hover:bg-[#131B17] motion-reduce:transition-none"
          >
            <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.10] bg-[#131B17] text-xs font-bold text-[#F4F7F5]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                initials
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[#F4F7F5]">
                {displayName}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-[#A0AAA4]">
                {email}
              </span>
            </span>

            <ChevronRight
              className="size-4 shrink-0 text-[#667069] transition-colors duration-200 group-hover:text-[#A0AAA4]"
              strokeWidth={1.8}
            />
          </Link>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {quickActions.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);
              const isNotifications = item.href === "/dashboard/notifications";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => closeDrawer()}
                  className={`group relative flex min-h-[94px] flex-col items-center justify-center gap-2.5 rounded-2xl border bg-[#0E1411] px-3 text-center transition-[border-color,background-color] duration-200 hover:border-white/[0.14] hover:bg-[#131B17] motion-reduce:transition-none ${
                    active
                      ? "border-blue-300/[0.16]"
                      : "border-white/[0.07]"
                  }`}
                >
                  {active ? (
                    <span className="absolute left-3 top-3 size-1.5 rounded-full bg-[#39E56F]" />
                  ) : null}

                  <span className="relative grid size-8 place-items-center text-[#A0AAA4] transition-colors duration-200 group-hover:text-[#F4F7F5]">
                    <Icon className="size-5" strokeWidth={1.75} />
                    {isNotifications && unread > 0 ? (
                      <span className="absolute -right-2 -top-1 min-w-4 rounded-full bg-[#39E56F] px-1 text-center text-[9px] font-bold leading-4 text-[#050807]">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    ) : null}
                  </span>

                  <span className="text-[13px] font-medium text-[#F4F7F5]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="my-5 h-px bg-white/[0.07]" />

          <nav aria-label="Account navigation" className="space-y-0.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => closeDrawer()}
                  className={`group flex min-h-12 items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-[background-color,color] duration-200 hover:bg-white/[0.025] motion-reduce:transition-none ${
                    active ? "bg-white/[0.025]" : ""
                  }`}
                >
                  <span className="grid size-8 shrink-0 place-items-center text-[#A0AAA4] transition-colors duration-200 group-hover:text-[#F4F7F5]">
                    <Icon className="size-[17px]" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1 text-[#F4F7F5]">
                    {item.label}
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-[#667069] transition-colors duration-200 group-hover:text-[#A0AAA4]"
                    strokeWidth={1.8}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="my-5 h-px bg-white/[0.07]" />

          <Link
            href="/games"
            onClick={() => closeDrawer()}
            className="group flex min-h-12 items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors duration-200 hover:bg-white/[0.025] motion-reduce:transition-none"
          >
            <span className="grid size-8 shrink-0 place-items-center text-[#39E56F]">
              <Grid2X2 className="size-[17px]" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1 font-medium text-[#82F5A4]">
              Browse Boosting Services
            </span>
            <ChevronRight
              className="size-4 shrink-0 text-[#39E56F]/55 transition-colors duration-200 group-hover:text-[#82F5A4]"
              strokeWidth={1.8}
            />
          </Link>

          <div className="my-5 h-px bg-white/[0.07]" />

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="group flex min-h-12 w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition-[background-color,color] duration-200 hover:bg-rose-400/[0.04] motion-reduce:transition-none"
            >
              <span className="grid size-8 shrink-0 place-items-center text-[#A0AAA4] transition-colors duration-200 group-hover:text-rose-300/75">
                <LogOut className="size-[17px]" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1 text-[#F4F7F5] transition-colors duration-200 group-hover:text-rose-200/90">
                Log out
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-[#667069] transition-colors duration-200 group-hover:text-rose-300/50"
                strokeWidth={1.8}
              />
            </button>
          </form>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-[#FFFFFF14] bg-[#131B17] text-xs font-bold text-[#F4F7F5] transition-[background-color,border-color] duration-200 hover:border-white/[0.16] hover:bg-[#18211C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 motion-reduce:transition-none"
        aria-label="Open account menu"
        title={displayName}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          initials
        )}
      </button>

      <button
        type="button"
        onClick={openDrawer}
        className="flex h-10 items-center gap-2 rounded-xl border border-[#FFFFFF14] bg-[#131B17] px-3.5 text-sm font-semibold text-[#F4F7F5] transition-[background-color,border-color] duration-200 hover:border-white/[0.16] hover:bg-[#18211C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 motion-reduce:transition-none"
        aria-label="Open account menu"
        aria-expanded={open}
      >
        <Menu className="size-4 text-[#A0AAA4]" strokeWidth={1.8} />
        <span className="hidden sm:inline">Menu</span>
      </button>

      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
