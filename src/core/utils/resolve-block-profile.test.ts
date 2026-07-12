import { describe, expect, it } from "vitest";
import { defaultBusinessProfile } from "@/core/types/business-profile";
import {
  ensureContactPageBlocks,
  isPlaceholderContact,
  resolveBlockWithProfile,
} from "./resolve-block-profile";

describe("resolve block with profile", () => {
  const profile = defaultBusinessProfile({
    businessName: "Priya Salon",
    phone: "9876543210",
    whatsapp: "919876543210",
    email: "hi@priya.com",
    address: "MG Road",
  });

  it("detects placeholder phones", () => {
    expect(isPlaceholderContact("91XXXXXXXXXX")).toBe(true);
    expect(isPlaceholderContact("9876543210")).toBe(false);
  });

  it("fills whatsapp from profile when empty", () => {
    const block = resolveBlockWithProfile(
      { id: "1", type: "whatsapp", title: "WA", body: "", data: { phone: "91XXXXXXXXXX" } },
      profile,
    );
    expect(block.data?.phone).toBe("919876543210");
  });

  it("fills contact from profile", () => {
    const block = resolveBlockWithProfile(
      { id: "1", type: "contact", title: "Contact", body: "", data: {} },
      profile,
    );
    expect(block.data?.phone).toBe("9876543210");
    expect(block.data?.email).toBe("hi@priya.com");
    expect(block.data?.address).toBe("MG Road");
  });

  it("ensures contact page has profile sections", () => {
    const blocks = ensureContactPageBlocks([], profile);
    expect(blocks.some((b) => b.type === "contact")).toBe(true);
    expect(blocks.some((b) => b.type === "whatsapp")).toBe(true);
  });
});
