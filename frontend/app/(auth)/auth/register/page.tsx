"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await apiFetch("/users/register", {
        method: "POST",
        body: JSON.stringify(form)
      });

      const loginResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (!loginResult?.ok) {
        throw new Error("Account created, but automatic sign-in failed. Please log in manually.");
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Join Cavo</p>
        <h1 className="mt-2 text-3xl font-black text-white">Create your account</h1>
      </div>
      <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
      <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" type="email" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
      <input value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" type="password" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
      <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone (optional)" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button disabled={loading} className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-black uppercase tracking-[0.16em] text-black disabled:opacity-60">{loading ? "Creating account..." : "Create account"}</button>
      <p className="text-center text-sm text-zinc-400">
        Already have an account? <Link href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-amber-300">Sign in</Link>
      </p>
    </form>
  );
}
