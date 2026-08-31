import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "BoostingPedia Cookie Policy.",
};

const sections = [
  {
    title: "1. What cookies are",
    paragraphs: [
      "Cookies and similar storage technologies are small pieces of information stored or accessed on your device when you use a website. They can support login sessions, security, preferences, analytics and other functionality.",
    ],
  },
  {
    title: "2. Strictly necessary technologies",
    paragraphs: [
      "BoostingPedia may use strictly necessary cookies or similar technologies to authenticate users, maintain secure sessions, remember essential selections, prevent fraud, process checkout and operate features you request. These technologies are required for core platform functionality.",
    ],
  },
  {
    title: "3. Preference technologies",
    paragraphs: [
      "Preference technologies may remember choices such as interface settings or other selections so the website can provide a more consistent experience.",
    ],
  },
  {
    title: "4. Analytics technologies",
    paragraphs: [
      "If analytics tools are enabled, they may help us understand aggregated website usage, performance and errors. Where applicable law requires consent for analytics technologies, we will seek consent before activating them.",
    ],
  },
  {
    title: "5. Advertising or marketing technologies",
    paragraphs: [
      "BoostingPedia does not currently describe advertising cookies as necessary to use the service. If advertising or cross-site marketing technologies are introduced in the future, this policy and any consent controls should be updated before those technologies are used where consent is legally required.",
    ],
  },
  {
    title: "6. Third-party technologies",
    paragraphs: [
      "Payment, authentication, hosting, security or other service providers may use cookies or similar technologies when their services are embedded in or used by BoostingPedia. Their processing may also be governed by their own privacy or cookie notices.",
    ],
  },
  {
    title: "7. Managing cookies",
    paragraphs: [
      "You can usually control or delete cookies through your browser settings. Disabling strictly necessary technologies may prevent login, checkout, security or other requested features from working correctly.",
      "Where BoostingPedia introduces a consent-management interface for optional technologies, you may also use that interface to change eligible preferences.",
    ],
  },
  {
    title: "8. International users",
    paragraphs: [
      "Cookie and tracking rules vary by country. BoostingPedia intends to apply consent controls where required by applicable law, particularly for technologies that are not strictly necessary to provide a requested service.",
    ],
  },
  {
    title: "9. Changes to this Cookie Policy",
    paragraphs: [
      "This policy may be updated as we add or remove technologies, analytics providers or other integrations. The latest version will be posted here.",
    ],
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Cookie Policy"
      description="How BoostingPedia uses cookies and similar technologies to operate and improve the platform."
      lastUpdated="August 30, 2026"
      sections={sections}
    />
  );
}
