import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("search, category sharing and CV return preserve the browsing context", async ({
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
  await page.goto("/jobs");
  const search = page.getByLabel("Search a role or category");
  await search.fill("warehouse");
  await expect(page.locator(".job-category")).toHaveCount(1);
  await expect(page.locator(".job-category")).toHaveAttribute("open", "");
  await expect(page).toHaveURL(/q=warehouse/);
  await page.reload();
  await expect(search).toHaveValue("warehouse");
  const category = page.locator(".job-category");
  await category.getByRole("button", { name: /^Copy link/ }).click();
  const copied = await page.evaluate(
    () => (window as unknown as { copied: string }).copied,
  );
  expect(copied).toContain("open=warehouse-logistics");
  expect(copied).toContain("#category-warehouse-logistics");
  await category.getByRole("link", { name: /^Picker & Packer\s*:/ }).click();
  await expect(page.locator(".cv-role-context")).toContainText(
    "Future opportunities: Picker & Packer",
  );
  await page.getByLabel("Preferred role").fill("Warehouse Helper");
  await expect(page.locator(".cv-role-context")).toContainText(
    "Future opportunities: Warehouse Helper",
  );
  await page.getByRole("link", { name: "Back to role categories" }).click();
  await expect(search).toHaveValue("warehouse");
  await expect(category).toHaveAttribute("open", "");
  await category.getByRole("link", { name: /^Warehouse Helper\s*:/ }).click();
  await expect(page).toHaveURL(/role=Warehouse/);
  await expect(page.locator(".cv-role-context")).toContainText(
    "Future opportunities: Warehouse Helper",
  );
  await page.goBack();
  await expect(search).toHaveValue("warehouse");
  await expect(category).toHaveAttribute("open", "");
  await page.goto(copied);
  await expect(search).toHaveValue("warehouse");
  await expect(category).toHaveAttribute("open", "");
  await search.fill("unknown role phrase");
  await expect(
    page.getByRole("heading", { name: "No role types match your search." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show all role types" }).click();
  await expect(page.locator(".job-category")).toHaveCount(12);
  await page.locator("#category-security summary").click();
  await expect(page).toHaveURL(/open=security/);
  await page.reload();
  await expect(page.locator("#category-security")).toHaveAttribute("open", "");
});

test("copy fallback is selectable and return destinations stay on Careers", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Denied");
        },
      },
    });
  });
  await page.goto("/jobs?open=security");
  await page
    .locator("#category-security")
    .getByRole("button", { name: /^Copy link/ })
    .click();
  const fallback = page.getByLabel("Copy this category link");
  await expect(fallback).toBeFocused();
  expect(
    await fallback.evaluate(
      (input: HTMLInputElement) =>
        (input.selectionEnd ?? 0) - (input.selectionStart ?? 0),
    ),
  ).toBeGreaterThan(20);
  await page.goto("/submit-cv?role=Cleaner&from=https%3A%2F%2Fevil.example%2F");
  await expect(
    page.getByRole("link", { name: "Back to role categories" }),
  ).toHaveAttribute("href", "/jobs");
  await expect(page.locator(".cv-role-context")).toContainText(
    "Future opportunities: Cleaner",
  );
});

test("role search and deep links work without JavaScript", async ({
  browser,
  baseURL,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "Shared server HTML and native form behavior.",
  );
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/jobs?q=Electrician&open=construction-technical");
  await expect(page.locator(".job-category")).toHaveCount(1);
  await expect(page.locator(".job-category")).toHaveAttribute("open", "");
  await page.getByLabel("Role or category", { exact: true }).fill("Cleaner");
  await page.getByRole("button", { name: "Search roles" }).click();
  await expect(page.locator(".job-category")).toHaveCount(1);
  await page
    .locator(".job-category")
    .getByRole("link", { name: /^Cleaner\s*:/ })
    .click();
  await expect(page.getByLabel("Preferred role")).toHaveValue("Cleaner");
  await expect(page.getByLabel("Preferred role")).toBeDisabled();
  await context.close();
});

for (const route of [
  "/jobs?q=Driver",
  "/submit-cv?role=Cleaner&from=%2Fjobs%3Fq%3DCleaner",
]) {
  for (const theme of ["light", "dark"] as const) {
    test(`role navigation accessibility ${theme} ${route}`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
      if (theme === "dark")
        await page.setViewportSize({ width: 320, height: 844 });
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    });
  }
}
