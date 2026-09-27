import type { QuotePreview } from "../types/configurator";

export const DOTA2_MMR_SERVICE_SLUG = "mmr-boost" as const;

export const DOTA2_CURRENT_MMR_MIN = 0;
export const DOTA2_CURRENT_MMR_MAX = 11999;
export const DOTA2_TARGET_MMR_MIN = 1;
export const DOTA2_TARGET_MMR_MAX = 12000;
export const DOTA2_MAX_ROLE_PREFERENCES = 2;

export const dota2ServerOptions = [
  { value: "us-east", label: "US East" },
  { value: "us-west", label: "US West" },
  { value: "south-america", label: "South America" },
  { value: "europe-west", label: "Europe West" },
  { value: "europe-east", label: "Europe East" },
  { value: "russia", label: "Russia" },
  { value: "southeast-asia", label: "Southeast Asia" },
  { value: "australia", label: "Australia" },
] as const;

export const dota2BehaviorScoreOptions = [
  { value: "8000-12000", label: "8,000–12,000", meta: "Included", modifierPercent: 0, customQuote: false },
  { value: "6000-7999", label: "6,000–7,999", meta: "+15%", modifierPercent: 15, customQuote: false },
  { value: "4000-5999", label: "4,000–5,999", meta: "+25%", modifierPercent: 25, customQuote: false },
  { value: "below-4000", label: "Below 4,000", meta: "Custom quote", modifierPercent: 0, customQuote: true },
] as const;

export const dota2BoostMethodOptions = [
  { value: "solo", label: "Solo", description: "Booster plays on your account.", modifierPercent: 0 },
  { value: "duo", label: "Duo", description: "You play with the booster.", modifierPercent: 75 },
] as const;

export const dota2PreferenceOptions = [
  { value: "none", label: "No Preference", meta: "Included", modifierPercent: 0 },
  { value: "roles", label: "Specific Roles", meta: "+10%", modifierPercent: 10 },
  { value: "hero", label: "Specific Hero", meta: "+20%", modifierPercent: 20 },
] as const;

export const dota2RoleOptions = [
  { value: "carry", label: "Carry" },
  { value: "mid", label: "Mid" },
  { value: "offlane", label: "Offlane" },
  { value: "soft-support", label: "Soft Support" },
  { value: "hard-support", label: "Hard Support" },
] as const;

export const dota2ExtraOptions = {
  privacyMode: { label: "Privacy Mode", meta: "FREE", modifierPercent: 0, fixedCents: 0, soloOnly: false },
  soloQueueOnly: { label: "Solo Queue Only", meta: "+20%", modifierPercent: 20, fixedCents: 0, soloOnly: true },
  expressDelivery: { label: "Express Delivery", meta: "+20%", modifierPercent: 20, fixedCents: 0, soloOnly: false },
  streaming: { label: "Streaming", meta: "+$10.00", modifierPercent: 0, fixedCents: 1000, soloOnly: true },
} as const;

export type Dota2Server = (typeof dota2ServerOptions)[number]["value"];
export type Dota2BehaviorScore = (typeof dota2BehaviorScoreOptions)[number]["value"];
export type Dota2BoostMethod = (typeof dota2BoostMethodOptions)[number]["value"];
export type Dota2Preference = (typeof dota2PreferenceOptions)[number]["value"];
export type Dota2Role = (typeof dota2RoleOptions)[number]["value"];

export type Dota2MmrQuoteMetadata = {
  currentBracket: string;
  targetBracket: string;
};

export type Dota2MmrCustomQuoteState = Dota2MmrQuoteMetadata & {
  reason: "immortal" | "behavior-score";
  message: string;
  supportingCopy: string;
};

export type Dota2MmrQuoteApiResponse = {
  quote?: QuotePreview;
  metadata?: Dota2MmrQuoteMetadata;
  customQuote?: Dota2MmrCustomQuoteState;
  error?: string;
};
