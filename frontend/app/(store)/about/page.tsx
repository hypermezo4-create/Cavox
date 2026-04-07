import { Gem, Globe, HeartHandshake, Shield } from "lucide-react";

const cards = [
  {
    icon: HeartHandshake,
    title: "Customer Focused",
    desc: "Every collection and every touchpoint is built around what customers actually want to wear.",
  },
  {
    icon: Shield,
    title: "Premium Quality",
    desc: "We prioritize comfort, durability, and polished finishing in every pair we present.",
  },
  {
    icon: Gem,
    title: "Curated Selection",
    desc: "Cavo brings together timeless essentials and fresh drops in one refined storefront.",
  },
];

export default function AboutPage() {
  return (
    <section className="px-2 py-8 md:px-0">
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold text-white md:text-6xl">About <span className="text-gradient">Cavo</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
          Cavo is a footwear brand built around sharp design, premium materials, and a shopping experience that feels modern from first click to final delivery.
        </p>
      </div>

      <div className="mb-20 grid items-center gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Our Story</h2>
          <p className="leading-relaxed text-zinc-400">We created Cavo for people who want premium sneakers and everyday footwear without compromising on style, comfort, or detail.</p>
          <p className="leading-relaxed text-zinc-400">From statement silhouettes to versatile daily pairs, every collection is curated to help customers move confidently. This environment is now carrying that identity forward in a cleaner codebase.</p>
        </div>
        <div className="glass rounded-[3rem] p-1">
          <div className="flex items-center justify-center rounded-[2.8rem] bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-12">
            <Globe className="h-32 w-32 text-yellow-500 opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {cards.map((item) => (
          <div key={item.title} className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-10">
            <item.icon className="mb-6 h-10 w-10 text-yellow-500" />
            <h3 className="mb-4 text-xl font-bold text-white">{item.title}</h3>
            <p className="text-sm leading-relaxed text-zinc-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
