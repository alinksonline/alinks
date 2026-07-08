import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { getPlatformLegalDocument } from "@/platform/legal/platform-documents";

export default function AupPage() {
  return <LegalDocumentPage document={getPlatformLegalDocument("aup")} />;
}