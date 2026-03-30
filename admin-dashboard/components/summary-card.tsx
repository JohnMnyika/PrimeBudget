import { ReactNode } from "react";

export function SummaryCard({
  title,
  value,
  children
}: {
  title: string;
  value: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-xl shadow-slate-950/5">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-black text-obsidian">{value}</p>
      {children ? <div className="mt-4 text-sm text-slate-600">{children}</div> : null}
    </div>
  );
}

