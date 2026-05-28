import type {
  AppSettings,
  Expense,
  Location,
  LocationSegment,
  MileageTrip,
  NewExpense,
  NewLocation,
  NewMileageTrip,
} from "@/lib/types";
import type { ReceiptExtraction } from "@/lib/ocr";
import type { RouteCalculation } from "@/lib/mileage-routes";

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }
  return response.json() as Promise<T>;
}

export const api = {
  getExpenses: () => request<Expense[]>("/api/expenses"),
  createExpense: (expense: NewExpense) =>
    request<Expense>("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    }),
  deleteExpense: (id: string) =>
    request<{ success: true }>(`/api/expenses/${id}`, { method: "DELETE" }),

  getTrips: () => request<MileageTrip[]>("/api/mileage"),
  createTrip: (trip: NewMileageTrip) =>
    request<MileageTrip>("/api/mileage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trip),
    }),
  deleteTrip: (id: string) =>
    request<{ success: true }>(`/api/mileage/${id}`, { method: "DELETE" }),

  calculateRoute: (locationIds: string[]) =>
    request<RouteCalculation>("/api/mileage/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationIds }),
    }),

  getLocations: () => request<Location[]>("/api/locations"),
  createLocation: (location: NewLocation) =>
    request<Location>("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(location),
    }),
  deleteLocation: (id: string) =>
    request<{ success: true }>(`/api/locations/${id}`, { method: "DELETE" }),

  getLocationSegments: () => request<LocationSegment[]>("/api/location-segments"),
  upsertLocationSegment: (input: {
    fromLocationId: string;
    toLocationId: string;
    miles: number;
  }) =>
    request<LocationSegment>("/api/location-segments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),

  getSettings: () => request<AppSettings>("/api/settings"),
  updateSettings: (settings: Partial<AppSettings>) =>
    request<AppSettings>("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    }),

  scanReceipt: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<ReceiptExtraction>("/api/receipts/scan", {
      method: "POST",
      body: formData,
    });
  },
};
