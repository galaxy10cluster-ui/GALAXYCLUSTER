"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Video as VideoIcon, Headphones, File, Eye, Download, MessagesSquare } from "lucide-react";
import { fileUrl } from "@/lib/api";

type CardType = "paper" | "video" | "audio" | "document";

const ICON: Record<CardType, typeof FileText> = {
  paper: FileText,
  video: VideoIcon,
  audio: Headphones,
  document: File,
};

const BASE_PATH: Record<CardType, string> = {
  paper: "/papers",
  video: "/videos",
  audio: "/audio",
  document: "/documents",
};

interface ContentCardProps {
  type: CardType;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  views?: number;
  downloads?: number;
  categoryName?: string | null;
  hasDebate?: boolean;
  index?: number;
}

export function ContentCard({
  type,
  slug,
  title,
  description,
  thumbnailUrl,
  views,
  downloads,
  categoryName,
  hasDebate = true,
  index = 0,
}: ContentCardProps) {
  const Icon = ICON[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        href={`${BASE_PATH[type]}/${slug}`}
        className="glass glass-hover group flex h-full flex-col overflow-hidden rounded-2xl"
      >
        <div className="relative aspect-video overflow-hidden bg-void-raised">
          {thumbnailUrl ? (
            <img
              src={fileUrl(thumbnailUrl)}
              alt=""
              className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-void-raised to-void-panel">
              <Icon size={28} className="text-ice/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />
          {categoryName && (
            <span className="mono-label absolute left-3 top-3 rounded-full border border-ice/30 bg-void/70 px-2.5 py-1 text-ice backdrop-blur">
              {categoryName}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-base font-semibold leading-snug text-paper transition group-hover:text-ice line-clamp-2">
            {title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-paper-dim line-clamp-2">
            {description}
          </p>

          <div className="mt-4 flex items-center gap-4 border-t border-void-border pt-3 text-xs text-paper-faint">
            {typeof views === "number" && (
              <span className="flex items-center gap-1">
                <Eye size={12} /> {views.toLocaleString()}
              </span>
            )}
            {typeof downloads === "number" && (
              <span className="flex items-center gap-1">
                <Download size={12} /> {downloads.toLocaleString()}
              </span>
            )}
            {hasDebate && (
              <span className="ml-auto flex items-center gap-1 text-terra-glow">
                <MessagesSquare size={12} /> Debate
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
