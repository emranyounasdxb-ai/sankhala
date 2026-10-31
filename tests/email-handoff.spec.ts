import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("employer can review and copy an encoded email draft without sending details", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copied: string }).copied = text;
        },
      },
    });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/hire-talent");
  await page.getByLabel("Company name").fill("Preview & Partners");
  await page.getByLabel("Contact person").fill("Preview person");
  await page.getByLabel("Work email").fill("preview@example.com");
  await page.getByLabel("Phone number").fill("+971501234567");
  await page.getByLabel("Role you are hiring for").fill("Sales & support");
  await page.getByLabel("Number of people").fill("3");
  await page.getByLabel("Work emirate").selectOption("Dubai");
  await page.getByLabel("Work location or area").fill("Deira");
  await page
    .getByLabel("Additional requirements")
    .fill("Evening shift\nEnglish & Arabic");
  const outgoing: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH"].includes(request.method()))
      outgoing.push(request.url());
  });
  await page.getByRole("button", { name: "Check my details" }).click();
  const review = page.getByRole("region", { name: "Review your message" });
  await expect(review).toBeVisible();
  const mail = new URL(
    (await review
      .getByRole("link", { name: "Prepare email draft" })
      .getAttribute("href")) ?? "",
  );
  expect(mail.protocol).toBe("mailto:");
  expect(mail.pathname).toBe("info@sankhala.ae");
  expect(mail.searchParams.get("subject")).toBe(
    "Staffing requirement: Sales & support",
  );
  expect(mail.searchParams.get("body")).toContain(
    "Company: Preview & Partners",
  );
  expect(mail.searchParams.get("body")).toContain(
    "Evening shift\nEnglish & Arabic",
  );
  await review.getByRole("button", { name: "Copy details" }).click();
  await expect(review.getByRole("status")).toContainText("Details copied");
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toContain("Number of people: 3");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByLabel("Number of people").fill("4");
  await expect(review).toHaveCount(0);
  expect(outgoing).toEqual([]);
});

test("candidate gets a manual CV reminder and a usable clipboard fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Clipboard denied");
        },
      },
    });
  });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/submit-cv");
  await page.getByLabel("Full name").fill("Preview candidate");
  await page.getByLabel("Email address").fill("candidate@example.com");
  await page.getByLabel("Phone number").fill("+971501234567");
  await page.getByLabel("Current city and country").fill("Dubai, UAE");
  await page.getByLabel("Preferred role").fill("Administrator");
  await page.getByLabel("CV document").setInputFiles({
    name: "preview.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 preview"),
  });
  await page.getByRole("button", { name: "Check my details" }).click();
  const review = page.getByRole("region", { name: "Review your message" });
  await expect(review).toContainText("Attach your CV in your email app.");
  await review.getByRole("button", { name: "Copy details" }).click();
  await expect(review.getByRole("status")).toContainText(
    "Automatic copying is unavailable",
  );
  await expect(review.getByLabel("Email message")).toBeFocused();
  expect(
    await review
      .getByLabel("Email message")
      .evaluate(
        (element: HTMLTextAreaElement) =>
          element.selectionEnd - element.selectionStart,
      ),
  ).toBeGreaterThan(30);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Remove file" }).click();
  await expect(review).toHaveCount(0);
});
