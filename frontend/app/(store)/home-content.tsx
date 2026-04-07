import { MessageCircle } from "lucide-react";
import Link from "next/link";
import HeroSection from "@/components/landing/HeroSection";
import StatsStrip from "@/components/landing/StatsStrip";
import { createWhatsAppLink } from "@/lib/brand";

const categories = [
  { title: "Men", href: "/men", desc: "Clean sneakers, statement pairs, and everyday staples." },
  { title: "Women", href: "/women", desc: "Elegant silhouettes, trending drops, and comfort-first style." },
  { title: "Kids", href: "/kids", desc: "Durable pairs built for movement, fun, and all-day wear." },
  { title: "Offers", href: "/offers", desc: "Discounted picks and limited deals ready for fast checkout wiring." },
];

export default function HomeContent() {
  return (
    <section>
      <HeroSection />
      <StatsStrip />

      <section className="pb-20 pt-6">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-400">Explore Cavo</p>
              <h2 className="mt-3 text-4xl font-black text-white">Collections made for every category</h2>
            </div>
            <Link href="/shop" className="rounded-2xl border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-200 transition hover:border-amber-500/30 hover:text-amber-300">View All Products</Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.href} href={category.href} className="glass rounded-[2rem] border border-white/5 p-8 transition hover:-translate-y-1 hover:border-amber-500/30 hover:bg-white/[0.05]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Collection</p>
                <h3 className="mt-4 text-2xl font-bold text-white">{category.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{category.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-5xl rounded-[3.5rem] border border-white/5 bg-gradient-to-br from-amber-500/20 to-zinc-900 p-[1px] px-6">
          <div className="relative overflow-hidden rounded-[3.4rem] bg-zinc-950 p-12 text-center md:p-20">
            <h2 className="mb-8 text-4xl font-black uppercase tracking-tight text-white md:text-6xl">
              Order Directly On <span className="text-amber-400">WhatsApp</span>
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-zinc-400">
              The clean environment now carries the proper Cavo identity. Next steps will wire cart, checkout, and full admin data flows on top of this front layer.
            </p>
            <a href={createWhatsAppLink("Hello Cavo, I want the latest catalog and available offers.")} target="_blank" className="mx-auto inline-flex items-center gap-3 rounded-2xl bg-amber-500 px-12 py-6 font-black uppercase tracking-tight text-black">
              <MessageCircle className="h-5 w-5" /> Start WhatsApp Order
            </a>
          </div>
        </div>
      </section>
    </section>
  );
}
