import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("public careers distinguishes confirmed vacancies from future role interests", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/jobs");
  await expect(
    page.getByRole("heading", { name: "Jobs at Sankhala", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Jobs with Our Clients", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".job-category")).toHaveCount(12);
  await expect(page.locator(".job-priority-roles li")).toHaveCount(12);
  const security = page
    .locator(".job-category")
    .filter({ has: page.locator("summary").filter({ hasText: /^Security/ }) });
  await security.locator("summary").click();
  await expect(security).toContainText("relevant approvals and certification");
  await page
    .locator(".job-priority-roles")
    .getByRole("link", { name: /^Picker & Packer\s*:/ })
    .click();
  await expect(page).toHaveURL(/role=Picker/);
  await expect(page.getByLabel("Preferred role")).toHaveValue(
    "Picker & Packer",
  );
  await page.getByLabel("Preferred role").fill("Warehouse Helper");
  await expect(page.getByLabel("Preferred role")).toHaveValue(
    "Warehouse Helper",
  );
  await page.goto("/submit-cv?role=unapproved-query-role");
  await expect(page.getByLabel("Preferred role")).toHaveValue("");
  const html = await (await request.get("/jobs")).text();
  expect(html).not.toContain('"@type":"JobPosting"');
  expect(html).not.toContain("DEMO-001");
});

test("job detail preview reserves all required employer-confirmed fields", async ({
  page,
}) => {
  await page.goto("/design/careers/sample-sales-associate");
  const info = page.locator(".career-review");
  await expect(info.locator("dt")).toHaveCount(11);
  for (const label of [
    "Number of vacancies",
    "Salary range",
    "Duty hours",
    "Weekly off",
    "Experience",
    "Required licence / certification",
    "Benefits",
    "Closing date",
  ])
    await expect(info.getByText(label, { exact: true })).toBeVisible();
  await expect(info).toContainText("Sankhala client (fictional example)");
  await expect(info).toContainText("Awaiting employer confirmation");
});

for (const theme of ["light", "dark"] as const) {
  test(`career category accessibility ${theme}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
    if (theme === "dark")
      await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("/jobs");
    await page.locator(".job-category summary").first().click();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}
