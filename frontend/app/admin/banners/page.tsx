"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import UploadButton from "@/components/admin/UploadButton";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { StatusMessage } from "@/components/admin/StatusMessage";
import { adminDeleteBanner, adminGetBanners, adminSaveBanner, type BannerItem } from "@/lib/admin-api";

const placements = ["HOME_HERO", "HOME_FEATURED", "CATEGORY_STRIP", "ANNOUNCEMENT"];
const initialForm = {
  id: "",
  titleEn: "",
  titleAr: "",
  subtitleEn: "",
  subtitleAr: "",
  imageUrl: "",
  mobileImageUrl: "",
  linkUrl: "",
  placement: "HOME_HERO",
  sortOrder: "0",
  isActive: true,
};

export default function AdminBannersPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [items, setItems] = useState<BannerItem[]>([]);
  const [form, setForm] = useState<any>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    try {
      setItems(await adminGetBanners(token));
    } catch (err: any) {
      setError(err?.message || "Failed to load banners");
    }
  }

  useEffect(() => { load(); }, [token]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setError(null);
    setSuccess(null);
    try {
      await adminSaveBanner({
        ...form,
        sortOrder: Number(form.sortOrder || 0),
      }, token, form.id || undefined);
      setSuccess(form.id ? "Banner updated." : "Banner created.");
      setForm(initialForm);
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to save banner");
    }
  }

  async function remove(id: string) {
    if (!token || !window.confirm("Delete this banner?")) return;
    try {
      await adminDeleteBanner(id, token);
      setItems((current) => current.filter((item) => item.id !== id));
      setSuccess("Banner deleted.");
    } catch (err: any) {
      setError(err?.message || "Failed to delete banner");
    }
  }

  return (
    <AdminPageShell title="Banners & offers" subtitle="Manage homepage hero banners, featured strips, and promotional announcements.">
      <StatusMessage error={error} success={success} />
      <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
        <form onSubmit={save} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <input value={form.titleEn} onChange={(e) => setForm((c: any) => ({ ...c, titleEn: e.target.value }))} placeholder="Title EN" required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <input value={form.titleAr} onChange={(e) => setForm((c: any) => ({ ...c, titleAr: e.target.value }))} placeholder="Title AR" required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <input value={form.subtitleEn} onChange={(e) => setForm((c: any) => ({ ...c, subtitleEn: e.target.value }))} placeholder="Subtitle EN" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <input value={form.subtitleAr} onChange={(e) => setForm((c: any) => ({ ...c, subtitleAr: e.target.value }))} placeholder="Subtitle AR" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <select value={form.placement} onChange={(e) => setForm((c: any) => ({ ...c, placement: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white">{placements.map((placement) => <option key={placement} value={placement}>{placement}</option>)}</select>
          <input value={form.imageUrl} onChange={(e) => setForm((c: any) => ({ ...c, imageUrl: e.target.value }))} placeholder="Desktop image URL" required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <UploadButton token={token} onUploaded={(url) => setForm((c: any) => ({ ...c, imageUrl: url }))} label="Upload desktop image" />
          <input value={form.mobileImageUrl} onChange={(e) => setForm((c: any) => ({ ...c, mobileImageUrl: e.target.value }))} placeholder="Mobile image URL" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <UploadButton token={token} onUploaded={(url) => setForm((c: any) => ({ ...c, mobileImageUrl: url }))} label="Upload mobile image" />
          <input value={form.linkUrl} onChange={(e) => setForm((c: any) => ({ ...c, linkUrl: e.target.value }))} placeholder="Optional link URL" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <div className="grid gap-3 md:grid-cols-2">
            <input type="number" value={form.sortOrder} onChange={(e) => setForm((c: any) => ({ ...c, sortOrder: e.target.value }))} placeholder="Sort order" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((c: any) => ({ ...c, isActive: e.target.checked }))} /> Active</label>
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-black">{form.id ? "Update" : "Create"}</button>
            {form.id ? <button type="button" onClick={() => setForm(initialForm)} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white">Cancel</button> : null}
          </div>
        </form>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <img src={item.imageUrl} alt={item.titleEn} className="h-16 w-24 rounded-2xl object-cover" />
                  <div>
                    <p className="font-semibold text-white">{item.titleEn}</p>
                    <p className="text-sm text-white/55">{item.placement} • sort {item.sortOrder}</p>
                    <p className="text-xs text-white/45">{item.linkUrl || "No CTA link"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setForm({ ...item, sortOrder: String(item.sortOrder) })} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white">Edit</button>
                  <button onClick={() => remove(item.id)} className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {!items.length ? <p className="text-sm text-white/55">No banners yet.</p> : null}
        </div>
      </div>
    </AdminPageShell>
  );
}
