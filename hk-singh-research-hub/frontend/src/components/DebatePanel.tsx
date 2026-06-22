"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useDebateSocket } from "@/hooks/useDebateSocket";
import { DebateJoinGate } from "./DebateJoinGate";
import { CommentComposer } from "./CommentComposer";
import { CommentThread } from "./CommentThread";
import type { DebateComment, DebateCategory } from "@/lib/types";

const FILTERS: { value: DebateCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "SUPPORT", label: "Support" },
  { value: "OPPOSITION", label: "Opposition" },
  { value: "QUESTION", label: "Questions" },
  { value: "ALTERNATIVE_THEORY", label: "Alt. Theory" },
];

export function DebatePanel({ roomId }: { roomId?: string | null }) {
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [comments, setComments] = useState<DebateComment[]>([]);
  const [sort, setSort] = useState<"newest" | "top">("newest");
  const [filter, setFilter] = useState<DebateCategory | "ALL">("ALL");
  const [participantCount, setParticipantCount] = useState(0);
  const { socket, connected } = useDebateSocket(roomId || undefined);

  const loadComments = useCallback(async () => {
    if (!roomId) return;
    const params = new URLSearchParams({ sort });
    if (filter !== "ALL") params.set("category", filter);
    try {
      const data = await api.get<DebateComment[]>(`/api/debates/${roomId}/comments?${params}`);
      setComments(data);
    } catch {
      setComments([]);
    }
  }, [roomId, sort, filter]);

  useEffect(() => {
    if (!roomId) return;
    const stored = sessionStorage.getItem(`debate-name-${roomId}`);
    if (stored) setAuthorName(stored);

    api
      .get<{ _count?: { participants: number } }>(`/api/debates/${roomId}`)
      .then((room) => setParticipantCount(room._count?.participants || 0))
      .catch(() => {});

    loadComments();
  }, [roomId, loadComments]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => loadComments();
    socket.on("new_comment", handler);
    socket.on("comment_deleted", handler);
    socket.on("comment_pinned", handler);
    socket.on("vote_update", handler);
    return () => {
      socket.off("new_comment", handler);
      socket.off("comment_deleted", handler);
      socket.off("comment_pinned", handler);
      socket.off("vote_update", handler);
    };
  }, [socket, loadComments]);

  if (!roomId) return null;

  return (
    <section className="mt-12">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-paper">
          <MessageSquare size={18} className="text-boundary" />
          Debate Room
        </h2>
        <div className="flex items-center gap-4 text-xs text-paper-faint">
          <span className="flex items-center gap-1.5">
            <Users size={13} /> {participantCount} participant{participantCount === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-ice" : "bg-paper-faint"}`} />
            {connected ? "Live" : "Connecting..."}
          </span>
        </div>
      </div>

      {!authorName ? (
        <DebateJoinGate roomId={roomId} onJoined={setAuthorName} />
      ) : (
        <CommentComposer roomId={roomId} authorName={authorName} onPosted={loadComments} />
      )}

      <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3 py-1 mono-label transition ${
                filter === f.value
                  ? "border-ice/50 bg-ice/10 text-ice"
                  : "border-void-border text-paper-faint hover:text-paper"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "top")}
          className="glass rounded-lg px-3 py-1.5 text-xs text-paper focus:outline-none [&>option]:bg-void-panel"
        >
          <option value="newest">Newest</option>
          <option value="top">Top</option>
        </select>
      </div>

      <div className="space-y-3">
        {comments.length === 0 && (
          <div className="glass rounded-xl py-10 text-center text-sm text-paper-faint">
            No comments yet — be the first to share your perspective.
          </div>
        )}
        {comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            roomId={roomId}
            authorName={authorName}
            onChanged={loadComments}
          />
        ))}
      </div>
    </section>
  );
}
