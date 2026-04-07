"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CartItem, SettingsResponse, apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

const paymentOptions = [
  { value: "VODAFONE_CASH", label: "Vodafone Cash" },
  { value: "INSTA_PAY", label: "Insta Pay" },
  { value: "COD", label: "Cash on Delivery" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    governorate: "",
    country: "Egypt",
    postalCode: "",
    paymentMethod: "COD",
    paymentReference: "",
    notes: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadCheckoutData() {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const [cart, settings, me] = await Promise.all([
          apiFetch<CartItem[]>("/cart", undefined, session.accessToken),
          apiFetch<SettingsResponse>("/settings"),
          apiFetch<any>("/users/me", undefined, session.accessToken),
        ]);

        if (cancelled) return;

        setCartItems(cart);
        setShippingFee(Number(settings.map.default_shipping_fee || 0));
        setForm((current) => ({
          ...current,
          customerName: current.customerName || me.name || "",
          customerEmail: current.customerEmail || me.email || "",
          customerPhone: current.customerPhone || me.phone || "",
        }));
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Could not load checkout data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCheckoutData();
    return () => {
      cancelled = true;
    };
  }, [session?.accessToken]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.variant?.priceOverride ?? item.product.salePrice ?? item.product.price ?? 0) * item.quantity, 0),
    [cartItems]
  );
  const total = subtotal + shippingFee;

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.accessToken) return;

    if (!cartItems.length) {
      setMessage("Your cart is empty.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      const created = await apiFetch<any>(
        "/orders",
        {
          method: "POST",
          body: JSON.stringify({
            ...form,
            shippingFee,
            items: cartItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              selectedSize: item.variant?.size || item.selectedSize,
              selectedColor: item.variant?.color || item.selectedColor,
            }))
          })
        },
        session.accessToken
      );

      router.push(`/order-confirmation/${created.id}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not place order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Checkout</p>
        <h1 className="mt-3 text-4xl font-black text-white">Complete your order</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">Add your delivery details and payment method, then place your order securely from the live backend.</p>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-zinc-400">Loading checkout...</div>
      ) : !cartItems.length ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
          <h2 className="text-2xl font-black text-white">Your cart is empty</h2>
          <p className="mt-3 text-zinc-400">Add some products before checking out.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <form onSubmit={placeOrder} className="space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <input value={form.customerName} onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))} placeholder="Full name" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
              <input value={form.customerEmail} onChange={(event) => setForm((current) => ({ ...current, customerEmail: event.target.value }))} placeholder="Email" type="email" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
            </div>
            <input value={form.customerPhone} onChange={(event) => setForm((current) => ({ ...current, customerPhone: event.target.value }))} placeholder="Phone number" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
            <input value={form.addressLine1} onChange={(event) => setForm((current) => ({ ...current, addressLine1: event.target.value }))} placeholder="Address line 1" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
            <input value={form.addressLine2} onChange={(event) => setForm((current) => ({ ...current, addressLine2: event.target.value }))} placeholder="Address line 2 (optional)" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
            <div className="grid gap-4 md:grid-cols-3">
              <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
              <input value={form.governorate} onChange={(event) => setForm((current) => ({ ...current, governorate: event.target.value }))} placeholder="Governorate" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
              <input value={form.postalCode} onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))} placeholder="Postal code" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
            </div>
            <select value={form.paymentMethod} onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none">
              {paymentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {form.paymentMethod !== "COD" ? (
              <input value={form.paymentReference} onChange={(event) => setForm((current) => ({ ...current, paymentReference: event.target.value }))} placeholder="Payment reference / transaction ID" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
            ) : null}
            <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Order notes (optional)" rows={4} className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
            {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
            <button disabled={submitting} className="w-full rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black disabled:opacity-60">{submitting ? "Placing order..." : "Place order"}</button>
          </form>

          <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Order summary</p>
            <div className="mt-5 space-y-4">
              {cartItems.map((item) => {
                const lineTotal = Number(item.variant?.priceOverride ?? item.product.salePrice ?? item.product.price ?? 0) * item.quantity;
                return (
                  <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
                    <div>
                      <p className="font-bold text-white">{item.product.nameEn}</p>
                      <p className="text-zinc-500">{item.quantity} × {item.variant?.size || item.selectedSize || "One size"} • {item.variant?.color || item.selectedColor || "Standard color"}</p>
                    </div>
                    <p className="font-semibold text-white">{formatPrice(lineTotal)}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm text-zinc-400">
              <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex items-center justify-between"><span>Shipping</span><span>{formatPrice(shippingFee)}</span></div>
              <div className="flex items-center justify-between text-base font-bold text-white"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
