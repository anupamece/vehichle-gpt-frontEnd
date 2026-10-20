import type {
  DashboardStats,
  EnergyAnalyticsResponse,
  EnergyDataPoint,
  EventTimelineDetailResponse,
  HealthResponse,
  PaginatedEventsResponse,
  QueryResponse,
  Vehicle,
  VehicleEvent,
  VehicleSummaryResponse,
} from "../types/vehicle";
import client from "./client";

/**
 * Endpoint 1: GET /api/health
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await client.get<HealthResponse>("/api/health");
  return data;
}

/**
 * Endpoint 2: GET /api/vehicle/summary
 * Returns vehicle summary including latest telemetry, SoC %, pack temperature,
 * measurement timestamp, and synthetic/live data origin flags.
 */
export async function fetchVehicleSummary(
  vehicleId?: string,
): Promise<VehicleSummaryResponse> {
  const params = vehicleId ? { vehicle_id: vehicleId } : undefined;
  const { data } = await client.get<VehicleSummaryResponse>(
    "/api/vehicle/summary",
    { params },
  );
  return data;
}

/**
 * Endpoint 3: GET /api/events (Paginated)
 * Supports multi-criteria filtering by event type, severity, date range, and keyword query.
 */
export async function fetchEvents(params?: {
  event_type?: string;
  start_time?: string;
  end_time?: string;
  severity?: string;
  query?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  offset?: number;
  vehicle_id?: string;
}): Promise<PaginatedEventsResponse> {
  const { data } = await client.get<PaginatedEventsResponse>("/api/events", {
    params,
  });
  return data;
}

/**
 * Endpoint 4: GET /api/events/{event_id}/timeline
 * Returns event context with pre-warning and post-warning telemetry and causation disclaimer.
 */
export async function fetchEventTimeline(
  eventId: string,
  beforeMinutes = 30,
  afterMinutes = 30,
): Promise<EventTimelineDetailResponse> {
  const { data } = await client.get<EventTimelineDetailResponse>(
    `/api/events/${encodeURIComponent(eventId)}/timeline`,
    {
      params: { before_minutes: beforeMinutes, after_minutes: afterMinutes },
    },
  );
  return data;
}

/**
 * Endpoint 5: GET /api/analytics/energy?group_by=driving_mode
 * Returns city vs highway normalized kWh/100 km metrics, comparison, and warnings.
 */
export async function fetchDrivingModeEnergy(
  groupBy = "driving_mode",
  vehicleId?: string,
): Promise<EnergyAnalyticsResponse> {
  const params: Record<string, string> = { group_by: groupBy };
  if (vehicleId) params.vehicle_id = vehicleId;
  const { data } = await client.get<EnergyAnalyticsResponse>(
    "/api/analytics/energy",
    { params },
  );
  return data;
}

/**
 * Endpoint 6: POST /api/query
 */
export async function submitQuery(question: string): Promise<QueryResponse> {
  const { data } = await client.post<QueryResponse>("/api/query", {
    question,
  });
  return data;
}

/* ────────────────────────────────────────────────────────────
   Dashboard & Legacy Support Helpers
   ──────────────────────────────────────────────────────────── */

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await client.get<DashboardStats>("/api/dashboard/stats");
  return data;
}

export async function fetchVehicles(): Promise<Vehicle[]> {
  const { data } = await client.get<Vehicle[]>("/api/vehicles");
  return data;
}

export async function fetchVehicleEvents(
  params?: Record<string, string | number | undefined>,
): Promise<VehicleEvent[]> {
  const { data } = await client.get<PaginatedEventsResponse | VehicleEvent[]>(
    "/api/events",
    { params },
  );
  if (data && typeof data === "object" && "items" in data && Array.isArray(data.items)) {
    return data.items;
  }
  return Array.isArray(data) ? data : [];
}

export async function fetchEnergyData(): Promise<EnergyDataPoint[]> {
  const { data } = await client.get<EnergyDataPoint[]>("/api/energy");
  return data;
}

export async function sendChatMessage(message: string): Promise<{
  reply: string;
  intent?: string;
  data?: Record<string, unknown>;
  sources?: string[];
  warnings?: string[];
}> {
  const { data } = await client.post<QueryResponse>("/api/query", {
    question: message,
  });
  return {
    reply: data.answer || data.reply || "No response received.",
    intent: data.intent,
    data: data.data,
    sources: data.sources,
    warnings: data.warnings,
  };
}
