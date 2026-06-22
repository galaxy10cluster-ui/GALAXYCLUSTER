import { Hero } from "@/components/Hero";
import { ContentCard } from "@/components/ContentCard";
import { SectionHeader } from "@/components/SectionHeader";
import { api } from "@/lib/api";
import type { Paper, Video, Audio, DocumentItem, ListResponse } from "@/lib/types";
import { FileText, Video as VideoIcon, Headphones } from "lucide-react";

export const revalidate = 30;

async function safeGet<T>(path: string, fallback: T): Promise<T> {
  try {
    return await api.get<T>(path);
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [papers, videos, audios, documents] = await Promise.all([
    safeGet<ListResponse<Paper>>("/api/papers?limit=3", { items: [], total: 0, page: 1, limit: 3 }),
    safeGet<ListResponse<Video>>("/api/videos?limit=3", { items: [], total: 0, page: 1, limit: 3 }),
    safeGet<ListResponse<Audio>>("/api/audios?limit=3", { items: [], total: 0, page: 1, limit: 3 }),
    safeGet<ListResponse<DocumentItem>>("/api/documents?limit=3", { items: [], total: 0, page: 1, limit: 3 }),
  ]);

  const noBackend =
    papers.items.length === 0 &&
    videos.items.length === 0 &&
    audios.items.length === 0 &&
    documents.items.length === 0;

  return (
    <>
      <Hero />

      {noBackend && (
        <div className="mx-auto max-w-3xl px-5 py-6 lg:px-8">
          <div className="glass rounded-xl border border-terra/30 px-5 py-4 text-sm text-paper-dim">
            <p className="font-display text-terra-glow">Backend not connected</p>
            <p className="mt-1">
              No content loaded — start the backend (<code className="mono-label text-ice">cd backend && npm run dev</code>)
              and run <code className="mono-label text-ice">npm run seed</code> to pre-load the PJ-Orbit demo content.
            </p>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <SectionHeader eyebrow="Latest Publication" title="Research Papers" viewAllHref="/papers" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {papers.items.map((p, i) => (
            <ContentCard
              key={p.id}
              type="paper"
              slug={p.slug}
              title={p.title}
              description={p.description}
              thumbnailUrl={p.thumbnailUrl}
              views={p.views}
              downloads={p.downloads}
              categoryName={p.category?.name}
              index={i}
            />
          ))}
          {papers.items.length === 0 && <EmptyState icon={FileText} label="No papers published yet" />}
        </div>
      </section>

      <section className="border-t border-void-border bg-void-panel/30">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <SectionHeader eyebrow="Watch" title="Video Overviews" viewAllHref="/videos" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.items.map((v, i) => (
              <ContentCard
                key={v.id}
                type="video"
                slug={v.slug}
                title={v.title}
                description={v.description}
                thumbnailUrl={v.thumbnailUrl}
                views={v.views}
                categoryName={v.category?.name}
                index={i}
              />
            ))}
            {videos.items.length === 0 && <EmptyState icon={VideoIcon} label="No videos uploaded yet" />}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <SectionHeader eyebrow="Listen" title="Audio &amp; Podcasts" viewAllHref="/audio" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {audios.items.map((a, i) => (
            <ContentCard
              key={a.id}
              type="audio"
              slug={a.slug}
              title={a.title}
              description={a.description}
              downloads={a.downloads}
              categoryName={a.category?.name}
              index={i}
            />
          ))}
          {audios.items.length === 0 && <EmptyState icon={Headphones} label="No audio uploaded yet" />}
        </div>
      </section>
    </>
  );
}

function EmptyState({ icon: Icon, label }: { icon: typeof FileText; label: string }) {
  return (
    <div className="glass col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl py-16 text-center">
      <Icon size={24} className="text-paper-faint" />
      <p className="text-sm text-paper-faint">{label}</p>
    </div>
  );
}
