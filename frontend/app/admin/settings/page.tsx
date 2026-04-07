"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { StatusMessage } from "@/components/admin/StatusMessage";
import { adminGetSettings, adminSaveSettings, type SiteSettingItem } from "@/lib/admin-api";

const starterRows: SiteSettingItem[] = [
  { key: "site_name", value: "Cavo", label: "Site name", group: "branding" },
  { key: "site_tagline", value: "Mirror original. Best price, best quality.", label: "Tagline", group: "branding" },
  { key: "default_shipping_fee", value: "75", label: "Default shipping fee", group: "checkout" },
  { key: "contact_email", value: "hello@cavo.eg", label: "Contact email", group: "contact" },
  { key: "contact_phone", value: "+20 100 000 0000", label: "Contact phone", group: "contact" },
  { key: "business_hours", value: "Daily 10:00-22:00", label: "Business hours", group: "contact" },
]

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [items, setItems] = useState<SiteSettingItem[]>(starterRows);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminGetSettings(token)
      .then((result) => {
        const merged = [...starterRows];
        result.items.forEach((item) => {
          const index = merged.findIndex((row) => row.key === item.key);
          if (index >= 0) merged[index] = { ...merged[index], ...item };
          else merged.push(item);
        });
        setItems(merged);
      })
      .catch((err: any) => setError(err?.message || "Failed to load settings"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave() {
    if (!token) return;
    setError(null);
    setSuccess(null);
    try {
      await adminSaveSettings(items, token);
      setSuccess("Settings saved successfully.");
    } catch (err: any) {
      setError(err?.message || "Failed to save settings");
    }
  }

  return (
    <AdminPageShell title="Settings" subtitle="Manage store-wide text, contact data, and checkout defaults.">
      <StatusMessage error={error} success={success} />
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        {loading ? <p className="text-white/70">Loading settings...</p> : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={`${item.key}-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-2 xl:grid-cols-4">
                <input value={item.key} onChange={(e) => setItems((current) => current.map((row, currentIndex) => currentIndex === index ? { ...row, key: e.target.value } : row))} placeholder="Key" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
                <input value={item.group || "general"} onChange={(e) => setItems((current) => current.map((row, currentIndex) => currentIndex === index ? { ...row, group: e.target.value } : row))} placeholder="Group" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
                <input value={item.label || ""} onChange={(e) => setItems((current) => current.map((row, currentIndex) => currentIndex === index ? { ...row, label: e.target.value } : row))} placeholder="Label" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
                <input value={item.value} onChange={(e) => setItems((current) => current.map((row, currentIndex) => currentIndex === index ? { ...row, value: e.target.value } : row))} placeholder="Value" className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" />
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={() => setItems((current) => [...current, { key: `custom_${Date.now()}`, value: "", label: "Custom setting", group: "general" }])} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white">Add setting</button>
              <button onClick={handleSave} className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-black">Save settings</button>
            </div>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
