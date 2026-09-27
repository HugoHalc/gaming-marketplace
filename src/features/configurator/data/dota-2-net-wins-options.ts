import type { QuotePreview } from "../types/configurator";
import type {
  Dota2BehaviorScore,
  Dota2BoostMethod,
  Dota2Preference,
  Dota2Role,
  Dota2Server,
} from "./dota-2-mmr-options";

export const DOTA2_NET_WINS_SERVICE_SLUG = "net-wins" as const;
export const DOTA2_NET_WINS_MIN = 1;
export const DOTA2_NET_WINS_MAX = 20;

export type Dota2NetWinsQuoteMetadata = {
  currentBracket: string;
  rateCentsPerWin: number;
};

export type Dota2NetWinsCustomQuoteState = Dota2NetWinsQuoteMetadata & {
  reason: "immortal" | "behavior-score";
  message: string;
  supportingCopy: string;
};

export type Dota2NetWinsQuoteApiResponse = {
  quote?: QuotePreview;
  metadata?: Dota2NetWinsQuoteMetadata;
  customQuote?: Dota2NetWinsCustomQuoteState;
  error?: string;
};

export type Dota2NetWinsValidatedSelection = {
  currentMmr: number;
  netWins: number;
  server: Dota2Server;
  behaviorScore: Dota2BehaviorScore;
  boostMethod: Dota2BoostMethod;
  preference: Dota2Preference;
  roles: Dota2Role[];
  heroName: string;
  privacyMode: boolean;
  soloQueueOnly: boolean;
  expressDelivery: boolean;
  streaming: boolean;
};
