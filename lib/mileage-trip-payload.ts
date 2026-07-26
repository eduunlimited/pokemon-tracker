import { prisma } from "@/lib/db";
import { mapLocation, mapLocationSegment, parseDateInput } from "@/lib/mappers";
import { calculateRoute } from "@/lib/mileage-routes";
import type { NewMileageTrip } from "@/lib/types";

export class MileageTripValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MileageTripValidationError";
  }
}

export async function buildMileageTripWriteData(body: NewMileageTrip) {
  let miles = body.miles;
  let routeSummary = body.routeSummary;
  const mode = body.mode ?? "manual";

  if (mode === "route" && body.locationPath && body.locationPath.length >= 2) {
    const [locations, segments] = await Promise.all([
      prisma.location.findMany(),
      prisma.locationSegment.findMany(),
    ]);

    const calculation = calculateRoute(
      body.locationPath,
      locations.map(mapLocation),
      segments.map(mapLocationSegment),
    );

    if (calculation.missingLegs.length > 0) {
      const missing = calculation.missingLegs
        .map((leg) => `${leg.fromName} → ${leg.toName}`)
        .join(", ");
      throw new MileageTripValidationError(
        `Missing segment distances for: ${missing}`,
      );
    }

    miles = calculation.totalMiles ?? body.miles;
    routeSummary = calculation.routeSummary;
  }

  return {
    date: parseDateInput(body.date),
    purpose: body.purpose,
    miles,
    mode,
    locationPath:
      mode === "route" && body.locationPath
        ? JSON.stringify(body.locationPath)
        : null,
    routeSummary: mode === "route" ? (routeSummary ?? null) : null,
    notes: body.notes ?? null,
  };
}
