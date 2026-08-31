import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "BoostingPedia Refund Policy.",
};

const sections = [
  {
    title: "1. General principle",
    paragraphs: [
      "Refunds are evaluated based on the status and progress of the purchased service. We aim to apply this policy consistently while preserving any mandatory consumer rights that apply in the customer’s jurisdiction.",
    ],
  },
  {
    title: "2. Cancellation before service begins",
    paragraphs: [
      "If you request cancellation before a booster has started work on the order, the order is eligible for a full refund of the service amount paid to BoostingPedia, subject to confirmation that fulfillment has not begun.",
    ],
  },
  {
    title: "3. Service already in progress",
    paragraphs: [
      "Once a booster has started the service, the order may be partially refundable or non-refundable depending on the progress already completed, resources committed and the portion of the service that has already been delivered.",
      "Where a partial refund applies, BoostingPedia may calculate the refund based on completed progression, completed wins, completed placement matches, elapsed fulfillment work or another reasonable unit relevant to the purchased service.",
    ],
  },
  {
    title: "4. Completed services",
    paragraphs: [
      "A service that has been fully completed according to the purchased configuration is not refundable, except where a refund is required by applicable law or where BoostingPedia determines that the service materially failed to match the completed order.",
    ],
  },
  {
    title: "5. BoostingPedia cannot deliver the service",
    paragraphs: [
      "If BoostingPedia determines that it cannot deliver an order and no acceptable alternative can be agreed with the customer, the undelivered service is eligible for a refund.",
    ],
  },
  {
    title: "6. Customer-caused interruption",
    paragraphs: [
      "Refund eligibility may be reduced or denied when completion is prevented by inaccurate information, loss of account access, customer interference with an active order, a customer-requested change outside the purchased scope, violation of game/platform requirements, or another circumstance caused by the customer.",
    ],
  },
  {
    title: "7. Game bans, restrictions and third-party actions",
    paragraphs: [
      "Game publishers and platforms operate independently from BoostingPedia. Refunds are not automatically owed solely because a publisher changes game rules, suspends servers, restricts an account or takes an enforcement action. Each case may be reviewed based on the service status and applicable consumer law.",
    ],
  },
  {
    title: "8. Chargebacks and suspected fraud",
    paragraphs: [
      "Chargebacks, unauthorized-payment claims, duplicate disputes and suspected fraud are subject to investigation. We may temporarily restrict the related account or order while reviewing payment records, order progress and communications.",
      "Customers should contact boostingpedia@gmail.com before initiating a payment dispute so we have an opportunity to resolve the issue.",
    ],
  },
  {
    title: "9. Refund method and processing time",
    paragraphs: [
      "Approved refunds will normally be returned to the original payment method where technically possible. The time for funds to appear may depend on the payment processor, card network, bank, currency or customer location.",
    ],
  },
  {
    title: "10. How to request a refund",
    paragraphs: [
      "Send your request to boostingpedia@gmail.com with the order number, account email and a short explanation of the issue. We may request additional information necessary to verify the order and determine progress.",
    ],
  },
  {
    title: "11. Mandatory consumer rights",
    paragraphs: [
      "This Refund Policy does not limit rights that cannot legally be waived under applicable consumer-protection law. Where mandatory law provides a customer with greater rights than this policy, those mandatory rights will apply.",
    ],
  },
];

export default function RefundsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund Policy"
      description="When an order may qualify for a full, partial or no refund."
      lastUpdated="August 30, 2026"
      sections={sections}
    />
  );
}
