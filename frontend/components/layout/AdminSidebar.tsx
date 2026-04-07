"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/social", label: "Social" },
  { href: "/admin/contact", label: "Inbox" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="min-h-screen w-full border-b border-white/10 bg-[#08080d] p-4 text-white md:w-72 md:border-b-0 md:border-r">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-white/45">Cavo</p>
        <h2 className="mt-2 text-2xl font-bold">Admin</h2>
        <p className="mt-1 text-sm text-white/55">Control products, orders, site settings, and customer conversations.</p>
      </div>
      <nav className="mt-6 grid gap-2">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-white text-black" : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
