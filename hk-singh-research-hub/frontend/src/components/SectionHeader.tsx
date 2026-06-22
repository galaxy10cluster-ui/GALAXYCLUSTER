import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  eyebrow,
  title,
  viewAllHref,
}: {
  eyebrow: string;
  title: string;
  viewAllHref: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="mono-label mb-2 text-terra">{eyebrow}</p>
        <h2 className="font-display text-2xl font-bold text-paper sm:text-3xl">{title}</h2>
      </div>
      <Link
        href={viewAllHref}
        className="hidden shrink-0 items-center gap-1.5 mono-label text-paper-dim transition hover:text-ice sm:flex"
      >
        View all <ArrowRight size={13} />
      </Link>
    </div>
  );
}
