import Link from "next/link";
import { Instagram, MessageCircle, PhoneCall, Send, Facebook, Music4 } from "lucide-react";
import { CavoLogo } from "@/components/brand/CavoLogo";
import { CAVO_BRAND, createWhatsAppLink } from "@/lib/brand";

const quickLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Men", href: "/men" },
  { label: "Women", href: "/women" },
  { label: "Kids", href: "/kids" },
  { label: "Offers", href: "/offers" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-black/20">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <CavoLogo />
          <p className="mt-4 max-w-sm text-sm text-zinc-500">
            Premium footwear store with a unified Cavo identity, professional catalog management, and a customer flow ready for full cart and checkout wiring.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Quick Links</h4>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-zinc-500 transition-colors hover:text-amber-400">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Order & Support</h4>
          <div className="space-y-3 text-sm text-zinc-400">
            <a href={createWhatsAppLink()} target="_blank" className="flex items-center gap-3 transition-colors hover:text-amber-400"><MessageCircle className="h-4 w-4" /> WhatsApp: {CAVO_BRAND.phoneLocal}</a>
            <a href={`tel:${CAVO_BRAND.phoneLocal}`} className="flex items-center gap-3 transition-colors hover:text-amber-400"><PhoneCall className="h-4 w-4" /> Call us directly</a>
            <div className="flex flex-wrap gap-3 pt-2 text-zinc-500">
              <a href={CAVO_BRAND.social.instagram} target="_blank" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
              <a href={CAVO_BRAND.social.telegram} target="_blank" aria-label="Telegram"><Send className="h-4 w-4" /></a>
              <a href={CAVO_BRAND.social.facebook} target="_blank" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
              <a href={CAVO_BRAND.social.tiktok} target="_blank" aria-label="TikTok"><Music4 className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 border-t border-white/5 px-6 py-6 text-sm text-zinc-500 md:flex-row">
        <p>© {new Date().getFullYear()} Cavo Store. Premium footwear, professional service, fast support.</p>
        <div className="flex gap-4">
          <Link href="/privacy-policy" className="hover:text-amber-400">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-amber-400">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
