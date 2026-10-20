import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import type { VehicleEvent, EventSeverity } from "../../types/vehicle";

const severityIcon: Record<EventSeverity, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-orange-400" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  critical: <ShieldAlert className="h-4 w-4 text-red-400" />,
};

interface RecentEventsProps {
  events: VehicleEvent[];
}

export default function RecentEvents({ events }: RecentEventsProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">
          Recent Events
        </h3>
        <p className="text-sm text-zinc-500">No recent events.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">
        Recent Events
      </h3>
      <ul className="space-y-2">
        {events.slice(0, 6).map((e) => (
          <li
            key={e.id}
            className="flex items-start gap-3 rounded-lg bg-zinc-800/50 px-3 py-2 text-sm"
          >
            <span className="mt-0.5 shrink-0">{severityIcon[e.severity]}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-zinc-200">{e.message}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {new Date(e.timestamp).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
