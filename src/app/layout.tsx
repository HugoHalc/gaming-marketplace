import type { Metadata } from "next";
import { Geist, Geist_Mono, Rajdhani } from "next/font/google";
import { siteConfig } from "@/config/site";
import { SupportChatWidget } from "@/components/support/support-chat-widget";
import { TawkVisitorMonitoring } from "@/components/monitoring/tawk-visitor-monitoring";
import { AdminSupportAlerts } from "@/components/support/admin-support-alerts";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  referrer: "origin",
  robots: {
    index: siteConfig.allowIndexing,
    follow: siteConfig.allowIndexing,
    googleBot: {
      index: siteConfig.allowIndexing,
      follow: siteConfig.allowIndexing,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} min-h-screen antialiased`}>
        {children}
        <Suspense fallback={null}>
          <TawkVisitorMonitoring />
        </Suspense>
        <SupportChatWidget />
        <Suspense fallback={null}>
          <AdminSupportAlerts />
        </Suspense>
      </body>
    </html>
  );
}
