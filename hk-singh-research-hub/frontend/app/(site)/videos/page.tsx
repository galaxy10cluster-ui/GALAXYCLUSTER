import { ContentListing } from "@/components/ContentListing";
import type { Video } from "@/lib/types";

export const metadata = {
  title: "Videos — HK Singh Research Hub",
  description: "Video overviews and explainers of theoretical physics research by H.K. Singh.",
};

export default function VideosPage() {
  return (
    <ContentListing<Video>
      apiPath="/api/videos"
      type="video"
      title="Video Overviews"
      subtitle="Visual walkthroughs of research concepts, from simplified intros to in-depth breakdowns."
    />
  );
}
