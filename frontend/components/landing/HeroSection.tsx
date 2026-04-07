"use client";

import { ArrowRight, MessageCircle, ShieldCheck, Star, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CAVO_BRAND, createWhatsAppLink } from "@/lib/brand";
import { PremiumButton } from "@/components/ui/PremiumButton";

const features = [
  {
    icon: Star,
    title: "Premium Quality",
    desc: "High-grade materials, clean finishing, and carefully selected silhouettes.",
  },
  {
    icon: Truck,
    title: "Fast Response",
    desc: `Quick support and direct ordering on WhatsApp: ${CAVO_BRAND.phoneLocal}.`,
  },
  {
    icon: ShieldCheck,
    title: "Professional Store",
    desc: "Unified identity, organized categories, active offers, and a smoother customer flow.",
  },
];

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="glass mb-8 inline-flex items-center gap-2 rounded-full border border-white/5 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{CAVO_BRAND.heroAlert}</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }} className="mb-8 text-5xl font-black uppercase tracking-tight text-white md:text-7xl lg:text-8xl">
            Walk Bold With <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">Cavo</span>
            <br /> Professional Shoe Store
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="mb-12 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
            Explore premium sneakers, casual pairs, everyday essentials, and limited offers for men, women, and kids. This first phase brings the clean Cavo identity into the new environment.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="mb-20 flex flex-col gap-6 sm:flex-row">
            <PremiumButton onClick={() => router.push("/shop")} icon={<ArrowRight className="h-5 w-5" />}>Shop Now</PremiumButton>
            <a href={createWhatsAppLink("Hello Cavo, I want to place an order and know the available sizes.")} target="_blank" className="glass flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-8 py-4 font-bold uppercase tracking-wide text-white transition-all hover:bg-white/10">
              <MessageCircle className="h-5 w-5 text-amber-400" /> Order on WhatsApp
            </a>
          </motion.div>

          <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }} className="glass group rounded-3xl border border-white/5 p-8 text-left transition-all duration-300 hover:border-amber-500/30 hover:bg-white/[0.05]">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 shadow-lg shadow-amber-500/5 transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
