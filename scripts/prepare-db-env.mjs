/**
 * Sets DATABASE_URL from Turso/Vercel env vars before prisma migrate deploy.
 */
function buildLibsqlUrl(baseUrl, authToken) {
  if (!authToken || baseUrl.includes("authToken=")) {
    return baseUrl;
  }
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}authToken=${authToken}`;
}

const direct = process.env.DATABASE_URL?.trim();
const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (tursoUrl && (!direct || direct.startsWith("file:"))) {
  process.env.DATABASE_URL = buildLibsqlUrl(tursoUrl, tursoToken);
  console.log("Using TURSO_DATABASE_URL for Prisma migrations.");
} else if (direct?.startsWith("libsql://")) {
  console.log("Using DATABASE_URL for Prisma migrations.");
} else if (direct?.startsWith("file:")) {
  console.log("Using local SQLite for Prisma migrations.");
} else {
  console.warn(
    "No Turso DATABASE_URL found. Skipping remote DB setup (local file: or missing env).",
  );
}
