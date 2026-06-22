"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, FileText, Video, Headphones, File,
  MessageSquare, BarChart2, Settings, LogOut, ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/content?type=paper", label: "Papers", icon: FileText },
  { href: "/admin/content?type=video", label: "Videos", icon: Video },
  { href: "/admin/content?type=audio", label: "Audio", icon: Headphones },
  { href: "/admin/content?type=document", label: "Documents", icon: File },
  { href: "/admin/debates", label: "Debates", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-void-border bg-void-panel">
      <div className="flex items-center gap-2 border-b border-void-border px-5 py-4">
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-ice/20 text-xs font-bold text-ice">HK</span>
        <span className="font-display text-sm font-semibold text-paper">Admin Panel</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href.split("?")[0]);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-ice/10 text-ice"
                  : "text-paper-dim hover:bg-void-raised hover:text-paper"
              }`}
            >
              <Icon size={15} />
              {label}
              {active && <ChevronRight size={12} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-void-border p-2">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-paper-dim transition hover:bg-void-raised hover:text-terra"
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") { setChecked(true); return; }
    const token = localStorage.getItem("admin-token");
    if (!token) { router.push("/admin/login"); return; }
    setChecked(true);
  }, [pathname, router]);

  function handleLogout() {
    localStorage.removeItem("admin-token");
    router.push("/admin/login");
  }

  if (!checked) return null;
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-void">
      <AdminSidebar onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
