/**
 * Shared appointments slot engine (book.appointments_core).
 * Pure helpers — no DB. MVP: 1:1 slots with optional resource capacity.
 */

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sun=0 … Sat=6

export type WeeklyHours = Partial<
  Record<DayOfWeek, { open: string; close: string } | null>
>;

/** Default salon hours Mon–Sat 10:00–19:00, closed Sunday. */
export const DEFAULT_SALON_HOURS: WeeklyHours = {
  0: null,
  1: { open: "10:00", close: "19:00" },
  2: { open: "10:00", close: "19:00" },
  3: { open: "10:00", close: "19:00" },
  4: { open: "10:00", close: "19:00" },
  5: { open: "10:00", close: "19:00" },
  6: { open: "10:00", close: "19:00" },
};

export type OccupiedSlot = {
  slotDate: string; // YYYY-MM-DD
  slotTime: string; // HH:mm
  durationMinutes: number;
  staffId?: string | null;
  capacityUsed?: number;
};

export type SlotOption = {
  time: string;
  label: string;
  available: boolean;
};

function parseHm(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function formatHm(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatSlotLabel(hhmm: string): string {
  const [hStr, m] = hhmm.split(":");
  const h = Number(hStr);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${ampm}`;
}

export function dayOfWeekFromIsoDate(isoDate: string): DayOfWeek {
  // Parse as local calendar date (noon avoids DST edge cases)
  const [y, mo, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, (mo ?? 1) - 1, d ?? 1, 12, 0, 0);
  return dt.getDay() as DayOfWeek;
}

/**
 * Generate candidate start times for a day given hours, service duration, and step.
 */
export function generateDaySlotTimes(input: {
  isoDate: string;
  weeklyHours?: WeeklyHours | null;
  durationMinutes: number;
  stepMinutes?: number;
  bufferMinutes?: number;
}): string[] {
  const hours = input.weeklyHours ?? DEFAULT_SALON_HOURS;
  const dow = dayOfWeekFromIsoDate(input.isoDate);
  const window = hours[dow];
  if (!window) return [];

  const open = parseHm(window.open);
  const close = parseHm(window.close);
  const step = input.stepMinutes ?? 30;
  const duration = Math.max(5, input.durationMinutes);
  const buffer = input.bufferMinutes ?? 0;
  const latestStart = close - duration - buffer;
  if (latestStart < open) return [];

  const times: string[] = [];
  for (let t = open; t <= latestStart; t += step) {
    times.push(formatHm(t));
  }
  return times;
}

function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Mark which slot start times are free given existing holds and resource capacity.
 * When staffId is set, only counts holds for that staff (or unassigned if staff filter null).
 */
export function buildAvailableSlots(input: {
  isoDate: string;
  durationMinutes: number;
  weeklyHours?: WeeklyHours | null;
  stepMinutes?: number;
  bufferMinutes?: number;
  occupied: OccupiedSlot[];
  staffId?: string | null;
  /** Concurrent bookings allowed for this resource (default 1). */
  capacity?: number;
  /** Exclude past times for today (local). */
  now?: Date;
}): SlotOption[] {
  const capacity = Math.max(1, input.capacity ?? 1);
  const buffer = input.bufferMinutes ?? 0;
  const duration = Math.max(5, input.durationMinutes);
  const times = generateDaySlotTimes({
    isoDate: input.isoDate,
    weeklyHours: input.weeklyHours,
    durationMinutes: duration,
    stepMinutes: input.stepMinutes,
    bufferMinutes: buffer,
  });

  const now = input.now ?? new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const nowMins = now.getHours() * 60 + now.getMinutes();

  return times.map((time) => {
    const start = parseHm(time);
    const end = start + duration + buffer;

    if (input.isoDate === todayIso && start <= nowMins) {
      return { time, label: formatSlotLabel(time), available: false };
    }

    let used = 0;
    for (const occ of input.occupied) {
      if (occ.slotDate !== input.isoDate) continue;
      if (input.staffId) {
        // Only conflict with same staff (or holds with no staff if booking without staff later)
        if (occ.staffId && occ.staffId !== input.staffId) continue;
      }
      const oStart = parseHm(occ.slotTime);
      const oEnd = oStart + Math.max(5, occ.durationMinutes) + buffer;
      if (intervalsOverlap(start, end, oStart, oEnd)) {
        used += occ.capacityUsed ?? 1;
      }
    }

    return {
      time,
      label: formatSlotLabel(time),
      available: used < capacity,
    };
  });
}

export function isSlotAvailable(
  input: Parameters<typeof buildAvailableSlots>[0] & { slotTime: string },
): boolean {
  const slots = buildAvailableSlots(input);
  const hit = slots.find((s) => s.time === input.slotTime);
  return Boolean(hit?.available);
}
