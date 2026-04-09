"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DownloadPage() {
  const params = useParams<{ id: string }>();
  const [msg, setMsg] = useState("Preparing download...");

  useEffect(() => {
    (async () => {
      const id = params.id;
      const { data: rom, error } = await supabase.from("roms").select("id,download_url").eq("id", id).maybeSingle();

      if (error || !rom?.download_url) {
        setMsg("ROM not found.");
        return;
      }

      await supabase.from("download_events").insert({
        rom_id: rom.id,
        download_url: rom.download_url,
        page_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent
      });

      window.location.href = rom.download_url;
    })();
  }, [params.id]);

  return <p>{msg}</p>;
}
