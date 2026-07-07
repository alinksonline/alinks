/**
 * E2E Razorpay test checkout — run: node scripts/razorpay-e2e-test.mjs
 */
import { chromium } from "playwright";
import fs from "fs";

const CHECKOUT_URL =
  "http://localhost:3000/demo/checkout?cart=" +
  encodeURIComponent(
    JSON.stringify([{ productId: "svc-1", name: "Haircut & Styling", price: 599, qty: 1 }]),
  );

async function getRazorpayFrame(page) {
  for (let i = 0; i < 30; i++) {
    const frame = page.frames().find((f) => f.url().includes("razorpay"));
    if (frame) return frame;
    await page.waitForTimeout(500);
  }
  throw new Error("No Razorpay frame");
}

async function dismissContactOverlay(frame, page) {
  // Checkout v2 may show contact/email step before payment methods
  const continueBtn = frame.getByRole("button", { name: /continue|proceed|pay now/i });
  const emailInput = frame.locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i]');
  const phoneInput = frame.locator('input[type="tel"], input[name*="contact" i], input[placeholder*="phone" i], input[placeholder*="mobile" i]');

  if (await emailInput.first().isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log("  → filling contact overlay");
    if (await phoneInput.first().isVisible().catch(() => false)) {
      await phoneInput.first().fill("9876543210");
    }
    await emailInput.first().fill("test@alinks.online");
    if (await continueBtn.first().isVisible().catch(() => false)) {
      await continueBtn.first().click({ force: true });
      await page.waitForTimeout(2000);
    }
  }
}

async function payWithCard(frame, page) {
  console.log("2. Card 4111…");
  const cardTab = frame.getByText(/^Card$/i).or(frame.getByTestId("Card")).or(frame.locator('[data-method="card"]'));
  if (await cardTab.first().isVisible({ timeout: 8000 }).catch(() => false)) {
    await cardTab.first().click({ force: true });
    await page.waitForTimeout(1500);
  }

  const cardNumber = frame.locator('input[placeholder*="card" i], input[name*="card" i], input[autocomplete="cc-number"]');
  if (await cardNumber.first().isVisible({ timeout: 10000 }).catch(() => false)) {
    await cardNumber.first().fill("4111111111111111");
  } else {
    // Some layouts use separate digit inputs
    const digits = frame.locator('input[inputmode="numeric"]');
    if ((await digits.count()) >= 1) {
      await digits.first().fill("4111111111111111");
    }
  }

  const expiry = frame.locator('input[placeholder*="MM" i], input[name*="expiry" i], input[autocomplete="cc-exp"]');
  if (await expiry.first().isVisible({ timeout: 5000 }).catch(() => false)) {
    await expiry.first().fill("12/26");
  }

  const cvv = frame.locator('input[placeholder*="CVV" i], input[name*="cvv" i], input[autocomplete="cc-csc"]');
  if (await cvv.first().isVisible({ timeout: 5000 }).catch(() => false)) {
    await cvv.first().fill("123");
  }

  const payBtn = frame.getByRole("button", { name: /pay|continue|proceed/i });
  await payBtn.first().click({ force: true });
  await page.waitForTimeout(2000);

  const successSim = frame.getByRole("button", { name: /success/i });
  if (await successSim.isVisible({ timeout: 10000 }).catch(() => false)) {
    console.log("3. Test simulator → Success");
    await successSim.click({ force: true });
  }
}

async function payWithUpi(frame, page) {
  console.log("2. UPI test@razorpay");
  const upiTab = frame.getByText(/^UPI$/i).or(frame.getByTestId("UPI")).or(frame.locator('[data-method="upi"]'));
  await upiTab.first().click({ force: true });
  await page.waitForTimeout(1500);

  const vpa = frame.locator('input[placeholder*="@" i], input[name*="vpa" i], input[placeholder*="UPI" i]');
  await vpa.first().fill("test@razorpay", { timeout: 15000 });

  const payBtn = frame.getByRole("button", { name: /pay|verify|continue|proceed/i });
  await payBtn.first().click({ force: true });
  await page.waitForTimeout(2000);

  const successSim = frame.getByRole("button", { name: /success/i });
  if (await successSim.isVisible({ timeout: 10000 }).catch(() => false)) {
    console.log("3. Test simulator → Success");
    await successSim.click({ force: true });
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("1. Checkout");
  await page.goto(CHECKOUT_URL, { waitUntil: "networkidle" });
  await page.getByPlaceholder("Your name").fill("Razorpay Test");
  await page.getByPlaceholder("Phone").fill("9876543210");
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole("button", { name: /Pay ₹599/i }).click();
  await page.waitForTimeout(5000);

  const frame = await getRazorpayFrame(page);
  await dismissContactOverlay(frame, page);

  try {
    await payWithCard(frame, page);
  } catch (cardErr) {
    console.log("Card flow failed, trying UPI:", cardErr.message);
    await dismissContactOverlay(frame, page);
    await payWithUpi(frame, page);
  }

  console.log("4. Waiting for ALINKS success");
  try {
    await page.getByText(/Payment successful/i).waitFor({ timeout: 90000 });
    console.log("SUCCESS:", (await page.locator("form p.text-sm").last().textContent())?.trim());
  } catch (err) {
    await page.screenshot({ path: "scripts/razorpay-e2e-failure.png", fullPage: true });
    const html = await frame.content().catch(() => "");
    fs.writeFileSync("scripts/razorpay-frame.html", html);
    throw err;
  }

  await browser.close();
}

main().catch((err) => {
  console.error("E2E FAILED:", err.message);
  process.exit(1);
});