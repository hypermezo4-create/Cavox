"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { isOwner } from "@/lib/owner";
import { supabase } from "@/lib/supabaseClient";
import { Section } from "@/components/Section";

export default function AdminHome() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      if (!data.user) { setOk(false); return; }
      setOk(await isOwner());
    })();
  }, []);

  if (ok === null) return <p>Loading...</p>;

  if (!email) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Admin</h1>
        <p>You need to sign in.</p>
        <Link href="/admin/login">Go to login</Link>
      </div>
    );
  }

  if (!ok) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Admin</h1>
        <p style={{ color: "crimson" }}>Access denied: not in owners allowlist.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Admin Dashboard</h1>
      <Section title="Manage">
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li><Link href="/admin/devices">Devices</Link></li>
          <li><Link href="/admin/roms">ROMs</Link></li>
          <li><Link href="/admin/teams">Teams</Link></li>
          <li><Link href="/admin/notifications">Notifications</Link></li>
          <li><Link href="/admin/analytics">Analytics</Link></li>
        </ul>
      </Section>
    </div>
  );
}
