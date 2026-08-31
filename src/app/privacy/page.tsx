import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "BoostingPedia Privacy Policy.",
};

const sections = [
  {
    title: "1. Who controls your information",
    paragraphs: [
      "BoostingPedia, operating from Jalisco, Mexico, is responsible for the personal information described in this Privacy Policy. Until a separate legal entity is formally established, the service operates under the BoostingPedia name.",
      "Privacy questions and rights requests may be sent to boostingpedia@gmail.com.",
    ],
  },
  {
    title: "2. Information we may collect",
    bullets: [
      "Account information such as name, email address, phone number, gamer tag and profile avatar.",
      "Order information such as selected game, service configuration, rank, platform, region, order status and communications related to fulfillment.",
      "Game-account access information where a purchased service requires temporary account access.",
      "Support communications, feedback, dispute information and records needed to resolve an order.",
      "Technical information such as IP address, device/browser information, security logs, session identifiers and cookie data.",
      "Payment-related information supplied to payment processors. BoostingPedia may receive transaction status and limited payment metadata, but card details may be handled directly by the payment provider.",
    ],
  },
  {
    title: "3. How we use information",
    bullets: [
      "Create and manage accounts.",
      "Process, assign, fulfill and support orders.",
      "Authenticate users and protect accounts.",
      "Process payments, refunds, disputes and fraud reviews.",
      "Communicate about orders, account changes and customer support.",
      "Improve reliability, security and platform performance.",
      "Comply with legal, tax, accounting, consumer-protection and regulatory obligations.",
    ],
  },
  {
    title: "4. Legal grounds and consent",
    paragraphs: [
      "Depending on your location and the type of processing, we may process information because it is necessary to provide a requested service, because you have given consent, because we have a legitimate business or security interest, or because processing is required by law.",
      "Where applicable law requires consent, you may withdraw consent for future processing, subject to processing that remains necessary for contractual, security or legal purposes.",
    ],
  },
  {
    title: "5. Sharing of information",
    paragraphs: [
      "We may share information only as reasonably necessary with boosters assigned to an order, payment processors, authentication providers, hosting and infrastructure providers, support tools, fraud-prevention providers, professional advisers and authorities where legally required.",
      "We do not sell personal information to advertisers.",
    ],
  },
  {
    title: "6. International transfers",
    paragraphs: [
      "Because BoostingPedia is intended to serve users internationally and may use service providers located in different countries, personal information may be processed outside your country of residence. Where applicable, we use contractual, organizational or other lawful safeguards appropriate to the transfer.",
    ],
  },
  {
    title: "7. Retention",
    paragraphs: [
      "We keep personal information only for as long as reasonably necessary for account administration, order fulfillment, security, dispute handling, legal compliance, accounting and legitimate business records. Retention periods may differ by data category and legal requirement.",
    ],
  },
  {
    title: "8. Security",
    paragraphs: [
      "We use reasonable administrative and technical measures intended to protect personal information, including authenticated access controls and restricted account-level permissions. No internet service can guarantee absolute security.",
    ],
  },
  {
    title: "9. Your privacy rights",
    paragraphs: [
      "Depending on your location, you may have rights to request access, correction, deletion/cancellation, objection, restriction, portability, withdrawal of consent or other privacy rights. In Mexico, applicable data-protection law provides rights commonly referred to as ARCO rights: access, rectification, cancellation and opposition.",
      "We may need to verify your identity before completing a privacy request. Requests can be sent to boostingpedia@gmail.com.",
    ],
  },
  {
    title: "10. Children and minors",
    paragraphs: [
      "BoostingPedia is intended for users who are at least 18 years old. A person under 18 may use the service only with authorization and supervision from a parent or legal guardian. We do not knowingly intend to collect information from minors acting without such authorization.",
    ],
  },
  {
    title: "11. Cookies and similar technologies",
    paragraphs: [
      "We use cookies and similar technologies for authentication, security, preferences and other website functions. Additional analytics or marketing technologies, if enabled, are addressed in our Cookie Policy and may require consent depending on your location.",
    ],
  },
  {
    title: "12. Updates to this Privacy Policy",
    paragraphs: [
      "We may revise this Privacy Policy when our services, providers, legal obligations or privacy practices change. The current version will always display its last-updated date.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      description="How BoostingPedia collects, uses, protects and shares personal information."
      lastUpdated="August 30, 2026"
      sections={sections}
    />
  );
}
