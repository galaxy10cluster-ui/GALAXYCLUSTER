"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Trash2, Pin, ShieldOff } from "lucide-react";
import { api } from "@/lib/api";
import type { DebateComment } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

const CATEGORY_COLOR: Record<string, string> = {
  SUPPORT: "text-ice",
  OPPOSITION: "text-terra",
  QUESTION: "text-boundary",
  ALTERNATIVE_THEORY: "text-paper-dim",
};

export default function AdminDebatesPage() {
  const [roomId, setRoomId] = useState("");
  const [comments, setComments] = useState<DebateComment[]>([]);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("admin-token") || "" : "";

  async function loadRoom() {
    if (!roomId.trim()) return;
    setLoading(true);
    try {
      const data = await api.get<DebateComment[]>(`/api/debates/${roomId.trim()}/comments?sort=newest`);
      setComments(data);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    await api.delete(`/api/debates/comments/${commentId}`, token);
    setComments((c) => c.filter((x) => x.id !== commentId));
  }

  async function handlePin(commentId: string, pinned: boolean) {
    await api.patch(`/api/debates/comments/${commentId}/pin`, { pinned }, token);
    setComments((c) => c.map((x) => (x.id === commentId ? { ...x, isPinned: pinned } : x)));
  }

  async function handleBan(comment: DebateComment) {
    if (!confirm(`Ban "${comment.authorName}" from all debates?`)) return;
    await api.post("/api/debates/ban", { displayName: comment.authorName, roomId }, token);
    alert("Participant banned.");
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-paper">Debate Moderation</h1>

      <div className="glass mb-6 rounded-xl p-4">
        <p className="mono-label mb-2 text-paper-faint">Load a debate room by ID</p>
        <div className="flex gap-2">
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Debate Room ID (UUID)"
            className="flex-1 rounded-lg border border-void-border bg-void px-3.5 py-2.5 text-sm text-paper font-mono focus:border-ice/40 focus:outline-none"
          />
          <button
            onClick={loadRoom}
            disabled={loading}
            className="rounded-lg bg-ice px-4 py-2 font-display text-sm font-semibold text-void transition hover:bg-ice-glow disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load"}
          </button>
        </div>
        <p className="mt-2 text-xs text-paper-faint">
          Find room IDs by visiting a content page, joining the debate, then copying the room ID from the API.
          Alternatively, check the database directly via <code className="mono-label text-ice">prisma studio</code>.
        </p>
      </div>

      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className={`glass flex gap-3 rounded-xl p-4 ${comment.isPinned ? "border-ice/30" : ""}`}>
              <MessageSquare size={15} className={CATEGORY_COLOR[comment.category] || "text-paper-faint"} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-semibold text-paper">{comment.authorName}</span>
                  <span className={`mono-label ${CATEGORY_COLOR[comment.category]}`}>{comment.category}</span>
                  {comment.isPinned && <span className="mono-label text-ice">PINNED</span>}
                  <span className="text-xs text-paper-faint">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-paper-dim line-clamp-3">{comment.content}</p>
                <p className="mono-label mt-1 text-paper-faint">
                  ↑ {comment.upvotes} · ↓ {comment.downvotes}
                  {comment.replies?.length ? ` · ${comment.replies.length} repl${comment.replies.length === 1 ? "y" : "ies"}` : ""}
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <button
                  onClick={() => handlePin(comment.id, !comment.isPinned)}
                  title={comment.isPinned ? "Unpin" : "Pin"}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-void-border text-paper-faint hover:border-ice/40 hover:text-ice"
                >
                  <Pin size={12} />
                </button>
                <button
                  onClick={() => handleBan(comment)}
                  title="Ban participant"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-void-border text-paper-faint hover:border-terra/40 hover:text-terra"
                >
                  <ShieldOff size={12} />
                </button>
                <button
                  onClick={() => handleDelete(comment.id)}
                  title="Delete comment"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-void-border text-paper-faint hover:border-terra/40 hover:text-terra"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && roomId && (
        <div className="glass rounded-xl py-12 text-center text-sm text-paper-faint">
          No comments found in this room.
        </div>
      )}
    </div>
  );
}
