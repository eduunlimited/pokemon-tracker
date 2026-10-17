import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createProfileOrderJob,
  finishProfileOrderJob,
  readProfileOrderJob,
  type ProfileOrderJobAction,
} from "@/lib/profile-order-job";
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

export async function GET() {
  await seedDatabaseIfEmpty();
  return NextResponse.json(await readProfileOrderJob());
}

export async function POST(request: Request) {
  await seedDatabaseIfEmpty();
  const body = (await request.json().catch(() => null)) as {
    action?: unknown;
    status?: unknown;
    message?: unknown;
  } | null;
  const token = bearerToken(request);

  if (token) {
    const settings = await prisma.appSetting.findUnique({ where: { id: "default" } });
    const expected = settings?.profileGeneratorApiKey?.trim() ?? "";
    if (!expected || !tokenMatches(token, expected)) {
      return NextResponse.json({ message: "Missing or invalid API key." }, { status: 401 });
    }
    const message = typeof body?.message === "string" ? body.message : "Profile Generator could not send orders.";
    await finishProfileOrderJob(message, body?.status === "done" ? "done" : "error");
    return NextResponse.json(await readProfileOrderJob());
  }

  const action = body?.action === "sync" ? "sync" : body?.action === "test" ? "test" : null;
  if (!action) {
    return NextResponse.json({ message: "Choose test or sync." }, { status: 400 });
  }
  return NextResponse.json(await createProfileOrderJob(action as ProfileOrderJobAction));
}
