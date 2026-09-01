"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  LayoutGrid,
  LogOut,
  PackageCheck,
  PlayCircle,
} from "lucide-react";
import type { ReactNode } from "react";

interface BoosterShellProps {
  children: ReactNode;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  payoutRateBps: number;
}

export function BoosterShell({
  children,
  displayName,
  email,
  avatarUrl,
  payoutRateBps,
}: BoosterShellProps) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "available";
  const payoutPercent = (payoutRateBps / 100).toFixed(
    payoutRateBps % 100 === 0 ? 0 : 2,
  );

  const navigation = [
    { label: "Available Orders", href: "/booster", value: "available", icon: LayoutGrid },
    { label: "My Active Orders", href: "/booster?view=active", value: "active", icon: PlayCircle },
    { label: "Completed", href: "/booster?view=completed", value: "completed", icon: PackageCheck },
  ];

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "BP";

  return (
    <div className="min-h-screen bg-[#050807] text-[#F4F7F5]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[238px] border-r border-white/[0.06] bg-[#070A08] lg:flex lg:flex-col">
        <div className="border-b border-white/[0.05] px-5 py-5">
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
            Booster Workspace
          </p>
        </div>

        <nav className="flex-1 px-3 py-4">
          {navigation.map((item) => {
            const active = view === item.value;
            const Icon = item.icon;
            return (
              <Link
                key={item.value}
                href={item.href}
                className={`relative flex h-10 items-center gap-3 rounded-xl px-3 text-xs font-medium transition-colors ${
                  active
                    ? "bg-[#131B17] text-[#F4F7F5]"
                    : "text-[#A0AAA4] hover:bg-white/[0.025] hover:text-[#F4F7F5]"
                }`}
              >
                {active ? (
                  <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#39E56F]" />
                ) : null}
                <Icon className="size-4" strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.05] p-4">
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#090D0B] px-3 py-2.5">
            <CheckCircle2 className="size-4 text-[#82F5A4]" />
            <div>
              <p className="text-[10px] text-[#667069]">Your payout rate</p>
              <p className="font-gaming-value text-base font-bold text-[#F4F7F5]">
                {payoutPercent}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.08] bg-[#0E1411] text-[10px] font-bold">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
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
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.05] bg-[#050807]/92 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div>
            <p className="font-gaming-label text-[9px] uppercase tracking-[0.13em] text-[#667069]">
              Booster Marketplace
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
