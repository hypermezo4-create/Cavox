"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { StatusMessage } from "@/components/admin/StatusMessage";
import { adminDeleteProduct, adminGetProducts, type AdminProduct } from "@/lib/admin-api";

export default function AdminProducts() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await adminGetProducts(token);
      setProducts(res.items);
    } catch (err: any) {
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      [product.nameEn, product.nameAr, product.brand, product.slug, product.sku].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [products, query]);

  async function handleDeactivate(id: string) {
    if (!token) return;
    const confirmed = window.confirm("Deactivate this product? It will be hidden from the storefront.");
    if (!confirmed) return;
    setError(null);
    setSuccess(null);
    try {
      await adminDeleteProduct(id, token);
      setProducts((current) => current.map((product) => product.id === id ? { ...product, isActive: false } : product));
      setSuccess("Product deactivated successfully.");
    } catch (err: any) {
      setError(err?.message || "Failed to deactivate product");
    }
  }

  return (
    <AdminPageShell
      title="Products"
      subtitle="Create, edit, and monitor the full Cavo catalog including stock and merchandising badges."
      action={<Link href="/admin/products/new" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black">Add product</Link>}
    >
      <StatusMessage error={error} success={success} />
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by product, brand, slug, or SKU" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-2 md:p-4">
        {loading ? <div className="p-6 text-white/70">Loading products...</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/80">
              <thead className="text-xs uppercase tracking-wide text-white/45">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-t border-white/10 align-top">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.featuredImage || product.images?.[0] || "https://placehold.co/80x80?text=Cavo"} alt={product.nameEn} className="h-14 w-14 rounded-2xl object-cover" />
                        <div>
                          <p className="font-semibold text-white">{product.nameEn}</p>
                          <p className="text-xs text-white/55">{product.brand} • {product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{product.category?.nameEn || "—"}</td>
                    <td className="px-4 py-4">EGP {Number(product.salePrice ?? product.price).toFixed(2)}</td>
                    <td className="px-4 py-4">{Number(product.stock || 0)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={`rounded-full px-2 py-1 ${product.isActive ? "bg-emerald-500/15 text-emerald-100" : "bg-white/10 text-white/65"}`}>{product.isActive ? "Active" : "Hidden"}</span>
                        {product.isFeatured ? <span className="rounded-full bg-purple-500/15 px-2 py-1 text-purple-100">Featured</span> : null}
                        {product.isOnSale ? <span className="rounded-full bg-amber-500/15 px-2 py-1 text-amber-100">Sale</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/products/${product.id}/edit`} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white">Edit</Link>
                        {product.isActive ? <button onClick={() => handleDeactivate(product.id)} className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100">Deactivate</button> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length ? <div className="p-6 text-sm text-white/55">No products matched your search.</div> : null}
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
