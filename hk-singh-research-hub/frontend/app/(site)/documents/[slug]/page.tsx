import { notFound } from "next/navigation";
import { File } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { DebatePanel } from "@/components/DebatePanel";
import { DownloadButton } from "@/components/DownloadButton";
import type { DocumentItem } from "@/lib/types";

async function getDocument(slug: string): Promise<DocumentItem | null> {
  try {
    return await api.get<DocumentItem>(`/api/documents/${slug}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const doc = await getDocument(params.slug);
  if (!doc) return { title: "Document not found" };
  return { title: `${doc.title} — HK Singh Research Hub`, description: doc.description };
}

export default async function DocumentDetailPage({ params }: { params: { slug: string } }) {
  const doc = await getDocument(params.slug);
  if (!doc) notFound();

  const isPdf = doc.fileType === "pdf";

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mono-label rounded-full border border-void-border bg-void-raised px-3 py-1 text-paper-faint uppercase">
          {doc.fileType}
        </span>
        {doc.category && (
          <span className="mono-label rounded-full border border-ice/30 bg-ice/10 px-3 py-1 text-ice">
            {doc.category.name}
          </span>
        )}
        {doc.tags.map((t) => (
          <span key={t.id} className="mono-label rounded-full border border-void-border px-3 py-1 text-paper-faint">
            {t.name}
          </span>
        ))}
      </div>

      <h1 className="font-display text-3xl font-bold leading-tight text-paper sm:text-4xl">
        {doc.title}
      </h1>

      <p className="mt-5 max-w-3xl text-base leading-relaxed text-paper-dim">{doc.description}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <DownloadButton
          kind="document"
          itemId={doc.id}
          fileUrl={doc.fileUrl}
          downloads={doc.downloads}
          label={`Download ${doc.fileType.toUpperCase()}`}
        />
        {isPdf && (
          <a
            href={fileUrl(doc.fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="glass glass-hover inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-sm font-semibold text-paper"
          >
            <File size={15} /> Open in New Tab
          </a>
        )}
      </div>

      {isPdf && (
        <div className="glass mt-8 overflow-hidden rounded-2xl">
          <iframe
            src={fileUrl(doc.fileUrl)}
            title={doc.title}
            className="h-[70vh] w-full"
          />
        </div>
      )}

      {!isPdf && (
        <div className="glass mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl py-16 text-center">
          <File size={32} className="text-paper-faint" />
          <p className="text-sm text-paper-dim">
            Preview not available for <span className="mono-label text-ice">.{doc.fileType}</span> files.
            Use the download button above to open this document.
          </p>
        </div>
      )}

      <DebatePanel roomId={doc.debateRoom?.id} />
    </div>
  );
}
