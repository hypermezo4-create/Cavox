import Link from "next/link";
import { Footprints } from "lucide-react";
import { CAVO_BRAND } from "@/lib/brand";

export function CavoLogo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="group flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-amber-400/30 bg-zinc-950 shadow-lg shadow-amber-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-300/20 via-transparent to-amber-600/20" />
        <Footprints className="relative z-10 h-5 w-5 text-amber-300" />
      </div>
      <div className="leading-none">
        <div className="text-2xl font-black uppercase tracking-[0.22em] text-white">Cavo</div>
        {!compact ? (
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300/90">{CAVO_BRAND.tagline}</div>
        ) : null}
      </div>
    </Link>
  );
}
