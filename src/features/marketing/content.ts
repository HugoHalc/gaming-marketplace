import {
  Clock3,
  Headphones,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export const popularServices = [
  {
    game: "League of Legends",
    name: "Rank Boost",
    description: "Move toward your target rank with a configurable, transparent service flow.",
    price: "From $12.99",
    tag: "Most popular",
  },
  {
    game: "VALORANT",
    name: "Competitive Wins",
    description: "Choose the number of wins you need and tailor the service to your preferences.",
    price: "From $9.99",
    tag: "Fast delivery",
  },
  {
    game: "Marvel Rivals",
    name: "Coaching",
    description: "Focused one-on-one sessions designed around mechanics, decisions, and consistency.",
    price: "From $24.99",
    tag: "1-on-1",
  },
] as const;

export const howItWorks = [
  {
    step: "01",
    title: "Choose your game",
    description: "Browse supported titles and select the service that matches your goal.",
  },
  {
    step: "02",
    title: "Configure your service",
    description: "Set your current position, target, region, queue, priority, and optional preferences.",
  },
  {
    step: "03",
    title: "Track your order",
    description: "After checkout, follow progress from your account with clear status updates.",
  },
] as const;

export const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "Server-validated pricing",
    description: "Your quote updates with the selected configuration and is validated server-side before the order is created.",
  },
  {
    icon: LockKeyhole,
    title: "Payment through Stripe",
    description: "When payment is required, checkout is processed through Stripe.",
  },
  {
    icon: Clock3,
    title: "Dashboard order tracking",
    description: "Your dashboard keeps order status and order details connected to the order.",
  },
  {
    icon: Sparkles,
    title: "Account access after checkout",
    description: "For Account Boost, account access is requested only after your order is placed.",
  },
  {
    icon: Headphones,
    title: "Order communication",
    description: "When a booster is assigned, you can communicate through the order workspace.",
  },
  {
    icon: Zap,
    title: "Site support",
    description: "Contact BoostingPedia Support through the site before or after placing an order.",
  },
] as const;

export type MarketingFaq = {
  question: string;
  answer: string;
  href?: string;
  linkLabel?: string;
};

export const faqs: readonly MarketingFaq[] = [
  {
    question: "How does the service work?",
    answer: "Choose a game and service, configure the options available for that service, and review the current quote. When you continue, BoostingPedia creates the order and takes you through payment and the order workspace.",
  },
  {
    question: "How is my price calculated?",
    answer: "Your quote updates from the configuration you select. Pricing is calculated and validated server-side before the order is created, and the configurator shows the current calculated total for those selections.",
  },
  {
    question: "Can my price change while I configure?",
    answer: "Yes. Changing an option can change the current quote when that option affects the service. Service-card Starting from prices are catalog entry prices; the configurator shows the current calculated total for your selections.",
  },
  {
    question: "What happens after I place an order?",
    answer: "Your order is added to your dashboard and, when payment is required, checkout is completed through Stripe. The order workspace keeps status, order details, and fulfillment communication connected as the order progresses.",
  },
  {
    question: "Can I track my order and talk to my booster?",
    answer: "Yes. You can track your order from your dashboard. Once an applicable order has an assigned booster, you can communicate with them through the order workspace.",
  },
  {
    question: "How does Account Boost work?",
    answer: "For Account Boost, the booster completes the service on your account. Account access is requested only after your order is placed, and relevant login coordination can happen through the order workspace.",
  },
  {
    question: "How are payments processed?",
    answer: "Payment is processed through Stripe. The payment options available to you are shown during Stripe checkout.",
  },
  {
    question: "What if I need help, cancel, or request a refund?",
    answer: "Use the site support chat if you need help with a service or an order. Cancellation and refund eligibility depends on the order status and progress; the Refund Policy explains the current terms.",
    href: "/refunds",
    linkLabel: "Read the Refund Policy",
  },
];
