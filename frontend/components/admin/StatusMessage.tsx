export function StatusMessage({ error, success }: { error?: string | null; success?: string | null }) {
  if (!error && !success) return null;
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${error ? "border-red-500/40 bg-red-500/10 text-red-100" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"}`}>
      {error || success}
    </div>
  );
}
