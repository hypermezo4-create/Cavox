"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";

type Props = {
  productId: string;
  productName: string;
  variantId?: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
};

export default function AddToCartButton({
  productId,
  productName,
  variantId,
  selectedSize,
  selectedColor,
  quantity = 1,
  disabled = false,
  className = ""
}: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const callbackUrl = useMemo(() => {
    if (typeof window === "undefined") return "/cart";
    return `${window.location.pathname}${window.location.search}`;
  }, []);

  async function handleAddToCart() {
    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    if (!session?.accessToken) {
      setFeedback("Please sign in first.");
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);
      await apiFetch(
        "/cart",
        {
          method: "POST",
          body: JSON.stringify({
            productId,
            variantId,
            selectedSize,
            selectedColor,
            quantity
          })
        },
        session.accessToken
      );
      setFeedback(`${productName} added to your cart.`);
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not add item to cart.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <ShoppingBag className="h-4 w-4" />
        {loading ? "Adding..." : "Add to cart"}
      </button>
      {feedback ? <p className="text-sm text-zinc-400">{feedback}</p> : null}
    </div>
  );
}
