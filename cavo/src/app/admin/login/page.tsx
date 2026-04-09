"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMsg(error ? error.message : "Signed in. Open /admin");
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setMsg(error ? error.message : "Signed up. If allowlisted, you can access /admin");
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h1 style={{ marginTop: 0 }}>Admin Login</h1>
      <form onSubmit={signIn} style={{ display: "grid", gap: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit">Sign in</button>
          <button type="button" onClick={signUp}>Sign up</button>
        </div>
        {msg ? <p style={{ margin: 0, opacity: 0.8 }}>{msg}</p> : null}
      </form>
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 12 }}>
        Add the 2 owner emails into <code>owners_allowlist</code> table in Supabase.
      </p>
    </div>
  );
}
