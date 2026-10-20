import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CarFront,
  ChevronRight,
  Clock,
  Gauge,
  Info,
  Send,
  Sparkles,
  Thermometer,
  Zap,
} from "lucide-react";
import { fetchEvents } from "../api/vehicleApi";
import type { VehicleEvent } from "../types/vehicle";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EventTimelineModal from "../components/events/EventTimelineModal";
import { useVehicle } from "../context/VehicleContext";

export default function MyVehiclePage() {
  const navigate = useNavigate();
  const {
    selectedVehicleId,
    setSelectedVehicleId,
    vehicles,
    summary,
    loading: summaryLoading,
    error: summaryError,
    reloadSummary,
    estimatedRangeKm,
  } = useVehicle();

  const [events, setEvents] = useState<VehicleEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Load recent events whenever selectedVehicleId changes
  useEffect(() => {
    let isMounted = true;
    setEventsLoading(true);

    fetchEvents({ vehicle_id: selectedVehicleId, limit: 3 })
      .then((res) => {
        if (isMounted) {
          setEvents(res.items || []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setEvents([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setEventsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedVehicleId]);

  const handleSubmitQuestion = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Clear input only after a valid question is entered
    setInput("");

    // Transfer the question and selected vehicle context to Assistant page
    navigate("/assistant", {
      state: {
        initialQuestion: trimmed,
        vehicleId: selectedVehicleId,
        timestamp: Date.now(),
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuestion();
    }
  };

  if (summaryLoading && !summary) {
    return <LoadingState message="Connecting to vehicle telemetry system…" />;
  }

  if (summaryError && !summary) {
    return (
      <ErrorState
        message={summaryError}
        onRetry={() => void reloadSummary(selectedVehicleId)}
      />
    );
  }

  // Derive real-time telemetry metrics
  const batteryPercent =
    summary?.batteryPercentage !== null && summary?.batteryPercentage !== undefined
      ? Number(summary.batteryPercentage.toFixed(1))
      : 78;

  const vehicleStatus = summary?.status ?? "online";
  const vehicleTitle = summary?.make
    ? `${summary.make} ${summary.model} (${summary.year})`
    : `Vehicle ${selectedVehicleId}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Main Vehicle Overview Card */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#0e1015] p-6 md:p-8 shadow-2xl space-y-7">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              VEHICLEGPT
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-white">
              Vehicle Overview
            </h1>
            <p className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-zinc-400">
              <span
                className={`h-2 w-2 rounded-full ${
                  vehicleStatus === "charging"
                    ? "bg-amber-400 animate-pulse"
                    : vehicleStatus === "driving"
                    ? "bg-blue-400 animate-pulse"
                    : vehicleStatus === "offline"
                    ? "bg-zinc-500"
                    : "bg-emerald-400"
                }`}
              />
              <span className="font-semibold text-zinc-300">{vehicleTitle}</span>
              <span>•</span>
              <span className="capitalize">{vehicleStatus} mode</span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                {selectedVehicleId}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Quick Vehicle Switcher */}
            {vehicles.length > 0 && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Active Vehicle
                </span>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 outline-none focus:border-orange-500 cursor-pointer"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Aesthetic Vehicle Silhouette Badge */}
            <div className="flex flex-col items-center justify-center gap-1 shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/90 text-orange-400 shadow-md">
                <CarFront className="h-6 w-6 transition-transform hover:scale-110" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                My Vehicle
              </span>
            </div>
          </div>
        </div>

        {/* Battery & Range Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 pt-2 border-t border-zinc-800/60">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
              <Zap className="h-3.5 w-3.5 text-orange-400" />
              <span>Battery</span>
            </div>
            <div className="mt-1 text-3xl md:text-4xl font-extrabold text-white">
              {batteryPercent}%
            </div>
            <div className="mt-1 text-[11px] font-medium text-zinc-500">
              {summary?.isSynthetic ? "Simulated data" : "Live telemetry"}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
              <Gauge className="h-3.5 w-3.5 text-emerald-400" />
              <span>Estimated range</span>
            </div>
            <div className="mt-1 text-3xl md:text-4xl font-extrabold text-white">
              {estimatedRangeKm} km
            </div>
            <div className="mt-1 text-[11px] font-medium text-zinc-500">
              {summary?.isSynthetic ? "Calculated range" : "Real-time range"}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
              <Thermometer className="h-3.5 w-3.5 text-amber-400" />
              <span>Pack Temp</span>
            </div>
            <div className="mt-1 text-2xl md:text-3xl font-extrabold text-white">
              {summary?.batteryTemperature !== null && summary?.batteryTemperature !== undefined
                ? `${summary.batteryTemperature.toFixed(1)} °C`
                : "--"}
            </div>
            <div className="mt-1 text-[11px] font-medium text-zinc-500">
              Thermal sensor
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              <span>Total Distance</span>
            </div>
            <div className="mt-1 text-2xl md:text-3xl font-extrabold text-white">
              {summary?.totalDistanceKm
                ? `${Math.round(summary.totalDistanceKm).toLocaleString()} km`
                : "--"}
            </div>
            <div className="mt-1 text-[11px] font-medium text-zinc-500">
              Odometer reading
            </div>
          </div>
        </div>

        {/* Ask Your Vehicle Prompt Box */}
        <div className="rounded-2xl border border-zinc-800/90 bg-[#131620]/90 p-5 md:p-6 shadow-lg">
          <div className="flex items-center gap-2 text-sm md:text-base font-bold text-white">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>Ask your vehicle</span>
          </div>
          <p className="mt-1.5 text-xs text-zinc-400">
            Ask about driving range, energy consumption, alerts or past events for{" "}
            <span className="font-semibold text-zinc-200">{vehicleTitle}</span>.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5 rounded-xl border border-zinc-700/80 bg-zinc-900/95 p-2 shadow-inner focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Why has my driving range reduced over the last two weeks on ${summary?.make || "this vehicle"}?`}
              className="flex-1 resize-none bg-transparent px-3 py-2 text-sm font-medium text-zinc-100 placeholder-zinc-500 outline-none"
            />
            <button
              type="button"
              onClick={handleSubmitQuestion}
              disabled={!input.trim()}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-orange-600/30 transition hover:from-orange-500 hover:to-orange-400 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span>Ask Assistant</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 px-1">
            <span>Example query • Uses local telemetry history for {selectedVehicleId}</span>
            <span className="hidden sm:inline">
              Press <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 font-mono text-[10px]">Enter ↵</kbd> to submit
            </span>
          </div>
        </div>

        {/* Recent Vehicle Events */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
              Recent vehicle events ({selectedVehicleId})
            </h2>
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="text-xs font-semibold text-orange-400 hover:underline"
            >
              View all fleet events →
            </button>
          </div>

          <div className="space-y-2">
            {eventsLoading ? (
              <div className="py-4 text-center text-xs text-zinc-500">
                Loading events for {selectedVehicleId}…
              </div>
            ) : events.length > 0 ? (
              events.map((ev) => {
                const eventTypeStr = String(ev.type || "");
                const isThermal =
                  eventTypeStr.includes("temperature") ||
                  eventTypeStr.includes("battery");
                const Icon = isThermal
                  ? Thermometer
                  : ev.severity === "critical"
                  ? AlertTriangle
                  : Info;

                const displayTitle =
                  eventTypeStr === "adas_disengagement"
                    ? "ADAS disengagement"
                    : eventTypeStr === "battery_warning"
                    ? "Battery temperature warning"
                    : eventTypeStr.replace(/_/g, " ");

                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setSelectedEventId(ev.id)}
                    className="group flex w-full items-center justify-between rounded-xl border border-zinc-800/70 bg-[#12151d]/70 px-4 py-3.5 text-left transition hover:border-zinc-700 hover:bg-[#151924]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-400 group-hover:text-orange-400 transition">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-zinc-200 group-hover:text-orange-400 transition">
                          {displayTitle}
                        </div>
                        <div className="truncate text-xs text-zinc-400">
                          {ev.message || "Recorded vehicle event"} •{" "}
                          {new Date(ev.timestamp).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-zinc-200" />
                  </button>
                );
              })
            ) : (
              // Sensible fallback matching the mockup
              <div className="rounded-xl border border-zinc-800/70 bg-[#12151d]/70 px-4 py-6 text-center text-xs text-zinc-400">
                No recent critical alerts or disengagements recorded for {selectedVehicleId}.
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer note */}
        <div className="pt-2 text-[11px] text-zinc-500">
          Concept telemetry demonstration. Values and events shown reflect 30-day deterministic automotive data for {selectedVehicleId}.
        </div>
      </div>

      {/* Event Timeline Modal if user inspects an event */}
      {selectedEventId && (
        <EventTimelineModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
