const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse YYYY-MM-DD to UTC noon for stable calendar-day storage. */
export function parseDateOnly(value: string): Date {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) {
    throw new Error(`Invalid date: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

/** Read a stored DateTime back to YYYY-MM-DD using its UTC calendar day. */
export function toDateOnlyString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Format YYYY-MM-DD for display without timezone shifting the calendar day. */
export function formatDate(date: string): string {
  const match = DATE_ONLY_PATTERN.exec(date);
  if (!match) {
    return date;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

/** Local calendar today (or the given instant) as YYYY-MM-DD. */
export function toInputDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Correct common OCR year mistakes on recent receipts. */
export function normalizeReceiptDate(
  raw: string | undefined,
  referenceDate = new Date(),
): string {
  const fallback = toInputDate(referenceDate);
  if (!raw?.trim()) {
    return fallback;
  }

  let year: number;
  let month: number;
  let day: number;

  const isoMatch = DATE_ONLY_PATTERN.exec(raw.trim());
  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else {
    const slashMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(raw.trim());
    if (!slashMatch) {
      return fallback;
    }

    month = Number(slashMatch[1]);
    day = Number(slashMatch[2]);
    year = Number(slashMatch[3]);
    if (year < 100) {
      year += year >= 70 ? 1900 : 2000;
    }
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return fallback;
  }

  const currentYear = referenceDate.getFullYear();
  const msPerDay = 86_400_000;
  const daysFromReference = (referenceDate.getTime() - new Date(year, month - 1, day).getTime()) / msPerDay;

  if (daysFromReference > 120) {
    const withCurrentYear = new Date(currentYear, month - 1, day);
    const daysWithCurrentYear =
      (referenceDate.getTime() - withCurrentYear.getTime()) / msPerDay;
    if (daysWithCurrentYear >= -1 && daysWithCurrentYear <= 120) {
      year = currentYear;
    }
  }

  if (currentYear - year >= 2 && currentYear - year <= 5) {
    const withCurrentYear = new Date(currentYear, month - 1, day);
    const daysWithCurrentYear =
      (referenceDate.getTime() - withCurrentYear.getTime()) / msPerDay;
    if (daysWithCurrentYear >= -1 && daysWithCurrentYear <= 120) {
      year = currentYear;
    }
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
