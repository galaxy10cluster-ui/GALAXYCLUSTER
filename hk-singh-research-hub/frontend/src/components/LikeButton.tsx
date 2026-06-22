"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { api } from "@/lib/api";

export function LikeButton({ videoId, likes }: { videoId: string; likes: number }) {
  const [count, setCount] = useState(likes);
  const [liked, setLiked] = useState(false);

  async function handleLike() {
    if (liked) return;
    setLiked(true);
    setCount((c) => c + 1);
    try {
      await api.post<{ likes: number }>(`/api/videos/${videoId}/like`);
    } catch {
      setCount((c) => c - 1);
      setLiked(false);
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={`flex items-center gap-1.5 transition ${liked ? "text-ice" : "text-paper-dim hover:text-ice"}`}
    >
      <ThumbsUp size={13} /> {count.toLocaleString()}
    </button>
  );
}
