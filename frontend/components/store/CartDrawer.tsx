"use client";

export default function CartDrawer({ open }: { open: boolean }) {
  return (
    <aside className={`fixed right-0 top-0 h-full w-80 border-l border-[var(--border-color)] bg-[var(--bg-card)] p-4 text-[var(--text-primary)] transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}>
      <h2 className="text-xl font-semibold">Cart</h2>
      <p className="mt-2 text-[var(--text-muted)]">Your selected shoes will appear here.</p>
    </aside>
  );
}
