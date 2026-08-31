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
    title: "Secure by design",
    description: "Server-validated pricing, protected account flows, and secure payment architecture.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    description: "A performance-first storefront designed to stay fast on desktop and mobile.",
  },
  {
    icon: LockKeyhole,
    title: "Privacy focused",
    description: "Sensitive order information stays scoped to the people who need access.",
  },
  {
    icon: Headphones,
    title: "Order support",
    description: "Every purchase is designed around clear progress, communication, and accountability.",
  },
  {
    icon: Clock3,
    title: "Clear expectations",
    description: "Transparent configuration and delivery context before you place an order.",
  },
  {
    icon: Sparkles,
    title: "Premium experience",
    description: "No clutter, no confusing forms, and no surprise pricing at the end of checkout.",
  },
] as const;

export const testimonials = [
  {
    quote: "The entire process felt much more polished than the marketplaces I had used before. The order status was especially clear.",
    name: "Jordan M.",
    detail: "League of Legends customer",
  },
  {
    quote: "I knew what I was selecting and what it would cost before checkout. That sounds basic, but it makes a huge difference.",
    name: "Alex R.",
    detail: "VALORANT customer",
  },
  {
    quote: "Fast, clean, and easy to use from my phone. I did not need to message support just to understand what was happening.",
    name: "Taylor K.",
    detail: "Marvel Rivals customer",
  },
] as const;

export const faqs = [
  {
    question: "How is the final service price calculated?",
    answer: "Your final price is based on the service configuration you select, including your current position, target, region, queue, priority, and any eligible options. The total is validated before checkout so there are no unexpected price changes.",
  },
  {
    question: "Can I track my order after purchase?",
    answer: "Yes. Once your order is placed, you can follow its progress from your account with clear status updates and order details.",
  },
  {
    question: "What payment methods are available?",
    answer: "Payments are processed securely through Stripe. Available payment methods may vary depending on your country, currency, and device.",
  },
  {
    question: "Will more games and services be added?",
    answer: "Yes. BoostingPedia is built to expand over time with additional games, services, and configurable options without changing the core marketplace experience.",
  },
] as const;
