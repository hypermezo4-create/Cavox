"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { CartItem, apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCart() {
    if (!session?.accessToken) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<CartItem[]>("/cart", undefined, session.accessToken);
      setItems(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load cart.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, [session?.accessToken]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.variant?.priceOverride ?? item.product.salePrice ?? item.product.price ?? 0) * item.quantity, 0),
    [items]
  );

  async function updateQuantity(id: string, quantity: number) {
    if (!session?.accessToken) return;
    try {
      await apiFetch(`/cart/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: Math.max(1, quantity) })
      }, session.accessToken);
      await loadCart();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not update quantity.");
    }
  }

  async function removeItem(id: string) {
    if (!session?.accessToken) return;
    try {
      await apiFetch(`/cart/${id}`, { method: "DELETE" }, session.accessToken);
      await loadCart();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not remove item.");
    }
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
        <h1 className="text-3xl font-black text-white">Sign in to view your cart</h1>
        <p className="mt-3 text-zinc-400">Your cart is linked to your account so you can continue checkout safely.</p>
        <Link href="/auth/login?callbackUrl=%2Fcart" className="mt-6 inline-flex rounded-2xl bg-amber-500 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">Sign in</Link>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Cart</p>
        <h1 className="mt-3 text-4xl font-black text-white">Your shopping bag</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">Review your selected products, adjust quantities, and continue to checkout.</p>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-zinc-400">Loading your cart...</div>
      ) : error ? (
        <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-red-200">{error}</div>
      ) : !items.length ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
          <h2 className="text-2xl font-black text-white">Your cart is empty</h2>
          <p className="mt-3 text-zinc-400">Browse the latest drops and add your favorite pairs.</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-2xl bg-amber-500 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">Continue shopping</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            {items.map((item) => {
              const unitPrice = Number(item.variant?.priceOverride ?? item.product.salePrice ?? item.product.price ?? 0);
              const image = item.variant?.image || item.product.featuredImage || item.product.images?.[0];
              return (
                <article key={item.id} className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:flex-row">
                  <div className="h-28 w-full overflow-hidden rounded-2xl bg-black/20 sm:w-28">
                    {image ? <img src={image} alt={item.product.nameEn} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">{item.product.brand}</p>
                        <h2 className="mt-1 text-xl font-black text-white">{item.product.nameEn}</h2>
                        <p className="mt-1 text-sm text-zinc-400">{item.variant?.size || item.selectedSize || "One size"} • {item.variant?.color || item.selectedColor || "Standard color"}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="rounded-xl border border-white/10 p-3 text-zinc-400 transition hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-2xl border border-white/10 bg-black/20">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 text-zinc-300"><Minus className="h-4 w-4" /></button>
                        <span className="min-w-12 text-center text-sm font-bold text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 text-zinc-300"><Plus className="h-4 w-4" /></button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-zinc-400">{formatPrice(unitPrice)} each</p>
                        <p className="text-lg font-black text-white">{formatPrice(unitPrice * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Summary</p>
            <div className="mt-5 space-y-4 text-sm text-zinc-400">
              <div className="flex items-center justify-between"><span>Items</span><span>{items.length}</span></div>
              <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex items-center justify-between"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-base font-bold text-white"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
              </div>
            </div>
            <Link href="/checkout" className="mt-6 inline-flex w-full justify-center rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black">Proceed to checkout</Link>
          </aside>
        </div>
      )}
    </section>
  );
}
