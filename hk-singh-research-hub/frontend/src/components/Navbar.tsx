"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sun, Moon, Menu, X, Bookmark } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { GlobalSearch } from "./GlobalSearch";

const NAV_LINKS = [
  { href: "/papers", label: "Papers" },
  { href: "/videos", label: "Videos" },
  { href: "/audio", label: "Audio" },
  { href: "/documents", label: "Documents" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-void-border/60 bg-void/70 backdrop-blur-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-ice/40 bg-void-panel">
              <span className="absolute inset-0 rounded-full bg-ice/20 blur-md group-hover:bg-ice/30 transition" />
              <span className="relative font-display text-xs font-bold text-ice">HK</span>
            </span>
            <span className="font-display text-sm font-semibold tracking-tight text-paper sm:text-base">
              HK Singh <span className="text-paper-dim font-normal hidden sm:inline">Research Hub</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mono-label text-paper-dim transition hover:text-ice"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-void-border text-paper-dim transition hover:border-ice/40 hover:text-ice"
            >
              <Search size={16} />
            </button>
            <button
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-void-border text-paper-dim transition hover:border-ice/40 hover:text-ice"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              href="/bookmarks"
              aria-label="Bookmarks"
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-void-border text-paper-dim transition hover:border-ice/40 hover:text-ice sm:flex"
            >
              <Bookmark size={16} />
            </Link>
            <button
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-void-border text-paper-dim lg:hidden"
            >
              <Menu size={16} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-void/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex items-center justify-between px-5 py-3">
              <span className="font-display text-sm font-semibold text-paper">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-paper-dim">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 font-display text-lg text-paper transition hover:bg-void-panel hover:text-ice"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
