import { chromium } from "playwright";

const CHECKOUT_URL =
  "http://localhost:3000/demo/checkout?cart=" +
  encodeURIComponent(
    JSON.stringify([{ productId: "svc-1", name: "Haircut & Styling", price: 599, qty: 1 }]),
  );

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(CHECKOUT_URL, { waitUntil: "networkidle" });
await page.getByPlaceholder("Your name").fill("Razorpay Test");
await page.getByPlaceholder("Phone").fill("9876543210");
await page.locator('input[type="checkbox"]').check();
await page.getByRole("button", { name: /Pay ₹599/i }).click();
await page.waitForTimeout(6000);

const frame = page.frames().find((f) => f.url().includes("razorpay"));

for (const step of ["contact-only", "contact+continue", "email+continue", "email+using-as"]) {
  if (step === "contact-only") {
    await frame.locator('input[name="contact"]').fill("9876543210");
  }
  if (step === "contact+continue") {
    await frame.getByRole("button", { name: "Continue" }).click({ force: true });
    await frame.waitForTimeout(2000);
  }
  if (step === "email+continue") {
    await frame.locator('input[name="email"]').fill("test@alinks.online");
    await frame.getByRole("button", { name: "Continue" }).click({ force: true });
    await frame.waitForTimeout(3000);
  }
  if (step === "email+using-as") {
    await frame.getByRole("button", { name: /Using as/i }).click({ force: true });
    await frame.waitForTimeout(3000);
  }

  const hasCard = await frame.locator('input[name="card.number"]').isVisible().catch(() => false);
  const hasVpa = await frame.locator('input[placeholder*="@" i]').isVisible().catch(() => false);
  const overlay = await frame.getByTestId("contact-overlay-container").isVisible().catch(() => false);
  console.log(step, { hasCard, hasVpa, overlay, buttons: (await frame.locator("button").allTextContents()).filter((t) => t.trim()).slice(0, 8) });
}

await browser.close();