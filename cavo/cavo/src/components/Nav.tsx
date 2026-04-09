"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Nav() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header style={{ borderBottom: "1px solid #eee", padding: "12px 16px" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 700 }}>Cavo</Link>
          <Link href="/devices">Devices</Link>
          <Link href="/roms">ROMs</Link>
          <Link href="/admin">Admin</Link>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {email ? <span style={{ fontSize: 12, opacity: 0.75 }}>{email}</span> : null}
          {email ? (
            <button onClick={() => supabase.auth.signOut()}>Sign out</button>
          ) : (
            <Link href="/admin/login">Sign in</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
