import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { getPlatformLegalDocument } from "@/platform/legal/platform-documents";

export default function PrivacyPage() {
  return <LegalDocumentPage document={getPlatformLegalDocument("privacy")} />;
}