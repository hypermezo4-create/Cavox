export default function Badge({ label }: { label: "NEW" | "SALE" | "OUT OF STOCK" }) {
  return <span className="rounded px-2 py-1 text-xs font-semibold bg-[var(--badge-bg)] text-[var(--text-primary)]">{label}</span>;
}
