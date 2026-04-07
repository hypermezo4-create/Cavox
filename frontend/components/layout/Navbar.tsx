"use client";

import { LogOut, Menu, ShoppingBag, Tag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { CavoLogo } from "@/components/brand/CavoLogo";
import LanguageToggle from "@/components/layout/LanguageToggle";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { apiFetch, CartItem } from "@/lib/api";
import { createWhatsAppLink, CAVO_BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/shop", name: "Shop" },
  { href: "/men", name: "Men" },
  { href: "/women", name: "Women" },
  { href: "/kids", name: "Kids" },
  { href: "/offers", name: "Offers" },
  { href: "/about", name: "About" },
  { href: "/contact", name: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { data: session, status } = useSession();

  useEffect(() => {
    let cancelled = false;

    async function loadCartCount() {
      if (!session?.accessToken) {
        setCartCount(0);
        return;
      }

      try {
        const items = await apiFetch<CartItem[]>("/cart", undefined, session.accessToken);
        if (!cancelled) {
          setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
        }
      } catch {
        if (!cancelled) setCartCount(0);
      }
    }

    loadCartCount();
    return () => {
      cancelled = true;
    };
  }, [pathname, session?.accessToken]);

  const authLink = useMemo(() => {
    if (status === "authenticated") {
      return session.user?.role === "ADMIN" ? "/admin" : "/auth/login";
    }
    return "/auth/login";
  }, [session?.user?.role, status]);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 md:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-[2rem] border border-white/10 bg-zinc-950/70 px-4 py-4 backdrop-blur-xl shadow-soft">
        <CavoLogo compact />

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/shop" && pathname === "/products");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-colors",
                  isActive ? "bg-amber-500/10 text-amber-300" : "text-zinc-400 hover:text-amber-200",
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/cart" className="relative rounded-xl border border-white/10 p-3 text-zinc-300 transition hover:text-amber-300">
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-black">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link href={authLink} className="rounded-xl border border-white/10 p-3 text-zinc-300 transition hover:text-amber-300" title={status === "authenticated" ? "Account" : "Login"}>
            <UserRound className="h-4 w-4" />
          </Link>
          {status === "authenticated" ? (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-xl border border-white/10 p-3 text-zinc-300 transition hover:text-amber-300" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          ) : null}
          <a href={createWhatsAppLink("Hello Cavo, I want your latest offers and available sizes.")} target="_blank" className="rounded-2xl bg-amber-500 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:brightness-110">
            WhatsApp Order
          </a>
          <div className="rounded-2xl border border-white/10 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-300">
            {CAVO_BRAND.phoneLocal}
          </div>
          <LanguageToggle />
          <ThemeToggle />
        </div>

        <button onClick={() => setIsOpen((v) => !v)} className="rounded-xl border border-white/10 p-3 text-zinc-300 md:hidden">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {isOpen ? (
        <div className="mx-auto mt-3 max-w-7xl rounded-[2rem] border border-white/10 bg-zinc-950/90 p-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide text-zinc-300 transition hover:bg-white/5 hover:text-amber-200">
                {item.name}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <Link href="/cart" className="relative rounded-xl border border-white/10 p-3 text-zinc-300">
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 ? <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-black">{cartCount}</span> : null}
              </Link>
              <Link href="/offers" className="rounded-xl border border-white/10 p-3 text-zinc-300"><Tag className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
