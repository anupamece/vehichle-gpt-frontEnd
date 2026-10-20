import { useEffect, useState } from "react";
import { Clock, Info, X } from "lucide-react";
import { fetchEventTimeline } from "../../api/vehicleApi";
import type { EventTimelineDetailResponse } from "../../types/vehicle";
import LoadingState from "../common/LoadingState";
import ErrorState from "../common/ErrorState";

interface EventTimelineModalProps {
  eventId: string | null;
  onClose: () => void;
}

export default function EventTimelineModal({
  eventId,
  onClose,
}: EventTimelineModalProps) {
  const [timeline, setTimeline] = useState<EventTimelineDetailResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [windowMinutes, setWindowMinutes] = useState(30);

  useEffect(() => {
    if (!eventId) {
      setTimeline(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchEventTimeline(eventId, windowMinutes, windowMinutes)
      .then((data) => {
        if (isMounted) setTimeline(data);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load event timeline from backend.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [eventId, windowMinutes]);

  if (!eventId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-400" />
            <h3 className="text-base font-bold text-white">
              Incident Context Timeline
            </h3>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              ID: {eventId}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-zinc-400">
              Window:
              <select
                value={windowMinutes}
                onChange={(e) => setWindowMinutes(Number(e.target.value))}
                className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-orange-500"
              >
                <option value={15}>±15 min</option>
                <option value={30}>±30 min</option>
                <option value={60}>±60 min</option>
              </select>
            </label>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {loading && <LoadingState message="Extracting context timeline around incident…" />}

          {error && (
            <ErrorState
              message={error}
              onRetry={() => {
                setLoading(true);
                setError(null);
                fetchEventTimeline(eventId, windowMinutes, windowMinutes)
                  .then(setTimeline)
                  .catch((err) => setError(err.message))
                  .finally(() => setLoading(false));
              }}
            />
          )}

          {!loading && !error && timeline && (
            <>
              {/* Target Incident Overview Card */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        timeline.event.severity === "critical"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : timeline.event.severity === "warning"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      }`}
                    >
                      {timeline.event.severity}
                    </span>
                    <span className="text-xs font-semibold uppercase text-zinc-400">
                      Type: {timeline.event.type.replace("_", " ")}
                    </span>
                    {timeline.event.dtcCode && (
                      <span className="rounded bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-400">
                        DTC: {timeline.event.dtcCode}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400">
                    Timestamp: {new Date(timeline.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-zinc-200">
                  {timeline.event.message}
                </p>
                {timeline.event.metadata && (
                  <pre className="mt-2 overflow-x-auto rounded bg-zinc-900 p-2 text-[11px] text-zinc-400">
                    {JSON.stringify(timeline.event.metadata, null, 2)}
                  </pre>
                )}
              </div>

              {/* Engineering Causation Disclaimer Banner */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
                <div className="flex items-start gap-2.5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-semibold uppercase tracking-wider">
                      Diagnostic Engineering Notice
                    </p>
                    <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                      {timeline.causationDisclaimer}
                    </p>
                  </div>
                </div>
              </div>

              {/* Related Events Section */}
              {timeline.relatedEvents.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Related Events in Window ({timeline.relatedEvents.length})
                  </h4>
                  <div className="space-y-1.5">
                    {timeline.relatedEvents.map((re) => (
                      <div
                        key={re.id}
                        className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/40 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-orange-400">
                            {re.type}
                          </span>
                          <span className="text-zinc-300">{re.message}</span>
                        </div>
                        <span className="text-zinc-500">
                          {new Date(re.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-warning vs Post-warning Telemetry Comparison */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Pre-Warning Telemetry */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                      Pre-Warning Measurements ({timeline.preEventTelemetry?.length ?? 0})
                    </span>
                    <span className="text-[11px] text-zinc-500">Leading up to event</span>
                  </div>
                  <div className="max-h-56 space-y-1.5 overflow-y-auto font-mono text-[11px]">
                    {(timeline.preEventTelemetry || []).slice(-8).map((pt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded bg-zinc-900/80 px-2 py-1 text-zinc-300"
                      >
                        <span>{new Date(pt.timestamp || "").toLocaleTimeString()}</span>
                        <span>{pt.speedKmh != null ? `${pt.speedKmh} km/h` : "null"}</span>
                        <span>{pt.batteryLevelPercent != null ? `${pt.batteryLevelPercent}%` : "—"}</span>
                        <span className="text-orange-400">
                          {pt.batteryTemperatureCelsius != null ? `${pt.batteryTemperatureCelsius}°C` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Post-Warning Telemetry */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Post-Warning Measurements ({timeline.postEventTelemetry?.length ?? 0})
                    </span>
                    <span className="text-[11px] text-zinc-500">System recovery / response</span>
                  </div>
                  <div className="max-h-56 space-y-1.5 overflow-y-auto font-mono text-[11px]">
                    {(timeline.postEventTelemetry || []).slice(0, 8).map((pt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded bg-zinc-900/80 px-2 py-1 text-zinc-300"
                      >
                        <span>{new Date(pt.timestamp || "").toLocaleTimeString()}</span>
                        <span>{pt.speedKmh != null ? `${pt.speedKmh} km/h` : "null"}</span>
                        <span>{pt.batteryLevelPercent != null ? `${pt.batteryLevelPercent}%` : "—"}</span>
                        <span className="text-emerald-400">
                          {pt.batteryTemperatureCelsius != null ? `${pt.batteryTemperatureCelsius}°C` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-zinc-800 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
}
