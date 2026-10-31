import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const titles = [
  "Recruitment & hiring",
  "Manpower supply",
  "Staff outsourcing",
  "HR & PRO support",
  "Payroll & workforce management",
  "Bulk hiring",
];
test("confirmed services and workforce categories connect to useful inquiry routes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const title of titles)
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  await expect(page.locator(".service-card")).toHaveCount(6);
  await expect(
    page.getByRole("list", { name: "Worker categories" }),
  ).toHaveText("DriversCleanersHelpersConstruction workers");
  await page
    .locator(".service-card")
    .filter({
      has: page.getByRole("heading", { name: "HR & PRO support", exact: true }),
    })
    .getByRole("link")
    .click();
  await expect(page).toHaveURL(/\/services#hr-pro-support$/);
  const pro = page.locator("#hr-pro-support");
  await expect(pro).toContainText("Visa processing support");
  await expect(
    pro.getByRole("link", { name: "Discuss HR & PRO support" }),
  ).toHaveAttribute("href", "/contact");
  await expect(page.locator("#payroll-workforce-management")).toContainText(
    "Attendance management",
  );
  await expect(page.locator("#bulk-hiring").getByRole("link")).toHaveAttribute(
    "href",
    "/hire-talent",
  );
  await expect(page.locator("#manpower-supply")).toContainText("security");
  await pro.getByRole("link", { name: "Discuss HR & PRO support" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator("main .lead")).toContainText("payroll");
});

for (const route of ["/", "/services", "/about"]) {
  for (const theme of ["light", "dark"] as const) {
    test(`company content responsive accessibility ${route} ${theme}`, async ({
      page,
    }) => {
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
