"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2, Edit, X, Upload } from "lucide-react";
import { api, API_URL } from "@/lib/api";

type ContentType = "paper" | "video" | "audio" | "document";

const ENDPOINTS: Record<ContentType, string> = {
  paper: "/api/papers",
  video: "/api/videos",
  audio: "/api/audios",
  document: "/api/documents",
};

const LABELS: Record<ContentType, string> = {
  paper: "Research Papers",
  video: "Videos",
  audio: "Audio Files",
  document: "Documents",
};

const ACCEPT: Record<ContentType, string> = {
  paper: "application/pdf",
  video: "video/mp4,video/webm",
  audio: "audio/mpeg,audio/wav,audio/x-m4a",
  document: "application/pdf,.docx,text/plain,.pptx",
};

interface Item { id: string; title: string; slug: string; views?: number; downloads?: number; createdAt: string; }

export default function AdminContentPage() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") || "paper") as ContentType;
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", abstract: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin-token") || "" : "";

  async function loadItems() {
    setLoading(true);
    try {
      const data = await api.get<{ items: Item[] }>(`${ENDPOINTS[type]}?limit=50`);
      setItems(data.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadItems(); }, [type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a file"); return; }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", form.title);
      fd.append("description", form.description);
      if (form.abstract) fd.append("abstract", form.abstract);
      if (type === "paper") fd.append("publicationDate", new Date().toISOString());
      if (type === "document") fd.append("fileType", file.name.split(".").pop() || "pdf");

      const res = await fetch(`${API_URL}${ENDPOINTS[type]}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Upload failed");
      }
      setShowForm(false);
      setForm({ title: "", description: "", abstract: "" });
      setFile(null);
      loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This also deletes its debate room and all comments.`)) return;
    try {
      await api.delete(`${ENDPOINTS[type]}/${id}`, token);
      loadItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-paper">{LABELS[type]}</h1>
          <p className="mono-label mt-1 text-paper-faint">{items.length} item{items.length === 1 ? "" : "s"}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-ice px-4 py-2.5 font-display text-sm font-semibold text-void transition hover:bg-ice-glow"
        >
          <Plus size={15} /> Upload New
        </button>
      </div>

      {showForm && (
        <div className="glass mb-6 rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-paper">Upload {LABELS[type].replace("s", "")}</h2>
            <button onClick={() => setShowForm(false)} className="text-paper-dim hover:text-paper"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Title"
              className="w-full rounded-lg border border-void-border bg-void px-3.5 py-2.5 text-sm text-paper focus:border-ice/40 focus:outline-none"
            />
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description"
              rows={3}
              className="w-full resize-none rounded-lg border border-void-border bg-void px-3.5 py-2.5 text-sm text-paper focus:border-ice/40 focus:outline-none"
            />
            {type === "paper" && (
              <textarea
                value={form.abstract}
                onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))}
                placeholder="Abstract (optional)"
                rows={4}
                className="w-full resize-none rounded-lg border border-void-border bg-void px-3.5 py-2.5 text-sm text-paper focus:border-ice/40 focus:outline-none"
              />
            )}

            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-void-border py-8 transition hover:border-ice/40"
            >
              <Upload size={22} className="text-paper-faint" />
              {file ? (
                <p className="text-sm text-ice">{file.name}</p>
              ) : (
                <p className="text-sm text-paper-dim">Click to choose file</p>
              )}
            </div>
            <input ref={fileRef} type="file" className="hidden" accept={ACCEPT[type]} onChange={(e) => setFile(e.target.files?.[0] || null)} />

            {error && <p className="text-sm text-terra">{error}</p>}

            <button
              type="submit"
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ice py-2.5 font-display text-sm font-semibold text-void transition hover:bg-ice-glow disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload & Publish"}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {loading && <p className="py-8 text-center text-sm text-paper-faint">Loading...</p>}
        {!loading && items.length === 0 && (
          <div className="glass rounded-xl py-12 text-center text-sm text-paper-faint">
            No {LABELS[type].toLowerCase()} uploaded yet.
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="glass flex items-center gap-4 rounded-xl px-4 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-semibold text-paper">{item.title}</p>
              <p className="mono-label mt-0.5 text-paper-faint">
                {new Date(item.createdAt).toLocaleDateString()}
                {item.views !== undefined && ` · ${item.views} views`}
                {item.downloads !== undefined && ` · ${item.downloads} downloads`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/${type === "audio" ? "audio" : type + "s"}/${item.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-void-border text-paper-dim transition hover:border-ice/40 hover:text-ice"
              >
                <Edit size={13} />
              </a>
              <button
                onClick={() => handleDelete(item.id, item.title)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-void-border text-paper-dim transition hover:border-terra/40 hover:text-terra"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
