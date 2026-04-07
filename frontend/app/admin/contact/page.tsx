"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { StatusMessage } from "@/components/admin/StatusMessage";
import { adminGetContacts, adminUpdateContact, type ContactSubmission } from "@/lib/admin-api";

const statuses = ["NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"];

export default function AdminContactPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    adminGetContacts(token)
      .then(setItems)
      .catch((err: any) => setError(err?.message || "Failed to load contact submissions"));
  }, [token]);

  async function update(item: ContactSubmission, payload: Record<string, unknown>) {
    if (!token) return;
    setError(null);
    setSuccess(null);
    try {
      const updated = await adminUpdateContact(item.id, payload, token);
      setItems((current) => current.map((row) => row.id === item.id ? updated : row));
      setSuccess(`Message from ${updated.name} updated.`);
    } catch (err: any) {
      setError(err?.message || "Failed to update message");
    }
  }

  return (
    <AdminPageShell title="Contact inbox" subtitle="Review incoming support, partnership, and order-support messages.">
      <StatusMessage error={error} success={success} />
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{item.subject}</h2>
                    <p className="text-sm text-white/55">{item.name} • {item.email}{item.phone ? ` • ${item.phone}` : ""}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/65">{item.topic}</span>
                </div>
                <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">{item.message}</p>
              </div>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <label className="space-y-2 text-sm text-white/80">Status<select value={item.status} onChange={(e) => update(item, { status: e.target.value, adminNotes: item.adminNotes || undefined })} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                <label className="space-y-2 text-sm text-white/80">Admin notes<textarea value={item.adminNotes || ""} onChange={(e) => setItems((current) => current.map((row) => row.id === item.id ? { ...row, adminNotes: e.target.value } : row))} rows={5} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white" /></label>
                <button onClick={() => update(item, { status: item.status, adminNotes: item.adminNotes || undefined })} className="w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-black">Save notes</button>
              </div>
            </div>
          </div>
        ))}
        {!items.length ? <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/55">No contact submissions yet.</div> : null}
      </div>
    </AdminPageShell>
  );
}
