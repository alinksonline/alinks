import { LEGAL_DOC_VERSION } from "@/core/constants/legal";

export type LegalContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "table"; headers: [string, string]; rows: [string, string][] };

export type LegalDocumentSection = {
  id: string;
  title: string;
  blocks: LegalContentBlock[];
};

export type PlatformLegalDocument = {
  id: "tos" | "privacy" | "aup" | "grievance";
  slug: "/terms" | "/privacy" | "/aup" | "/grievance";
  title: string;
  checkboxLabel: string;
  subtitle: string;
  draftNotice: string;
  meta: string[];
  sections: LegalDocumentSection[];
};

const DRAFT_NOTICE =
  "Draft v0.1 — for product implementation only. Lawyer review required before public launch. Placeholders in [brackets] will be replaced with final approved text.";

export const PLATFORM_LEGAL_DOCS: Record<PlatformLegalDocument["id"], PlatformLegalDocument> = {
  tos: {
    id: "tos",
    slug: "/terms",
    title: "ALINKS Terms of Service",
    checkboxLabel: "Terms of Service",
    subtitle: "Tenant agreement between you and Artix for use of the ALINKS platform.",
    draftNotice: DRAFT_NOTICE,
    meta: [
      `Version: ${LEGAL_DOC_VERSION}`,
      "Party: Artix / Artix Private Limited",
      "Product: ALINKS",
      "Effective date: [DATE — lawyer to confirm]",
    ],
    sections: [
      {
        id: "acceptance",
        title: "1. Acceptance",
        blocks: [
          {
            type: "paragraph",
            text: "By creating an account, accessing the dashboard, or using ALINKS, you agree to these Terms of Service, our Privacy Policy, Acceptable Use Policy, and any addenda you accept (including the Payment Facilitation Addendum if you enable payments). If you do not agree, do not use the Platform.",
          },
        ],
      },
      {
        id: "what-alinks-is",
        title: "2. What ALINKS Is",
        blocks: [
          {
            type: "paragraph",
            text: "ALINKS is a software-as-a-service (SaaS) platform that provides tools to create and host a mobile-first mini-website (up to 5 pages), product catalog, booking, and optional checkout features, plus integration with third-party services such as Google Sheets, Supabase (bring-your-own), and payment gateways via Artix partners.",
          },
          {
            type: "paragraph",
            text: "Artix provides technology only. Artix is not your employer, partner, agent, franchisor, or co-seller of your products or services.",
          },
        ],
      },
      {
        id: "tenant-responsibility",
        title: "3. Tenant Is Solely Responsible for Their Business",
        blocks: [
          { type: "paragraph", text: "You alone are responsible for:" },
          {
            type: "bullets",
            items: [
              "Your business operations, products, services, pricing, and descriptions",
              "All licences, registrations, and permits (including FSSAI, drug licence, NMC/medical registration, GST, shop establishment, and others as applicable)",
              "Accuracy of listings, images, claims, MRP, weights, and expiry dates",
              "Food safety, product quality, professional conduct, and consumer complaints",
              "Appointments, salon packages, clinic bookings, and medical disclaimers",
              "Refunds, returns, cancellations, and disputes with your customers",
              "Tax on your sales (GST, TDS, etc.)",
              "Compliance with Consumer Protection Act 2019, ASCI, Legal Metrology, IT Act, DPDP Act 2023 (as applicable to you as data controller of your customer data), and all applicable laws",
            ],
          },
          {
            type: "paragraph",
            text: "Artix does not verify licences, FSSAI numbers, medical credentials, or product safety except where the Platform provides optional verification tools. Any approval or display on the Platform does not constitute Artix endorsement.",
          },
        ],
      },
      {
        id: "indemnity",
        title: "4. Indemnity",
        blocks: [
          {
            type: "paragraph",
            text: "You agree to indemnify, defend, and hold harmless Artix, its directors, officers, employees, and affiliates from any claims, damages, losses, penalties, or expenses (including reasonable legal fees) arising from your business, products, services, or conduct; your breach of these Terms or applicable law; claims by your customers, patients, or third parties; and content you publish or AI-generated content you approve and publish.",
          },
        ],
      },
      {
        id: "liability",
        title: "5. Limitation of Liability",
        blocks: [
          { type: "paragraph", text: "To the maximum extent permitted by law:" },
          {
            type: "bullets",
            items: [
              "Artix's total liability for any claim shall not exceed the fees paid by you to Artix in the 12 months preceding the claim, or INR [AMOUNT], whichever is lower. [Lawyer to set cap.]",
              "Artix is not liable for indirect, consequential, special, or punitive damages, lost profits, or loss of data in your Google or Supabase accounts.",
              "Artix is not liable for third-party services (Google, Supabase, Razorpay, PhonePe, SMS providers, hosting outages).",
            ],
          },
        ],
      },
      {
        id: "billing",
        title: "6. Subscription & Billing",
        blocks: [
          {
            type: "bullets",
            items: [
              "Fees for Basic, Pro, and Enterprise tiers are as published on alinks.online",
              "Subscriptions renew per your chosen plan (monthly or annual)",
              "Taxes (GST) apply as per law",
              "Refunds of ALINKS subscription fees: see Subscription Refund Policy",
              "Artix subscription fees are separate from your customer sales",
            ],
          },
        ],
      },
      {
        id: "account",
        title: "7. Account & Trial",
        blocks: [
          {
            type: "bullets",
            items: [
              "A 14-day trial may be offered; public publish may require a paid plan",
              "Phone verification and business details may be required at signup",
              "Unpaid accounts after trial: site may be unpublished per Platform policy",
              "You must provide accurate registration information",
            ],
          },
        ],
      },
      {
        id: "aup-ref",
        title: "8. Acceptable Use",
        blocks: [
          {
            type: "paragraph",
            text: "You must comply with the Acceptable Use Policy. Prohibited uses include illegal goods, counterfeit products, unlicensed pharmacy, fake medical credentials, fraud, and content that violates law.",
          },
        ],
      },
      {
        id: "termination",
        title: "9. Suspension & Termination",
        blocks: [
          { type: "paragraph", text: "Artix may suspend or terminate your account for breach of Terms or AUP, complaints, fraud, illegal listings, non-payment, or fake licences or misrepresentation. You may cancel per dashboard; export obligations per Data Addendum." },
        ],
      },
      {
        id: "ip",
        title: "10. Intellectual Property",
        blocks: [
          {
            type: "bullets",
            items: [
              "Artix owns the Platform, ALINKS brand, Tap & Blast, templates, and code",
              "You own your business content, product images, and customer data in your designated storage (Google/Supabase)",
              "Licence grant: you may use ALINKS during subscription; Basic tier may display ALINKS branding; Pro+ may remove per tier features",
            ],
          },
        ],
      },
      {
        id: "ai",
        title: "11. AI Features (ALINKS AI)",
        blocks: [
          {
            type: "bullets",
            items: [
              "AI generates drafts; you must review before publish",
              "You are liable for published AI content",
              "AI credits: included allowances and paid packs per published pricing",
              "Client-facing AI consumes paid credits; not included in base subscription",
            ],
          },
        ],
      },
      {
        id: "payments",
        title: "12. Payments (If Enabled)",
        blocks: [
          {
            type: "paragraph",
            text: "If you enable checkout, you also accept the Payment Facilitation Addendum. You are seller of record. Artix facilitates payment routing only.",
          },
        ],
      },
      {
        id: "data",
        title: "13. Data",
        blocks: [
          {
            type: "paragraph",
            text: "See Privacy Policy and Data & Storage Addendum. Artix stores tenant account data only. Customer and patient data is stored in your Google Sheets or your Supabase — not on Artix servers.",
          },
        ],
      },
      {
        id: "modifications",
        title: "14. Modifications",
        blocks: [
          {
            type: "paragraph",
            text: "We may update these Terms with notice (email or dashboard). Material changes may require re-acceptance. Continued use after notice constitutes acceptance unless law requires explicit consent.",
          },
        ],
      },
      {
        id: "law",
        title: "15. Governing Law & Disputes",
        blocks: [
          {
            type: "paragraph",
            text: "These Terms are governed by the laws of India. Courts at [Vijayawada / Hyderabad — lawyer to confirm] shall have exclusive jurisdiction. You agree to attempt good-faith resolution before litigation.",
          },
        ],
      },
      {
        id: "contact",
        title: "16. Grievance & Contact",
        blocks: [
          {
            type: "bullets",
            items: [
              "Grievance Officer: [NAME, EMAIL — see Grievance Officer notice]",
              "Support: support@alinks.online",
              "Registered address: [ARTIX ADDRESS]",
            ],
          },
        ],
      },
      {
        id: "misc",
        title: "17. Miscellaneous",
        blocks: [
          {
            type: "paragraph",
            text: "Severability, no waiver, assignment (Artix may assign; you may not without consent), entire agreement with Privacy Policy and accepted addenda.",
          },
        ],
      },
    ],
  },
  privacy: {
    id: "privacy",
    slug: "/privacy",
    title: "ALINKS Privacy Policy",
    checkboxLabel: "Privacy Policy",
    subtitle: "How Artix collects, uses, stores, and protects personal data of ALINKS tenants (business owners).",
    draftNotice: DRAFT_NOTICE,
    meta: [
      `Version: ${LEGAL_DOC_VERSION}`,
      "Data Fiduciary: Artix / Artix Private Limited",
      "Product: ALINKS",
      "DPDP Act 2023 alignment — lawyer review required",
    ],
    sections: [
      {
        id: "scope",
        title: "1. Scope",
        blocks: [
          {
            type: "paragraph",
            text: "This Policy explains how Artix collects, uses, stores, and protects personal data of tenants (business owners who register for ALINKS).",
          },
          {
            type: "paragraph",
            text: "Important — end-customer data: Artix does not store your customers', patients', or buyers' personal data on Artix servers. That data is written to storage you own and control: your Google Account (Google Sheets / Drive), or your Supabase project (BYO model). See Data & Storage Addendum. For how you handle customer data, you must publish your own Privacy Policy on your mini-site.",
          },
        ],
      },
      {
        id: "collect",
        title: "2. Data We Collect (Tenants)",
        blocks: [
          {
            type: "bullets",
            items: [
              "Account: name, phone, email, business name, vertical, address, GSTIN (optional)",
              "Billing: subscription tier, payment history, invoices, Razorpay payment IDs",
              "Technical: IP address, device, browser, session logs, security logs",
              "Platform use: pages edited, products added, feature usage, AI credit balance",
              "OAuth tokens: encrypted Google/Supabase connection tokens (not sheet content)",
              "KYC (Pro payments): PAN, bank details — submitted to payment partners via Artix wizard; purpose-limited",
              "Legal acceptances: which documents you agreed to, version, timestamp, IP",
            ],
          },
        ],
      },
      {
        id: "not-collect",
        title: "3. Data We Do Not Collect or Retain",
        blocks: [
          {
            type: "bullets",
            items: [
              "Customer names, phones, orders, appointments, patient details (permanent storage)",
              "Full contents of your Google Sheets or Supabase tables",
              "Card numbers (payments via hosted payment gateway checkout only)",
              "Clinical diagnoses or medical records",
            ],
          },
          {
            type: "paragraph",
            text: "Transient processing: during a booking or checkout request, customer fields may exist in server memory only long enough to append to your Google Sheet or Supabase, then are discarded.",
          },
        ],
      },
      {
        id: "purpose",
        title: "4. Purpose of Processing",
        blocks: [
          {
            type: "bullets",
            items: [
              "Provide and improve ALINKS services",
              "Billing and subscription management",
              "Authentication and security",
              "Payment facilitation onboarding (sub-merchant KYC to partners)",
              "Support and abuse prevention",
              "Legal compliance and dispute resolution",
              "Aggregated analytics (no customer PII)",
            ],
          },
        ],
      },
      {
        id: "legal-basis",
        title: "5. Legal Basis (DPDP)",
        blocks: [
          {
            type: "bullets",
            items: [
              "Consent: signup, optional features, marketing (if any)",
              "Contract: necessary to provide subscribed services",
              "Legal obligation: tax, fraud prevention, lawful requests",
              "Legitimate uses: security, platform integrity",
            ],
          },
        ],
      },
      {
        id: "sharing",
        title: "6. Sharing & Sub-processors",
        blocks: [
          { type: "paragraph", text: "We may share tenant data with the following recipients. We do not sell tenant personal data." },
          {
            type: "table",
            headers: ["Recipient", "Purpose"],
            rows: [
              ["Razorpay / PhonePe", "Subscription + sub-merchant KYC"],
              ["Google", "OAuth, Sheets API (your account)"],
              ["Supabase", "OAuth connect (your project)"],
              ["Cloudflare / Vercel", "Hosting, CDN"],
              ["MSG91 / SMS", "OTP, notifications (if enabled)"],
              ["OpenRouter / Perplexity", "ALINKS AI generation (tenant content)"],
            ],
          },
        ],
      },
      {
        id: "transfers",
        title: "7. International Transfers",
        blocks: [
          {
            type: "paragraph",
            text: "Some sub-processors may process data outside India. We use appropriate safeguards as required by law.",
          },
        ],
      },
      {
        id: "retention",
        title: "8. Retention",
        blocks: [
          {
            type: "bullets",
            items: [
              "Active account: duration of subscription plus reasonable period",
              "Billing records: as required by tax law (typically 6–8 years)",
              "Security logs: 90 days [lawyer to confirm]",
              "Deleted account: tenant config removed; legal/billing records retained per law",
              "OAuth tokens: deleted on disconnect or account deletion",
            ],
          },
        ],
      },
      {
        id: "rights",
        title: "9. Your Rights (DPDP)",
        blocks: [
          {
            type: "paragraph",
            text: "Tenants may request access, correction, erasure (subject to legal retention), grievance redressal, and nominate a contact for exercise of rights upon death or incapacity. Contact the Grievance Officer. Response within timelines per DPDP rules.",
          },
        ],
      },
      {
        id: "security",
        title: "10. Security",
        blocks: [
          {
            type: "paragraph",
            text: "HTTPS, encryption at rest for sensitive fields, access controls, PIN/biometric for dashboard (product feature). No system is 100% secure; report concerns promptly.",
          },
        ],
      },
      {
        id: "breach",
        title: "11. Breach Notification",
        blocks: [
          {
            type: "paragraph",
            text: "We will notify affected tenants and authorities as required by DPDP and applicable law.",
          },
        ],
      },
      {
        id: "children",
        title: "12. Children",
        blocks: [
          { type: "paragraph", text: "ALINKS is for business users. Not directed at children under 18." },
        ],
      },
      {
        id: "changes",
        title: "13. Changes",
        blocks: [
          {
            type: "paragraph",
            text: "We will update this Policy with notice. Material changes may require re-consent.",
          },
        ],
      },
      {
        id: "contact",
        title: "14. Contact",
        blocks: [
          {
            type: "bullets",
            items: [
              "Data Protection / Grievance Officer: [NAME, EMAIL, ADDRESS]",
              "Email: privacy@alinks.online",
            ],
          },
        ],
      },
    ],
  },
  aup: {
    id: "aup",
    slug: "/aup",
    title: "ALINKS Acceptable Use Policy",
    checkboxLabel: "Acceptable Use Policy",
    subtitle: "Rules that protect the Platform, users, and the public from illegal, harmful, or abusive use.",
    draftNotice: DRAFT_NOTICE,
    meta: [
      `Version: ${LEGAL_DOC_VERSION}`,
      "Part of Platform Terms of Service",
      "Standalone URL: alinks.online/aup",
    ],
    sections: [
      {
        id: "purpose",
        title: "1. Purpose",
        blocks: [
          {
            type: "paragraph",
            text: "This Acceptable Use Policy (AUP) protects the Platform, users, and the public from illegal, harmful, or abusive use of ALINKS.",
          },
        ],
      },
      {
        id: "prohibited",
        title: "2. Prohibited Content & Conduct",
        blocks: [
          { type: "paragraph", text: "Tenants must not use ALINKS to:" },
          {
            type: "bullets",
            items: [
              "Sell illegal goods or services under Indian law",
              "Sell prescription-only medicines without a valid drug licence (pharmacy vertical)",
              "Offer medical services without valid registration (NMC/state council/AYUSH)",
              "Impersonate doctors, hospitals, or government bodies",
              "Sell counterfeit, stolen, or IP-infringing products",
              "Publish false claims (health cures, guaranteed income, fake certifications)",
              "Facilitate fraud, phishing, or payment scams",
              "Harass, discriminate, or publish hate content",
              "Distribute malware or attempt to breach Platform security",
              "Scrape or overload Platform APIs abusively",
              "Resell ALINKS access without authorization",
              "Use affiliate links without ASCI-compliant disclosure (#ad / sponsored)",
            ],
          },
        ],
      },
      {
        id: "high-risk",
        title: "3. High-Risk Categories (Extra Scrutiny)",
        blocks: [
          {
            type: "bullets",
            items: [
              "Pharmacy: OTC only; drug licence mandatory on file",
              "Clinic/doctor: NMC/reg number mandatory; ALINKS Verify pipeline",
              "Food/grocery: no false organic/FSSAI claims",
              "Financial products: prohibited unless licensed",
            ],
          },
        ],
      },
      {
        id: "moderation",
        title: "4. Moderation",
        blocks: [
          { type: "paragraph", text: "Artix may:" },
          {
            type: "bullets",
            items: [
              "Remove or hide listings",
              "Suspend checkout or publishing",
              "Terminate accounts",
              "Report to authorities where legally required",
              "Cooperate with law enforcement and grievance requests per IT Act",
            ],
          },
        ],
      },
      {
        id: "cooperation",
        title: "5. Tenant Cooperation",
        blocks: [
          {
            type: "paragraph",
            text: "You must respond to takedown notices and provide licence proof when requested.",
          },
        ],
      },
      {
        id: "reporting",
        title: "6. Reporting",
        blocks: [
          {
            type: "paragraph",
            text: "Report abuse: abuse@alinks.online. Grievance Officer details are published in our legal notices.",
          },
        ],
      },
      {
        id: "monitoring",
        title: "7. No Duty to Monitor",
        blocks: [
          {
            type: "paragraph",
            text: "Artix is not obligated to pre-screen all content but may do so. Intermediary safe harbour is subject to due diligence compliance under applicable law.",
          },
        ],
      },
    ],
  },
  grievance: {
    id: "grievance",
    slug: "/grievance",
    title: "DPDP Grievance Officer",
    checkboxLabel: "Grievance notice",
    subtitle: "Contact and grievance redressal under the Digital Personal Data Protection Act, 2023.",
    draftNotice: DRAFT_NOTICE,
    meta: [
      `Version: ${LEGAL_DOC_VERSION}`,
      "Data Fiduciary: Artix / Artix Private Limited",
      "Product: ALINKS — https://alinks.online",
      "Effective date: [DATE — lawyer to confirm]",
    ],
    sections: [
      {
        id: "officer",
        title: "Grievance Officer",
        blocks: [
          {
            type: "paragraph",
            text: "In accordance with the Digital Personal Data Protection Act, 2023, Artix has appointed a Grievance Officer for privacy-related complaints regarding your ALINKS tenant account.",
          },
          {
            type: "table",
            headers: ["Contact", "Details"],
            rows: [
              ["Grievance Officer", "[FULL NAME — to be appointed]"],
              ["Email", "grievance@alinks.online"],
              ["Privacy requests", "privacy@alinks.online"],
              ["Security issues", "security@alinks.online"],
              ["Registered address", "[REGISTERED OFFICE — lawyer to confirm]"],
            ],
          },
        ],
      },
      {
        id: "rights",
        title: "Your rights (tenant account data)",
        blocks: [
          {
            type: "paragraph",
            text: "You may request access, correction, erasure, or grievance redressal for personal data Artix processes about you as an ALINKS business owner (name, email, phone, billing metadata, session logs).",
          },
          {
            type: "bullets",
            items: [
              "Export your account data: Dashboard → Settings → Export my data",
              "Delete your account: Dashboard → Settings → Delete account",
              "Response time: within [X] days per applicable rules [lawyer to set]",
            ],
          },
        ],
      },
      {
        id: "tenant-customers",
        title: "End-customer data (not Artix)",
        blocks: [
          {
            type: "paragraph",
            text: "If your complaint is about a specific shop, salon, or clinic on ALINKS, contact that business directly. Artix does not control customer data stored in tenant Google Sheets or tenant-owned Supabase projects.",
          },
        ],
      },
    ],
  },
};

export function getPlatformLegalDocument(id: PlatformLegalDocument["id"]): PlatformLegalDocument {
  return PLATFORM_LEGAL_DOCS[id];
}