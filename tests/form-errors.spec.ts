import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("employer error summary covers required fields and links to the matching controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/hire-talent");
  const check = page.getByRole("button", { name: "Check my details" });
  const summary = page.getByRole("region", {
    name: "Please check your details",
  });
  await expect(check).toBeEnabled();
  await check.click();
  await expect(summary).toBeFocused();
  await expect(summary.getByRole("link")).toHaveCount(8);
  await expect(summary).toContainText("8 fields need attention.");
  const role = page.getByLabel("Role you are hiring for");
  await expect(role).toHaveAttribute(
    "aria-describedby",
    "employer-role-hint employer-role-error",
  );
  await summary
    .getByRole("link", { name: /^Role you are hiring for:/ })
    .focus();
  await page.keyboard.press("Enter");
  await expect(role).toBeFocused();
  await role.fill("Sales associate");
  await expect(role).toBeFocused();
  await expect(role).toHaveAttribute("aria-describedby", "employer-role-hint");
  await expect(summary.getByRole("link")).toHaveCount(7);
  await expect(page.locator("#employer-role-hint")).toBeVisible();
  await summary.getByRole("link", { name: /^Contact person:/ }).click();
  await expect(page.getByLabel("Contact person")).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.getByLabel("Contact person").fill("Preview person");
  await page.getByLabel("Company name").fill("Preview company");
  await page.getByLabel("Number of people").fill("1.5");
  await page.getByLabel("Work emirate").selectOption("Dubai");
  await page.getByLabel("Work location or area").fill("Business Bay");
  await page.getByLabel("Work email").fill("invalid-email");
  await page.getByLabel("Phone number").fill("abc");
  await check.click();
  await expect(summary).toBeFocused();
  await expect(summary.getByRole("link")).toHaveCount(3);
  await expect(summary).toContainText(
    "Number of people: Enter a whole number of at least 1.",
  );
  await expect(summary).toContainText(
    "Work email: Enter an email address, for example name@company.com.",
  );
  await expect(summary).toContainText(
    "Phone number: Enter a contact number, including your country code.",
  );
  await summary.getByRole("link", { name: /^Work email:/ }).click();
  await expect(page.getByLabel("Work email")).toBeFocused();
  await page.getByLabel("Work email").fill("preview@example.com");
  await page.getByLabel("Number of people").fill("5");
  await page.getByLabel("Phone number").fill("+971 50 123 4567");
  await expect(summary).not.toBeVisible();
  await expect(page.getByLabel("Phone number")).toHaveAttribute(
    "aria-describedby",
    "employer-phone-hint",
  );
  await expect(page.locator("#employer-location-hint")).toBeVisible();
  await check.click();
  await expect(page.getByRole("status")).toBeFocused();
  await expect(page.getByRole("status")).toContainText(
    "Your details have not been sent.",
  );
  await expect(page.getByLabel("Company name")).toHaveValue("Preview company");
});

test("candidate summary focuses the CV control and keeps examples and local file feedback accessible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/submit-cv");
  const check = page.getByRole("button", { name: "Check my details" });
  const summary = page.getByRole("region", {
    name: "Please check your details",
  });
  await expect(check).toBeEnabled();
  await check.click();
  await expect(summary).toBeFocused();
  await expect(summary.getByRole("link")).toHaveCount(6);
  await summary.getByRole("link", { name: /^CV document:/ }).click();
  const file = page.getByLabel("CV document");
  await expect(file).toBeFocused();
  await expect(file).toHaveAttribute(
    "aria-describedby",
    "candidate-cv-error cv-hint",
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByLabel("Full name").fill("Preview candidate");
  await page.getByLabel("Email address").fill("candidate@example.com");
  await page.getByLabel("Phone number").fill("+971 50 123 4567");
  await page.getByLabel("Current city and country").fill("Dubai, UAE");
  await page.getByLabel("Preferred role").fill("Office administrator");
  for (const field of ["phone", "location", "role"]) {
    await expect(page.locator(`#candidate-${field}-hint`)).toBeVisible();
    await expect(page.locator(`#candidate-${field}`)).toHaveAttribute(
      "aria-describedby",
      `candidate-${field}-hint`,
    );
  }
  await expect(summary.getByRole("link")).toHaveCount(1);
  await expect(summary).toContainText("1 field needs attention.");
  await file.setInputFiles({
    name: "preview.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 preview fixture"),
  });
  await expect(summary).not.toBeVisible();
  await check.click();
  await expect(page.getByRole("status")).toContainText(
    "Your details have not been sent.",
  );
  await page.getByRole("button", { name: "Remove file" }).click();
  await expect(file).toBeFocused();
  await expect(summary).toBeVisible();
  await expect(summary.getByRole("link")).toHaveCount(1);
  await expect(page.getByLabel("Full name")).toHaveValue("Preview candidate");
  await check.click();
  await expect(summary).toBeFocused();
});
