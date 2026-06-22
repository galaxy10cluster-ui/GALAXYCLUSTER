"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, MessagesSquare } from "lucide-react";
import { SpacetimeGrid } from "./SpacetimeGrid";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-void-border">
      <div className="absolute inset-0 bg-ice-terra-radial" />
      <div className="relative h-[420px] sm:h-[480px]">
        <SpacetimeGrid />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/40 to-void" />
      </div>

      <div className="relative mx-auto -mt-72 max-w-5xl px-5 pb-20 text-center sm:-mt-80 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mono-label mb-4 text-ice"
        >
          Independent Theoretical Physics Research
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-gradient-ice-terra font-display text-5xl font-bold tracking-tight sm:text-7xl"
        >
          H.K. Singh
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-4 max-w-xl font-body text-base text-paper-dim sm:text-lg"
        >
          Student · Analytical Thinker · Independent Theoretical Researcher
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/papers"
            className="group flex items-center gap-2 rounded-full bg-ice px-6 py-3 font-display text-sm font-semibold text-void shadow-glow transition hover:bg-ice-glow"
          >
            Explore Research
            <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/videos"
            className="flex items-center gap-2 rounded-full border border-void-border bg-void-panel/60 px-6 py-3 font-display text-sm font-semibold text-paper backdrop-blur transition hover:border-ice/40"
          >
            <PlayCircle size={15} />
            Watch Videos
          </Link>
          <Link
            href="/papers/pj-orbit-hypothesis-localized-spacetime-curvature"
            className="flex items-center gap-2 rounded-full border border-terra/40 bg-terra/10 px-6 py-3 font-display text-sm font-semibold text-terra-glow transition hover:bg-terra/20"
          >
            <MessagesSquare size={15} />
            Join Debate
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
