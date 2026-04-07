import Link from "next/link";
import { createWhatsAppLink } from "@/lib/brand";

export default function HomePage() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-[2rem] border border-white/10 bg-black/30 p-8 md:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-400">Cavo</p>
          <h1 className="mt-4 text-4xl font-black text-white md:text-6xl">
            Premium footwear store ready for deployment
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-300 md:text-lg">
            Explore men, women, kids, and offers collections. This homepage is intentionally kept
            server-rendered and minimal to avoid prerender issues during Vercel deployment while the
            rest of the storefront and admin dashboard stay available.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="rounded-2xl bg-amber-500 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-black"
            >
              Shop now
            </Link>
            <a
              href={createWhatsAppLink("Hello Cavo, I want the latest catalog and available offers.")}
              target="_blank"
              className="rounded-2xl border border-white/10 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white"
            >
              WhatsApp order
            </a>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            ["Men", "/men"],
            ["Women", "/women"],
            ["Kids", "/kids"],
            ["Offers", "/offers"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 text-white transition hover:border-amber-500/30"
            >
              <div className="text-lg font-bold">{label}</div>
              <div className="mt-2 text-sm text-zinc-400">Browse the {label.toLowerCase()} collection.</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
