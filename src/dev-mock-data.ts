/**
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  DEV-ONLY MOCK DATA                                             │
 * │  This module exists solely so the UI can render during           │
 * │  development before the backend is available. It must NOT be    │
 * │  imported from production API code.                              │
 * └──────────────────────────────────────────────────────────────────┘
 */

import type {
  DashboardStats,
  EnergyDataPoint,
  Vehicle,
  VehicleEvent,
} from "./types/vehicle";

export const MOCK_STATS: DashboardStats = {
  totalVehicles: 24,
  activeVehicles: 18,
  totalAlerts: 7,
  avgBatteryLevel: 72,
};

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "v-001",
    vin: "1HGCM82633A004352",
    make: "Tesla",
    model: "Model 3",
    year: 2024,
    status: "driving",
    batteryLevel: 78,
    odometer: 14320,
    lastSeen: "2026-10-20T04:55:00Z",
  },
  {
    id: "v-002",
    vin: "5YJSA1E26HF000316",
    make: "Rivian",
    model: "R1T",
    year: 2025,
    status: "charging",
    batteryLevel: 42,
    odometer: 8710,
    lastSeen: "2026-10-20T04:50:00Z",
  },
  {
    id: "v-003",
    vin: "WVWZZZ3CZWE012345",
    make: "BMW",
    model: "iX",
    year: 2025,
    status: "online",
    batteryLevel: 91,
    odometer: 3200,
    lastSeen: "2026-10-20T04:52:00Z",
  },
  {
    id: "v-004",
    vin: "1N4AZ1CP5JC302958",
    make: "Nissan",
    model: "Ariya",
    year: 2024,
    status: "idle",
    batteryLevel: 65,
    odometer: 22100,
    lastSeen: "2026-10-20T03:10:00Z",
  },
  {
    id: "v-005",
    vin: "7SAYGDEE4PA000001",
    make: "Hyundai",
    model: "Ioniq 6",
    year: 2025,
    status: "offline",
    batteryLevel: 15,
    odometer: 41600,
    lastSeen: "2026-10-19T22:00:00Z",
  },
];

export const MOCK_EVENTS: VehicleEvent[] = [
  {
    id: "e-001",
    vehicleId: "v-001",
    type: "battery",
    severity: "info",
    message: "Battery level at 78 % — within normal range.",
    timestamp: "2026-10-20T04:55:00Z",
  },
  {
    id: "e-002",
    vehicleId: "v-002",
    type: "alert",
    severity: "warning",
    message: "Tire pressure low on rear-left wheel (28 psi).",
    timestamp: "2026-10-20T04:40:00Z",
  },
  {
    id: "e-003",
    vehicleId: "v-005",
    type: "diagnostic",
    severity: "critical",
    message: "12 V auxiliary battery voltage critically low.",
    timestamp: "2026-10-19T22:01:00Z",
  },
  {
    id: "e-004",
    vehicleId: "v-003",
    type: "geofence",
    severity: "info",
    message: "Vehicle entered designated campus zone.",
    timestamp: "2026-10-20T04:30:00Z",
  },
  {
    id: "e-005",
    vehicleId: "v-004",
    type: "maintenance",
    severity: "warning",
    message: "Cabin air filter replacement due in 500 km.",
    timestamp: "2026-10-20T02:15:00Z",
  },
  {
    id: "e-006",
    vehicleId: "v-001",
    type: "system",
    severity: "info",
    message: "OTA update v4.2.1 installed successfully.",
    timestamp: "2026-10-20T01:00:00Z",
  },
];

export const MOCK_ENERGY: EnergyDataPoint[] = [
  { timestamp: "06:00", consumed: 5.2, regenerated: 0.8 },
  { timestamp: "08:00", consumed: 12.4, regenerated: 1.5 },
  { timestamp: "10:00", consumed: 18.1, regenerated: 3.2 },
  { timestamp: "12:00", consumed: 22.0, regenerated: 4.1 },
  { timestamp: "14:00", consumed: 28.7, regenerated: 5.6 },
  { timestamp: "16:00", consumed: 35.3, regenerated: 7.0 },
  { timestamp: "18:00", consumed: 40.9, regenerated: 8.9 },
  { timestamp: "20:00", consumed: 44.2, regenerated: 10.1 },
];
