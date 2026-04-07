import Link from "next/link";
import Badge from "../ui/Badge";
import AddToCartButton from "./AddToCartButton";
import { Product } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.featuredImage || product.images?.[0];
  const displayPrice = Number(product.salePrice ?? product.price ?? 0);
  const basePrice = Number(product.price ?? 0);
  const primaryVariant = product.variants?.find((variant) => variant.isActive && variant.stock > 0);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-soft">
      <div className="aspect-square bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
        {primaryImage ? (
          <img src={primaryImage} alt={product.nameEn} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-500">No image</div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400">{product.brand || "Cavo"}</p>
          {product.salePrice || product.isOnSale ? <Badge label="SALE" /> : product.isNewArrival ? <Badge label="NEW" /> : null}
        </div>
        <h3 className="text-xl font-bold text-white">{product.nameEn}</h3>
        <p className="mt-2 min-h-[44px] text-sm text-zinc-400">
          {product.shortDescriptionEn || product.descriptionEn || "Premium Cavo footwear crafted for style and all-day wear."}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-black text-white">{formatPrice(displayPrice)}</p>
            {product.salePrice ? <p className="text-sm text-zinc-500 line-through">{formatPrice(basePrice)}</p> : null}
          </div>
          <Link
            href={`/products/${product.id}`}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-200 transition hover:border-amber-500/30 hover:text-amber-300"
          >
            Details
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <AddToCartButton
            productId={product.id}
            productName={product.nameEn}
            variantId={primaryVariant?.id}
            selectedSize={primaryVariant?.size || product.sizes?.[0]}
            selectedColor={primaryVariant?.color || product.colors?.[0]}
            className="flex-1"
          />
        </div>
      </div>
    </article>
  );
}
