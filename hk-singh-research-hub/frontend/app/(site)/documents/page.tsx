import { ContentListing } from "@/components/ContentListing";
import type { DocumentItem } from "@/lib/types";

export const metadata = {
  title: "Documents — HK Singh Research Hub",
  description: "Supporting documents, slide decks, and reference materials.",
};

export default function DocumentsPage() {
  return (
    <ContentListing<DocumentItem>
      apiPath="/api/documents"
      type="document"
      title="Documents"
      subtitle="Slide decks, supporting materials, and reference documents in PDF, DOCX, and PPT formats."
    />
  );
}
