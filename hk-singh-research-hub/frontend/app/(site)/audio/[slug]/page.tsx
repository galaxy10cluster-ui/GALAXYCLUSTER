import { notFound } from "next/navigation";
import { Headphones, Download } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { DebatePanel } from "@/components/DebatePanel";
import { DownloadButton } from "@/components/DownloadButton";
import type { Audio } from "@/lib/types";

async function getAudio(slug: string): Promise<Audio | null> {
  try {
    return await api.get<Audio>(`/api/audios/${slug}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const audio = await getAudio(params.slug);
  if (!audio) return { title: "Audio not found" };
  return { title: `${audio.title} — HK Singh Research Hub`, description: audio.description };
}

export default async function AudioDetailPage({ params }: { params: { slug: string } }) {
  const audio = await getAudio(params.slug);
  if (!audio) notFound();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <div className="glass rounded-2xl p-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-ice/10 text-ice">
          <Headphones size={36} />
        </div>

        <h1 className="text-center font-display text-2xl font-bold text-paper sm:text-3xl">
          {audio.title}
        </h1>

        <div className="mt-6 flex justify-center">
          <audio
            controls
            className="w-full max-w-lg rounded-xl"
            style={{ filter: "invert(1) hue-rotate(180deg)" }}
          >
            <source src={fileUrl(audio.fileUrl)} />
            Your browser does not support the audio element.
          </audio>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {audio.category && (
            <span className="mono-label rounded-full border border-ice/30 bg-ice/10 px-3 py-1 text-ice">
              {audio.category.name}
            </span>
          )}
          {audio.tags.map((t) => (
            <span key={t.id} className="mono-label rounded-full border border-void-border px-3 py-1 text-paper-faint">
              {t.name}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-base leading-relaxed text-paper-dim">{audio.description}</p>

      <div className="mt-6 flex gap-3">
        <DownloadButton
          kind="audio"
          itemId={audio.id}
          fileUrl={audio.fileUrl}
          downloads={audio.downloads}
          label="Download Audio"
        />
      </div>

      <DebatePanel roomId={audio.debateRoom?.id} />
    </div>
  );
}
