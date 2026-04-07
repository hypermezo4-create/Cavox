"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Star } from "lucide-react";
import ImageGallery from "@/components/store/ImageGallery";
import AddToCartButton from "@/components/store/AddToCartButton";
import { Product, ProductReview, apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

type Props = {
  product: Product;
  initialReviews: ProductReview[];
};

export default function ProductDetailsClient({ product, initialReviews }: Props) {
  const { data: session, status } = useSession();
  const [selectedSize, setSelectedSize] = useState(product.variants?.[0]?.size || product.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.variants?.[0]?.color || product.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>(initialReviews);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });

  const chosenVariant = useMemo(() => {
    if (!product.variants?.length) return undefined;
    return product.variants.find((variant) => {
      const sizeMatches = selectedSize ? variant.size === selectedSize : true;
      const colorMatches = selectedColor ? variant.color === selectedColor : true;
      return variant.isActive && sizeMatches && colorMatches;
    });
  }, [product.variants, selectedColor, selectedSize]);

  const availableSizes = useMemo(() => {
    const raw = product.variants?.length ? product.variants.filter((variant) => variant.isActive).map((variant) => variant.size) : product.sizes;
    return Array.from(new Set(raw || []));
  }, [product.sizes, product.variants]);

  const availableColors = useMemo(() => {
    const raw = product.variants?.length
      ? product.variants
          .filter((variant) => variant.isActive && (!selectedSize || variant.size === selectedSize))
          .map((variant) => variant.color)
      : product.colors;
    return Array.from(new Set(raw || []));
  }, [product.colors, product.variants, selectedSize]);

  const displayPrice = Number(chosenVariant?.priceOverride ?? product.salePrice ?? product.price ?? 0);
  const compareAtPrice = product.salePrice ? Number(product.price) : null;
  const activeImage = chosenVariant?.image || product.featuredImage || product.images?.[0];
  const galleryImages = Array.from(new Set([activeImage, ...(product.images || [])].filter(Boolean) as string[]));
  const reviewAverage = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.accessToken) {
      setReviewMessage("Please sign in to leave a review.");
      return;
    }

    if (!reviewForm.comment.trim()) {
      setReviewMessage("Please add your review comment.");
      return;
    }

    try {
      setReviewLoading(true);
      setReviewMessage(null);
      await apiFetch(
        "/reviews",
        {
          method: "POST",
          body: JSON.stringify({
            productId: product.id,
            rating: reviewForm.rating,
            title: reviewForm.title,
            comment: reviewForm.comment
          })
        },
        session.accessToken
      );
      setReviewForm({ rating: 5, title: "", comment: "" });
      setReviewMessage("Your review was submitted and is waiting for approval.");
    } catch (error) {
      setReviewMessage(error instanceof Error ? error.message : "Could not submit review.");
    } finally {
      setReviewLoading(false);
    }
  }

  return (
    <section className="space-y-10">
      <div className="grid gap-8 md:grid-cols-2">
        <ImageGallery images={galleryImages.length ? galleryImages : ["https://placehold.co/800x800?text=Cavo"]} />
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">{product.brand}</p>
            {product.category ? <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">{product.category.nameEn}</span> : null}
            {product.isOnSale || product.salePrice ? <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">Sale</span> : null}
          </div>

          <h1 className="mt-4 text-3xl font-black text-white md:text-4xl">{product.nameEn}</h1>
          <p className="mt-4 leading-relaxed text-zinc-400">{product.descriptionEn}</p>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <p className="text-3xl font-black text-[var(--price-color)]">{formatPrice(displayPrice)}</p>
            {compareAtPrice ? <p className="text-lg text-zinc-500 line-through">{formatPrice(compareAtPrice)}</p> : null}
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
            <div className="flex items-center gap-1 text-amber-300">
              <Star className="h-4 w-4 fill-current" />
              <span>{reviewAverage ? reviewAverage.toFixed(1) : "New"}</span>
            </div>
            <span>•</span>
            <span>{reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
            <span>•</span>
            <span>{chosenVariant?.stock ?? product.stock} in stock</span>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Size</label>
              <select
                value={selectedSize}
                onChange={(event) => setSelectedSize(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              >
                {availableSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Color</label>
              <select
                value={selectedColor}
                onChange={(event) => setSelectedColor(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              >
                {availableColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 w-40">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <AddToCartButton
              productId={product.id}
              productName={product.nameEn}
              variantId={chosenVariant?.id}
              selectedSize={chosenVariant?.size || selectedSize}
              selectedColor={chosenVariant?.color || selectedColor}
              quantity={quantity}
              disabled={(chosenVariant?.stock ?? product.stock) < 1}
            />
            <p className="text-sm text-zinc-400">SKU: {chosenVariant?.sku || product.slug}</p>
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Customer reviews</p>
              <h2 className="mt-2 text-2xl font-black text-white">What shoppers are saying</h2>
            </div>
            <div className="text-right text-sm text-zinc-400">
              <p className="text-lg font-black text-white">{reviewAverage ? reviewAverage.toFixed(1) : "0.0"}/5</p>
              <p>{reviews.length} approved reviews</p>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.length ? (
              reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-white/10 bg-black/10 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{review.user?.name || "Cavo Customer"}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-300">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-current" : ""}`} />
                      ))}
                    </div>
                  </div>
                  {review.title ? <p className="mt-3 font-semibold text-white">{review.title}</p> : null}
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{review.comment}</p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-zinc-400">No approved reviews yet. Be the first to share your feedback.</div>
            )}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Leave a review</p>
          <h2 className="mt-2 text-2xl font-black text-white">Share your experience</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">Reviews are submitted immediately and appear publicly after admin approval.</p>

          {status === "authenticated" ? (
            <form onSubmit={submitReview} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(event) => setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} star{rating === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
              </div>

              <input
                value={reviewForm.title}
                onChange={(event) => setReviewForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Title (optional)"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
              />
              <textarea
                value={reviewForm.comment}
                onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                placeholder="Tell us about size, comfort, quality, and delivery."
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:brightness-110 disabled:opacity-60"
              >
                {reviewLoading ? "Submitting..." : "Submit review"}
              </button>
              {reviewMessage ? <p className="text-sm text-zinc-400">{reviewMessage}</p> : null}
            </form>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-zinc-400">
              Sign in first to add a review for this product.
            </div>
          )}
        </aside>
      </section>
    </section>
  );
}
