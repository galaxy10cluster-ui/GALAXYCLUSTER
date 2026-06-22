"use client";

import { Download } from "lucide-react";
import { api, fileUrl } from "@/lib/api";

const ENDPOINT: Record<string, string> = {
  paper: "/api/papers",
  audio: "/api/audios",
  document: "/api/documents",
};

export function DownloadButton({
  kind = "paper",
  itemId,
  fileUrl: url,
  downloads,
  label = "Download",
}: {
  kind?: "paper" | "audio" | "document";
  itemId: string;
  fileUrl: string;
  downloads: number;
  label?: string;
}) {
  async function handleClick() {
    try {
      await api.post(`${ENDPOINT[kind]}/${itemId}/download`);
    } catch {
      // non-blocking — still let the download proceed
    }
    window.open(fileUrl(url), "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-xl bg-terra px-5 py-2.5 font-display text-sm font-semibold text-void shadow-glow-terra transition hover:bg-terra-glow"
    >
      <Download size={15} /> {label}
      <span className="mono-label opacity-70">({downloads})</span>
    </button>
  );
}
