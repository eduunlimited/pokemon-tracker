import type { Location, LocationSegment } from "@/lib/types";

export function canonicalSegmentIds(
  fromId: string,
  toId: string,
): { locationAId: string; locationBId: string } {
  if (fromId === toId) {
    throw new Error("A location cannot connect to itself");
  }

  return fromId < toId
    ? { locationAId: fromId, locationBId: toId }
    : { locationAId: toId, locationBId: fromId };
}

export function findSegmentMiles(
  fromId: string,
  toId: string,
  segments: LocationSegment[],
): number | null {
  const { locationAId, locationBId } = canonicalSegmentIds(fromId, toId);
  const segment = segments.find(
    (item) =>
      item.locationAId === locationAId && item.locationBId === locationBId,
  );
  return segment?.miles ?? null;
}

export interface RouteLeg {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  miles: number | null;
}

export interface RouteCalculation {
  legs: RouteLeg[];
  totalMiles: number | null;
  missingLegs: RouteLeg[];
  routeSummary: string;
}

export function calculateRoute(
  locationIds: string[],
  locations: Location[],
  segments: LocationSegment[],
): RouteCalculation {
  const locationMap = new Map(locations.map((location) => [location.id, location]));
  const names = locationIds
    .map((id) => locationMap.get(id)?.name)
    .filter(Boolean) as string[];

  const legs: RouteLeg[] = [];
  const missingLegs: RouteLeg[] = [];

  for (let index = 0; index < locationIds.length - 1; index += 1) {
    const fromId = locationIds[index];
    const toId = locationIds[index + 1];
    const fromName = locationMap.get(fromId)?.name ?? "Unknown";
    const toName = locationMap.get(toId)?.name ?? "Unknown";
    const miles = findSegmentMiles(fromId, toId, segments);

    const leg: RouteLeg = { fromId, toId, fromName, toName, miles };
    legs.push(leg);
    if (miles === null) {
      missingLegs.push(leg);
    }
  }

  const totalMiles =
    missingLegs.length === 0
      ? legs.reduce((sum, leg) => sum + (leg.miles ?? 0), 0)
      : null;

  return {
    legs,
    totalMiles,
    missingLegs,
    routeSummary: names.join(" → "),
  };
}

export function buildRoundTripPath(
  stopIds: string[],
  homeId: string,
): string[] {
  if (stopIds.length === 0) {
    return [homeId, homeId];
  }

  const first = stopIds[0];
  const last = stopIds[stopIds.length - 1];

  if (first === homeId && last === homeId) {
    return stopIds;
  }

  if (first === homeId) {
    return [...stopIds, homeId];
  }

  if (last === homeId) {
    return [homeId, ...stopIds];
  }

  return [homeId, ...stopIds, homeId];
}
