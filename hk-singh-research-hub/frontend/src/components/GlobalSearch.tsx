"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, FileText, Video, Headphones, File } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "paper" | "video" | "audio" | "document";
}

const TYPE_META: Record<string, { icon: typeof FileText; path: string; label: string }> = {
  paper: { icon: FileText, path: "/papers", label: "Paper" },
  video: { icon: Video, path: "/videos", label: "Video" },
  audio: { icon: Headphones, path: "/audio", label: "Audio" },
  document: { icon: File, path: "/documents", label: "Document" },
};

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const data = await api.get<Record<string, SearchResult[]>>(
          `/api/search?q=${encodeURIComponent(query)}`
        );
        setResults([...data.papers, ...data.videos, ...data.audios, ...data.documents]);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-void/80 backdrop-blur-sm px-4 pt-24"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-xl rounded-2xl shadow-glass"
          >
            <div className="flex items-center gap-3 border-b border-void-border px-4 py-3">
              <Search size={18} className="text-ice" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search papers, videos, audio, documents..."
                className="flex-1 bg-transparent font-body text-sm text-paper placeholder:text-paper-faint focus:outline-none"
              />
              <button onClick={onClose} aria-label="Close search" className="text-paper-dim hover:text-paper">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {loading && (
                <p className="px-3 py-6 text-center mono-label text-paper-faint">Searching...</p>
              )}
              {!loading && query.length >= 2 && results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-paper-dim">
                  No results for "{query}"
                </p>
              )}
              {!loading &&
                results.map((r) => {
                  const meta = TYPE_META[r.type];
                  const Icon = meta.icon;
                  return (
                    <Link
                      key={`${r.type}-${r.id}`}
                      href={`${meta.path}/${r.slug}`}
                      onClick={onClose}
                      className="flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-void-raised"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ice/10 text-ice">
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-display text-sm text-paper">{r.title}</span>
                        <span className="block truncate text-xs text-paper-dim">{r.description}</span>
                      </span>
                      <span className="ml-auto mono-label shrink-0 text-paper-faint">{meta.label}</span>
                    </Link>
                  );
                })}
              {query.length < 2 && (
                <p className="px-3 py-6 text-center text-xs text-paper-faint">
                  Type at least 2 characters to search across all content
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
