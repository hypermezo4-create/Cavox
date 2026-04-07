"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/store/ProductCard";
import { Product, ProductsResponse, apiBase } from "@/lib/api";

interface StoreGridProps {
  title: string;
  description: string;
  category?: string;
  offersOnly?: boolean;
}

export default function StoreGrid({ title, description, category, offersOnly = false }: StoreGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (offersOnly) params.set("onSale", "true");
        const response = await fetch(`${apiBase}/products${params.toString() ? `?${params.toString()}` : ""}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        const data = (await response.json()) as ProductsResponse;
        setProducts(Array.isArray(data.items) ? data.items : []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setError("Could not load products yet.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [category, offersOnly]);

  const visibleProducts = useMemo(() => {
    if (!offersOnly) return products;
    return products.filter((product) => Boolean(product.salePrice || product.isOnSale));
  }, [offersOnly, products]);

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <h1 className="mb-4 text-5xl font-black text-white">{title}</h1>
        <p className="mb-10 max-w-2xl text-zinc-400">{description}</p>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-white/[0.03]" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-12 text-center text-zinc-400">{error}</div>
        ) : visibleProducts.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-12 text-center text-zinc-400">
            No products found yet. Add products from the admin panel to populate this collection.
          </div>
        )}
      </div>
    </section>
  );
}
