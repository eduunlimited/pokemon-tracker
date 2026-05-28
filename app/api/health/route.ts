import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLibsqlClientConfig, resolveDatabaseUrl } from "@/lib/database-url";

export async function GET() {
  const resolvedUrl = resolveDatabaseUrl();
  const dbKind = resolvedUrl.startsWith("libsql://")
    ? "turso"
    : resolvedUrl.startsWith("file:")
      ? "local"
      : resolvedUrl
        ? "other"
        : "missing";

  if (!resolvedUrl) {
    return NextResponse.json(
      {
        ok: false,
        db: "missing",
        message:
          "No database URL found. Set DATABASE_URL or TURSO_DATABASE_URL + TURSO_AUTH_TOKEN in Vercel.",
      },
      { status: 503 },
    );
  }

  try {
    await prisma.appSetting.findUnique({ where: { id: "default" } });
    return NextResponse.json({
      ok: true,
      db: dbKind,
      libsql: Boolean(getLibsqlClientConfig()),
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    return NextResponse.json(
      {
        ok: false,
        db: dbKind,
        message:
          dbKind === "turso"
            ? "Turso URL is set but the database is not reachable or migrations were not applied. Run prisma migrate deploy against Turso."
            : "Database connection failed.",
      },
      { status: 503 },
    );
  }
}
