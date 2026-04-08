import { Facebook, Instagram, Mail, MessageCircle, Music4, PhoneCall, Send } from "lucide-react";
import { CAVO_BRAND, createWhatsAppLink } from "@/lib/brand";

const supportTopics = ["General Inquiry", "Order Help", "Sizing Help"];

export default function ContactPage() {
  return (
    <section className="max-w-5xl px-2 py-8 md:px-0">
      <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-500">
        <Mail className="h-3.5 w-3.5" /> Contact Cavo
      </div>

      <h1 className="text-5xl font-black tracking-tighter text-white md:text-7xl">Contact & <span className="text-yellow-500">Support</span></h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-400">
        Need help with sizing, stock, or offers? This first transfer phase keeps the contact touchpoints ready while the backend contact workflow gets wired in the next phase.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <a href={createWhatsAppLink("Hello Cavo, I need help with an order.")} target="_blank" className="inline-flex items-center gap-3 rounded-2xl bg-amber-500 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-black">
          <MessageCircle className="h-4 w-4" /> WhatsApp {CAVO_BRAND.phoneLocal}
        </a>
        <a href={`tel:${CAVO_BRAND.phoneLocal}`} className="inline-flex items-center gap-3 rounded-2xl border border-white/10 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white">
          <PhoneCall className="h-4 w-4" /> Call Now
        </a>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {supportTopics.map((topic) => (
          <div key={topic} className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-sm font-semibold text-zinc-400">Topic</p>
            <h3 className="mt-2 text-xl font-bold text-white">{topic}</h3>
            <p className="mt-3 text-sm text-zinc-500">Handled now through WhatsApp and direct support channels until the form endpoint is added.</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 md:p-10">
        <h2 className="text-2xl font-bold text-white">Reach us everywhere</h2>
        <div className="mt-6 flex flex-wrap gap-4 text-zinc-400">
          <a href={CAVO_BRAND.social.instagram} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 hover:text-amber-300"><Instagram className="h-4 w-4" /> Instagram</a>
          <a href={CAVO_BRAND.social.telegram} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 hover:text-amber-300"><Send className="h-4 w-4" /> Telegram</a>
          <a href={CAVO_BRAND.social.facebook} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 hover:text-amber-300"><Facebook className="h-4 w-4" /> Facebook</a>
          <a href={CAVO_BRAND.social.tiktok} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 hover:text-amber-300"><Music4 className="h-4 w-4" /> TikTok</a>
        </div>
      </div>
    </section>
  );
}
