import { Suspense } from "react";
import ProductFilter from "@/components/store/ProductFilter";
import ProductCard from "@/components/store/ProductCard";
import { ProductsResponse, apiFetch } from "@/lib/api";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const query = new URLSearchParams();

  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    } else if (value) {
      query.set(key, value);
    }
  });

  const data = await apiFetch<ProductsResponse>(`/products${query.toString() ? `?${query.toString()}` : ""}`);

  return (
    <section className="space-y-10">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Catalog</p>
        <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">Browse all products</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">Search, sort, and explore the current live products synced from the backend catalog.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <Suspense fallback={<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-zinc-400">Loading filters...</div>}><ProductFilter /></Suspense>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-zinc-400">
            <span>{data.pagination.total} products found</span>
            <span>Page {data.pagination.page} of {data.pagination.pages || 1}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
