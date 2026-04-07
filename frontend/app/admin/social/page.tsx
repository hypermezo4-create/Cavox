"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { StatusMessage } from "@/components/admin/StatusMessage";
import { adminDeleteSocial, adminGetSocial, adminSaveSocial, type SocialLinkItem } from "@/lib/admin-api";

const platforms = ["WHATSAPP", "INSTAGRAM", "TELEGRAM", "FACEBOOK", "TIKTOK", "X"];
const empty = { id: "", platform: "WHATSAPP", label: "", url: "", icon: "", sortOrder: "0", isActive: true };

export default function AdminSocialPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [links, setLinks] = useState<SocialLinkItem[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    try {
      setLinks(await adminGetSocial(token));
    } catch (err: any) {
      setError(err?.message || "Failed to load social links");
    }
  }

  useEffect(() => { load(); }, [token]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setError(null);
    setSuccess(null);
    try {
      await adminSaveSocial({ ...form, sortOrder: Number(form.sortOrder || 0) }, token, form.id || undefined);
      setSuccess(form.id ? "Social link updated." : "Social link created.");
      setForm(empty);
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to save social link");
    }
  }

  async function remove(id: string) {
    if (!token || !window.confirm("Delete this social link?")) return;
    try {
      await adminDeleteSocial(id, token);
      setLinks((current) => current.filter((item) => item.id !== id));
      setSuccess("Social link deleted.");
    } catch (err: any) {
      setError(err?.message || "Failed to delete social link");
    }
  }

  return (
    <AdminPageShell title="Social links" subtitle="Manage the channels customers can use to contact and order from Cavo.">
      <StatusMessage error={error} success={success} />
      <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <form onSubmit={save} className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <select value={form.platform} onChange={(e) => setForm((c: any) => ({ ...c, platform: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white">{platforms.map((platform) => <option key={platform} value={platform}>{platform}</option>)}</select>
          <input value={form.label} onChange={(e) => setForm((c: any) => ({ ...c, label: e.target.value }))} placeholder="Label" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <input value={form.url} onChange={(e) => setForm((c: any) => ({ ...c, url: e.target.value }))} placeholder="URL" required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <input value={form.icon} onChange={(e) => setForm((c: any) => ({ ...c, icon: e.target.value }))} placeholder="Optional icon" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <input type="number" value={form.sortOrder} onChange={(e) => setForm((c: any) => ({ ...c, sortOrder: e.target.value }))} placeholder="Sort order" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((c: any) => ({ ...c, isActive: e.target.checked }))} /> Active</label>
          <div className="flex gap-3">
            <button className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-black">{form.id ? "Update" : "Create"}</button>
            {form.id ? <button type="button" onClick={() => setForm(empty)} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white">Cancel</button> : null}
          </div>
        </form>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-3">
            {links.map((link) => (
              <div key={link.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-white">{link.platform}</p>
                  <p className="text-sm text-white/55">{link.label || link.url}</p>
                  <p className="text-xs text-white/45">{link.url}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setForm({ ...link, sortOrder: String(link.sortOrder) })} className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white">Edit</button>
                  <button onClick={() => remove(link.id)} className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100">Delete</button>
                </div>
              </div>
            ))}
            {!links.length ? <p className="text-sm text-white/55">No social links configured yet.</p> : null}
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
