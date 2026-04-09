"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Section } from "@/components/Section";

type Device = { id: string; name: string; codename: string; };

export default function DevicesClient() {
  const [items, setItems] = useState<Device[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("devices").select("id,name,codename").order("name", { ascending: true });
      setItems((data ?? []) as any);
    })();
  }, []);

  const filtered = items.filter(d => (d.name + " " + d.codename).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Devices</h1>
      <Section title="Search">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name/codename" />
      </Section>

      <Section title="List">
        {filtered.length === 0 ? <p style={{ opacity: 0.7 }}>No devices.</p> : null}
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {filtered.map(d => (
            <li key={d.id}>
              <Link href={`/devices/${encodeURIComponent(d.codename)}`}>{d.name}</Link>{" "}
              <span style={{ opacity: 0.7 }}>({d.codename})</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
