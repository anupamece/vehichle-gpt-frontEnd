import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchVehicles, fetchVehicleSummary } from "../api/vehicleApi";
import type { Vehicle, VehicleSummaryResponse } from "../types/vehicle";

interface VehicleContextType {
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  selectedVehicle: Vehicle | null;
  vehicles: Vehicle[];
  summary: VehicleSummaryResponse | null;
  loading: boolean;
  error: string | null;
  reloadSummary: (vehicleId?: string) => Promise<void>;
  estimatedRangeKm: number;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

const STORAGE_KEY = "vehiclegpt_active_vehicle_id";

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [selectedVehicleId, setSelectedVehicleIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || "v-001";
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [summary, setSummary] = useState<VehicleSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setSelectedVehicleId = useCallback((id: string) => {
    setSelectedVehicleIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const loadVehicles = useCallback(async () => {
    try {
      const list = await fetchVehicles();
      setVehicles(list);
      // If current selectedVehicleId is not in list and list has items, default to first
      if (list.length > 0 && !list.some((v) => v.id === selectedVehicleId)) {
        setSelectedVehicleId(list[0].id);
      }
    } catch {
      // Keep existing list or fail gracefully
    }
  }, [selectedVehicleId, setSelectedVehicleId]);

  const reloadSummary = useCallback(
    async (vehicleId?: string) => {
      const targetId = vehicleId || selectedVehicleId;
      setLoading(true);
      setError(null);
      try {
        const sum = await fetchVehicleSummary(targetId);
        setSummary(sum);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to fetch vehicle telemetry summary.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [selectedVehicleId],
  );

  useEffect(() => {
    void loadVehicles();
  }, [loadVehicles]);

  useEffect(() => {
    void reloadSummary(selectedVehicleId);
  }, [selectedVehicleId, reloadSummary]);

  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || null;

  // Compute estimated range based on actual battery SoC and vehicle specs
  const batteryPercent = summary?.batteryPercentage ?? 78;
  const maxRangeKm = selectedVehicle?.model?.toLowerCase().includes("r1t")
    ? 505
    : selectedVehicle?.model?.toLowerCase().includes("ix")
    ? 490
    : selectedVehicle?.model?.toLowerCase().includes("ioniq")
    ? 480
    : 430; // Tesla Model 3 standard / baseline
  const estimatedRangeKm = Math.round((batteryPercent / 100) * maxRangeKm);

  return (
    <VehicleContext.Provider
      value={{
        selectedVehicleId,
        setSelectedVehicleId,
        selectedVehicle,
        vehicles,
        summary,
        loading,
        error,
        reloadSummary,
        estimatedRangeKm,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle(): VehicleContextType {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error("useVehicle must be used within a VehicleProvider");
  }
  return context;
}
