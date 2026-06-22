import { ContentListing } from "@/components/ContentListing";
import type { Audio } from "@/lib/types";

export const metadata = {
  title: "Audio & Podcasts — HK Singh Research Hub",
  description: "Audio lectures and podcast-style discussions of theoretical physics research.",
};

export default function AudioPage() {
  return (
    <ContentListing<Audio>
      apiPath="/api/audios"
      type="audio"
      title="Audio & Podcasts"
      subtitle="Spoken-format research overviews and discussions, with notes and timestamps."
    />
  );
}
