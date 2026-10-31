import { expect, test } from "@playwright/test";

test("homepage exposes confirmed organization details in server rendered JSON-LD", async ({
  request,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "Server output is shared across browsers.",
  );
  const response = await request.get("/");
  const html = await response.text();
  const scripts = [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
  ];
  expect(scripts).toHaveLength(1);
  const organization = JSON.parse(scripts[0][1]);
  expect(organization).toMatchObject({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://sankhala.ae/#organization",
    name: "Sankhala Employment",
    url: "https://sankhala.ae/",
    email: "info@sankhala.ae",
    telephone: "+971 4 611 3100",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Office 218, Business Village B, Deira",
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    areaServed: { "@type": "Country", name: "United Arab Emirates" },
  });
  for (const unconfirmed of [
    "legalName",
    "sameAs",
    "foundingDate",
    "aggregateRating",
  ])
    expect(organization).not.toHaveProperty(unconfirmed);

  // Verify the advertised logo is an available PNG with sufficient dimensions.
  const logoUrl = new URL(organization.logo);
  expect(logoUrl.origin).toBe("https://sankhala.ae");
  const logo = await request.get(logoUrl.pathname);
  expect(logo.ok()).toBe(true);
  expect(logo.headers()["content-type"]).toContain("image/png");
  const bytes = await logo.body();
  expect(bytes.readUInt32BE(16)).toBeGreaterThanOrEqual(112);
  expect(bytes.readUInt32BE(20)).toBeGreaterThanOrEqual(112);
  expect(html).toContain('name="robots" content="noindex, nofollow"');
});
