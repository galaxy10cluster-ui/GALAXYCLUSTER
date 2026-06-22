"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await api.post("/api/newsletter", { email });
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="border-t border-void-border bg-void-panel/40">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-base font-semibold text-paper">HK Singh Research Hub</p>
            <p className="mt-3 text-sm text-paper-dim">
              Independent theoretical physics research on spacetime curvature, negative mass,
              and the PJ-Orbit hypothesis.
            </p>
          </div>

          <div>
            <p className="mono-label mb-3 text-paper-faint">Browse</p>
            <ul className="space-y-2 text-sm text-paper-dim">
              <li><Link href="/papers" className="hover:text-ice">Research Papers</Link></li>
              <li><Link href="/videos" className="hover:text-ice">Videos</Link></li>
              <li><Link href="/audio" className="hover:text-ice">Audio &amp; Podcasts</Link></li>
              <li><Link href="/documents" className="hover:text-ice">Documents</Link></li>
            </ul>
          </div>

          <div>
            <p className="mono-label mb-3 text-paper-faint">Site</p>
            <ul className="space-y-2 text-sm text-paper-dim">
              <li><Link href="/about" className="hover:text-ice">About</Link></li>
              <li><Link href="/contact" className="hover:text-ice">Contact</Link></li>
              <li><Link href="/admin/login" className="hover:text-ice">Admin Login</Link></li>
            </ul>
          </div>

          <div>
            <p className="mono-label mb-3 text-paper-faint">Stay Updated</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-void-border bg-void px-3 py-2 text-sm text-paper placeholder:text-paper-faint focus:border-ice/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="shrink-0 rounded-lg bg-ice px-3 py-2 text-xs font-semibold text-void transition hover:bg-ice-glow disabled:opacity-50"
              >
                Join
              </button>
            </form>
            {status === "done" && <p className="mt-2 text-xs text-ice">Subscribed — thank you.</p>}
            {status === "error" && <p className="mt-2 text-xs text-terra">Something went wrong.</p>}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-void-border pt-6 text-xs text-paper-faint sm:flex-row">
          <p>© {new Date().getFullYear()} H.K. Singh. All research presented as independent, non-peer-reviewed work.</p>
          <p className="mono-label">Gravity is not just a force — it's a story of balance.</p>
        </div>
      </div>
    </footer>
  );
}
