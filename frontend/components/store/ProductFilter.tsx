"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ProductFilter() {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/products?${next.toString()}`);
  };

  return (
    <aside className="space-y-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 text-[var(--text-primary)]">
      <div>
        <label>Brand</label>
        <select onChange={(e) => setParam("brand", e.target.value)} className="mt-1 w-full rounded border border-[var(--input-border)] bg-[var(--input-bg)] p-2">
          <option value="">All</option><option>Nike</option><option>Adidas</option><option>Puma</option><option>New Balance</option><option>Louis Vuitton</option><option>Other</option>
        </select>
      </div>
      <div>
        <label>Category</label>
        <select onChange={(e) => setParam("category", e.target.value)} className="mt-1 w-full rounded border border-[var(--input-border)] bg-[var(--input-bg)] p-2">
          <option value="">All</option><option value="men">Men</option><option value="women">Women</option><option value="kids">Kids</option>
        </select>
      </div>
      <div>
        <label>Sort</label>
        <select onChange={(e) => setParam("sort", e.target.value)} className="mt-1 w-full rounded border border-[var(--input-border)] bg-[var(--input-bg)] p-2">
          <option value="newest">Newest</option><option value="price-asc">Price Low–High</option><option value="price-desc">Price High–Low</option><option value="best-rated">Best Rated</option>
        </select>
      </div>
    </aside>
  );
}
