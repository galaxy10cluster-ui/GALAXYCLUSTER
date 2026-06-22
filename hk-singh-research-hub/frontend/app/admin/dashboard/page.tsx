"use client";

import { useEffect, useState } from "react";
import { FileText, Video, Headphones, File, Eye, Download, MessageSquare, Users } from "lucide-react";
import { api } from "@/lib/api";

interface Overview {
  totals: {
    contentItems: number;
    papers: number; videos: number; audios: number; documents: number;
    views: number; downloads: number; comments: number; debateParticipants: number;
  };
}

interface Leaderboard { name: string; comments: number; }
interface Engagement { date: string; comment: number; view: number; }

function StatCard({ icon: Icon, label, value, color = "text-ice" }: {
  icon: typeof FileText; label: string; value: number | string; color?: string;
}) {
  return (
    <div className="glass rounded-xl p-5">
      <div className={`mb-2 ${color}`}><Icon size={18} /></div>
      <p className="font-display text-2xl font-bold text-paper">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="mono-label mt-1 text-paper-faint">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [engagement, setEngagement] = useState<Engagement[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("admin-token") || "";
    api.get<Overview>("/api/analytics/overview", token).then(setOverview).catch(() => {});
    api.get<Leaderboard[]>("/api/analytics/leaderboard").then(setLeaderboard).catch(() => {});
    api.get<Engagement[]>("/api/analytics/engagement", token).then(setEngagement).catch(() => {});
  }, []);

  const totals = overview?.totals;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-paper">Dashboard</h1>
        <p className="mt-1 text-sm text-paper-dim">Welcome back, H.K. Singh</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Papers" value={totals?.papers ?? "—"} />
        <StatCard icon={Video} label="Videos" value={totals?.videos ?? "—"} />
        <StatCard icon={Headphones} label="Audio" value={totals?.audios ?? "—"} />
        <StatCard icon={File} label="Documents" value={totals?.documents ?? "—"} />
        <StatCard icon={Eye} label="Total Views" value={totals?.views ?? "—"} color="text-terra" />
        <StatCard icon={Download} label="Downloads" value={totals?.downloads ?? "—"} color="text-terra" />
        <StatCard icon={MessageSquare} label="Debate Comments" value={totals?.comments ?? "—"} color="text-boundary" />
        <StatCard icon={Users} label="Debate Participants" value={totals?.debateParticipants ?? "—"} color="text-boundary" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="glass col-span-2 rounded-xl p-6">
          <h2 className="mb-4 font-display text-base font-semibold text-paper">Comment Activity — Last 14 Days</h2>
          {engagement.length === 0 ? (
            <p className="py-8 text-center text-sm text-paper-faint">No activity data yet</p>
          ) : (
            <div className="flex h-32 items-end gap-1.5">
              {engagement.map((e) => {
                const max = Math.max(...engagement.map((x) => x.comment), 1);
                const h = Math.max((e.comment / max) * 100, 4);
                return (
                  <div key={e.date} className="group relative flex flex-1 flex-col items-center gap-1">
                    <div
                      style={{ height: `${h}%` }}
                      className="w-full rounded-sm bg-ice/40 transition group-hover:bg-ice"
                    />
                    <span className="mono-label text-paper-faint" style={{ fontSize: "9px" }}>
                      {e.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="mb-4 font-display text-base font-semibold text-paper">Top Debaters</h2>
          {leaderboard.length === 0 ? (
            <p className="py-4 text-center text-sm text-paper-faint">No debate activity yet</p>
          ) : (
            <ol className="space-y-2.5">
              {leaderboard.slice(0, 8).map((entry, i) => (
                <li key={entry.name} className="flex items-center gap-3">
                  <span className="mono-label w-4 text-right text-paper-faint">{i + 1}</span>
                  <span className="flex-1 truncate text-sm text-paper">{entry.name}</span>
                  <span className="mono-label text-ice">{entry.comments}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
