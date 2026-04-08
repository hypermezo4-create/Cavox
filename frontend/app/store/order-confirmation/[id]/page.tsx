"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Order, apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      if (!session?.accessToken || !params?.id) return;
      try {
        setLoading(true);
        const data = await apiFetch<Order>(`/orders/${params.id}`, undefined, session.accessToken);
        if (!cancelled) setOrder(data);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrder();
    return () => {
      cancelled = true;
    };
  }, [params?.id, session?.accessToken]);

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Order confirmed</p>
        <h1 className="mt-3 text-4xl font-black text-white">Thank you for shopping with Cavo</h1>
        <p className="mt-3 text-zinc-400">Your order has been placed successfully and is now waiting for processing.</p>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-zinc-400">Loading order details...</div>
      ) : error ? (
        <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-red-200">{error}</div>
      ) : order ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-black text-white">Order snapshot</h2>
            <div className="mt-5 space-y-3 text-sm text-zinc-400">
              <div className="flex items-center justify-between"><span>Order number</span><span className="font-semibold text-white">{order.orderNumber}</span></div>
              <div className="flex items-center justify-between"><span>Status</span><span className="font-semibold text-white">{order.orderStatus}</span></div>
              <div className="flex items-center justify-between"><span>Payment</span><span className="font-semibold text-white">{order.paymentStatus}</span></div>
              <div className="flex items-center justify-between"><span>Total</span><span className="font-semibold text-white">{formatPrice(order.totalPrice)}</span></div>
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">
              <p className="font-bold text-white">Delivery address</p>
              <p className="mt-2">{order.addressLine1}</p>
              {order.addressLine2 ? <p>{order.addressLine2}</p> : null}
              <p>{order.city}, {order.governorate}</p>
              <p>{order.country}</p>
            </div>
          </aside>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-black text-white">Items</h2>
            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div>
                    <p className="font-bold text-white">{item.productNameEn}</p>
                    <p className="text-sm text-zinc-500">{item.quantity} × {item.variantSize || "One size"} • {item.variantColor || "Standard color"}</p>
                  </div>
                  <p className="font-semibold text-white">{formatPrice(item.lineTotal)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-200">Continue shopping</Link>
              <Link href="/cart" className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black text-black">Back to cart</Link>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
