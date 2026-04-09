"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { isOwner } from "@/lib/owner";

type Device = { id: string; name: string; codename: string; };
type Rom = {
  id: string;
  device_id: string | null;
  name: string;
  version: string;
  release_date: string | null;
  changelogs: string | null;
  installation: string | null;
  download_url: string;
};

export default function AdminRoms() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [items, setItems] = useState<Rom[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [editing, setEditing] = useState<Rom | null>(null);

  const [deviceId, setDeviceId] = useState("");
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [changelogs, setChangelogs] = useState("");
  const [installation, setInstallation] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  async function load() {
    const { data } = await supabase
      .from("roms")
      .select("id,device_id,name,version,release_date,changelogs,installation,download_url")
      .order("created_at", { ascending: false });
    setItems((data ?? []) as any);

    const { data: devs } = await supabase
      .from("devices")
      .select("id,name,codename")
      .order("name", { ascending: true });
    setDevices((devs ?? []) as any);
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
      setDeviceId(""); setName(""); setVersion(""); setReleaseDate("");
      setChangelogs(""); setInstallation(""); setDownloadUrl("");
      return;
    }
    setDeviceId(editing.device_id ?? "");
    setName(editing.name);
    setVersion(editing.version);
    setReleaseDate(editing.release_date ?? "");
    setChangelogs(editing.changelogs ?? "");
    setInstallation(editing.installation ?? "");
    setDownloadUrl(editing.download_url);
  }, [editing]);

  if (ok === null) return <p>Loading...</p>;
  if (!ok) return <p>Access denied. <Link href="/admin">Back</Link></p>;

  async function save() {
    const payload: any = {
      device_id: deviceId || null,
      name,
      version,
      release_date: releaseDate || null,
      changelogs: changelogs || null,
      installation: installation || null,
      download_url: downloadUrl
    };

    if (editing) await supabase.from("roms").update(payload).eq("id", editing.id);
    else await supabase.from("roms").insert(payload);

    setEditing(null);
    await load();
  }

  async function del(id: string) {
    if (!confirm("Delete rom?")) return;
    await supabase.from("roms").delete().eq("id", id);
    await load();
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Admin / ROMs</h1>

      <div style={{ display: "grid", gap: 10, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
        <strong>{editing ? "Edit ROM" : "Add ROM"}</strong>

        <select value={deviceId} onChange={(e)=>setDeviceId(e.target.value)}>
          <option value="">(Optional) Link to device</option>
          {devices.map(d => <option key={d.id} value={d.id}>{d.name} ({d.codename})</option>)}
        </select>

        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name Roms" />
        <input value={version} onChange={(e)=>setVersion(e.target.value)} placeholder="Version" />
        <input value={releaseDate} onChange={(e)=>setReleaseDate(e.target.value)} placeholder="Date (YYYY-MM-DD)" />
        <textarea value={changelogs} onChange={(e)=>setChangelogs(e.target.value)} placeholder="Changelogs" rows={6} />
        <textarea value={installation} onChange={(e)=>setInstallation(e.target.value)} placeholder="Installation" rows={6} />
        <input value={downloadUrl} onChange={(e)=>setDownloadUrl(e.target.value)} placeholder="Url Download" />

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={save}>{editing ? "Save" : "Add"}</button>
          {editing ? <button onClick={()=>setEditing(null)}>Cancel</button> : null}
        </div>
      </div>

      <h3>List</h3>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map(r => (
          <div key={r.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12, display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div>
              <strong>{r.name}</strong> <span style={{ opacity: 0.7 }}>{r.version}</span>
              {r.release_date ? <span style={{ opacity: 0.7 }}> — {r.release_date}</span> : null}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`/download/${r.id}`}>Test Download</a>
              <button onClick={()=>setEditing(r)}>Edit</button>
              <button onClick={()=>del(r.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 16 }}><Link href="/admin">Back to Admin</Link></p>
    </div>
  );
}
