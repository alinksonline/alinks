import { describe, expect, it } from "vitest";
import { GOOGLE_CALENDAR_SCOPES, googleCalendarRedirectUri } from "./google-calendar-oauth";

describe("google calendar oauth config", () => {
  it("requests events + readonly for freebusy", () => {
    expect(GOOGLE_CALENDAR_SCOPES).toContain("calendar.events");
    expect(GOOGLE_CALENDAR_SCOPES).toContain("calendar.readonly");
    expect(GOOGLE_CALENDAR_SCOPES).toContain("openid");
  });

  it("redirect URI path is integrations/google-calendar/callback", () => {
    // getEnv needs URL — may throw if unset in pure unit; only check path helper shape via string include
    // googleCalendarRedirectUri uses getEnv which always sets NEXT_PUBLIC_APP_URL in parse
    const uri = googleCalendarRedirectUri();
    expect(uri).toMatch(/\/api\/integrations\/google-calendar\/callback$/);
  });
});
