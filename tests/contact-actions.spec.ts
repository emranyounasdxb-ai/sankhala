import { expect, test } from "@playwright/test";

test("hiring page contact actions replace self navigation and stay near the mobile form", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/hire-talent");
  await expect(page.getByLabel("Company name")).toBeEnabled();
  const header = page.locator("header.site-header");
  await expect(header.locator('a[href="/hire-talent"]')).toHaveCount(0);
  await expect(header.locator(".header-cta")).toHaveAttribute(
    "href",
    "https://wa.me/971565243800",
  );
  await expect(header.locator(".header-cta")).toContainText("WhatsApp");

  // Every browser also exercises the narrow layout, regardless of its project viewport.
  await page.setViewportSize({ width: 320, height: 844 });
  const shortcuts = page.getByRole("navigation", {
    name: "Contact our recruitment team",
    exact: true,
  });
  const call = shortcuts.getByRole("link", { name: "Call us", exact: true });
  const whatsapp = shortcuts.getByRole("link", { name: /WhatsApp/ });
  await expect(call).toBeVisible();
  await expect(call).toHaveAttribute("href", "tel:+97146113100");
  await expect(whatsapp).toBeVisible();
  await expect(whatsapp).toHaveAttribute("href", "https://wa.me/971565243800");
  await expect(whatsapp).toHaveAttribute("target", "_blank");
  await call.focus();
  await expect(call).toBeFocused();
  // Native Tab order is checked separately where the browser port supports it.
  await whatsapp.focus();
  await expect(whatsapp).toBeFocused();
  const shortcutsBox = await shortcuts.boundingBox();
  const formBox = await page.locator("form").boundingBox();
  expect(shortcutsBox).not.toBeNull();
  expect(formBox).not.toBeNull();
  expect((shortcutsBox?.y ?? 0) + (shortcutsBox?.height ?? 0)).toBeLessThan(
    formBox?.y ?? 0,
  );
  for (const link of [call, whatsapp]) {
    const box = await link.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const menu = page.getByRole("dialog", { name: "Navigation menu" });
  await expect(menu.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute(
    "href",
    "https://wa.me/971565243800",
  );
  await menu.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(menu).not.toBeVisible();
  await expect(header.locator(".header-cta")).toHaveAttribute(
    "href",
    "/hire-talent",
  );
  await expect(header.locator(".header-cta")).toContainText("Hire Talent");
});
