import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-400">404</p>
      <h1 className="text-4xl font-black text-white">Page not found</h1>
      <p className="max-w-xl text-sm text-zinc-400">
        The page you requested does not exist or has been moved.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black">
          Go to shop
        </Link>
        <Link href="/admin" className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white">
          Admin
        </Link>
      </div>
    </div>
  );
}
