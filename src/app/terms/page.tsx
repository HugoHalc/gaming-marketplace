import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "BoostingPedia Terms & Conditions.",
};

const sections = [
  {
    title: "1. About BoostingPedia",
    paragraphs: [
      "These Terms & Conditions govern access to and use of BoostingPedia, a gaming-services marketplace operated from Jalisco, Mexico. Until a separate legal entity is formally established, references to “BoostingPedia,” “we,” “us,” or “our” refer to the BoostingPedia business operating the platform.",
      "BoostingPedia is an independent marketplace and is not affiliated with, endorsed by, or sponsored by the publishers or owners of the games referenced on the platform.",
    ],
  },
  {
    title: "2. Eligibility",
    paragraphs: [
      "You must be at least 18 years old to purchase services on your own behalf. If you are under 18, you may use the platform only with the authorization and supervision of a parent or legal guardian who accepts responsibility for the transaction.",
      "By placing an order, you represent that the information you provide is accurate and that you have authority to use the payment method and any game account involved in the service.",
    ],
  },
  {
    title: "3. Services and order configuration",
    paragraphs: [
      "BoostingPedia offers game-related services whose scope, configuration, price and expected delivery conditions are shown before checkout. Service availability may depend on game, rank, region, platform, playlist, queue conditions, account status, booster availability and other operational factors.",
      "Quoted delivery times, when shown, are estimates unless expressly stated otherwise. We do not guarantee uninterrupted access to third-party game servers or services outside our control.",
    ],
  },
  {
    title: "4. Customer responsibilities",
    bullets: [
      "Provide accurate order, platform, rank, region and account information.",
      "Maintain access to the email or communication channel used for the order.",
      "Do not intentionally interfere with an active service or provide conflicting instructions to multiple service providers.",
      "Review and understand the rules, terms and enforcement policies of the relevant game publisher or platform before ordering.",
      "Use the service only where lawful and permitted for you to do so.",
    ],
  },
  {
    title: "5. Account-access services",
    paragraphs: [
      "Certain services may require temporary access to a customer’s game account. Where this applies, access information should be provided only through the workflow designated by BoostingPedia. Customers remain responsible for maintaining the security of their personal email, payment accounts and any unrelated credentials.",
      "Third-party game publishers may restrict account sharing, boosting or similar activity. BoostingPedia does not control publisher enforcement decisions and cannot guarantee that a publisher will not take action under its own terms or policies.",
    ],
  },
  {
    title: "6. Payments",
    paragraphs: [
      "Prices are presented before checkout and may vary based on service configuration. Payment processing may be handled by third-party payment providers. Additional bank, currency-conversion or card-issuer charges may be imposed by third parties and are not controlled by BoostingPedia.",
      "Orders may be paused or cancelled where payment is declined, reversed, disputed, suspected to be fraudulent or otherwise requires verification.",
    ],
  },
  {
    title: "7. Refunds and cancellations",
    paragraphs: [
      "Refund eligibility is governed by our Refund Policy. In general, orders cancelled before a booster begins are eligible for a full refund; services already in progress may qualify for a partial refund based on progress; completed services are not refundable; and orders BoostingPedia cannot deliver may be refunded.",
      "Chargebacks, payment disputes and suspected fraud may be investigated before an account, order or refund is resolved.",
    ],
  },
  {
    title: "8. Prohibited conduct",
    bullets: [
      "Fraud, stolen payment methods, chargeback abuse or false identity information.",
      "Harassment, threats or abusive conduct toward boosters, support staff or other users.",
      "Attempting to bypass the platform to avoid payment obligations or security controls.",
      "Using BoostingPedia for unlawful activity or to violate the rights of another person.",
      "Interfering with the website, security systems, payment systems or other users’ accounts.",
    ],
  },
  {
    title: "9. Suspension and termination",
    paragraphs: [
      "We may suspend an order or account where reasonably necessary to investigate fraud, security concerns, abusive conduct, payment disputes, violations of these Terms or risks to the platform or its users. Where appropriate, we may request additional verification before continuing service.",
    ],
  },
  {
    title: "10. Intellectual property",
    paragraphs: [
      "The BoostingPedia name, branding, website design, original graphics and platform content are owned by or licensed to BoostingPedia. Game names, logos and other third-party trademarks remain the property of their respective owners.",
    ],
  },
  {
    title: "11. Disclaimers and limitation of liability",
    paragraphs: [
      "BoostingPedia provides the platform and services on a commercially reasonable basis but does not control third-party game servers, publishers, payment networks, internet providers or platform outages. Nothing in these Terms excludes liability or consumer rights that cannot legally be excluded.",
      "To the maximum extent permitted by applicable law, BoostingPedia is not responsible for indirect, incidental or consequential losses arising from events outside its reasonable control.",
    ],
  },
  {
    title: "12. International customers",
    paragraphs: [
      "BoostingPedia may serve customers in multiple countries. These Terms are intended to operate globally, but mandatory consumer, privacy or digital-service rights in your country may still apply and are not waived where the law does not permit waiver.",
    ],
  },
  {
    title: "13. Governing law and disputes",
    paragraphs: [
      "These Terms are governed by the laws of Mexico, with the business domiciled in Jalisco, Mexico, except where mandatory laws in a customer’s jurisdiction require otherwise. Before initiating formal proceedings, we encourage customers to contact us so we can attempt to resolve the issue directly.",
    ],
  },
  {
    title: "14. Changes to these Terms",
    paragraphs: [
      "We may update these Terms to reflect changes in services, law, payment methods, security practices or platform operations. The current version and effective date will be posted on this page.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      description="The rules that apply when you access BoostingPedia, create an account or purchase gaming services."
      lastUpdated="August 30, 2026"
      sections={sections}
    />
  );
}
