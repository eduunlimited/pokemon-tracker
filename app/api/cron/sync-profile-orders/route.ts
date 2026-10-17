import { NextResponse } from "next/server";
import { syncProfileOrders } from "@/lib/profile-order-sync";
import { seedDatabaseIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    await seedDatabaseIfEmpty();
    const result = await syncProfileOrders();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Profile order sync failed:", error);
    return NextResponse.json(
      { message: "Could not sync Profile Generator orders." },
      { status: 502 },
    );
  }
}
