import { expect, test } from "@playwright/test";

test("office address, map and directions remain accessible across screen sizes", async ({
  page,
}) => {
  // Validate our integration without depending on a third party map response.
  await page.route("https://www.google.com/maps/embed?*", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html lang='en'><title>Map fixture</title><body>Map preview</body></html>",
    }),
  );
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.goto("/contact");
  const call = page
    .locator(".contact-options")
    .getByRole("link", { name: /Call our team/ });
  await expect(call).toContainText("+971 4 611 3100");
  await expect(call).toHaveAttribute("href", "tel:+97146113100");
  const whatsapp = page
    .locator(".contact-options")
    .getByRole("link", { name: /Message on WhatsApp/ });
  await expect(whatsapp).toContainText("+971 56 524 3800");
  await expect(whatsapp).toHaveAttribute("href", "https://wa.me/971565243800");
  const office = page.getByRole("region", { name: "Visit us in Deira." });
  await expect(office.locator("address")).toHaveText(
    "Office 218, Business Village B, Deira, Dubai",
  );
  const directions = office.getByRole("link", { name: /Get directions/ });
  await expect(directions).toHaveAttribute(
    "href",
    "https://maps.app.goo.gl/v5aCi9ZYTEtV4eQ67",
  );
  await expect(directions).toHaveAttribute("target", "_blank");
  const map = office.locator("iframe");
  await expect(map).toHaveAttribute("loading", "lazy");
  await expect(map).toHaveAttribute(
    "title",
    "Google Maps location reference for Business Village, Deira",
  );
  await expect(map).toHaveAttribute(
    "referrerpolicy",
    "strict-origin-when-cross-origin",
  );
  await expect(map).toHaveAttribute("allowfullscreen", "");
  await expect(map).toHaveAttribute(
    "src",
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d908.7069586994204!2d55.32659347536622!3d25.25727701893566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5de6b86dd11b%3A0x1292d3673e691666!2sALIYAS%20Real%20Estate!5e1!3m2!1sen!2sae!4v1793443213921!5m2!1sen!2sae",
  );

  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const colorScheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme });
      await expect(page.locator("html")).toHaveAttribute(
        "data-theme",
        colorScheme,
      );
      await office.scrollIntoViewIfNeeded();
      await expect(map).toBeVisible();
      await directions.focus();
      await expect(directions).toBeFocused();
      const mapBox = await map.boundingBox();
      expect(mapBox?.width).toBeGreaterThan(200);
      // Firefox may report 319.99997 for a 320px box at some device scales.
      expect(mapBox?.height).toBeGreaterThanOrEqual(319.5);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
});
