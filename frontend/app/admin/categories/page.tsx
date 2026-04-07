"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import UploadButton from "@/components/admin/UploadButton";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { StatusMessage } from "@/components/admin/StatusMessage";
import { adminDeleteCategory, adminGetCategories, adminSaveCategory, type CategoryWithMeta } from "@/lib/admin-api";

const initialForm = {
  id: "",
  nameEn: "",
  nameAr: "",
  slug: "",
  descriptionEn: "",
  descriptionAr: "",
  image: "",
  sortOrder: "0",
  parentId: "",
  isActive: true,
  showOnHome: false
};

export default function AdminCategoriesPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [items, setItems] = useState<CategoryWithMeta[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      setItems(await adminGetCategories(token));
    } catch (err: any) {
      setError(err?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setError(null);
    setSuccess(null);
    try {
      await adminSaveCategory({
        nameEn: form.nameEn,
        nameAr: form.nameAr,
        slug: form.slug || undefined,
        descriptionEn: form.descriptionEn || undefined,
        descriptionAr: form.descriptionAr || undefined,
        image: form.image || undefined,
        sortOrder: Number(form.sortOrder || 0),
        parentId: form.parentId || undefined,
        isActive: form.isActive,
        showOnHome: form.showOnHome,
      }, token, form.id || undefined);
      setSuccess(form.id ? "Category updated." : "Category created.");
      setForm(initialForm);
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to save category");
    }
  }

  async function handleDelete(id: string) {
    if (!token || !window.confirm("Delete this category?")) return;
    setError(null);
    setSuccess(null);
    try {
      await adminDeleteCategory(id, token);
      setItems((current) => current.filter((item) => item.id !== id));
      setSuccess("Category deleted.");
    } catch (err: any) {
      setError(err?.message || "Failed to delete category");
    }
  }

  function editCategory(item: CategoryWithMeta) {
    setForm({
      id: item.id,
      nameEn: item.nameEn,
      nameAr: item.nameAr,
      slug: item.slug,
      descriptionEn: item.descriptionEn || "",
      descriptionAr: item.descriptionAr || "",
      image: item.image || "",
      sortOrder: String(item.sortOrder || 0),
      parentId: item.parentId || "",
      isActive: item.isActive ?? true,
      showOnHome: item.showOnHome ?? false,
    });
  }

  return (
    <AdminPageShell title="Categories" subtitle="Organize men, women, kids, and future collections dynamically.">
      <StatusMessage error={error} success={success} />
      <div className="grid gap-6 lg:grid-cols-[1fr,1.4fr]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">{form.id ? "Edit category" : "New category"}</h2>
          <input value={form.nameEn} onChange={(e) => setForm((c) => ({ ...c, nameEn: e.target.value }))} placeholder="Name EN" required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <input value={form.nameAr} onChange={(e) => setForm((c) => ({ ...c, nameAr: e.target.value }))} placeholder="Name AR" required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <input value={form.slug} onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value }))} placeholder="Slug" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <select value={form.parentId} onChange={(e) => setForm((c) => ({ ...c, parentId: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white">
            <option value="">No parent category</option>
            {items.filter((item) => item.id !== form.id).map((item) => <option key={item.id} value={item.id}>{item.nameEn}</option>)}
          </select>
          <input value={form.image} onChange={(e) => setForm((c) => ({ ...c, image: e.target.value }))} placeholder="Image URL" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <UploadButton token={token} onUploaded={(url) => setForm((c) => ({ ...c, image: url }))} label="Upload category image" />
          <textarea value={form.descriptionEn} onChange={(e) => setForm((c) => ({ ...c, descriptionEn: e.target.value }))} placeholder="Description EN" rows={3} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <textarea value={form.descriptionAr} onChange={(e) => setForm((c) => ({ ...c, descriptionAr: e.target.value }))} placeholder="Description AR" rows={3} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <input type="number" value={form.sortOrder} onChange={(e) => setForm((c) => ({ ...c, sortOrder: e.target.value }))} placeholder="Sort order" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <div className="grid gap-2 text-sm text-white/80 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((c) => ({ ...c, isActive: e.target.checked }))} /> Active</label>
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3"><input type="checkbox" checked={form.showOnHome} onChange={(e) => setForm((c) => ({ ...c, showOnHome: e.target.checked }))} /> Show on home</label>
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-black">{form.id ? "Update" : "Create"}</button>
            {form.id ? <button type="button" onClick={() => setForm(initialForm)} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white">Cancel</button> : null}
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Existing categories</h2>
          <div className="mt-4 space-y-3">
            {loading ? <p className="text-white/70">Loading...</p> : items.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <img src={item.image || "https://placehold.co/80x80?text=Cavo"} alt={item.nameEn} className="h-14 w-14 rounded-2xl object-cover" />
                  <div>
                    <p className="font-semibold text-white">{item.nameEn}</p>
                    <p className="text-sm text-white/55">{item.nameAr} • {item.slug}</p>
                    <p className="text-xs text-white/45">Products: {item._count?.products || 0} • Children: {item._count?.children || 0}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => editCategory(item)} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
