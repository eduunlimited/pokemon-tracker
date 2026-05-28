/**
 * Combines Turso/Vercel env vars into DATABASE_URL for Prisma CLI (migrate deploy).
 * Vercel Turso integration often sets TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
 * instead of a single DATABASE_URL.
 */
function buildLibsqlUrl(baseUrl: string, authToken?: string): string {
  if (!authToken || baseUrl.includes("authToken=")) {
    return baseUrl;
  }
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}authToken=${authToken}`;
}

export function resolveDatabaseUrl(): string {
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

export function getLibsqlClientConfig(): { url: string; authToken?: string } | null {
  const resolved = resolveDatabaseUrl();
  if (!resolved.startsWith("libsql://")) {
    return null;
  }

  const questionIndex = resolved.indexOf("?");
  if (questionIndex === -1) {
    return {
      url: resolved,
      authToken: process.env.TURSO_AUTH_TOKEN?.trim(),
    };
  }

  const base = resolved.slice(0, questionIndex);
  const params = new URLSearchParams(resolved.slice(questionIndex + 1));
  const authToken =
    params.get("authToken") ?? process.env.TURSO_AUTH_TOKEN?.trim() ?? undefined;

  return { url: base, authToken };
}
