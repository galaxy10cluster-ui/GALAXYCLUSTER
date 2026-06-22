"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { api } from "@/lib/api";

export function DebateJoinGate({
  roomId,
  onJoined,
}: {
  roomId: string;
  onJoined: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post(`/api/debates/${roomId}/join`, { displayName: name.trim() });
      sessionStorage.setItem(`debate-name-${roomId}`, name.trim());
      onJoined(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass mx-auto max-w-sm rounded-2xl p-6 text-center"
    >
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-boundary/15 text-boundary">
        <MessageSquare size={18} />
      </div>
      <h3 className="font-display text-base font-semibold text-paper">Join this debate</h3>
      <p className="mt-1.5 text-sm text-paper-dim">
        Enter a display name to join instantly — no signup required.
      </p>

      <form onSubmit={handleJoin} className="mt-5 flex flex-col gap-2.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your display name"
          maxLength={50}
          className="rounded-lg border border-void-border bg-void px-3.5 py-2.5 text-center text-sm text-paper placeholder:text-paper-faint focus:border-boundary/50 focus:outline-none"
        />
        {error && <p className="text-xs text-terra">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-boundary px-4 py-2.5 font-display text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Joining..." : "Join Debate"}
        </button>
      </form>
    </motion.div>
  );
}
