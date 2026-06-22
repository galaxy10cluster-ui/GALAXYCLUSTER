import { notFound } from "next/navigation";
import { Eye, ThumbsUp } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { DebatePanel } from "@/components/DebatePanel";
import { LikeButton } from "@/components/LikeButton";
import type { Video } from "@/lib/types";

async function getVideo(slug: string): Promise<Video | null> {
  try {
    return await api.get<Video>(`/api/videos/${slug}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const video = await getVideo(params.slug);
  if (!video) return { title: "Video not found" };
  return { title: `${video.title} — HK Singh Research Hub`, description: video.description };
}

export default async function VideoDetailPage({ params }: { params: { slug: string } }) {
  const video = await getVideo(params.slug);
  if (!video) notFound();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <div className="glass overflow-hidden rounded-2xl">
        <video
          controls
          poster={video.thumbnailUrl ? fileUrl(video.thumbnailUrl) : undefined}
          className="aspect-video w-full bg-black"
        >
          <source src={fileUrl(video.fileUrl)} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {video.category && (
          <span className="mono-label rounded-full border border-ice/30 bg-ice/10 px-3 py-1 text-ice">
            {video.category.name}
          </span>
        )}
        {video.tags.map((t) => (
          <span key={t.id} className="mono-label rounded-full border border-void-border px-3 py-1 text-paper-faint">
            {t.name}
          </span>
        ))}
      </div>

      <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-paper sm:text-4xl">
        {video.title}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-paper-dim">
        <span className="flex items-center gap-1.5">
          <Eye size={13} /> {video.views.toLocaleString()} views
        </span>
        <LikeButton videoId={video.id} likes={video.likes} />
      </div>

      <p className="mt-5 max-w-3xl text-base leading-relaxed text-paper-dim">{video.description}</p>

      <DebatePanel roomId={video.debateRoom?.id} />
    </div>
  );
}
