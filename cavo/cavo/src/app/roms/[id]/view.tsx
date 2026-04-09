"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Section } from "@/components/Section";

type Rom = { id: string; name: string; version: string; release_date: string | null; changelogs: string | null; installation: string | null; download_url: string; };

export default function RomClient() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [item, setItem] = useState<Rom | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("roms")
        .select("id,name,version,release_date,changelogs,installation,download_url")
        .eq("id", id)
        .maybeSingle();
      setItem(data as any);
    })();
  }, [id]);

  if (!item) return <p>Loading...</p>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>{item.name} {item.version}</h1>

      <Section title="Release date">
        <p style={{ margin: 0 }}>{item.release_date ?? "—"}</p>
      </Section>

      <Section title="Changelogs">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{item.changelogs ?? "—"}</pre>
      </Section>

      <Section title="Installation">
        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{item.installation ?? "—"}</pre>
      </Section>

      <Section title="Download">
        <Link href={`/download/${item.id}`}>Download</Link>
      </Section>
    </div>
  );
}
