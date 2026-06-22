import { Metadata } from "next";
import { BookOpen, Atom, TrendingUp, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "About — HK Singh Research Hub",
  description: "About H.K. Singh — student, analytical thinker, and independent theoretical researcher.",
};

const TIMELINE = [
  {
    period: "Origins",
    icon: BookOpen,
    text: "Developed a deep interest in theoretical physics, cosmology, and the fundamental structure of the universe.",
  },
  {
    period: "PJ-Orbit Hypothesis",
    icon: Atom,
    text: "Formulated the PJ-Orbit Hypothesis: a localized spacetime curvature model proposing that negative mass is confined within bounded equilibrium regions, resolving the classical runaway motion paradox.",
  },
  {
    period: "Mathematical Framework",
    icon: TrendingUp,
    text: "Derived the modified effective acceleration equation a(r) = −GM/r² × tanh((r − r_PJ)/Δ) and explored its implications for galactic rotation curves and ring-structure formation.",
  },
  {
    period: "Ongoing Research",
    icon: Rocket,
    text: "Continuing to develop scalar field coupling mechanics, relativistic simulation models, and specific observational predictions. Open to academic collaboration and critical engagement.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <div className="mb-12 text-center">
        <p className="mono-label mb-3 text-ice">Independent Researcher</p>
        <h1 className="font-display text-4xl font-bold text-paper sm:text-5xl">H.K. Singh</h1>
        <p className="mt-4 text-base text-paper-dim">
          Student · Analytical Thinker · Independent Theoretical Researcher
        </p>
      </div>

      <div className="glass mb-12 rounded-2xl p-8">
        <h2 className="mb-4 font-display text-xl font-semibold text-paper">About This Research</h2>
        <p className="mb-4 leading-relaxed text-paper-dim">
          This hub presents independent, non-peer-reviewed theoretical physics research by H.K. Singh.
          The primary focus is the <strong className="text-ice">PJ-Orbit Hypothesis</strong> — a speculative
          but rigorously framed model proposing that negative mass can exist in a stable, localized form
          through a structured inversion of spacetime curvature.
        </p>
        <p className="mb-4 leading-relaxed text-paper-dim">
          Rather than dismissing negative mass due to the classical runaway motion paradox, the framework
          introduces a bounded equilibrium region (the PJ-orbit) where gravitational behavior transitions
          smoothly from repulsive to attractive — described mathematically using a hyperbolic tangent
          transition function applied to the Newtonian gravitational acceleration.
        </p>
        <p className="leading-relaxed text-paper-dim">
          This work is in an early conceptual stage. It is presented here in the spirit of open scientific
          inquiry — inviting critical engagement, debate, and collaboration rather than asserting final conclusions.
        </p>
      </div>

      <h2 className="mb-6 font-display text-xl font-semibold text-paper">Research Timeline</h2>
      <div className="space-y-5">
        {TIMELINE.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="glass glass-hover flex gap-4 rounded-xl p-5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ice/10 text-ice">
                <Icon size={17} />
              </div>
              <div>
                <p className="mono-label mb-1 text-ice">{item.period}</p>
                <p className="text-sm leading-relaxed text-paper-dim">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass mt-12 rounded-2xl border-terra/30 p-6 text-center">
        <p className="mono-label mb-2 text-terra">Disclaimer</p>
        <p className="text-sm text-paper-dim">
          All research presented on this site is independent, speculative, and non-peer-reviewed.
          Claims should not be treated as established science. The researcher welcomes critical
          scrutiny, debate, and alternative interpretations.
        </p>
      </div>
    </div>
  );
}
