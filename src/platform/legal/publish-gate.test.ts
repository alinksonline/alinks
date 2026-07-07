import { describe, expect, it } from "vitest";
import { LEGAL_DOC_TYPES } from "@/core/constants/legal";

describe("publish gate constants", () => {
  it("requires core legal doc types for publish", () => {
    expect(LEGAL_DOC_TYPES.PLATFORM_TOS).toBe("PLATFORM_TOS");
    expect(LEGAL_DOC_TYPES.TENANT_TOS_PUBLISHED).toBe("TENANT_TOS_PUBLISHED");
  });
});