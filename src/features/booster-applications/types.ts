export const applicationStatusLabels = {
  submitted: "Application submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Not approved",
  withdrawn: "Withdrawn",
} as const;
export type ApplicationStatus = keyof typeof applicationStatusLabels;
export const activeApplicationStatuses: ApplicationStatus[] = [
  "submitted",
  "under_review",
];
export type CandidateApplication = {
  id: string;
  status: ApplicationStatus;
  requested_games: string[];
  platforms: Record<string, string[]>;
  experience: string;
  weekly_hours: number;
  timezone: string;
  submitted_at: string;
  updated_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
  version: number;
};
export type AdminApplication = CandidateApplication & {
  user_id: string;
  email: string;
  full_name: string | null;
  gamer_tag: string | null;
  internal_note: string;
  history: {
    actor_id: string;
    from_status: ApplicationStatus;
    to_status: ApplicationStatus;
    internal_note: string;
    created_at: string;
  }[];
};
export type ApplicationActionState = {
  error?: string;
  success?: string;
  fields?: Record<string, string>;
};
export const applicationInputClass =
  "mt-2 min-h-11 w-full min-w-0 rounded-lg border border-white/15 bg-[#0B110E] px-3 py-2 text-sm text-[#F4F7F5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#82F5A4]";
export const applicationButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-[#39E56F]/25 bg-[#39E56F]/10 px-4 py-2 text-sm font-semibold text-[#82F5A4] hover:bg-[#39E56F]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#82F5A4] disabled:opacity-50";
export function applicationDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export const applicationConfirmations = [
  {
    name: "approval",
    label:
      "I understand that submitting an application does not guarantee approval.",
  },
  {
    name: "onPlatform",
    label: "I will manage orders and conversations within BoostingPedia.",
  },
  { name: "privacy", label: "I will protect customer information." },
  { name: "rules", label: "I will follow the platform’s operational rules." },
] as const;
