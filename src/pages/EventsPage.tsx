import { useCallback, useEffect, useState } from "react";
import { fetchEvents } from "../api/vehicleApi";
import type {
  EventSeverity,
  EventType,
  VehicleEvent,
} from "../types/vehicle";
import EventFilters from "../components/events/EventFilters";
import EventTable from "../components/events/EventTable";
import EventTimelineModal from "../components/events/EventTimelineModal";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";

export default function EventsPage() {
  const [events, setEvents] = useState<VehicleEvent[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<EventSeverity | "all">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Timeline Modal State
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number | undefined> = {
        limit: 100,
        offset: 0,
        sort_by: "timestamp",
        sort_order: "desc",
      };

      if (typeFilter !== "all") params.event_type = typeFilter;
      if (severityFilter !== "all") params.severity = severityFilter;
      if (startDate) params.start_time = `${startDate}T00:00:00Z`;
      if (endDate) params.end_time = `${endDate}T23:59:59Z`;
      if (searchQuery.trim()) params.query = searchQuery.trim();

      const response = await fetchEvents(params);
      setEvents(response.items);
      setTotal(response.total);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to retrieve events from backend.";
      setError(msg);
      setEvents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, severityFilter, startDate, endDate, searchQuery]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleResetFilters = () => {
    setTypeFilter("all");
    setSeverityFilter("all");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-5">
      {/* Filters Bar */}
      <EventFilters
        selectedType={typeFilter}
        selectedSeverity={severityFilter}
        startDate={startDate}
        endDate={endDate}
        searchQuery={searchQuery}
        onTypeChange={setTypeFilter}
        onSeverityChange={setSeverityFilter}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSearchChange={setSearchQuery}
        onReset={handleResetFilters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>
          Showing <strong className="text-white">{events.length}</strong> of{" "}
          <strong className="text-white">{total}</strong> total recorded events
        </span>
        {loading && <span className="text-orange-400">Updating query…</span>}
      </div>

      {/* Loading & Error States */}
      {loading && events.length === 0 ? (
        <LoadingState message="Loading events from database…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <EventTable
          events={events}
          onSelectEvent={(ev) => setSelectedEventId(ev.id)}
        />
      )}

      {/* Event Timeline Modal */}
      <EventTimelineModal
        eventId={selectedEventId}
        onClose={() => setSelectedEventId(null)}
      />
    </div>
  );
}
