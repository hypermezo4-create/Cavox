"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Section } from "@/components/Section";

type Rom = { id: string; name: string; version: string; release_date: string | null; };

export default function RomsClient() {
  const [items, setItems] = useState<Rom[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("roms").select("id,name,version,release_date").order("created_at", { ascending: false });
      setItems((data ?? []) as any);
    })();
  }, []);

  const filtered = items.filter(r => (r.name + " " + r.version).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>ROMs</h1>

      <Section title="Search">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name/version" />
      </Section>

      <Section title="List">
        {filtered.length === 0 ? <p style={{ opacity: 0.7 }}>No roms.</p> : null}
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {filtered.map(r => (
            <li key={r.id} style={{ marginBottom: 6 }}>
              <Link href={`/roms/${r.id}`}>{r.name} {r.version}</Link>
              {r.release_date ? <span style={{ opacity: 0.7 }}> — {r.release_date}</span> : null}
              <Link href={`/download/${r.id}`} style={{ marginLeft: 10 }}>Download</Link>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
