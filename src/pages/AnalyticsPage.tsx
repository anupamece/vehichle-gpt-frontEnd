import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { fetchDrivingModeEnergy } from "../api/vehicleApi";
import type { EnergyAnalyticsResponse } from "../types/vehicle";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<EnergyAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const energyData = await fetchDrivingModeEnergy("driving_mode");
      setAnalytics(energyData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load energy analytics.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <LoadingState message="Calculating energy analytics and efficiency metrics…" />;
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState message={error} onRetry={() => void load()} />
      </div>
    );
  }

  if (!analytics || analytics.breakdown.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
        <p className="text-sm font-medium text-zinc-400">
          No energy consumption data available to analyze.
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-500"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  // Bar chart dataset: Normalized kWh/100km
  const rateChartData = analytics.breakdown.map((item) => ({
    mode: item.drivingMode.toUpperCase(),
    rate: item.consumptionPer100km ?? 0,
    unit: item.energyMetricUnit,
  }));

  // Bar chart dataset: Energy Consumed vs Regenerated (kWh)
  const balanceChartData = analytics.breakdown.map((item) => ({
    mode: item.drivingMode.toUpperCase(),
    consumed: item.totalEnergyConsumedKwh,
    regenerated: item.totalEnergyRegeneratedKwh,
    net: item.netEnergyConsumedKwh,
  }));

  const comparison = analytics.comparison;

  return (
    <div className="space-y-6">
      {/* Metric Standard & Definition Header */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Automotive Energy Consumption & Normalized Efficiency
            </h2>
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
              {analytics.metricDefinition}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-1.5 self-start rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-orange-500/60 hover:text-orange-400 sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Recalculate
          </button>
        </div>
      </div>

      {/* Comparative Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analytics.breakdown.map((b) => (
          <div
            key={b.drivingMode}
            className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5"
          >
            <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              {b.drivingMode} Consumption
            </span>
            <p className="mt-1 text-2xl font-bold text-white">
              {b.consumptionPer100km != null ? b.consumptionPer100km.toFixed(2) : "—"}{" "}
              <span className="text-sm font-normal text-zinc-400">
                {b.energyMetricUnit}
              </span>
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/80 pt-2">
              <span>Regen Recovery:</span>
              <span className="font-semibold text-emerald-400">
                {b.efficiencyScorePercent.toFixed(1)}%
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-zinc-400">
              <span>Total Distance:</span>
              <span className="font-medium text-zinc-300">
                {b.totalDistanceKm.toLocaleString()} km
              </span>
            </div>
          </div>
        ))}

        {/* Delta Card */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Highway vs City Variance
          </span>
          <p className="mt-1 text-2xl font-bold text-amber-400">
            {comparison?.consumption_delta_kwh_per_100km != null
              ? `+${comparison.consumption_delta_kwh_per_100km} kWh/100 km`
              : "—"}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/80 pt-2">
            <span>Excess Consumption:</span>
            <span className="font-semibold text-amber-300">
              {comparison?.highway_consumption_increase_percent != null
                ? `+${comparison.highway_consumption_increase_percent}%`
                : "—"}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-zinc-400">
            <span>Efficiency Leader:</span>
            <span className="font-bold uppercase text-emerald-400">
              {String(comparison?.more_efficient_mode ?? "city")}
            </span>
          </div>
        </div>

        {/* Total Energy Analyzed */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Fleet Aggregate Rate
          </span>
          <p className="mt-1 text-2xl font-bold text-orange-400">
            {analytics.summary?.fleet_avg_kwh_per_100km != null
              ? `${analytics.summary.fleet_avg_kwh_per_100km} kWh/100 km`
              : "—"}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/80 pt-2">
            <span>Valid Trips Analyzed:</span>
            <span className="font-medium text-zinc-300">
              {String(comparison?.valid_trips_analyzed ?? analytics.summary?.valid_trips ?? "—")}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-zinc-400">
            <span>Excluded Trips:</span>
            <span className="font-medium text-zinc-300">
              {String(comparison?.excluded_trips_count ?? analytics.summary?.excluded_trips ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Section: 2 Columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Normalized kWh / 100 km comparison */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-200">
              Normalized Consumption Rate (kWh/100 km)
            </h3>
            <p className="text-xs text-zinc-500">
              Lower is more efficient. City reflects high regenerative braking; highway reflects aerodynamic drag.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={rateChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="mode" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <YAxis unit=" kWh" tick={{ fill: "#71717a", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(val) => [`${Number(val).toFixed(2)} kWh/100 km`, "Normalized Rate"]}
              />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                {rateChartData.map((entry) => (
                  <Cell
                    key={entry.mode}
                    fill={entry.mode.toLowerCase() === "city" ? "#34d399" : "#f57c20"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Consumed vs Regenerated Energy Balance (kWh) */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-200">
              Total Energy Consumed vs. Regenerated (kWh)
            </h3>
            <p className="text-xs text-zinc-500">
              Cumulative gross kilowatt-hours consumed vs regenerative braking energy recovered.
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={balanceChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="mode" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <YAxis unit=" kWh" tick={{ fill: "#71717a", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(val, name) => [
                  `${Number(val).toLocaleString()} kWh`,
                  name === "consumed" ? "Energy Consumed" : "Energy Regenerated",
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                formatter={(v) => (v === "consumed" ? "Consumed (kWh)" : "Regenerated (kWh)")}
              />
              <Bar dataKey="consumed" fill="#f57c20" radius={[4, 4, 0, 0]} />
              <Bar dataKey="regenerated" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Mode Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-900/70 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Driving Mode
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Rate (kWh/100 km)
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Total Consumed
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Regenerated
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Net Energy
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Distance
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Avg Speed
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Regen Recovery
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
            {analytics.breakdown.map((row) => (
              <tr key={row.drivingMode} className="transition hover:bg-zinc-800/40">
                <td className="whitespace-nowrap px-4 py-3 font-sans font-bold capitalize text-white">
                  {row.drivingMode}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-bold text-orange-400">
                  {row.consumptionPer100km != null ? row.consumptionPer100km.toFixed(2) : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-300">
                  {row.totalEnergyConsumedKwh.toLocaleString()} kWh
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-emerald-400">
                  {row.totalEnergyRegeneratedKwh.toLocaleString()} kWh
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-300">
                  {row.netEnergyConsumedKwh.toLocaleString()} kWh
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-300">
                  {row.totalDistanceKm.toLocaleString()} km
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-300">
                  {row.averageSpeedKmh.toFixed(1)} km/h
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-sans font-semibold text-emerald-400">
                  {row.efficiencyScorePercent.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Data Quality & Diagnostics Warnings */}
      {analytics.warnings && analytics.warnings.length > 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Data Validation & Outlier Exclusions ({analytics.warnings.length})
              </p>
              <ul className="list-disc pl-4 text-xs text-amber-200/90 space-y-0.5">
                {analytics.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>All telemetry points and trip segments passed distance and energy validation rules without exclusions.</span>
        </div>
      )}
    </div>
  );
}
