import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Battery,
  CarFront,
  Clock,
  Gauge,
  Info,
  RefreshCw,
  Zap,
} from "lucide-react";
import {
  fetchDashboardStats,
  fetchEnergyData,
  fetchEvents,
} from "../api/vehicleApi";
import type {
  DashboardStats,
  EnergyDataPoint,
  VehicleEvent,
} from "../types/vehicle";
import StatCard from "../components/dashboard/StatCard";
import VehicleStatus from "../components/dashboard/VehicleStatus";
import EnergyChart from "../components/dashboard/EnergyChart";
import RecentEvents from "../components/dashboard/RecentEvents";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import { useVehicle } from "../context/VehicleContext";

export default function DashboardPage() {
  const {
    selectedVehicleId,
    setSelectedVehicleId,
    vehicles,
    summary,
    reloadSummary,
  } = useVehicle();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<VehicleEvent[]>([]);
  const [energy, setEnergy] = useState<EnergyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (vId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const targetId = vId || selectedVehicleId;
      const [sRes, evRes, enRes] = await Promise.all([
        fetchDashboardStats(),
        fetchEvents({ limit: 6, vehicle_id: targetId }),
        fetchEnergyData(),
        reloadSummary(targetId),
      ]);

      setStats(sRes);
      setEvents(evRes.items || []);
      setEnergy(enRes || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to VehicleGPT backend.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedVehicleId, reloadSummary]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleVehicleChange = (newId: string) => {
    setSelectedVehicleId(newId);
    void load(newId);
  };

  if (loading) {
    return <LoadingState message="Fetching live vehicle summary and telemetry…" />;
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState message={error} onRetry={() => void load()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Selected Vehicle Telemetry Status */}
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
            <CarFront className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {summary?.make} {summary?.model} ({summary?.year})
              </h2>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {summary?.status ?? "online"}
              </span>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                VIN: {summary?.vin}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                Latest Reading:{" "}
                <span className="font-medium text-zinc-300">
                  {summary?.lastMeasurementTime
                    ? new Date(summary.lastMeasurementTime).toLocaleString()
                    : "Live Stream"}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-zinc-500" />
                Source:{" "}
                <span className="font-medium text-zinc-300">
                  {summary?.isSynthetic ? "Historical Simulation" : "Live CAN Bus"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Selector & Refresh Action */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {vehicles.length > 0 && (
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Switch Vehicle:
              <select
                value={selectedVehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-200 outline-none focus:border-orange-500"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.id})
                  </option>
                ))}
              </select>
            </label>
          )}

          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-orange-500/60 hover:text-orange-400"
            title="Refresh Telemetry"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Battery State of Charge"
          value={
            summary?.batteryPercentage != null
              ? `${summary.batteryPercentage.toFixed(1)}%`
              : "—"
          }
          icon={<Battery className="h-5 w-5" />}
          accent="text-orange-400"
        />
        <StatCard
          label="Battery Pack Temp"
          value={
            summary?.batteryTemperature != null
              ? `${summary.batteryTemperature.toFixed(1)}°C`
              : "—"
          }
          icon={<Gauge className="h-5 w-5" />}
          accent={
            (summary?.batteryTemperature ?? 0) > 45
              ? "text-red-400"
              : "text-emerald-400"
          }
        />
        <StatCard
          label="Total Distance"
          value={
            summary?.totalDistanceKm != null
              ? `${summary.totalDistanceKm.toLocaleString()} km`
              : "—"
          }
          icon={<Activity className="h-5 w-5" />}
          accent="text-blue-400"
        />
        <StatCard
          label="Cumulative Energy"
          value={
            summary?.energyConsumptionKwh != null
              ? `${summary.energyConsumptionKwh.toLocaleString()} kWh`
              : "—"
          }
          icon={<Zap className="h-5 w-5" />}
          accent="text-amber-400"
        />
      </div>

      {/* Recent Alerts KPI Bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            24h Info Events
          </span>
          <span className="text-lg font-bold text-orange-400">
            {summary?.recentEventCounts?.info ?? 0}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            24h Warning Alerts
          </span>
          <span className="text-lg font-bold text-amber-400">
            {summary?.recentEventCounts?.warning ?? 0}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            24h Critical Alerts
          </span>
          <span className="text-lg font-bold text-red-400">
            {summary?.recentEventCounts?.critical ?? 0}
          </span>
        </div>
      </div>

      {/* Main Content Grid: Energy Chart & Recent Events */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EnergyChart data={energy} />
        </div>
        <div>
          <RecentEvents events={events} />
        </div>
      </div>

      {/* Fleet Overview Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <VehicleStatus vehicles={vehicles} />
        {stats && (
          <div className="flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">
              Fleet Level Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-zinc-800/40 p-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Fleet Vehicles</p>
                <p className="mt-1 text-2xl font-bold text-white">{stats.totalVehicles}</p>
              </div>
              <div className="rounded-lg bg-zinc-800/40 p-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Active In Operation</p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.activeVehicles}</p>
              </div>
              <div className="rounded-lg bg-zinc-800/40 p-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Fleet Open Alerts</p>
                <p className="mt-1 text-2xl font-bold text-amber-400">{stats.totalAlerts}</p>
              </div>
              <div className="rounded-lg bg-zinc-800/40 p-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Fleet Avg Battery</p>
                <p className="mt-1 text-2xl font-bold text-orange-400">{stats.avgBatteryLevel}%</p>
              </div>
            </div>
            {summary?.dataQualityNotes && (
              <p className="mt-4 text-xs text-zinc-500">
                * {summary.dataQualityNotes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
