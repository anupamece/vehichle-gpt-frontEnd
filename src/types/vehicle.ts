/* ────────────────────────────────────────────────────────────
   VehicleGPT Shared API Contract Types (Frontend <-> Backend)
   ──────────────────────────────────────────────────────────── */

export interface HealthResponse {
  status: "ok" | string;
}

export type VehicleStatusType = "online" | "offline" | "charging" | "driving" | "idle";

export interface TelemetrySnapshot {
  timestamp?: string;
  tripId?: string | null;
  speedKmh?: number | null;
  batteryLevelPercent?: number | null;
  batteryTemperatureCelsius?: number | null;
  drivingMode?: "city" | "highway" | string | null;
  energyConsumedKwh?: number | null;
  energyRegeneratedKwh?: number | null;
  distanceKm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  phase?: "pre_warning" | "at_event" | "post_warning" | string | null;
  isSynthetic?: boolean;
}

export interface RecentEventCounts {
  info: number;
  warning: number;
  critical: number;
  total: number;
}

export interface VehicleSummaryResponse {
  vehicleId: string | null;
  vin: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  status: VehicleStatusType | string | null;
  batteryPercentage: number | null; // Unit: % (0.0 to 100.0)
  batteryTemperature: number | null; // Unit: °C
  totalDistanceKm: number | null; // Unit: km
  energyConsumptionKwh: number | null; // Unit: kWh
  recentEventCounts: RecentEventCounts;
  latestTelemetry?: TelemetrySnapshot | null;
  lastMeasurementTime?: string | null;
  isLive?: boolean;
  isSynthetic?: boolean;
  dataSource?: string;
  dataQualityNotes?: string | null;
}

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  status: VehicleStatusType;
  batteryLevel?: number;
  odometer?: number;
  lastSeen: string; // ISO-8601
  isSynthetic?: boolean;
}

export type EventType =
  | "diagnostic"
  | "alert"
  | "maintenance"
  | "geofence"
  | "battery"
  | "system"
  | "adas_disengagement";

export type EventSeverity = "info" | "warning" | "critical";

export interface VehicleEvent {
  id: string;
  vehicleId: string;
  tripId?: string | null;
  relatedEventId?: string | null;
  dtcCode?: string | null;
  type: EventType | string;
  severity: EventSeverity;
  message: string;
  timestamp: string; // ISO-8601
  metadata?: Record<string, unknown> | null;
  isSynthetic?: boolean;
}

export interface PaginatedEventsResponse {
  items: VehicleEvent[];
  total: number;
  limit: number;
  offset: number;
}

export interface EventTimeWindow {
  beforeMinutes: number;
  afterMinutes: number;
  windowStart: string; // ISO-8601
  windowEnd: string; // ISO-8601
}

export interface EventTimelineDetailResponse {
  event: VehicleEvent;
  timestamp: string;
  timeWindow: EventTimeWindow;
  relatedEvents: VehicleEvent[];
  relatedTelemetry: TelemetrySnapshot[];
  preEventTelemetry?: TelemetrySnapshot[];
  postEventTelemetry?: TelemetrySnapshot[];
  preEventEvents?: VehicleEvent[];
  postEventEvents?: VehicleEvent[];
  causationDisclaimer?: string;
}

export interface DrivingModeEnergyMetric {
  drivingMode: "city" | "highway" | string;
  energyMetricUnit: string; // "kWh/100 km"
  consumptionPer100km: number | null;
  totalEnergyConsumedKwh: number;
  totalEnergyRegeneratedKwh: number;
  netEnergyConsumedKwh: number;
  totalDistanceKm: number;
  averageSpeedKmh: number;
  efficiencyScorePercent: number;
}

export interface EnergyAnalyticsResponse {
  groupBy: "driving_mode" | string;
  metricDefinition: string;
  breakdown: DrivingModeEnergyMetric[];
  summary: Record<string, unknown>;
  warnings?: string[];
  comparison?: Record<string, unknown>;
}

export interface EnergyDataPoint {
  timestamp: string;
  consumed: number;
  regenerated: number;
}

export interface QueryRequest {
  question: string;
}

export interface QueryResponse {
  question: string;
  answer: string;
  intent: string;
  data: Record<string, unknown>;
  sources: string[];
  warnings: string[];
  reply?: string; // Compatibility helper
}

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  totalAlerts: number;
  avgBatteryLevel: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  intent?: string;
  data?: Record<string, unknown>;
  sources?: string[];
  warnings?: string[];
}
