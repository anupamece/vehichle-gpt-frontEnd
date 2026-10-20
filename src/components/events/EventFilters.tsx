import { Filter, RotateCcw, Search } from "lucide-react";
import type { EventSeverity, EventType } from "../../types/vehicle";

interface EventFiltersProps {
  selectedType: EventType | "all";
  selectedSeverity: EventSeverity | "all";
  startDate: string;
  endDate: string;
  searchQuery: string;
  onTypeChange: (t: EventType | "all") => void;
  onSeverityChange: (s: EventSeverity | "all") => void;
  onStartDateChange: (d: string) => void;
  onEndDateChange: (d: string) => void;
  onSearchChange: (q: string) => void;
  onReset: () => void;
}

const eventTypes: Array<EventType | "all"> = [
  "all",
  "diagnostic",
  "alert",
  "battery",
  "adas_disengagement",
  "maintenance",
  "geofence",
  "system",
];

const severities: Array<EventSeverity | "all"> = [
  "all",
  "info",
  "warning",
  "critical",
];

export default function EventFilters({
  selectedType,
  selectedSeverity,
  startDate,
  endDate,
  searchQuery,
  onTypeChange,
  onSeverityChange,
  onStartDateChange,
  onEndDateChange,
  onSearchChange,
  onReset,
}: EventFiltersProps) {
  const inputClass =
    "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 outline-none focus:border-orange-500";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <Filter className="h-3.5 w-3.5 text-orange-400" />
          <span>Telemetry Event Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-zinc-400 transition hover:text-orange-400"
        >
          <RotateCcw className="h-3 w-3" />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
        {/* Keyword Search */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Search Description / DTC
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="e.g. ADAS, P0A12, radar, temperature..."
              className={`${inputClass} w-full pl-8`}
            />
          </div>
        </div>

        {/* Event Type Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Event Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as EventType | "all")}
            className={inputClass}
          >
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All Event Types" : t.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Severity
          </label>
          <select
            value={selectedSeverity}
            onChange={(e) =>
              onSeverityChange(e.target.value as EventSeverity | "all")
            }
            className={inputClass}
          >
            {severities.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Severities" : s.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter: Start & End */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Date Window
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className={`${inputClass} w-full px-1.5 text-[11px]`}
              title="Start Date"
            />
            <span className="text-zinc-500 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className={`${inputClass} w-full px-1.5 text-[11px]`}
              title="End Date"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
