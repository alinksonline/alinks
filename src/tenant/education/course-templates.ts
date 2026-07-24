/** Starter courses for education industry types. */

export type CourseTemplate = {
  title: string;
  description: string;
  subject: string;
  mode: string;
  feeLabel: string;
  feeAmount: number | null;
  /** Famous public YouTube sample — tenants replace with their channel */
  youtubeUrl: string;
  sortOrder: number;
};

/** Sample embed uses a well-known public video id format for template only. */
const SAMPLE_YT = "https://www.youtube.com/watch?v=jNQXAC9IVRw";

export const TUITION_COURSE_TEMPLATES: CourseTemplate[] = [
  {
    title: "Class 10 Maths",
    description: "Board exam prep · free demo on request",
    subject: "Maths",
    mode: "tuition",
    feeLabel: "From ₹2,500 / mo",
    feeAmount: 2500,
    youtubeUrl: SAMPLE_YT,
    sortOrder: 1,
  },
  {
    title: "Science foundation",
    description: "Physics + Chemistry fundamentals",
    subject: "Science",
    mode: "tuition",
    feeLabel: "Enquiry for fees",
    feeAmount: null,
    youtubeUrl: SAMPLE_YT,
    sortOrder: 2,
  },
  {
    title: "English speaking",
    description: "Conversation practice batches",
    subject: "English",
    mode: "tuition",
    feeLabel: "₹1,999 / mo",
    feeAmount: 1999,
    youtubeUrl: SAMPLE_YT,
    sortOrder: 3,
  },
];

export const SKILL_COURSE_TEMPLATES: CourseTemplate[] = [
  {
    title: "Guitar beginner",
    description: "Open chords · 8-week starter",
    subject: "Music",
    mode: "skill",
    feeLabel: "₹3,000 / course",
    feeAmount: 3000,
    youtubeUrl: SAMPLE_YT,
    sortOrder: 1,
  },
  {
    title: "Coding for kids",
    description: "Scratch + Python intro",
    subject: "Coding",
    mode: "skill",
    feeLabel: "₹4,500 / course",
    feeAmount: 4500,
    youtubeUrl: SAMPLE_YT,
    sortOrder: 2,
  },
  {
    title: "Digital design basics",
    description: "Canva + portfolio tips",
    subject: "Design",
    mode: "skill",
    feeLabel: "Free intro video",
    feeAmount: 0,
    youtubeUrl: SAMPLE_YT,
    sortOrder: 3,
  },
];

export const SCHOOL_COURSE_TEMPLATES: CourseTemplate[] = [
  {
    title: "Admissions 2026–27",
    description: "Nursery to Grade 10 · campus visit enquiry",
    subject: "Admissions",
    mode: "school",
    feeLabel: "Prospectus on request",
    feeAmount: null,
    youtubeUrl: SAMPLE_YT,
    sortOrder: 1,
  },
  {
    title: "Campus tour video",
    description: "Walkthrough of facilities",
    subject: "Campus",
    mode: "school",
    feeLabel: "Free",
    feeAmount: 0,
    youtubeUrl: SAMPLE_YT,
    sortOrder: 2,
  },
];

export function templatesForEducationType(industryType: string): CourseTemplate[] {
  switch (industryType) {
    case "school_college":
      return SCHOOL_COURSE_TEMPLATES;
    case "skill_class":
    case "independent_teacher":
      return SKILL_COURSE_TEMPLATES;
    case "tuition":
    default:
      return TUITION_COURSE_TEMPLATES;
  }
}
