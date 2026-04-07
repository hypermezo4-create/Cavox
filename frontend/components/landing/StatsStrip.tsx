"use client";

import { animate, motion } from "framer-motion";
import { useEffect, useState } from "react";

function Counter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}

const items = [
  { label: "Happy Customers", value: 12500, suffix: "+" },
  { label: "Premium Styles", value: 850, suffix: "+" },
  { label: "Fast Reply", value: "5-15", suffix: "m", stringValue: true },
  { label: "Quality Rating", value: "4.9", suffix: "/5", stringValue: true },
];

export default function StatsStrip() {
  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {items.map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center">
              <div className="mb-2 text-4xl font-black tracking-tighter text-white md:text-5xl">
                {stat.stringValue ? <>{stat.value}{stat.suffix}</> : <><Counter value={Number(stat.value)} />{stat.suffix}</>}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
