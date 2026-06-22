import { ContentListing } from "@/components/ContentListing";
import type { Paper } from "@/lib/types";

export const metadata = {
  title: "Research Papers — HK Singh Research Hub",
  description: "Browse independent theoretical physics research papers by H.K. Singh.",
};

export default function PapersPage() {
  return (
    <ContentListing<Paper>
      apiPath="/api/papers"
      type="paper"
      title="Research Papers"
      subtitle="Independent theoretical physics manuscripts, searchable by title, abstract, and topic."
    />
  );
}
