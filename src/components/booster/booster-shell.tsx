"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Package,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

interface BoosterShellProps {
  children: ReactNode;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  payoutRateBps: number;
}

function isActive(pathname: string, href: string) {
  if (href === "/booster") return pathname === "/booster";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BoosterShell({
  children,
  displayName,
  email,
  avatarUrl,
  payoutRateBps,
}: BoosterShellProps) {
  const pathname = usePathname();
  const payoutPercent = (payoutRateBps / 100).toFixed(
    payoutRateBps % 100 === 0 ? 0 : 2,
  );

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "BP";

  const navigation = [
    {
      label: "Dashboard",
      href: "/booster",
      icon: LayoutDashboard,
    },
    {
      label: "Orders",
      href: "/booster/orders",
      icon: Package,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050807] text-[#F4F7F5]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[238px] border-r border-white/[0.06] bg-[#070A08] lg:flex lg:flex-col">
        <div className="px-5 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/brand/boostingpedia-mark.png"
              alt=""
              width={30}
              height={30}
              className="size-7 object-contain"
            />
            <span className="text-sm font-semibold">BoostingPedia</span>
          </Link>

          <p className="mt-3 font-gaming-label text-[9px] uppercase tracking-[0.14em] text-[#667069]">
            Booster Account
          </p>
        </div>

        <nav className="flex-1 px-3 py-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${
                    active
                      ? "bg-[#131B17] text-[#F4F7F5]"
                      : "text-[#A0AAA4] hover:bg-[#0E1411] hover:text-[#F4F7F5]"
                  }`}
                >
                  {active ? (
                    <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#39E56F]" />
                  ) : null}
                  <Icon
                    className={`size-[17px] ${
                      active ? "text-[#82F5A4]" : "text-[#667069]"
                    }`}
                    strokeWidth={1.8}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="my-4 h-px bg-white/[0.07]" />

          <Link
            href="/dashboard/profile"
            className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm text-[#A0AAA4] transition-colors hover:bg-[#0E1411] hover:text-[#F4F7F5]"
          >
            <UserRound className="size-[17px] text-[#667069]" strokeWidth={1.8} />
            Account Settings
          </Link>
        </nav>

        <div className="border-t border-white/[0.05] p-4">
          <div className="mb-3 border-b border-white/[0.05] pb-3">
            <p className="text-[9px] text-[#667069]">Payout rate</p>
            <p className="font-gaming-value mt-1 text-base font-bold text-[#82F5A4]">
              {payoutPercent}%
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.08] bg-[#0E1411] text-[10px] font-bold">
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
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{displayName}</p>
              <p className="mt-0.5 truncate text-[9px] text-[#667069]">{email}</p>
            </div>
          </div>

          <form action="/auth/signout" method="post" className="mt-3">
            <button className="flex h-9 w-full items-center gap-2 rounded-lg px-2 text-[10px] font-medium text-[#667069] hover:bg-white/[0.025] hover:text-[#F4F7F5]">
              <LogOut className="size-3.5" />
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-[238px]">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.05] bg-[#050807]/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div>
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-[#667069]">
              Booster Account
            </p>
            <p className="mt-0.5 text-xs font-semibold text-[#F4F7F5]">
              {pathname === "/booster" ? "Dashboard" : "Orders"}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="text-[10px] font-medium text-[#A0AAA4] hover:text-[#F4F7F5]"
          >
            Customer account
          </Link>
        </header>

        {children}
      </div>
    </div>
  );
}
