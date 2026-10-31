import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/about",
  "/services",
  "/contact",
  "/jobs",
  "/hire-talent",
  "/submit-cv",
  "/privacy",
];

test("public routes have server content and prelaunch SEO controls", async ({
  request,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "HTTP output is shared across viewports.",
  );
  const titles = new Set<string>();
  for (const route of routes) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    const html = await response.text();
    expect(html, route).toContain('<main id="main"');
    expect(html, route).toContain('name="robots" content="noindex, nofollow"');
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    expect(canonical && new URL(canonical).href, route).toBe(
      new URL(route, "https://sankhala.ae").href,
    );
    expect(html, route).toContain(
      'property="og:image" content="https://sankhala.ae/brand/social/og-light-1200x630.png"',
    );
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    expect(title, route).toContain("Sankhala Employment");
    expect(title?.match(/Sankhala Employment/g), route).toHaveLength(1);
    titles.add(title ?? "");
  }
  expect(titles.size).toBe(routes.length);
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "<loc>",
  );
  // Crawling stays allowed so search engines can read the noindex metadata.
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  expect(robots).not.toContain("Sitemap:");
  expect((await request.get("/favicon.ico")).ok()).toBe(true);
  expect((await request.get("/images/recruitment-hero.webp")).ok()).toBe(true);
});

// Each audit gets Playwright's fresh context. Reusing an axe-analyzed page for
// navigation can corrupt inherited style resolution in Windows WebKit.
for (const theme of ["light", "dark"] as const) {
  for (const route of ["/", "/hire-talent", "/submit-cv"]) {
    test(`public layout ${route} in ${theme} is accessible with working contact links`, async ({
      page,
    }, testInfo) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme: theme });
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator("body")).toHaveCSS(
        "background-color",
        theme === "dark" ? "rgb(24, 24, 24)" : "rgb(255, 255, 255)",
      );
      if (route !== "/")
        await expect(page.locator("form")).toHaveCSS(
          "background-color",
          theme === "dark" ? "rgb(31, 31, 31)" : "rgb(247, 247, 247)",
        );
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} ${theme}`,
      ).toBe(true);
      const accessibility = await new AxeBuilder({ page }).analyze();
      expect(accessibility.violations, `${route} ${theme}`).toEqual([]);
      if (route === "/")
        await page.screenshot({
          path: `test-results/home-${theme}-${testInfo.project.name}.png`,
          fullPage: true,
        });
      await expect(
        page.locator('a[href="tel:+97146113100"]:visible').first(),
      ).toBeVisible();
      await expect(
        page.locator('a[href="mailto:info@sankhala.ae"]:visible').first(),
      ).toBeVisible();
      await expect(
        page.locator('a[href="https://wa.me/971565243800"]:visible').first(),
      ).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
}

test("theme follows system until a choice is made and persists across navigation", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page
    .getByRole("button", { name: "Switch to dark theme" })
    .first()
    .click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/jobs");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("heading", { name: "No vacancies are published yet." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Submit CV", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/submit-cv$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("skip link and mobile menu support keyboard navigation", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // Native Tab order is covered separately; this checks focus and Enter activation.
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  if (!testInfo.project.use.isMobile) return;
  const open = page.getByRole("button", { name: "Open navigation menu" });
  await open.click();
  const menu = page.getByRole("dialog", { name: "Navigation menu" });
  await expect(menu).toBeVisible();
  await expect(
    menu.getByRole("link", { name: "Home", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(open).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await open.click();
  await menu.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(menu).not.toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Connecting companies and candidates.",
  );
});

test("employers and candidates have distinct recruitment journeys", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const journeys = page.locator("#how-it-works");
  const employers = journeys.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Build your team.", exact: true }),
  });
  const candidates = journeys.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Put your experience forward.",
      exact: true,
    }),
  });
  await expect(employers.getByRole("listitem")).toHaveCount(3);
  await expect(candidates.getByRole("listitem")).toHaveCount(3);
  await expect(employers).toContainText(
    "Share the role, number of staff and work location.",
  );
  await expect(candidates).toContainText(
    "Share your CV, experience and the type of role you’re looking for.",
  );
  await employers.getByRole("link", { name: "Share a requirement" }).click();
  await expect(page).toHaveURL(/\/hire-talent$/);
  await page.goBack();
  await candidates.getByRole("link", { name: "Submit your CV" }).click();
  await expect(page).toHaveURL(/\/submit-cv$/);
});

test("sticky navigation preserves layout and leaves anchor content visible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const header = page.locator("header.site-header");
  const before = await header.boundingBox();
  const mainTop = await page
    .locator("main")
    .evaluate(
      (element) => element.getBoundingClientRect().top + window.scrollY,
    );
  expect(before).not.toBeNull();
  await page.getByRole("link", { name: "See how it works" }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await expect(header).toHaveClass(/is-scrolled/);
  const after = await header.boundingBox();
  const target = await page.locator("#how-it-works").boundingBox();
  expect(after).not.toBeNull();
  expect(target).not.toBeNull();
  expect(Math.abs((after?.y ?? 1) - 0)).toBeLessThan(1);
  expect(after?.height).toBe(before?.height);
  expect(
    await page
      .locator("main")
      .evaluate(
        (element) => element.getBoundingClientRect().top + window.scrollY,
      ),
  ).toBe(mainTop);
  expect(target?.y).toBeGreaterThanOrEqual((after?.height ?? 0) - 1);
});

test("content and direct contact routes remain usable without JavaScript", async ({
  browser,
  baseURL,
}, testInfo) => {
  test.skip(
    !!testInfo.project.use.isMobile,
    "Narrow no-JavaScript behavior is covered once per browser engine.",
  );
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 700 },
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Connecting people.Building futures.",
  );
  await expect(
    page.getByRole("heading", { name: "Behind every role, there’s a person." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Hire Talent", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/hire-talent$/);
  await expect(page.getByLabel("Company name")).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Check my details" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "email our team", exact: true }),
  ).toBeVisible();
  await context.close();
});

test("scroll text completes and reduced motion keeps narrow layouts readable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const animatedHeading = page.locator(".statement-title");
  await animatedHeading.scrollIntoViewIfNeeded();
  // Observe the actual enhancement before asserting cleanup: plain SSR text
  // already has no aria-label and must not make this test pass prematurely.
  await expect(animatedHeading).toHaveAttribute(
    "aria-label",
    "Behind every role, there’s a person.",
  );
  await expect(animatedHeading.locator('[aria-hidden="true"]')).not.toHaveCount(
    0,
  );
  await expect
    .poll(() => animatedHeading.getAttribute("aria-label"))
    .toBe(null);
  await expect(animatedHeading).toHaveText(
    "Behind every role, there’s a person.",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(animatedHeading.locator("[style*='opacity']")).toHaveCount(0);
  await expect(animatedHeading).toHaveCSS("opacity", "1");
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/services",
      "/contact",
      "/hire-talent",
      "/submit-cv",
    ]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      if (route === "/") {
        await page.locator(".statement-title").scrollIntoViewIfNeeded();
        await expect(page.locator(".statement-title")).not.toHaveAttribute(
          "aria-label",
        );
        await expect(
          page.locator(".statement-title [style*='opacity']"),
        ).toHaveCount(0);
        await expect(
          page.locator(".service-card[style*='opacity']"),
        ).toHaveCount(0);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBe(true);
    }
  }
});

test("employer form validates required fields and keeps unsent details", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/hire-talent");
  const form = page.locator("form");
  await expect(
    form.getByText("Online submissions are not open yet.", { exact: true }),
  ).toBeVisible();
  await form.getByRole("button", { name: "Check my details" }).click();
  await expect(
    page.getByRole("group", { name: "Staff needed", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Company and contact", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Role you are hiring for")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(
    page.getByRole("region", { name: "Please check your details" }),
  ).toBeFocused();
  await page.getByLabel("Company name").fill("Preview company");
  await page.getByLabel("Contact person").fill("Preview person");
  await page.getByLabel("Work email").fill("preview@example.com");
  await page.getByLabel("Phone number").fill("+971565243800");
  await page.getByLabel("Role you are hiring for").fill("Sales associate");
  await page.getByLabel("Number of people").fill("5");
  await page.getByLabel("Work emirate").selectOption("Dubai");
  await page.getByLabel("Work location or area").fill("Dubai");
  const outgoing: string[] = [];
  page.on("request", (request) => {
    if (
      ["POST", "PUT", "PATCH"].includes(request.method()) ||
      new URL(request.url()).pathname.startsWith("/api/")
    )
      outgoing.push(request.url());
  });
  await form.getByRole("button", { name: "Check my details" }).click();
  await expect(form.getByRole("status")).toContainText(
    "Your details have not been sent.",
  );
  await expect(page.getByLabel("Company name")).toHaveValue("Preview company");
  await expect(page.getByLabel("Number of people")).toHaveValue("5");
  expect(outgoing).toEqual([]);
  await expect(page).toHaveURL(/\/hire-talent$/);
});

test("candidate CV stays local and invalid files are rejected", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/submit-cv");
  const form = page.locator("form");
  await page.getByLabel("Full name").fill("Preview candidate");
  await page.getByLabel("Email address").fill("candidate@example.com");
  await page.getByLabel("Phone number").fill("+971565243800");
  await page.getByLabel("Preferred role").fill("Sales associate");
  await page.getByLabel("Current city and country").fill("Dubai, UAE");
  const outgoing: string[] = [];
  page.on("request", (request) => {
    if (
      ["POST", "PUT", "PATCH"].includes(request.method()) ||
      new URL(request.url()).pathname.startsWith("/api/")
    )
      outgoing.push(request.url());
  });
  const file = page.getByLabel("CV document");
  await file.setInputFiles({
    name: "cv.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("invalid"),
  });
  await expect(
    page.getByText("Choose a PDF or DOCX file.", { exact: true }),
  ).toBeVisible();
  await expect(file).toHaveAttribute("aria-invalid", "true");
  await file.setInputFiles({
    name: "large-cv.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });
  await expect(
    page.getByText("Choose a file smaller than 5 MB.", { exact: true }),
  ).toBeVisible();
  await file.setInputFiles({
    name: "preview-cv.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 preview fixture"),
  });
  await form.getByRole("button", { name: "Check my details" }).click();
  await expect(form.getByRole("status")).toContainText(
    "Your details have not been sent.",
  );
  await expect(
    page.getByText("Selected: preview-cv.pdf", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("Preview candidate");
  await file.focus();
  const chooseReplacement = page.waitForEvent("filechooser");
  await file.press("Enter");
  const chooser = await chooseReplacement;
  await chooser.setFiles({
    name: "updated-cv.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 replacement fixture"),
  });
  await expect(
    page.getByText("Selected: updated-cv.pdf", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Selected: preview-cv.pdf", { exact: true }),
  ).not.toBeVisible();
  await expect(page.getByLabel("Preferred role")).toHaveValue(
    "Sales associate",
  );
  await form.getByRole("button", { name: "Remove file" }).click();
  await expect(file).toBeFocused();
  await expect(file).toHaveValue("");
  await expect(
    form.getByRole("button", { name: "Remove file" }),
  ).not.toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("Preview candidate");
  await form.getByRole("button", { name: "Check my details" }).click();
  await expect(file).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByRole("region", { name: "Please check your details" }),
  ).toBeFocused();
  expect(outgoing).toEqual([]);
});
