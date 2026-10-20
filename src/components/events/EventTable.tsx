import { Clock } from "lucide-react";
import type { VehicleEvent, EventSeverity } from "../../types/vehicle";

const severityBadge: Record<EventSeverity, string> = {
  info: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  critical: "bg-red-500/10 text-red-400 border border-red-500/20",
};

interface EventTableProps {
  events: VehicleEvent[];
  onSelectEvent?: (event: VehicleEvent) => void;
}

export default function EventTable({ events, onSelectEvent }: EventTableProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 py-16 text-center">
        <p className="text-sm font-medium text-zinc-400">
          No telemetry events match the specified filter criteria.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Try expanding the date range or resetting event type / severity filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-900/60 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900">
          <tr>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Timestamp (UTC)
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Type
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Severity
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              DTC / Ref
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Description
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Timeline
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60 font-mono">
          {events.map((e) => (
            <tr
              key={e.id}
              className="transition hover:bg-zinc-800/40"
            >
              <td className="whitespace-nowrap px-4 py-3 font-sans text-xs text-zinc-300">
                {new Date(e.timestamp).toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-sans text-xs capitalize text-zinc-200">
                {e.type.replace("_", " ")}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-sans">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                    severityBadge[e.severity] || severityBadge.info
                  }`}
                >
                  {e.severity}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-400">
                {e.dtcCode ? (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-bold text-orange-400">
                    {e.dtcCode}
                  </span>
                ) : e.relatedEventId ? (
                  <span className="text-zinc-500">ref:{e.relatedEventId.slice(-6)}</span>
                ) : (
                  "—"
                )}
              </td>
              <td className="max-w-md px-4 py-3 font-sans text-xs text-zinc-200">
                {e.message}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-sans">
                {onSelectEvent && (
                  <button
                    type="button"
                    onClick={() => onSelectEvent(e)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-200 transition hover:border-orange-500/60 hover:text-orange-400"
                  >
                    <Clock className="h-3 w-3" />
                    Timeline
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
