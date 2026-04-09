"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { isOwner } from "@/lib/owner";

type Team = {
  id: string;
  name: string;
  country: string | null;
  position: string | null;
  telegram_url: string | null;
  github_url: string | null;
};

export default function AdminTeams() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [items, setItems] = useState<Team[]>([]);
  const [editing, setEditing] = useState<Team | null>(null);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [position, setPosition] = useState("");
  const [telegram, setTelegram] = useState("");
  const [github, setGithub] = useState("");

  async function load() {
    const { data } = await supabase
      .from("teams")
      .select("id,name,country,position,telegram_url,github_url")
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
      setName(""); setCountry(""); setPosition(""); setTelegram(""); setGithub("");
      return;
    }
    setName(editing.name);
    setCountry(editing.country ?? "");
    setPosition(editing.position ?? "");
    setTelegram(editing.telegram_url ?? "");
    setGithub(editing.github_url ?? "");
  }, [editing]);

  if (ok === null) return <p>Loading...</p>;
  if (!ok) return <p>Access denied. <Link href="/admin">Back</Link></p>;

  async function save() {
    const payload = {
      name,
      country: country || null,
      position: position || null,
      telegram_url: telegram || null,
      github_url: github || null
    };

    if (editing) await supabase.from("teams").update(payload).eq("id", editing.id);
    else await supabase.from("teams").insert(payload);

    setEditing(null);
    await load();
  }

  async function del(id: string) {
    if (!confirm("Delete team member?")) return;
    await supabase.from("teams").delete().eq("id", id);
    await load();
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Admin / Teams</h1>

      <div style={{ display: "grid", gap: 10, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        <strong>{editing ? "Edit Member" : "Add Member"}</strong>
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" />
        <input value={country} onChange={(e)=>setCountry(e.target.value)} placeholder="Country" />
        <input value={position} onChange={(e)=>setPosition(e.target.value)} placeholder="Position" />
        <input value={telegram} onChange={(e)=>setTelegram(e.target.value)} placeholder="Telegram Link" />
        <input value={github} onChange={(e)=>setGithub(e.target.value)} placeholder="Github Link" />

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={save}>{editing ? "Save" : "Add"}</button>
          {editing ? <button onClick={()=>setEditing(null)}>Cancel</button> : null}
        </div>
      </div>

      <h3>List</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map(t => (
          <div key={t.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12, display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div>
              <strong>{t.name}</strong> <span style={{ opacity: 0.7 }}>{t.position ?? ""}</span>
              <div style={{ fontSize: 12, opacity: 0.75 }}>{t.country ?? ""}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={()=>setEditing(t)}>Edit</button>
              <button onClick={()=>del(t.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 16 }}><Link href="/admin">Back to Admin</Link></p>
    </div>
  );
}
