"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DashboardShellProps {
  children: React.ReactNode;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
  unreadNotifications: number;
}

const mainNavigation = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Orders", href: "/dashboard/orders", icon: Package },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Avatar({
  avatarUrl,
  initials,
  size = "md",
}: {
  avatarUrl: string | null;
  initials: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.10] bg-[#131B17] font-bold text-[#F4F7F5] ${
        size === "sm" ? "size-9 text-[10px]" : "size-10 text-xs"
      }`}
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
    </span>
  );
}

function SidebarContent({
  pathname,
  displayName,
  email,
  avatarUrl,
  initials,
  unreadNotifications,
  onNavigate,
}: Omit<DashboardShellProps, "children"> & {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-5 pb-5 pt-6">
        <Link
          href="/"
          onClick={onNavigate}
          className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39E56F]/35"
        >
          <img
            src="/brand/boostingpedia-mark.png"
            alt=""
            className="size-8 object-contain"
          />
          <span className="text-[15px] font-bold tracking-[-0.025em] text-[#F4F7F5]">
            BoostingPedia
          </span>
        </Link>

        <p className="font-gaming-label mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#667069]">
          Customer Dashboard
        </p>
      </div>

      <nav
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.10)_transparent]"
        aria-label="Customer dashboard navigation"
      >
        {mainNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`group relative flex min-h-11 items-center gap-3 rounded-xl border px-3 text-sm transition-[background-color,border-color,color] duration-200 motion-reduce:transition-none ${
                active
                  ? "border-white/[0.08] bg-[#131B17] text-[#F4F7F5]"
                  : "border-transparent text-[#A0AAA4] hover:bg-[#0E1411] hover:text-[#F4F7F5]"
              }`}
            >
              {active ? (
                <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#39E56F]" />
              ) : null}
              <Icon
                className={`size-[17px] ${
                  active
                    ? "text-[#F4F7F5]"
                    : "text-[#667069] group-hover:text-[#A0AAA4]"
                }`}
                strokeWidth={1.8}
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.href === "/dashboard/notifications" &&
              unreadNotifications > 0 ? (
                <span className="min-w-5 rounded-full bg-[#39E56F]/[0.10] px-1.5 text-center text-[9px] font-bold leading-5 text-[#82F5A4]">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              ) : null}
            </Link>
          );
        })}

        <div
          className="group flex min-h-11 cursor-not-allowed items-center gap-3 rounded-xl border border-transparent px-3 text-sm text-[#667069]"
          aria-disabled="true"
          title="Live order chat will be added in Phase 16C."
        >
          <MessageSquare className="size-[17px]" strokeWidth={1.8} />
          <span className="min-w-0 flex-1 truncate">Messages</span>
          <span className="font-gaming-label text-[9px] uppercase tracking-[0.12em] text-[#667069]">
            Soon
          </span>
        </div>

        <div className="my-3 h-px bg-white/[0.07]" />

        <Link
          href="/dashboard/profile"
          onClick={onNavigate}
          aria-current={isActive(pathname, "/dashboard/profile") ? "page" : undefined}
          className={`group relative flex min-h-11 items-center gap-3 rounded-xl border px-3 text-sm transition-[background-color,border-color,color] duration-200 motion-reduce:transition-none ${
            isActive(pathname, "/dashboard/profile")
              ? "border-white/[0.08] bg-[#131B17] text-[#F4F7F5]"
              : "border-transparent text-[#A0AAA4] hover:bg-[#0E1411] hover:text-[#F4F7F5]"
          }`}
        >
          {isActive(pathname, "/dashboard/profile") ? (
            <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#39E56F]" />
          ) : null}
          <UserRound
            className={`size-[17px] ${
              isActive(pathname, "/dashboard/profile")
                ? "text-[#F4F7F5]"
                : "text-[#667069] group-hover:text-[#A0AAA4]"
            }`}
            strokeWidth={1.8}
          />
          Account Settings
        </Link>
      </nav>

      <div className="shrink-0 border-t border-white/[0.07] p-3">
        <Link
          href="/dashboard/profile"
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#0E1411]"
        >
          <Avatar avatarUrl={avatarUrl} initials={initials} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-[#F4F7F5]">
              {displayName}
            </span>
            <span className="mt-0.5 block truncate text-[10px] text-[#667069]">
              {email}
            </span>
          </span>
          <ChevronRight
            className="size-3.5 shrink-0 text-[#667069] group-hover:text-[#A0AAA4]"
            strokeWidth={1.8}
          />
        </Link>

        <form action="/auth/signout" method="post" className="mt-1">
          <button
            type="submit"
            className="group flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-xs text-[#A0AAA4] transition-colors hover:bg-rose-400/[0.04] hover:text-rose-200/90"
          >
            <LogOut
              className="size-4 text-[#667069] group-hover:text-rose-300/70"
              strokeWidth={1.8}
            />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  displayName,
  email,
  avatarUrl,
  initials,
  unreadNotifications,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-[100dvh] bg-[#050807] text-[#F4F7F5]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] border-r border-white/[0.07] bg-[#070A08] lg:block">
        <SidebarContent
          pathname={pathname}
          displayName={displayName}
          email={email}
          avatarUrl={avatarUrl}
          initials={initials}
          unreadNotifications={unreadNotifications}
        />
      </aside>

      <div className="min-h-[100dvh] lg:pl-[244px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#050807]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-[#0E1411] text-[#A0AAA4] hover:bg-[#131B17] hover:text-[#F4F7F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 lg:hidden"
              aria-label="Open dashboard navigation"
              aria-expanded={mobileOpen}
            >
              <Menu className="size-4" strokeWidth={1.8} />
            </button>

            <div className="min-w-0">
              <p className="font-gaming-label text-[9px] font-semibold uppercase tracking-[0.15em] text-[#667069]">
                Customer
              </p>
              <p className="truncate text-sm font-semibold text-[#F4F7F5]">
                {pathname === "/dashboard"
                  ? "Overview"
                  : pathname.startsWith("/dashboard/orders")
                    ? "My Orders"
                    : pathname.startsWith("/dashboard/notifications")
                      ? "Notifications"
                      : pathname.startsWith("/dashboard/profile")
                        ? "Account Settings"
                        : "Dashboard"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/notifications"
              className="relative grid size-10 place-items-center rounded-full border border-white/[0.08] bg-[#0E1411] text-[#A0AAA4] transition-colors hover:bg-[#131B17] hover:text-[#F4F7F5]"
              aria-label={
                unreadNotifications
                  ? `${unreadNotifications} unread notifications`
                  : "Notifications"
              }
            >
              <Bell className="size-4" strokeWidth={1.8} />
              {unreadNotifications > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-[#39E56F] px-1 text-center text-[9px] font-bold leading-4 text-[#050807]">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              ) : null}
            </Link>

            <Link
              href="/dashboard/profile"
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              aria-label="Open account settings"
            >
              <Avatar avatarUrl={avatarUrl} initials={initials} />
            </Link>
          </div>
        </header>

        <main className="min-w-0">{children}</main>
      </div>

      <div
        className={`fixed inset-0 z-[80] lg:hidden ${
          mobileOpen ? "visible" : "invisible delay-[240ms]"
        }`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close dashboard navigation"
          onClick={() => setMobileOpen(false)}
        />

        <aside
          ref={drawerRef}
          className={`absolute inset-y-0 left-0 w-[min(88vw,320px)] border-r border-white/[0.08] bg-[#070A08] shadow-[30px_0_70px_-40px_rgba(0,0,0,.98)] transition-transform duration-[240ms] ease-out motion-reduce:transition-none ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full border border-white/[0.08] bg-[#131B17] text-[#667069] hover:text-[#F4F7F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            aria-label="Close dashboard navigation"
          >
            <X className="size-4" strokeWidth={1.8} />
          </button>

          <SidebarContent
            pathname={pathname}
            displayName={displayName}
            email={email}
            avatarUrl={avatarUrl}
            initials={initials}
            unreadNotifications={unreadNotifications}
            onNavigate={() => setMobileOpen(false)}
          />
        </aside>
      </div>
    </div>
  );
}
