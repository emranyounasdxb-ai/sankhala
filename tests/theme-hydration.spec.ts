import { expect, test } from "@playwright/test";

test("system theme changes before hydration are reconciled when scripts load", async ({
  page,
}) => {
  let releaseScripts = () => {};
  const scriptsReady = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route("**/_next/static/**/*.js", async (route) => {
    await scriptsReady;
    await route.continue();
  });
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });

  try {
    // Server content and the inline theme script render while hydration is paused.
    await page.goto("/hire-talent", { waitUntil: "commit" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByLabel("Company name")).toBeDisabled();

    await page.emulateMedia({ colorScheme: "light" });
    expect(
      await page.evaluate(
        () => window.matchMedia("(prefers-color-scheme: dark)").matches,
      ),
    ).toBe(false);

    releaseScripts();
    await expect(page.getByLabel("Company name")).toBeEnabled();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)",
    );
  } finally {
    releaseScripts();
  }
});
