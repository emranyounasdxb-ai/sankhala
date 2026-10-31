import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("server HTML contains text and prelaunch SEO controls", async ({
  request,
}) => {
  const response = await request.get("/");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("Our website is taking shape.");
  expect(html).toContain('name="robots" content="noindex, nofollow"');
  expect(html).toContain("<title>Sankhala Employment</title>");
  expect(html).not.toContain('rel="canonical"');
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "<loc>",
  );
  expect((await request.get("/favicon.ico")).ok()).toBe(true);
});

test("fonts, animation and accessible layout load without errors", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".foundation-copy")).toHaveCSS("opacity", "1");
  await expect.poll(() => heading.getAttribute("aria-label")).toBe(null);
  await expect(heading).toHaveCSS("opacity", "1");
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  expect(errors).toEqual([]);
  await page.screenshot({
    path: `test-results/foundation-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("text remains available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 700 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3100/");
  await expect(
    page.getByRole("heading", { name: "Our website is taking shape." }),
  ).toBeVisible();
  await context.close();
});

test("scroll text effects complete and respond to reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 260 });
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveAttribute(
    "aria-label",
    "Our website is taking shape.",
  );
  await heading.scrollIntoViewIfNeeded();
  await expect.poll(() => heading.getAttribute("aria-label")).toBe(null);
  await expect(heading).toHaveText("Our website is taking shape.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".foundation-copy")).toHaveCSS("opacity", "1");
  await expect(page.locator(".foundation-copy")).toHaveCSS("transform", "none");
});

test("reduced motion shows readable text at 320px and 768px", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText("Our website is taking shape.");
    await expect(heading).toHaveCSS("transform", "none");
    await expect(heading).toHaveCSS("opacity", "1");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
