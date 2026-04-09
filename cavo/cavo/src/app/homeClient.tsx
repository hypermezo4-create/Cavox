"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Section } from "@/components/Section";

type Notification = { id: string; title: string; body: string; pinned: boolean; created_at: string; };
type Rom = { id: string; name: string; version: string; download_url: string; created_at: string; };

export default function HomeClient() {
  const [notes, setNotes] = useState<Notification[]>([]);
  const [roms, setRoms] = useState<Rom[]>([]);

  useEffect(() => {
    (async () => {
      const { data: n } = await supabase
        .from("notifications")
        .select("id,title,body,pinned,created_at")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);

      const { data: r } = await supabase
        .from("roms")
        .select("id,name,version,download_url,created_at")
        .order("created_at", { ascending: false })
        .limit(6);

      setNotes((n ?? []) as any);
      setRoms((r ?? []) as any);
    })();
  }, []);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Cavo</h1>

      <Section title="Notifications">
        {notes.length === 0 ? <p style={{ opacity: 0.7 }}>No notifications.</p> : null}
        <div style={{ display: "grid", gap: 10 }}>
          {notes.map((x) => (
            <div key={x.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <strong>{x.title}</strong>
                {x.pinned ? <span style={{ fontSize: 12, opacity: 0.7 }}>(Pinned)</span> : null}
              </div>
              <p style={{ marginBottom: 0, opacity: 0.85 }}>{x.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Latest ROMs">
        {roms.length === 0 ? <p style={{ opacity: 0.7 }}>No roms yet.</p> : null}
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {roms.map((r) => (
            <li key={r.id} style={{ marginBottom: 6 }}>
              <Link href={`/roms/${r.id}`}>{r.name} {r.version}</Link>{" "}
              <Link href={`/download/${r.id}`} style={{ marginLeft: 8 }}>Download</Link>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
