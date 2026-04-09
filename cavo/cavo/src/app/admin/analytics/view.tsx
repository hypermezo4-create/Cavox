"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { isOwner } from "@/lib/owner";

type EventRow = { id: string; rom_id: string | null; download_url: string; clicked_at: string; };

export default function AdminAnalytics() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { setOk(false); return; }
      setOk(await isOwner());

      const { data: ev } = await supabase
        .from("download_events")
        .select("id,rom_id,download_url,clicked_at")
        .order("clicked_at", { ascending: false })
        .limit(200);

      setEvents((ev ?? []) as any);
    })();
  }, []);

  const top = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) {
      const key = e.rom_id ?? e.download_url;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 20);
  }, [events]);

  if (ok === null) return <p>Loading...</p>;
  if (!ok) return <p>Access denied. <Link href="/admin">Back</Link></p>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Admin / Analytics</h1>

      <h3>Top Downloads (last 200 clicks)</h3>
      <ol>
        {top.map(([k,v]) => <li key={k}><code>{k}</code> — {v}</li>)}
      </ol>

      <h3>Latest Events</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {events.slice(0, 50).map(e => (
          <div key={e.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{e.clicked_at}</div>
            <div><code style={{ fontSize: 12 }}>{e.download_url}</code></div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 16 }}><Link href="/admin">Back to Admin</Link></p>
    </div>
  );
}
