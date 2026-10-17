import { NextResponse } from "next/server";
import { testProfileOrderConnection } from "@/lib/profile-order-sync";
import { seedDatabaseIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await seedDatabaseIfEmpty();
    const result = await testProfileOrderConnection();
    return NextResponse.json(
      { message: result.message, count: result.count },
      { status: result.ok ? 200 : 400 },
    );
  } catch (error) {
    console.error("Profile order connection test failed:", error);
    return NextResponse.json(
      { message: "Could not reach the Profile Generator orders API." },
      { status: 502 },
    );
  }
}
