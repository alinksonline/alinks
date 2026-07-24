import { describe, expect, it } from "vitest";
import {
  buildAvailableSlots,
  dayOfWeekFromIsoDate,
  generateDaySlotTimes,
  isSlotAvailable,
  DEFAULT_SALON_HOURS,
} from "./appointment-slots";

describe("appointment slots", () => {
  it("generates Mon–Sat windows and closes Sunday", () => {
    // 2026-07-20 is a Monday
    const mon = generateDaySlotTimes({
      isoDate: "2026-07-20",
      durationMinutes: 60,
      stepMinutes: 60,
      weeklyHours: DEFAULT_SALON_HOURS,
    });
    expect(mon.length).toBeGreaterThan(0);
    expect(mon[0]).toBe("10:00");

    // 2026-07-19 is a Sunday
    const sun = generateDaySlotTimes({
      isoDate: "2026-07-19",
      durationMinutes: 60,
      weeklyHours: DEFAULT_SALON_HOURS,
    });
    expect(sun).toEqual([]);
  });

  it("marks overlapping holds unavailable", () => {
    const slots = buildAvailableSlots({
      isoDate: "2026-07-20",
      durationMinutes: 60,
      stepMinutes: 30,
      occupied: [
        {
          slotDate: "2026-07-20",
          slotTime: "11:00",
          durationMinutes: 60,
          staffId: "s1",
        },
      ],
      staffId: "s1",
      capacity: 1,
      now: new Date("2026-07-01T09:00:00"),
    });
    const eleven = slots.find((s) => s.time === "11:00");
    const tenThirty = slots.find((s) => s.time === "10:30");
    expect(eleven?.available).toBe(false);
    // 10:30 + 60 ends 11:30 → overlaps 11:00–12:00
    expect(tenThirty?.available).toBe(false);
    expect(slots.find((s) => s.time === "10:00")?.available).toBe(true);
    expect(slots.find((s) => s.time === "12:00")?.available).toBe(true);
  });

  it("allows concurrent when capacity > 1", () => {
    const ok = isSlotAvailable({
      isoDate: "2026-07-20",
      slotTime: "11:00",
      durationMinutes: 45,
      occupied: [
        { slotDate: "2026-07-20", slotTime: "11:00", durationMinutes: 45, staffId: "s1" },
      ],
      staffId: "s1",
      capacity: 2,
      now: new Date("2026-07-01T09:00:00"),
    });
    expect(ok).toBe(true);
  });

  it("dayOfWeekFromIsoDate is stable", () => {
    expect(dayOfWeekFromIsoDate("2026-07-20")).toBe(1); // Monday
  });
});
