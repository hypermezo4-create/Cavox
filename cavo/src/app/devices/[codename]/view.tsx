"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Section } from "@/components/Section";

type Device = { id: string; name: string; codename: string; photos: string[]; specs: Record<string, any>; };

export default function DeviceClient() {
  const params = useParams<{ codename: string }>();
  const codename = decodeURIComponent(params.codename);
  const [item, setItem] = useState<Device | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("devices").select("id,name,codename,photos,specs").eq("codename", codename).maybeSingle();
      setItem(data as any);
    })();
  }, [codename]);

  if (!item) return <p>Loading...</p>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>{item.name} <span style={{ opacity: 0.7, fontSize: 14 }}>({item.codename})</span></h1>

      <Section title="Photos">
        {item.photos?.length ? (
          <div style={{ display: "grid", gap: 8 }}>
            {item.photos.map((u, i) => <a key={i} href={u} target="_blank" rel="noreferrer">{u}</a>)}
          </div>
        ) : <p style={{ opacity: 0.7 }}>No photos.</p>}
      </Section>

      <Section title="Specs">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(item.specs ?? {}, null, 2)}</pre>
      </Section>
    </div>
  );
}
