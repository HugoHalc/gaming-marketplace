import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center py-20">
      <Container className="max-w-xl text-center">
        <p className="text-sm font-semibold text-violet-300">404</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">This page does not exist.</h1>
        <p className="mt-4 text-[var(--muted-foreground)]">The link may be outdated, or the page may have moved.</p>
        <Button asChild className="mt-8"><Link href="/">Back to home</Link></Button>
      </Container>
    </main>
  );
}
