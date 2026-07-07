export type PlanTaskStatus = "done" | "partial" | "external" | "pending";

export interface PlanTask {
  id: string;
  phase: 0 | 1 | 2 | 3 | 4;
  title: string;
  status: PlanTaskStatus;
  gate?: boolean;
  notes?: string;
}

export interface PhaseSummary {
  phase: 0 | 1 | 2 | 3 | 4;
  name: string;
  gate: string;
  tasks: PlanTask[];
}

export const IMPLEMENTATION_PLAN: PhaseSummary[] = [
  { phase: 0, name: "Foundation", gate: "Benjamin logs in as superadmin", tasks: [
    { id: "P0-01", phase: 0, title: "Infrastructure & LOCAL_DEV_SETUP", status: "done" },
    { id: "P0-02", phase: 0, title: "Layered codebase scaffold", status: "done" },
    { id: "P0-03", phase: 0, title: "Session auth + DEV_OTP", status: "done", notes: "SMS external" },
    { id: "P0-04", phase: 0, title: "Routing & middleware", status: "done" },
    { id: "P0-05", phase: 0, title: "Marketing surface", status: "done" },
    { id: "P0-06", phase: 0, title: "Platform dashboard shell", status: "done" },
    { id: "P0-07", phase: 0, title: "Superadmin skeleton", status: "done", gate: true },
    { id: "P0-08", phase: 0, title: "Public site placeholder", status: "done" },
    { id: "P0-09", phase: 0, title: "Database & migrations", status: "done" },
    { id: "P0-10", phase: 0, title: "Verification", status: "done" },
    { id: "P0-EXT", phase: 0, title: "Cloudflare wildcard SSL", status: "external" },
  ]},
  { phase: 1, name: "Soft beta", gate: "First paying Basic tenant with 5-page site", tasks: [
    { id: "P1-01", phase: 1, title: "Signup & onboarding", status: "done" },
    { id: "P1-02", phase: 1, title: "5-page builder", status: "done" },
    { id: "P1-03", phase: 1, title: "3 templates", status: "done" },
    { id: "P1-04", phase: 1, title: "Theme & branding", status: "done" },
    { id: "P1-05", phase: 1, title: "Publish gates Q019", status: "done", gate: true },
    { id: "P1-06", phase: 1, title: "Commerce Lite WhatsApp", status: "done" },
    { id: "P1-07", phase: 1, title: "Google Sheets connect", status: "partial" },
    { id: "P1-08", phase: 1, title: "Razorpay Basic billing", status: "partial" },
    { id: "P1-09", phase: 1, title: "ALINKS AI basic", status: "done" },
    { id: "P1-10", phase: 1, title: "Legal v1 publication", status: "external" },
    { id: "P1-12", phase: 1, title: "Testing foundation", status: "done" },
  ]},
  { phase: 2, name: "Pro commerce", gate: "Pro UPI checkout completes", tasks: [
    { id: "P2-01", phase: 2, title: "Subdomain + tier gate", status: "done" },
    { id: "P2-02", phase: 2, title: "Cart checkout Razorpay COD", status: "done", gate: true },
    { id: "P2-03", phase: 2, title: "Sheets Redis write queue", status: "done" },
    { id: "P2-04", phase: 2, title: "Tap & Blast", status: "done" },
    { id: "P2-05", phase: 2, title: "Custom domain wizard", status: "done" },
    { id: "P2-06", phase: 2, title: "Salon pay-then-book", status: "done" },
    { id: "P2-07", phase: 2, title: "Share & domain pages", status: "done" },
  ]},
  { phase: 3, name: "Public launch India", gate: "Open signup + marketing", tasks: [
    { id: "P3-01", phase: 3, title: "ALINKS AI + credits", status: "done" },
    { id: "P3-02", phase: 3, title: "Meta catalog feed", status: "done" },
    { id: "P3-03", phase: 3, title: "Staff + clinic gate", status: "done", gate: true },
    { id: "P3-04", phase: 3, title: "Promo codes", status: "done" },
    { id: "P3-05", phase: 3, title: "Sitemaps + schema.org", status: "done" },
    { id: "P3-06", phase: 3, title: "Ad network slots", status: "partial" },
    { id: "P3-07", phase: 3, title: "Launch checklist", status: "done" },
    { id: "P3-EXT", phase: 3, title: "Lawyer legal sign-off", status: "external" },
  ]},
  { phase: 4, name: "Growth", gate: "Supabase + i18n + verticals", tasks: [
    { id: "P4-01", phase: 4, title: "Supabase BYO connector", status: "done" },
    { id: "P4-02", phase: 4, title: "Multi-business switcher", status: "done", gate: true },
    { id: "P4-03", phase: 4, title: "Dashboard i18n 7 langs", status: "done" },
    { id: "P4-04", phase: 4, title: "International IN/SG/AE", status: "done" },
    { id: "P4-05", phase: 4, title: "Pharmacy OTC gate", status: "done" },
    { id: "P4-06", phase: 4, title: "Fresh veg grocery", status: "partial" },
    { id: "P4-07", phase: 4, title: "Meta Marketplace partner", status: "external" },
  ]},
];

export const EXTERNAL_BLOCKERS = [
  { id: "E-01", title: "Artix Pvt Ltd incorporated", status: "external" as const },
  { id: "E-02", title: "Lawyer finalize legal docs 01-14", status: "external" as const },
  { id: "E-03", title: "DPDP grievance officer appointed", status: "external" as const },
  { id: "E-04", title: "GST registration", status: "external" as const },
  { id: "E-05", title: "Razorpay partner live keys", status: "external" as const },
  { id: "E-06", title: "PhonePe partner application", status: "external" as const },
  { id: "E-07", title: "Cloudflare production DNS", status: "external" as const },
  { id: "E-08", title: "Meta Commerce partner", status: "external" as const },
];

export function getPlanProgress() {
  const all = IMPLEMENTATION_PLAN.flatMap((p) => p.tasks);
  const codeTasks = all.filter((t) => t.status !== "external");
  const done = codeTasks.filter((t) => t.status === "done").length;
  const partial = codeTasks.filter((t) => t.status === "partial").length;
  const pending = codeTasks.filter((t) => t.status === "pending").length;
  return { done, partial, pending, total: codeTasks.length, percent: Math.round((done / codeTasks.length) * 100) };
}

export function getPhaseProgress(phase: PhaseSummary) {
  const code = phase.tasks.filter((t) => t.status !== "external");
  const done = code.filter((t) => t.status === "done").length;
  return { done, total: code.length, percent: code.length ? Math.round((done / code.length) * 100) : 0 };
}
