import type { ReactNode } from "react";

export function AdminPageShell({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-white/65">{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
