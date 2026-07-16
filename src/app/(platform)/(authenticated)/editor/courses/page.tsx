import { redirect } from "next/navigation";
import { EditorNav } from "@/components/editor/editor-nav";
import { PageShell } from "@/components/shared/page-shell";
import { canShowEducationCourses } from "@/core/utils/industry-gates";
import { requireAuth } from "@/platform/auth/session";
import { requireBusiness } from "@/platform/business/require-business";
import { getCoursesForBusiness } from "@/app/actions/education";
import { CoursesEditorPanel } from "./courses-editor-panel";

export default async function CoursesEditorPage() {
  const session = await requireAuth();
  const business = await requireBusiness(session);

  if (
    !canShowEducationCourses({
      vertical: business.vertical,
      industryGroup: business.industryGroup,
    })
  ) {
    redirect("/editor");
  }

  const list = await getCoursesForBusiness(business.id);

  return (
    <>
      <EditorNav
        active="/editor/courses"
        vertical={business.vertical}
        industryGroup={business.industryGroup}
      />
      <PageShell className="py-4 pb-10">
        <p className="premium-label">Education</p>
        <h1 className="premium-heading mt-1 text-lg">Courses</h1>
        <p className="premium-subtext mt-1.5 max-w-sm">
          Open catalogue of subjects/skills. Video = <strong>YouTube only</strong> (free with website). Free
          enquiry — no LMS v1.
        </p>
        <CoursesEditorPanel businessId={business.id} handle={business.handle} courses={list} />
      </PageShell>
    </>
  );
}
