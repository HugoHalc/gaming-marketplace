import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminSupportConsole } from "@/components/support/admin-support-console";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/marketing/site-header";
import { requireAdmin } from "@/features/auth/server/auth";

export const metadata = { title: "Live Support | BoostingPedia" };
export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  await requireAdmin();
  return <><SiteHeader/><main className="py-8 sm:py-10"><Container>
    <Link href="/admin" className="inline-flex items-center text-[11px] font-semibold text-white/55 hover:text-white"><ArrowLeft className="mr-1.5 size-3.5"/>Admin</Link>
    <div className="mt-5"><p className="font-gaming-label text-[10px] uppercase tracking-[0.14em] text-[#667069]">Customer Support</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-white">Live Support</h1><p className="mt-2 text-[12px] text-[#8A948E]">Answer pre-sale questions from website visitors and customers.</p></div>
    <div className="mt-6"><AdminSupportConsole/></div>
  </Container></main></>;
}
