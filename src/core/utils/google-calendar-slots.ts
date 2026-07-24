/**
 * Pure helpers for Google Calendar slot / event time math (Asia/Kolkata wall clock).
 */

/** Add minutes to HH:mm; returns { date, time } (date may roll to next day). */
export function addMinutesToSlot(
  slotDate: string,
  slotTime: string,
  durationMinutes: number,
): { date: string; time: string } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slotDate) || !/^\d{2}:\d{2}$/.test(slotTime)) return null;
  const [y, mo, d] = slotDate.split("-").map(Number);
  const [h, m] = slotTime.split(":").map(Number);
  const start = new Date(y, (mo ?? 1) - 1, d ?? 1, h ?? 0, m ?? 0, 0, 0);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + Math.max(1, durationMinutes) * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
    time: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
  };
}

/** Google Calendar event start/end with Asia/Kolkata timeZone. */
export function buildGoogleEventTimeRange(
  slotDate: string,
  slotTime: string,
  durationMinutes: number,
): {
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
} | null {
  const end = addMinutesToSlot(slotDate, slotTime, durationMinutes);
  if (!end) return null;
  return {
    start: { dateTime: `${slotDate}T${slotTime}:00`, timeZone: "Asia/Kolkata" },
    end: { dateTime: `${end.date}T${end.time}:00`, timeZone: "Asia/Kolkata" },
  };
}

function kolkataHm(d: Date): string {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  // en-GB can return "24" for midnight in some engines — normalize
  const h = hh === "24" ? "00" : hh;
  return `${h.padStart(2, "0")}:${mm.padStart(2, "0")}`;
}

function kolkataDate(d: Date): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA → YYYY-MM-DD
  return fmt.format(d);
}

/**
 * Convert FreeBusy busy interval (RFC3339) into local HH:mm occupied block for one day.
 */
export function busyIntervalToOccupied(
  isoDate: string,
  busyStartIso: string,
  busyEndIso: string,
): { slotDate: string; slotTime: string; durationMinutes: number } | null {
  const start = new Date(busyStartIso);
  const end = new Date(busyEndIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null;

  const dayStart = Date.parse(`${isoDate}T00:00:00+05:30`);
  const dayEnd = Date.parse(`${isoDate}T23:59:59.999+05:30`);
  if (Number.isNaN(dayStart) || Number.isNaN(dayEnd)) return null;

  const clipStart = Math.max(start.getTime(), dayStart);
  const clipEnd = Math.min(end.getTime(), dayEnd);
  if (clipEnd <= clipStart) return null;

  const durationMinutes = Math.max(5, Math.ceil((clipEnd - clipStart) / 60_000));
  const slotTime = kolkataHm(new Date(clipStart));
  // Ensure we attribute to the requested calendar day
  if (kolkataDate(new Date(clipStart)) !== isoDate && kolkataDate(new Date(clipEnd - 1)) !== isoDate) {
    return null;
  }

  return {
    slotDate: isoDate,
    slotTime,
    durationMinutes,
  };
}
