"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Popular {
  topPapers: { title: string; slug: string; views: number }[];
  topVideos: { title: string; slug: string; views: number }[];
  topAudios: { title: string; slug: string; plays: number }[];
}

export default function AdminAnalyticsPage() {
  const [popular, setPopular] = useState<Popular | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("admin-token") || "" : "";

  useEffect(() => {
    api.get<Popular>("/api/analytics/popular", token).then(setPopular).catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-paper">Analytics</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <PopularList
          title="Top Papers"
          items={(popular?.topPapers || []).map((p) => ({ title: p.title, stat: p.views, label: "views" }))}
        />
        <PopularList
          title="Top Videos"
          items={(popular?.topVideos || []).map((v) => ({ title: v.title, stat: v.views, label: "views" }))}
        />
        <PopularList
          title="Top Audio"
          items={(popular?.topAudios || []).map((a) => ({ title: a.title, stat: a.plays, label: "plays" }))}
        />
      </div>
    </div>
  );
}

function PopularList({ title, items }: { title: string; items: { title: string; stat: number; label: string }[] }) {
  return (
    <div className="glass rounded-xl p-5">
      <h2 className="mb-4 font-display text-base font-semibold text-paper">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-paper-faint">No data yet</p>
      ) : (
        <ol className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mono-label mt-0.5 w-4 shrink-0 text-right text-paper-faint">{i + 1}</span>
              <span className="flex-1 text-sm text-paper">{item.title}</span>
              <span className="mono-label shrink-0 text-ice">{item.stat.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
