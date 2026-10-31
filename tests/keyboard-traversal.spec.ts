import { expect, test } from "@playwright/test";

test.beforeEach(async ({ browserName }) => {
  test.skip(
    browserName === "webkit" && process.platform === "win32",
    "Windows WebKit skips links in native Tab order, including on a bare HTML fixture. Its port exposes no full keyboard access preference. Focus, Enter activation and menu behavior are tested separately; native traversal needs Safari hardware verification.",
  );
});

test("native keyboard traversal starts at the skip link", async ({
  page,
  browserName,
}) => {
  await page.goto("/");
  await page.keyboard.press(
    browserName === "webkit" && process.platform === "darwin"
      ? "Alt+Tab"
      : "Tab",
  );
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
});

test("native keyboard traversal reaches the next mobile contact link", async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/hire-talent");
  await expect(page.getByLabel("Company name")).toBeEnabled();
  const shortcuts = page.getByRole("navigation", {
    name: "Contact our recruitment team",
  });
  await shortcuts.getByRole("link", { name: "Call us", exact: true }).focus();
  await page.keyboard.press(
    browserName === "webkit" && process.platform === "darwin"
      ? "Alt+Tab"
      : "Tab",
  );
  await expect(shortcuts.getByRole("link", { name: /WhatsApp/ })).toBeFocused();
});
