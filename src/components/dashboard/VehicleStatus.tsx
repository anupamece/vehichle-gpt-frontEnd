import { Circle } from "lucide-react";
import type { Vehicle, VehicleStatusType } from "../../types/vehicle";

const statusColor: Record<VehicleStatusType, string> = {
  online: "text-emerald-400",
  driving: "text-orange-400",
  charging: "text-amber-400",
  idle: "text-zinc-400",
  offline: "text-zinc-600",
};

interface VehicleStatusProps {
  vehicles: Vehicle[];
}

export default function VehicleStatus({ vehicles }: VehicleStatusProps) {
  if (vehicles.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">
          Vehicle Status
        </h3>
        <p className="text-sm text-zinc-500">No vehicles found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">
        Vehicle Status
      </h3>
      <ul className="space-y-2">
        {vehicles.map((v) => (
          <li key={v.id} className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-200">
              {v.year} {v.make} {v.model}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${statusColor[v.status]}`}
            >
              <Circle className="h-2 w-2 fill-current" />
              {v.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
