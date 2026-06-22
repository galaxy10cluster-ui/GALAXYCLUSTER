"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post<{ token: string }>("/api/auth/login", { email, password });
      localStorage.setItem("admin-token", data.token);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-5">
      <div className="glass w-full max-w-sm rounded-2xl p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-ice/30 bg-ice/10 font-display text-lg font-bold text-ice">
            HK
          </div>
          <h1 className="font-display text-xl font-bold text-paper">Admin Login</h1>
          <p className="mt-1 text-xs text-paper-faint">HK Singh Research Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mono-label mb-1.5 block text-paper-faint">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-void-border bg-void px-3.5 py-2.5 text-sm text-paper focus:border-ice/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mono-label mb-1.5 block text-paper-faint">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-void-border bg-void px-3.5 py-2.5 text-sm text-paper focus:border-ice/50 focus:outline-none"
            />
          </div>
          {error && <p className="text-xs text-terra">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-ice py-2.5 font-display text-sm font-semibold text-void transition hover:bg-ice-glow disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
