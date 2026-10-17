import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { finishProfileOrderJob } from "@/lib/profile-order-job";
import { importPushedOrders } from "@/lib/profile-order-sync";
import { seedDatabaseIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

function tokenMatches(presented: string, expected: string): boolean {
  const left = Buffer.from(presented);
  const right = Buffer.from(expected);
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function bearerToken(request: Request): string {
  const match = /^Bearer\s+(\S+)\s*$/i.exec(request.headers.get("authorization") ?? "");
  return match?.[1] ?? "";
}

export async function POST(request: Request) {
  try {
    await seedDatabaseIfEmpty();
    const settings = await prisma.appSetting.findUnique({ where: { id: "default" } });
    const expected = settings?.profileGeneratorApiKey?.trim() ?? "";
    if (!expected || !tokenMatches(bearerToken(request), expected)) {
      return NextResponse.json({ message: "Missing or invalid API key." }, { status: 401 });
    }

    const body = (await request.json()) as { probe?: unknown; orders?: unknown };
    if (body.probe === true) {
      const message = "Connected. Pokemon Tracker can store orders.";
      await finishProfileOrderJob(message, "done");
      return NextResponse.json({ message });
    }
    if (!Array.isArray(body.orders)) {
      return NextResponse.json({ message: "Orders are required." }, { status: 400 });
    }

    const result = await importPushedOrders(body.orders);
    const message = `Stored ${result.created} new, ${result.updated} updated, ${result.removed} removed.`;
    await finishProfileOrderJob(message, "done");
    return NextResponse.json({
      ...result,
      message,
    });
  } catch (error) {
    console.error("Profile order import failed:", error);
    return NextResponse.json({ message: "Could not store Profile Generator orders." }, { status: 500 });
  }
}
