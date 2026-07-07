export const SUBSCRIPTION_TIERS = ["basic", "pro", "enterprise"] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export const BILLING_CYCLES = ["monthly", "annual"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

/** Q033 monthly list · Q034 annual per-month · Q036 launch stack */
export const TIER_PRICING = {
  basic: { monthlyList: 599, annualPerMonth: 499 },
  pro: { monthlyList: 1599, annualPerMonth: 1499 },
  enterprise: { monthlyList: 6999, annualPerMonth: 4999 },
} as const satisfies Record<
  SubscriptionTier,
  { monthlyList: number; annualPerMonth: number }
>;

export const LAUNCH_STACK = {
  foundersLockLimit: 500,
  first100Limit: 100,
  first100PayMonths: 10,
  first100GetMonths: 12,
  launchWindowMonths: 6,
} as const;

export const PLAN_DETAILS: Record<
  SubscriptionTier,
  { label: string; description: string; highlights: string[] }
> = {
  basic: {
    label: "Basic",
    description: "Path URL · WhatsApp catalog",
    highlights: ["25 products", "5-page site", "WhatsApp ordering"],
  },
  pro: {
    label: "Pro",
    description: "Subdomain · checkout · Tap & Blast",
    highlights: ["200 products", "Cart checkout", "Custom domain wizard"],
  },
  enterprise: {
    label: "Enterprise",
    description: "Multi-business · Supabase add-on",
    highlights: ["3 businesses", "2,000 products", "Priority support"],
  },
};

export function formatInr(amount: number): string {
  return amount.toLocaleString("en-IN");
}

export function getPerMonthPrice(tier: SubscriptionTier, cycle: BillingCycle): number {
  return cycle === "monthly" ? TIER_PRICING[tier].monthlyList : TIER_PRICING[tier].annualPerMonth;
}

export function getAnnualBilledTotal(tier: SubscriptionTier): number {
  return TIER_PRICING[tier].annualPerMonth * 12;
}

export function getAnnualSavings(tier: SubscriptionTier): { amount: number; percent: number } {
  const monthlyYear = TIER_PRICING[tier].monthlyList * 12;
  const annual = getAnnualBilledTotal(tier);
  const amount = monthlyYear - annual;
  const percent = Math.round((amount / monthlyYear) * 100);
  return { amount, percent };
}

export function getMaxAnnualSavingsPercent(): number {
  return Math.max(...SUBSCRIPTION_TIERS.map((tier) => getAnnualSavings(tier).percent));
}