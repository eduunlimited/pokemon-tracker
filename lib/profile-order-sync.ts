import { prisma } from "@/lib/db";
import { parseDateInput } from "@/lib/mappers";

export const PROFILE_ORDER_CATEGORY = "Online Purchases - API";

const STORE_NAMES: Record<string, string> = {
  target: "Target",
  walmart: "Walmart",
  "pokemon-center": "Pokemon Center",
};

export type ProfileOrderDraft = {
  externalId: string;
  date: string;
  vendor: string;
  amount: number;
  cancelled: boolean;
};

type RemoteOrder = {
  id?: unknown;
  retailer?: unknown;
  status?: unknown;
  total?: unknown;
  placedAt?: unknown;
};

export type ProfileOrderSyncResult = {
  skipped: boolean;
  reason?: "missing-api-key" | "missing-api-url";
  created: number;
  updated: number;
  removed: number;
  skippedOrders: number;
};

export function profileOrderDraft(order: RemoteOrder): ProfileOrderDraft | null {
  const externalId = typeof order.id === "string" ? order.id.trim() : "";
  if (!externalId) {
    return null;
  }

  if (order.status === "cancelled") {
    return { externalId, date: "", vendor: "", amount: 0, cancelled: true };
  }

  if (typeof order.total !== "number" || !Number.isFinite(order.total) || order.total <= 0) {
    return null;
  }

  const placedAt = typeof order.placedAt === "string" ? order.placedAt.trim() : "";
  const date = /^(\d{4}-\d{2}-\d{2})/.exec(placedAt)?.[1];
  if (!date) {
    return null;
  }

  const retailer = typeof order.retailer === "string" ? order.retailer : "";
  return {
    externalId,
    date,
    vendor: STORE_NAMES[retailer] ?? (retailer || "Online"),
    amount: order.total,
    cancelled: false,
  };
}

async function profileOrderCredentials(): Promise<
  { apiKey: string; url: string } | { reason: "missing-api-key" | "missing-api-url" }
> {
  const settings = await prisma.appSetting.findUnique({
    where: { id: "default" },
  });
  const apiKey = settings?.profileGeneratorApiKey?.trim() ?? "";
  const url = process.env.PROFILE_GENERATOR_API_URL?.trim() ?? "";
  if (!apiKey) return { reason: "missing-api-key" };
  if (!url) return { reason: "missing-api-url" };
  return { apiKey, url };
}

function credentialMessage(reason: "missing-api-key" | "missing-api-url"): string {
  if (reason === "missing-api-key") return "Enter an API key first.";
  return "The orders API address is not configured.";
}

export async function testProfileOrderConnection(): Promise<{ ok: boolean; message: string; count?: number }> {
  const credentials = await profileOrderCredentials();
  if ("reason" in credentials) {
    return { ok: false, message: credentialMessage(credentials.reason) };
  }

  const response = await fetch(credentials.url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${credentials.apiKey}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  if (response.status === 401) {
    return { ok: false, message: "The API key was rejected." };
  }
  if (!response.ok) {
    return { ok: false, message: `Orders API returned ${response.status}.` };
  }

  const body = (await response.json()) as { count?: unknown; orders?: unknown };
  const count = typeof body.count === "number" ? body.count : Array.isArray(body.orders) ? body.orders.length : 0;
  return { ok: true, count, message: `Connected. ${count} order${count === 1 ? "" : "s"} found.` };
}

export async function syncProfileOrders(): Promise<ProfileOrderSyncResult> {
  const credentials = await profileOrderCredentials();
  if ("reason" in credentials) {
    return {
      skipped: true,
      reason: credentials.reason,
      created: 0,
      updated: 0,
      removed: 0,
      skippedOrders: 0,
    };
  }

  const response = await fetch(credentials.url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${credentials.apiKey}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? "The API key was rejected."
        : `Profile Generator orders API returned ${response.status}.`,
    );
  }

  const body = (await response.json()) as { orders?: unknown };
  const orders = Array.isArray(body.orders) ? body.orders : [];
  const draftsById = new Map<string, ProfileOrderDraft>();
  for (const order of orders) {
    if (!order || typeof order !== "object") {
      continue;
    }
    const draft = profileOrderDraft(order);
    if (draft) {
      draftsById.set(draft.externalId, draft);
    }
  }
  const drafts = [...draftsById.values()];

  const existing = await prisma.expense.findMany({
    where: { externalId: { in: drafts.map((draft) => draft.externalId) } },
    select: { externalId: true },
  });
  const existingIds = new Set(existing.map((expense) => expense.externalId));

  let created = 0;
  let updated = 0;
  let removed = 0;

  for (const draft of drafts) {
    if (draft.cancelled) {
      if (!existingIds.has(draft.externalId)) {
        continue;
      }
      await prisma.expense.deleteMany({ where: { externalId: draft.externalId } });
      removed += 1;
      continue;
    }

    const data = {
      date: parseDateInput(draft.date),
      vendor: draft.vendor,
      amount: draft.amount,
      category: PROFILE_ORDER_CATEGORY,
    };

    if (existingIds.has(draft.externalId)) {
      await prisma.expense.update({
        where: { externalId: draft.externalId },
        data,
      });
      updated += 1;
      continue;
    }

    await prisma.expense.create({
      data: { ...data, externalId: draft.externalId },
    });
    created += 1;
  }

  return {
    skipped: false,
    created,
    updated,
    removed,
    skippedOrders: orders.length - drafts.length,
  };
}
