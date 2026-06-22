import { notFound } from "next/navigation";
import { Calendar, Eye, FileText } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { DebatePanel } from "@/components/DebatePanel";
import { DownloadButton } from "@/components/DownloadButton";
import type { Paper } from "@/lib/types";

async function getPaper(slug: string): Promise<Paper | null> {
  try {
    return await api.get<Paper>(`/api/papers/${slug}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const paper = await getPaper(params.slug);
  if (!paper) return { title: "Paper not found" };
  return {
    title: `${paper.title} — HK Singh Research Hub`,
    description: paper.description,
  };
}

export default async function PaperDetailPage({ params }: { params: { slug: string } }) {
  const paper = await getPaper(params.slug);
  if (!paper) notFound();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {paper.category && (
          <span className="mono-label rounded-full border border-ice/30 bg-ice/10 px-3 py-1 text-ice">
            {paper.category.name}
          </span>
        )}
        {paper.tags.map((t) => (
          <span key={t.id} className="mono-label rounded-full border border-void-border px-3 py-1 text-paper-faint">
            {t.name}
          </span>
        ))}
      </div>

      <h1 className="font-display text-3xl font-bold leading-tight text-paper sm:text-4xl">{paper.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-paper-dim">
        <span>{paper.authorName}</span>
        <span className="flex items-center gap-1.5">
          <Calendar size={13} /> {new Date(paper.publicationDate).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye size={13} /> {paper.views.toLocaleString()} views
        </span>
      </div>

      <p className="mt-6 max-w-3xl text-base leading-relaxed text-paper-dim">{paper.description}</p>

      <div className="glass mt-6 rounded-2xl p-5">
        <p className="mono-label mb-2 text-terra">Abstract</p>
        <p className="text-sm leading-relaxed text-paper-dim">{paper.abstract}</p>
      </div>

      {paper.aiSummary && (
        <div className="glass mt-4 rounded-2xl border-boundary/30 p-5">
          <p className="mono-label mb-2 text-boundary">AI Summary</p>
          <p className="text-sm leading-relaxed text-paper-dim">{paper.aiSummary}</p>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <DownloadButton
          kind="paper"
          itemId={paper.id}
          fileUrl={paper.fileUrl}
          downloads={paper.downloads}
          label="Download PDF"
        />
        <a
          href={fileUrl(paper.fileUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="glass glass-hover inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-sm font-semibold text-paper"
        >
          <FileText size={15} /> Read Online
        </a>
      </div>

      <div className="glass mt-8 overflow-hidden rounded-2xl">
        <iframe
          src={fileUrl(paper.fileUrl)}
          title={paper.title}
          className="h-[70vh] w-full"
        />
      </div>

      <DebatePanel roomId={paper.debateRoom?.id} />
    </div>
  );
}
