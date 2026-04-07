"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = params.get("callbackUrl") || "/";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError("Invalid email or password.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "authenticated") {
    return (
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center">
        <h1 className="text-2xl font-black text-white">You are already signed in</h1>
        <p className="mt-3 text-zinc-400">Head back to shopping or continue to your cart.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/shop" className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-200">Shop now</Link>
          <Link href="/cart" className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black text-black">View cart</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Welcome back</p>
        <h1 className="mt-2 text-3xl font-black text-white">Sign in to your Cavo account</h1>
      </div>
      <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
      <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" className="w-full rounded-2xl border border-white/10 bg-black/20 p-3 text-white outline-none placeholder:text-zinc-500" />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button disabled={loading} className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-black uppercase tracking-[0.16em] text-black disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button>
      <p className="text-center text-sm text-zinc-400">
        Don&apos;t have an account? <Link href={`/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-amber-300">Create one</Link>
      </p>
    </form>
  );
}
