import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const base = "/design/careers";
test("filters use real URLs and public careers retains its empty state", async ({
  page,
  request,
}, info) => {
  await page.goto(base);
  await expect(page.locator(".career-list article")).toHaveCount(3);
  await page.getByLabel("Role or keyword").fill("office");
  await page.getByLabel("Emirate", { exact: true }).selectOption("Abu Dhabi");
  await page.getByLabel("Job type").selectOption("Contract");
  await page.getByRole("button", { name: "Find sample roles" }).click();
  await expect(page.locator(".career-list article")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Office coordinator", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Role or keyword")).toHaveValue("office");
  await page.getByLabel("Role or keyword").fill("nomatches");
  await page.getByRole("button", { name: "Find sample roles" }).click();
  await expect(
    page.getByRole("heading", { name: "No sample roles match your filters." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Reset filters" }).click();
  await expect(page.locator(".career-list article")).toHaveCount(3);
  if (info.project.name === "desktop") {
    for (const route of [
      base,
      `${base}/states`,
      `${base}/sample-sales-associate`,
      `${base}/sample-sales-associate/apply`,
    ]) {
      const html = await (await request.get(route)).text();
      expect(html).toContain('name="robots" content="noindex, nofollow"');
      expect(html).not.toContain('"@type":"JobPosting"');
      expect(html).toContain("Design preview");
    }
    expect((await request.get(`${base}/unknown-role`)).status()).toBe(404);
    const publicPage = await (await request.get("/jobs")).text();
    expect(publicPage).toContain("No vacancies are published yet.");
    expect(publicPage).not.toContain("DEMO-001");
    expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
      "/design/careers",
    );
  }
});

test("sample application validates CV, retains edits and finishes without network writes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${base}/sample-sales-associate`);
  await page
    .getByRole("link", { name: "Preview application", exact: true })
    .click();
  const writes: string[] = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "PATCH"].includes(request.method()))
      writes.push(request.url());
  });
  await page
    .getByRole("button", { name: "Review application", exact: true })
    .click();
  const summary = page.getByRole("region", {
    name: "Check your application details",
  });
  await expect(summary).toBeFocused();
  await expect(summary.getByRole("link")).toHaveCount(5);
  await summary.getByRole("link", { name: /^Full name:/ }).click();
  await expect(page.getByLabel("Full name")).toBeFocused();
  await page.getByLabel("Full name").fill("Preview candidate");
  await page.getByLabel("Email address").fill("preview@example.com");
  await page.getByLabel("Phone number").fill("+971501234567");
  await page.getByLabel("Current city and country").fill("Dubai, UAE");
  const file = page.getByLabel("CV document");
  await file.setInputFiles({
    name: "bad.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("bad"),
  });
  await expect(page.locator("#apply-cv-error")).toHaveText(
    "Choose a PDF or DOCX file.",
  );
  await file.setInputFiles({
    name: "large.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });
  await expect(page.locator("#apply-cv-error")).toContainText("5 MB");
  await file.setInputFiles({
    name: "preview.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 fixture"),
  });
  await page
    .getByRole("button", { name: "Review application", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Review your application" }),
  ).toBeFocused();
  await expect(page.locator(".career-review")).toContainText(
    "Preview candidate",
  );
  await expect(page.locator(".career-review")).toContainText("preview.pdf");
  await page.getByRole("button", { name: "Edit details" }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("Preview candidate");
  expect(
    await file.evaluate((input: HTMLInputElement) => input.files?.length),
  ).toBe(1);
  await expect(page.locator(".career-file")).toContainText("preview.pdf");
  await page.getByLabel("Full name").fill("Edited candidate");
  await page
    .getByRole("button", { name: "Review application", exact: true })
    .click();
  await expect(page.locator(".career-review")).toContainText(
    "Edited candidate",
  );
  await page.getByRole("button", { name: "Finish design preview" }).click();
  await expect(page.getByRole("status")).toContainText(
    "No application was sent or saved.",
  );
  expect(writes).toEqual([]);
});

test("closed roles and illustrated loading/error states have clear recovery", async ({
  page,
}) => {
  await page.goto(`${base}/sample-warehouse-assistant/apply`);
  await expect(
    page.getByRole("button", { name: "Applications closed" }),
  ).toBeDisabled();
  await expect(page.locator("form")).toHaveCount(0);
  await page.goto(`${base}/states`);
  await expect(page.getByRole("status")).toHaveText("Loading role previews");
  await page.getByRole("button", { name: "Load error", exact: true }).click();
  await expect(
    page.locator(".career-state-stage").getByRole("alert"),
  ).toContainText("We could not load the roles.");
  await page.getByRole("button", { name: "Retry preview" }).click();
  await expect(
    page.getByRole("heading", { name: "Sales associate", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "No matches", exact: true }).click();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(
    page.locator(".career-card").filter({ hasText: "DEMO-001" }),
  ).toBeVisible();
});

for (const route of [
  base,
  `${base}/states`,
  `${base}/sample-sales-associate`,
  `${base}/sample-sales-associate/apply`,
]) {
  for (const theme of ["light", "dark"] as const) {
    test(`career accessibility ${theme}: ${route}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
      if (theme === "dark")
        await page.setViewportSize({ width: 320, height: 844 });
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    });
  }
}
