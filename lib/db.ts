import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function parseLibsqlUrl(databaseUrl: string): { url: string; authToken?: string } {
  const questionIndex = databaseUrl.indexOf("?");
  if (questionIndex === -1) {
    return { url: databaseUrl, authToken: process.env.TURSO_AUTH_TOKEN };
  }

  const base = databaseUrl.slice(0, questionIndex);
  const params = new URLSearchParams(databaseUrl.slice(questionIndex + 1));
  const authToken = params.get("authToken") ?? process.env.TURSO_AUTH_TOKEN ?? undefined;

  return { url: base, authToken };
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (databaseUrl.startsWith("libsql://")) {
    const { url, authToken } = parseLibsqlUrl(databaseUrl);
    const adapter = new PrismaLibSql({ url, authToken });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
