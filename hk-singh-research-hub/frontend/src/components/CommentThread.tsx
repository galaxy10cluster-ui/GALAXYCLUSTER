"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowBigUp, ArrowBigDown, Reply, Pin, Paperclip } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { api, fileUrl } from "@/lib/api";
import { CommentComposer } from "./CommentComposer";
import type { DebateComment, DebateCategory } from "@/lib/types";

const CATEGORY_BADGE: Record<DebateCategory, string> = {
  SUPPORT: "border-ice/40 text-ice bg-ice/10",
  OPPOSITION: "border-terra/40 text-terra bg-terra/10",
  QUESTION: "border-boundary/40 text-boundary bg-boundary/10",
  ALTERNATIVE_THEORY: "border-paper-dim/40 text-paper-dim bg-paper-dim/10",
};

const CATEGORY_LABEL: Record<DebateCategory, string> = {
  SUPPORT: "Support",
  OPPOSITION: "Opposition",
  QUESTION: "Question",
  ALTERNATIVE_THEORY: "Alt. Theory",
};

export function CommentThread({
  comment,
  roomId,
  authorName,
  isAdmin = false,
  onChanged,
}: {
  comment: DebateComment;
  roomId: string;
  authorName: string | null;
  isAdmin?: boolean;
  onChanged: () => void;
}) {
  const [replying, setReplying] = useState(false);
  const [votes, setVotes] = useState({ up: comment.upvotes, down: comment.downvotes });
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  async function vote(direction: "up" | "down") {
    if (voted) return;
    setVoted(direction);
    setVotes((v) => ({ ...v, [direction]: v[direction] + 1 }));
    try {
      await api.post(`/api/debates/comments/${comment.id}/vote`, { direction });
    } catch {
      // revert on failure
      setVotes((v) => ({ ...v, [direction]: v[direction] - 1 }));
      setVoted(null);
    }
  }

  async function handlePin() {
    await api.patch(`/api/debates/comments/${comment.id}/pin`, { pinned: !comment.isPinned });
    onChanged();
  }

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    await api.delete(`/api/debates/comments/${comment.id}`);
    onChanged();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-4 ${comment.isPinned ? "border-ice/40" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-0.5">
          <button
            onClick={() => vote("up")}
            disabled={!!voted}
            aria-label="Upvote"
            className={`transition ${voted === "up" ? "text-ice" : "text-paper-faint hover:text-ice"}`}
          >
            <ArrowBigUp size={18} />
          </button>
          <span className="mono-label text-paper-dim">{votes.up - votes.down}</span>
          <button
            onClick={() => vote("down")}
            disabled={!!voted}
            aria-label="Downvote"
            className={`transition ${voted === "down" ? "text-terra" : "text-paper-faint hover:text-terra"}`}
          >
            <ArrowBigDown size={18} />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {comment.isPinned && <Pin size={12} className="text-ice" />}
            <span className="font-display text-sm font-semibold text-paper">{comment.authorName}</span>
            <span
              className={`rounded-full border px-2 py-0.5 mono-label ${CATEGORY_BADGE[comment.category]}`}
            >
              {CATEGORY_LABEL[comment.category]}
            </span>
            <span className="text-xs text-paper-faint">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>

          <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-paper-dim">
            {comment.content}
          </p>

          {comment.attachments?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {comment.attachments.map((a) => (
                <a
                  key={a.id}
                  href={fileUrl(a.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-void-border bg-void px-2.5 py-1.5 text-xs text-ice hover:border-ice/40"
                >
                  <Paperclip size={11} /> {a.fileType} attachment
                </a>
              ))}
            </div>
          )}

          <div className="mt-2.5 flex items-center gap-4">
            {authorName && (
              <button
                onClick={() => setReplying((r) => !r)}
                className="flex items-center gap-1 mono-label text-paper-faint transition hover:text-ice"
              >
                <Reply size={12} /> Reply
              </button>
            )}
            {isAdmin && (
              <>
                <button onClick={handlePin} className="mono-label text-paper-faint hover:text-ice">
                  {comment.isPinned ? "Unpin" : "Pin"}
                </button>
                <button onClick={handleDelete} className="mono-label text-paper-faint hover:text-terra">
                  Delete
                </button>
              </>
            )}
          </div>

          {replying && authorName && (
            <div className="mt-3">
              <CommentComposer
                roomId={roomId}
                authorName={authorName}
                parentId={comment.id}
                compact
                onPosted={() => {
                  setReplying(false);
                  onChanged();
                }}
              />
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3 border-l border-void-border pl-4">
              {comment.replies.map((reply) => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  roomId={roomId}
                  authorName={authorName}
                  isAdmin={isAdmin}
                  onChanged={onChanged}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
