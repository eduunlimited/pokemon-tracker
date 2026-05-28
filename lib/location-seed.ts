import { prisma } from "@/lib/db";
import { canonicalSegmentIds } from "@/lib/mileage-routes";

export const DEFAULT_LOCATIONS = [
  { name: "Home", isHome: true },
  { name: "Dallas Card Show", isHome: false },
  { name: "USPS Post Office", isHome: false },
  { name: "Local Card Shop", isHome: false },
] as const;

export async function seedLocationsIfEmpty() {
  const count = await prisma.location.count();
  if (count > 0) {
    return;
  }

  const created = await Promise.all(
    DEFAULT_LOCATIONS.map((location) =>
      prisma.location.create({
        data: {
          name: location.name,
          isHome: location.isHome,
        },
      }),
    ),
  );

  const byName = new Map(created.map((location) => [location.name, location.id]));
  const homeId = byName.get("Home");
  const dallasId = byName.get("Dallas Card Show");
  const uspsId = byName.get("USPS Post Office");
  const shopId = byName.get("Local Card Shop");

  if (!homeId || !dallasId || !uspsId || !shopId) {
    return;
  }

  const segmentData = [
    { fromId: homeId, toId: uspsId, miles: 12 },
    { fromId: homeId, toId: dallasId, miles: 43 },
    { fromId: homeId, toId: shopId, miles: 8 },
    { fromId: uspsId, toId: dallasId, miles: 38 },
    { fromId: shopId, toId: uspsId, miles: 15 },
  ];

  await prisma.locationSegment.createMany({
    data: segmentData.map(({ fromId, toId, miles }) => ({
      ...canonicalSegmentIds(fromId, toId),
      miles,
    })),
  });
}
