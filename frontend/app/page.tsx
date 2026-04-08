export const metadata = {
  title: "Cavo",
  description: "Cavo storefront",
};

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-black tracking-tight">Cavo</h1>
      <p className="mt-4 text-base text-zinc-400">
        Premium footwear storefront
      </p>
      <div className="mt-8 flex gap-4">
        <a
          href="/shop"
          className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black"
        >
          Enter Store
        </a>
        <a
          href="/auth/login"
          className="rounded-2xl border border-white/20 px-6 py-3 text-sm font-bold text-white"
        >
          Login
        </a>
      </div>
    </main>
  );
}