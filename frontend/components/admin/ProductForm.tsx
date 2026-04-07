"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import UploadButton from "@/components/admin/UploadButton";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { StatusMessage } from "@/components/admin/StatusMessage";
import { adminGetCategories, adminGetProduct, adminSaveProduct, type CategoryWithMeta } from "@/lib/admin-api";

interface VariantState {
  size: string;
  color: string;
  stock: string;
  priceOverride: string;
  sku: string;
  image: string;
  isActive: boolean;
}

interface FormState {
  categoryId: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  brand: string;
  sku: string;
  price: string;
  salePrice: string;
  featuredImage: string;
  imagesText: string;
  sizesText: string;
  colorsText: string;
  stock: string;
  shortDescriptionEn: string;
  shortDescriptionAr: string;
  descriptionEn: string;
  descriptionAr: string;
  metaTitleEn: string;
  metaTitleAr: string;
  metaDescriptionEn: string;
  metaDescriptionAr: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  variants: VariantState[];
}

const emptyForm: FormState = {
  categoryId: "",
  nameEn: "",
  nameAr: "",
  slug: "",
  brand: "",
  sku: "",
  price: "",
  salePrice: "",
  featuredImage: "",
  imagesText: "",
  sizesText: "",
  colorsText: "",
  stock: "0",
  shortDescriptionEn: "",
  shortDescriptionAr: "",
  descriptionEn: "",
  descriptionAr: "",
  metaTitleEn: "",
  metaTitleAr: "",
  metaDescriptionEn: "",
  metaDescriptionAr: "",
  isActive: true,
  isFeatured: false,
  isNewArrival: false,
  isOnSale: false,
  variants: []
};

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatProductToForm(product: any): FormState {
  return {
    categoryId: product.categoryId || "",
    nameEn: product.nameEn || "",
    nameAr: product.nameAr || "",
    slug: product.slug || "",
    brand: product.brand || "",
    sku: product.sku || "",
    price: String(product.price ?? ""),
    salePrice: product.salePrice != null ? String(product.salePrice) : "",
    featuredImage: product.featuredImage || "",
    imagesText: Array.isArray(product.images) ? product.images.join(", ") : "",
    sizesText: Array.isArray(product.sizes) ? product.sizes.join(", ") : "",
    colorsText: Array.isArray(product.colors) ? product.colors.join(", ") : "",
    stock: String(product.stock ?? 0),
    shortDescriptionEn: product.shortDescriptionEn || "",
    shortDescriptionAr: product.shortDescriptionAr || "",
    descriptionEn: product.descriptionEn || "",
    descriptionAr: product.descriptionAr || "",
    metaTitleEn: product.metaTitleEn || "",
    metaTitleAr: product.metaTitleAr || "",
    metaDescriptionEn: product.metaDescriptionEn || "",
    metaDescriptionAr: product.metaDescriptionAr || "",
    isActive: !!product.isActive,
    isFeatured: !!product.isFeatured,
    isNewArrival: !!product.isNewArrival,
    isOnSale: !!product.isOnSale,
    variants: Array.isArray(product.variants)
      ? product.variants.map((variant: any) => ({
          size: variant.size || "",
          color: variant.color || "",
          stock: String(variant.stock ?? 0),
          priceOverride: variant.priceOverride != null ? String(variant.priceOverride) : "",
          sku: variant.sku || "",
          image: variant.image || "",
          isActive: !!variant.isActive
        }))
      : []
  };
}

export default function ProductForm({ productId }: { productId?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token = session?.accessToken;
  const isEdit = !!productId;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [categories, setCategories] = useState<CategoryWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      adminGetCategories(token),
      isEdit && productId ? adminGetProduct(productId, token) : Promise.resolve(null)
    ])
      .then(([fetchedCategories, product]) => {
        if (cancelled) return;
        setCategories(fetchedCategories);
        if (product) {
          setForm(formatProductToForm(product));
        } else if (fetchedCategories[0]) {
          setForm((current) => ({ ...current, categoryId: current.categoryId || fetchedCategories[0].id }));
        }
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message || "Failed to load product form");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, isEdit, productId]);

  const variantSummary = useMemo(() => form.variants.filter((variant) => variant.size && variant.color).length, [form.variants]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateVariant(index: number, key: keyof VariantState, value: string | boolean) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, currentIndex) => currentIndex === index ? { ...variant, [key]: value } : variant)
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        categoryId: form.categoryId,
        nameEn: form.nameEn,
        nameAr: form.nameAr,
        slug: form.slug || undefined,
        brand: form.brand,
        sku: form.sku || undefined,
        price: Number(form.price || 0),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        featuredImage: form.featuredImage || undefined,
        images: splitList(form.imagesText),
        sizes: splitList(form.sizesText),
        colors: splitList(form.colorsText),
        stock: Number(form.stock || 0),
        shortDescriptionEn: form.shortDescriptionEn || undefined,
        shortDescriptionAr: form.shortDescriptionAr || undefined,
        descriptionEn: form.descriptionEn,
        descriptionAr: form.descriptionAr,
        metaTitleEn: form.metaTitleEn || undefined,
        metaTitleAr: form.metaTitleAr || undefined,
        metaDescriptionEn: form.metaDescriptionEn || undefined,
        metaDescriptionAr: form.metaDescriptionAr || undefined,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        isOnSale: form.isOnSale,
        variants: form.variants
          .filter((variant) => variant.size && variant.color)
          .map((variant) => ({
            size: variant.size,
            color: variant.color,
            stock: Number(variant.stock || 0),
            priceOverride: variant.priceOverride ? Number(variant.priceOverride) : undefined,
            sku: variant.sku || undefined,
            image: variant.image || undefined,
            isActive: variant.isActive
          }))
      };

      const saved = await adminSaveProduct(payload, token, productId);
      setSuccess(isEdit ? "Product updated successfully." : "Product created successfully.");
      if (!isEdit) {
        router.push(`/admin/products/${saved.id}/edit`);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">Loading product editor...</div>;
  }

  if (!token) {
    return <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">You must be signed in as an admin to manage products.</div>;
  }

  return (
    <AdminPageShell
      title={isEdit ? "Edit product" : "Create product"}
      subtitle={isEdit ? `Update every detail for this item. ${variantSummary} variants currently configured.` : "Add a new product with variants, gallery, badges, and SEO details."}
      action={<Link href="/admin/products" className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">Back to products</Link>}
    >
      <StatusMessage error={error} success={success} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-white/80">English name<input value={form.nameEn} onChange={(e) => update("nameEn", e.target.value)} required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <label className="space-y-2 text-sm text-white/80">Arabic name<input value={form.nameAr} onChange={(e) => update("nameAr", e.target.value)} required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <label className="space-y-2 text-sm text-white/80">Slug<input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="auto-from-name" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <label className="space-y-2 text-sm text-white/80">Brand<input value={form.brand} onChange={(e) => update("brand", e.target.value)} required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <label className="space-y-2 text-sm text-white/80">Category<select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.nameEn}</option>)}</select></label>
              <label className="space-y-2 text-sm text-white/80">SKU<input value={form.sku} onChange={(e) => update("sku", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <label className="space-y-2 text-sm text-white/80">Base price<input type="number" min="0" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <label className="space-y-2 text-sm text-white/80">Sale price<input type="number" min="0" step="0.01" value={form.salePrice} onChange={(e) => update("salePrice", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <label className="space-y-2 text-sm text-white/80">Stock<input type="number" min="0" value={form.stock} onChange={(e) => update("stock", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <label className="space-y-2 text-sm text-white/80">Sizes (comma separated)<input value={form.sizesText} onChange={(e) => update("sizesText", e.target.value)} placeholder="39, 40, 41" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <label className="space-y-2 text-sm text-white/80 md:col-span-2">Colors (comma separated)<input value={form.colorsText} onChange={(e) => update("colorsText", e.target.value)} placeholder="Black, White" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <label className="space-y-2 text-sm text-white/80 md:col-span-2">Short description (EN)<textarea value={form.shortDescriptionEn} onChange={(e) => update("shortDescriptionEn", e.target.value)} rows={3} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <label className="space-y-2 text-sm text-white/80 md:col-span-2">Short description (AR)<textarea value={form.shortDescriptionAr} onChange={(e) => update("shortDescriptionAr", e.target.value)} rows={3} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <label className="space-y-2 text-sm text-white/80 md:col-span-2">Description (EN)<textarea value={form.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} rows={6} required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <label className="space-y-2 text-sm text-white/80 md:col-span-2">Description (AR)<textarea value={form.descriptionAr} onChange={(e) => update("descriptionAr", e.target.value)} rows={6} required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
            </div>
          </div>

          <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="space-y-3">
              <label className="space-y-2 text-sm text-white/80">Featured image URL<input value={form.featuredImage} onChange={(e) => update("featuredImage", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <UploadButton token={token} onUploaded={(url) => update("featuredImage", url)} label="Upload featured image" />
              {form.featuredImage ? <img src={form.featuredImage} alt="featured" className="h-40 w-full rounded-2xl object-cover" /> : null}
            </div>
            <div className="space-y-3">
              <label className="space-y-2 text-sm text-white/80">Gallery URLs<input value={form.imagesText} onChange={(e) => update("imagesText", e.target.value)} placeholder="url1, url2" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
              <UploadButton token={token} onUploaded={(url) => update("imagesText", [form.imagesText, url].filter(Boolean).join(form.imagesText ? ", " : ""))} label="Upload gallery image" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ["isActive", "Active"],
                ["isFeatured", "Featured"],
                ["isNewArrival", "New arrival"],
                ["isOnSale", "On sale"]
              ] as Array<[keyof FormState, string]>).map(([key, label]) => (
                <label key={String(key)} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/85">
                  <input type="checkbox" checked={Boolean(form[key])} onChange={(e) => update(key, e.target.checked as any)} className="h-4 w-4" />
                  {label}
                </label>
              ))}
            </div>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <h3 className="font-semibold text-white">SEO</h3>
              <input value={form.metaTitleEn} onChange={(e) => update("metaTitleEn", e.target.value)} placeholder="Meta title EN" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
              <input value={form.metaTitleAr} onChange={(e) => update("metaTitleAr", e.target.value)} placeholder="Meta title AR" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
              <textarea value={form.metaDescriptionEn} onChange={(e) => update("metaDescriptionEn", e.target.value)} placeholder="Meta description EN" rows={3} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
              <textarea value={form.metaDescriptionAr} onChange={(e) => update("metaDescriptionAr", e.target.value)} placeholder="Meta description AR" rows={3} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Variants</h2>
              <p className="text-sm text-white/60">Add product-specific size/color combinations and stock overrides.</p>
            </div>
            <button type="button" onClick={() => update("variants", [...form.variants, { size: "", color: "", stock: "0", priceOverride: "", sku: "", image: "", isActive: true }])} className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">Add variant</button>
          </div>
          <div className="space-y-4">
            {form.variants.length ? form.variants.map((variant, index) => (
              <div key={`${variant.size}-${variant.color}-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-6">
                <input value={variant.size} onChange={(e) => updateVariant(index, "size", e.target.value)} placeholder="Size" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" />
                <input value={variant.color} onChange={(e) => updateVariant(index, "color", e.target.value)} placeholder="Color" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" />
                <input type="number" min="0" value={variant.stock} onChange={(e) => updateVariant(index, "stock", e.target.value)} placeholder="Stock" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" />
                <input type="number" min="0" step="0.01" value={variant.priceOverride} onChange={(e) => updateVariant(index, "priceOverride", e.target.value)} placeholder="Price override" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" />
                <input value={variant.sku} onChange={(e) => updateVariant(index, "sku", e.target.value)} placeholder="Variant SKU" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-white/75"><input type="checkbox" checked={variant.isActive} onChange={(e) => updateVariant(index, "isActive", e.target.checked)} /> Active</label>
                  <button type="button" onClick={() => update("variants", form.variants.filter((_, currentIndex) => currentIndex !== index))} className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100">Remove</button>
                </div>
                <div className="md:col-span-4"><input value={variant.image} onChange={(e) => updateVariant(index, "image", e.target.value)} placeholder="Variant image URL" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white" /></div>
                <div className="md:col-span-2"><UploadButton token={token} onUploaded={(url) => updateVariant(index, "image", url)} label="Upload variant image" /></div>
              </div>
            )) : <p className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-white/55">No variants yet. You can still save a simple product with base stock only.</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/products" className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15">Cancel</Link>
          <button type="submit" disabled={saving} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : isEdit ? "Update product" : "Create product"}</button>
        </div>
      </form>
    </AdminPageShell>
  );
}
