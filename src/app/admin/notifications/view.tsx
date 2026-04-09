"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { isOwner } from "@/lib/owner";

type Note = {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  pinned: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

export default function AdminNotifications() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [items, setItems] = useState<Note[]>([]);
  const [editing, setEditing] = useState<Note | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [active, setActive] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [starts, setStarts] = useState("");
  const [ends, setEnds] = useState("");

  async function load() {
    const { data } = await supabase
      .from("notifications")
      .select("id,title,body,is_active,pinned,starts_at,ends_at")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    setItems((data ?? []) as any);
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { setOk(false); return; }
      setOk(await isOwner());
      await load();
    })();
  }, []);

  useEffect(() => {
    if (!editing) {
      setTitle(""); setBody(""); setActive(true); setPinned(false); setStarts(""); setEnds("");
      return;
    }
    setTitle(editing.title);
    setBody(editing.body);
    setActive(editing.is_active);
    setPinned(editing.pinned);
    setStarts(editing.starts_at ?? "");
    setEnds(editing.ends_at ?? "");
  }, [editing]);

  if (ok === null) return <p>Loading...</p>;
  if (!ok) return <p>Access denied. <Link href="/admin">Back</Link></p>;

  async function save() {
    const payload = {
      title,
      body,
      is_active: active,
      pinned,
      starts_at: starts || null,
      ends_at: ends || null
    };

    if (editing) await supabase.from("notifications").update(payload).eq("id", editing.id);
    else await supabase.from("notifications").insert(payload);

    setEditing(null);
    await load();
  }

  async function del(id: string) {
    if (!confirm("Delete notification?")) return;
    await supabase.from("notifications").delete().eq("id", id);
    await load();
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Admin / Notifications</h1>

      <div style={{ display: "grid", gap: 10, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        <strong>{editing ? "Edit Notification" : "Add Notification"}</strong>
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" />
        <textarea value={body} onChange={(e)=>setBody(e.target.value)} placeholder="Body" rows={5} />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={active} onChange={(e)=>setActive(e.target.checked)} />
          Active
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={pinned} onChange={(e)=>setPinned(e.target.checked)} />
          Pinned
        </label>

        <input value={starts} onChange={(e)=>setStarts(e.target.value)} placeholder="Starts at (optional ISO)" />
        <input value={ends} onChange={(e)=>setEnds(e.target.value)} placeholder="Ends at (optional ISO)" />

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={save}>{editing ? "Save" : "Add"}</button>
          {editing ? <button onClick={()=>setEditing(null)}>Cancel</button> : null}
        </div>
      </div>

      <h3>List</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map(n => (
          <div key={n.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12, display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div>
              <strong>{n.title}</strong>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {n.is_active ? "Active" : "Disabled"} • {n.pinned ? "Pinned" : "Normal"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={()=>setEditing(n)}>Edit</button>
              <button onClick={()=>del(n.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 16 }}><Link href="/admin">Back to Admin</Link></p>
    </div>
  );
}
