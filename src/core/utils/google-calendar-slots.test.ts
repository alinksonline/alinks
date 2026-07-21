import { describe, expect, it } from "vitest";
import {
  addMinutesToSlot,
  buildGoogleEventTimeRange,
  busyIntervalToOccupied,
} from "./google-calendar-slots";

describe("google calendar slot helpers", () => {
  it("adds duration within same day", () => {
    expect(addMinutesToSlot("2026-07-21", "10:00", 60)).toEqual({
      date: "2026-07-21",
      time: "11:00",
    });
  });

  it("rolls past midnight", () => {
    const end = addMinutesToSlot("2026-07-21", "23:30", 60);
    expect(end?.date).toBe("2026-07-22");
    expect(end?.time).toBe("00:30");
  });

  it("builds Google event range with Asia/Kolkata", () => {
    const r = buildGoogleEventTimeRange("2026-07-21", "14:00", 45);
    expect(r?.start).toEqual({ dateTime: "2026-07-21T14:00:00", timeZone: "Asia/Kolkata" });
    expect(r?.end).toEqual({ dateTime: "2026-07-21T14:45:00", timeZone: "Asia/Kolkata" });
  });

  it("maps freebusy interval to occupied for a day", () => {
    // 10:00–11:00 IST = 04:30–05:30 UTC
    const occ = busyIntervalToOccupied(
      "2026-07-21",
      "2026-07-21T04:30:00.000Z",
      "2026-07-21T05:30:00.000Z",
    );
    expect(occ).not.toBeNull();
    expect(occ?.slotDate).toBe("2026-07-21");
    expect(occ?.slotTime).toBe("10:00");
    expect(occ?.durationMinutes).toBe(60);
  });

  it("rejects invalid slots", () => {
    expect(addMinutesToSlot("bad", "10:00", 30)).toBeNull();
    expect(buildGoogleEventTimeRange("2026-07-21", "xx", 30)).toBeNull();
  });
});
