"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { api } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await api.post("/api/contact", form);
      setStatus("done");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 lg:px-8">
      <div className="mb-10 text-center">
        <p className="mono-label mb-3 text-ice">Get in Touch</p>
        <h1 className="font-display text-3xl font-bold text-paper sm:text-4xl">Contact</h1>
        <p className="mt-3 text-sm text-paper-dim">
          Academic collaboration, questions about the research, or debate invitations welcome.
        </p>
      </div>

      {status === "done" ? (
        <div className="glass rounded-2xl py-12 text-center">
          <p className="font-display text-lg text-ice">Message sent.</p>
          <p className="mt-2 text-sm text-paper-dim">Thank you — I will respond when I can.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass flex flex-col gap-4 rounded-2xl p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mono-label mb-1.5 block text-paper-faint">Name</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full rounded-lg border border-void-border bg-void px-3.5 py-2.5 text-sm text-paper placeholder:text-paper-faint focus:border-ice/40 focus:outline-none"
              />
            </div>
            <div>
              <label className="mono-label mb-1.5 block text-paper-faint">Email</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-void-border bg-void px-3.5 py-2.5 text-sm text-paper placeholder:text-paper-faint focus:border-ice/40 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mono-label mb-1.5 block text-paper-faint">Message</label>
            <textarea
              name="message"
              required
              rows={6}
              value={form.message}
              onChange={handleChange}
              placeholder="Your message..."
              className="w-full resize-none rounded-lg border border-void-border bg-void px-3.5 py-2.5 text-sm text-paper placeholder:text-paper-faint focus:border-ice/40 focus:outline-none"
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-terra">Failed to send — please try again.</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="flex items-center justify-center gap-2 rounded-xl bg-ice py-3 font-display text-sm font-semibold text-void transition hover:bg-ice-glow disabled:opacity-50"
          >
            {status === "loading" ? "Sending..." : "Send Message"}
            <Send size={14} />
          </button>
        </form>
      )}
    </div>
  );
}
