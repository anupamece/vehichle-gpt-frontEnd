import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EnergyDataPoint } from "../../types/vehicle";

interface EnergyChartProps {
  data: EnergyDataPoint[];
}

export default function EnergyChart({ data }: EnergyChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">
          Energy Consumption
        </h3>
        <p className="text-sm text-zinc-500">No energy data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">
        Energy Consumption
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="consumed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f57c20" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#f57c20" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="regenerated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="timestamp"
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            unit=" kWh"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="consumed"
            stroke="#f57c20"
            fill="url(#consumed)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="regenerated"
            stroke="#34d399"
            fill="url(#regenerated)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
