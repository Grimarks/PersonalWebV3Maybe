/** Helper format tanggal (locale Indonesia) yang aman untuk nilai kosong/tidak valid. */

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toTime(value?: string | null): number {
  return toDate(value)?.getTime() ?? 0;
}

/** "15 Januari 2025" */
export function formatLongDate(value?: string | null): string {
  const d = toDate(value);
  return d ? d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";
}

/** "Jan 2025" */
export function formatMonthYear(value?: string | null): string {
  const d = toDate(value);
  return d ? d.toLocaleDateString("id-ID", { month: "short", year: "numeric" }) : "";
}

/** "15 Jan 2025, 14.30" */
export function formatDateTime(value?: string | null): string {
  const d = toDate(value);
  return d
    ? d.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";
}

/** Urutkan terbaru dulu berdasarkan field tanggal ISO. */
export function sortByDateDesc<T>(items: T[], getDate: (item: T) => string | undefined): T[] {
  return [...items].sort((a, b) => toTime(getDate(b)) - toTime(getDate(a)));
}
