"use client";

import { useState } from "react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-paper">Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass rounded-xl p-6">
          <h2 className="mb-4 font-display text-base font-semibold text-paper">Site Identity</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mono-label mb-1.5 block text-paper-faint">Site Name</label>
              <input
                defaultValue="HK Singh Research Hub"
                className="w-full rounded-lg border border-void-border bg-void px-3.5 py-2.5 text-sm text-paper focus:border-ice/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="mono-label mb-1.5 block text-paper-faint">Homepage Subtitle</label>
              <input
                defaultValue="Student | Analytical Thinker | Independent Theoretical Researcher"
                className="w-full rounded-lg border border-void-border bg-void px-3.5 py-2.5 text-sm text-paper focus:border-ice/40 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="mb-4 font-display text-base font-semibold text-paper">Theme Colors</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mono-label mb-1.5 block text-paper-faint">Primary (Ice Blue)</label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#00D4FF" className="h-9 w-9 cursor-pointer rounded-lg border border-void-border bg-void" />
                <input defaultValue="#00D4FF" className="flex-1 rounded-lg border border-void-border bg-void px-3 py-2 font-mono text-sm text-paper" />
              </div>
            </div>
            <div>
              <label className="mono-label mb-1.5 block text-paper-faint">Accent (Terra Cotta)</label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#FF6B35" className="h-9 w-9 cursor-pointer rounded-lg border border-void-border bg-void" />
                <input defaultValue="#FF6B35" className="flex-1 rounded-lg border border-void-border bg-void px-3 py-2 font-mono text-sm text-paper" />
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-paper-faint">
            Color changes require a frontend rebuild to take effect (update tailwind.config.js).
          </p>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="mb-4 font-display text-base font-semibold text-paper">Sections</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Papers", "Videos", "Audio", "Documents"].map((section) => (
              <label key={section} className="flex cursor-pointer items-center justify-between rounded-lg border border-void-border bg-void-raised px-4 py-3">
                <span className="text-sm text-paper">{section}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#00D4FF]" />
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-ice px-5 py-2.5 font-display text-sm font-semibold text-void transition hover:bg-ice-glow"
        >
          {saved ? "Saved ✓" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
