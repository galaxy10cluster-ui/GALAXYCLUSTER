"use client";

import { useState, useRef } from "react";
import { Paperclip, Send } from "lucide-react";
import { api, API_URL } from "@/lib/api";
import type { DebateCategory } from "@/lib/types";

const CATEGORY_OPTIONS: { value: DebateCategory; label: string; color: string }[] = [
  { value: "SUPPORT", label: "Support", color: "border-ice/40 text-ice data-[active=true]:bg-ice/15" },
  { value: "OPPOSITION", label: "Opposition", color: "border-terra/40 text-terra data-[active=true]:bg-terra/15" },
  { value: "QUESTION", label: "Question", color: "border-boundary/40 text-boundary data-[active=true]:bg-boundary/15" },
  {
    value: "ALTERNATIVE_THEORY",
    label: "Alternative Theory",
    color: "border-paper-dim/40 text-paper-dim data-[active=true]:bg-paper-dim/15",
  },
];

export function CommentComposer({
  roomId,
  authorName,
  parentId,
  onPosted,
  compact = false,
}: {
  roomId: string;
  authorName: string;
  parentId?: string;
  onPosted: () => void;
  compact?: boolean;
}) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<DebateCategory>("SUPPORT");
  const [file, setFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setError("");
    try {
      const comment = await api.post<{ id: string }>(`/api/debates/${roomId}/comments`, {
        authorName,
        content: content.trim(),
        category,
        parentId,
      });

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await fetch(`${API_URL}/api/debates/comments/${comment.id}/attachments`, {
          method: "POST",
          body: formData,
        });
      }

      setContent("");
      setFile(null);
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setPosting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-3.5">
      {!compact && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-active={category === opt.value}
              onClick={() => setCategory(opt.value)}
              className={`rounded-full border px-2.5 py-1 mono-label transition ${opt.color}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Write a reply..." : "Share your perspective..."}
        rows={compact ? 2 : 3}
        maxLength={5000}
        className="w-full resize-none bg-transparent text-sm text-paper placeholder:text-paper-faint focus:outline-none"
      />

      {file && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-paper-dim">
          <Paperclip size={11} /> {file.name}
          <button type="button" onClick={() => setFile(null)} className="text-terra hover:underline">
            remove
          </button>
        </p>
      )}
      {error && <p className="mt-1 text-xs text-terra">{error}</p>}

      <div className="mt-2.5 flex items-center justify-between border-t border-void-border pt-2.5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 mono-label text-paper-faint transition hover:text-ice"
        >
          <Paperclip size={13} /> Attach
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="video/*,audio/*,application/pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          type="submit"
          disabled={posting || !content.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-ice px-3.5 py-1.5 font-display text-xs font-semibold text-void transition hover:bg-ice-glow disabled:opacity-40"
        >
          {posting ? "Posting..." : "Post"} <Send size={12} />
        </button>
      </div>
    </form>
  );
}
