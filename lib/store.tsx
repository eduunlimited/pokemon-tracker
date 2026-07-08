"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { calculateDashboardSummary } from "@/lib/calculations";
import type {
  AppSettings,
  DashboardSummary,
  Expense,
  Location,
  LocationSegment,
  MileageTrip,
  NewExpense,
  NewLocation,
  NewMileageTrip,
} from "@/lib/types";

interface AppStore {
  expenses: Expense[];
  trips: MileageTrip[];
  locations: Location[];
  locationSegments: LocationSegment[];
  settings: AppSettings;
  summary: DashboardSummary;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshLocations: () => Promise<void>;
  addExpense: (expense: NewExpense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addTrip: (trip: NewMileageTrip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  addLocation: (location: NewLocation) => Promise<Location>;
  deleteLocation: (id: string) => Promise<void>;
  upsertLocationSegment: (input: {
    fromLocationId: string;
    toLocationId: string;
    miles: number;
  }) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

const defaultSettings: AppSettings = {
  mileageRate: 0.67,
  collectrInventoryValue: 0,
};

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [trips, setTrips] = useState<MileageTrip[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationSegments, setLocationSegments] = useState<LocationSegment[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLocations = useCallback(async () => {
    const [nextLocations, nextSegments] = await Promise.all([
      api.getLocations(),
      api.getLocationSegments(),
    ]);
    setLocations(nextLocations);
    setLocationSegments(nextSegments);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesResult, tripsResult, settingsResult] =
        await Promise.allSettled([
          api.getExpenses(),
          api.getTrips(),
          api.getSettings(),
        ]);

      const failures: string[] = [];

      if (expensesResult.status === "fulfilled") {
        setExpenses(expensesResult.value);
      } else {
        failures.push("expenses");
      }

      if (tripsResult.status === "fulfilled") {
        setTrips(tripsResult.value);
      } else {
        failures.push("mileage");
      }

      if (settingsResult.status === "fulfilled") {
        setSettings(settingsResult.value);
      } else {
        failures.push("settings");
      }

      try {
        await refreshLocations();
      } catch {
        // Location data is optional for the dashboard.
      }

      if (failures.length === 3) {
        setError(
          "Could not connect to the database. In Vercel, set DATABASE_URL or connect Turso (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN), then redeploy.",
        );
      } else if (failures.length > 0) {
        setError(`Some data could not be loaded (${failures.join(", ")}).`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [refreshLocations]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary = useMemo(
    () => calculateDashboardSummary(expenses, trips, settings),
    [expenses, trips, settings],
  );

  const value = useMemo<AppStore>(
    () => ({
      expenses,
      trips,
      locations,
      locationSegments,
      settings,
      summary,
      loading,
      error,
      refresh,
      refreshLocations,
      addExpense: async (expense) => {
        const created = await api.createExpense(expense);
        setExpenses((current) => [created, ...current]);
      },
      deleteExpense: async (id) => {
        await api.deleteExpense(id);
        setExpenses((current) => current.filter((expense) => expense.id !== id));
      },
      addTrip: async (trip) => {
        const created = await api.createTrip(trip);
        setTrips((current) => [created, ...current]);
      },
      deleteTrip: async (id) => {
        await api.deleteTrip(id);
        setTrips((current) => current.filter((trip) => trip.id !== id));
      },
      addLocation: async (location) => {
        const created = await api.createLocation(location);
        await refreshLocations();
        return created;
      },
      deleteLocation: async (id) => {
        await api.deleteLocation(id);
        await refreshLocations();
      },
      upsertLocationSegment: async (input) => {
        await api.upsertLocationSegment(input);
        await refreshLocations();
      },
      updateSettings: async (updates) => {
        const updated = await api.updateSettings(updates);
        setSettings(updated);
        setError(null);
      },
    }),
    [
      expenses,
      trips,
      locations,
      locationSegments,
      settings,
      summary,
      loading,
      error,
      refresh,
      refreshLocations,
    ],
  );

  return (
    <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return context;
}
