"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-2xl font-black text-white">Something went wrong</h2>
      <p className="max-w-xl text-sm text-zinc-400">
        Cavo could not render this screen right now. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black"
      >
        Try again
      </button>
    </div>
  );
}
