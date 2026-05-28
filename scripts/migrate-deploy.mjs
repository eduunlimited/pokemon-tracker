/**
 * Applies Prisma migrations locally (file:) or on Turso (libsql://).
 * Prisma CLI migrate deploy only accepts file: URLs for the sqlite provider.
 */
import { createClient } from "@libsql/client";
import { createHash, randomUUID } from "node:crypto";
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadDotEnv() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) {
      continue;
    }
    const eq = line.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    if (process.env[key]) {
      continue;
    }
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function buildLibsqlUrl(baseUrl, authToken) {
  if (!authToken || baseUrl.includes("authToken=")) {
    return baseUrl;
  }
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}authToken=${authToken}`;
}

function resolveDatabaseUrl() {
  const direct = process.env.DATABASE_URL?.trim();
  if (direct && !direct.startsWith("file:")) {
    return direct;
  }

  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  if (tursoUrl) {
    return buildLibsqlUrl(tursoUrl, process.env.TURSO_AUTH_TOKEN?.trim());
  }

  return direct ?? "";
}

function parseLibsqlConfig(databaseUrl) {
  const questionIndex = databaseUrl.indexOf("?");
  if (questionIndex === -1) {
    return {
      url: databaseUrl,
      authToken: process.env.TURSO_AUTH_TOKEN?.trim(),
    };
  }

  const base = databaseUrl.slice(0, questionIndex);
  const params = new URLSearchParams(databaseUrl.slice(questionIndex + 1));
  return {
    url: base,
    authToken:
      params.get("authToken") ?? process.env.TURSO_AUTH_TOKEN?.trim() ?? undefined,
  };
}

async function migrateTurso(databaseUrl) {
  const config = parseLibsqlConfig(databaseUrl);
  const client = createClient(config);
  const migrationsDir = join(process.cwd(), "prisma", "migrations");

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);

  const applied = await client.execute(
    'SELECT "migration_name" FROM "_prisma_migrations" WHERE "finished_at" IS NOT NULL',
  );
  const appliedNames = new Set(
    applied.rows.map((row) => String(row.migration_name)),
  );

  const folders = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const folder of folders) {
    const sqlPath = join(migrationsDir, folder, "migration.sql");
    if (!existsSync(sqlPath)) {
      continue;
    }

    if (appliedNames.has(folder)) {
      console.log(`Skipping already applied migration: ${folder}`);
      continue;
    }

    const sql = readFileSync(sqlPath, "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const id = randomUUID();

    console.log(`Applying Turso migration: ${folder}`);
    await client.executeMultiple(sql);
    await client.execute({
      sql: `INSERT INTO "_prisma_migrations"
        ("id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count")
        VALUES (?, ?, datetime('now'), ?, datetime('now'), 1)`,
      args: [id, checksum, folder],
    });
  }

  console.log("Turso migrations complete.");
}

function migrateLocal() {
  console.log("Applying local SQLite migrations with Prisma CLI.");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
}

loadDotEnv();

const databaseUrl = resolveDatabaseUrl();

if (!databaseUrl) {
  console.warn("No DATABASE_URL found. Skipping migrations.");
  process.exit(0);
}

if (databaseUrl.startsWith("libsql://")) {
  await migrateTurso(databaseUrl);
} else if (databaseUrl.startsWith("file:")) {
  migrateLocal();
} else {
  console.warn(`Unsupported DATABASE_URL scheme. Skipping migrations: ${databaseUrl}`);
}
