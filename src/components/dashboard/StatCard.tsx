import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: string; // tailwind text color class
}

export default function StatCard({
  label,
  value,
  icon,
  accent = "text-orange-400",
}: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-800 ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          {label}
        </p>
        <p className="mt-0.5 text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
