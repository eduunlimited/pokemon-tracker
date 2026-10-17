import { NextResponse } from "next/server";
import { syncProfileOrders } from "@/lib/profile-order-sync";
import { seedDatabaseIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await seedDatabaseIfEmpty();
    const result = await syncProfileOrders();
    if (result.skipped) {
      const message =
        result.reason === "missing-api-key"
          ? "Enter an API key first."
          : "The orders API address is not configured.";
      return NextResponse.json({ message }, { status: 400 });
    }

    return NextResponse.json({
      ...result,
      message: `Synced ${result.created} new, ${result.updated} updated, ${result.removed} removed.`,
    });
  } catch (error) {
    console.error("Profile order sync failed:", error);
    const message = error instanceof Error ? error.message : "Could not sync Profile Generator orders.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
