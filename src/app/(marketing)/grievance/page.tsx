import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { getPlatformLegalDocument } from "@/platform/legal/platform-documents";

export default function GrievancePage() {
  return <LegalDocumentPage document={getPlatformLegalDocument("grievance")} />;
}