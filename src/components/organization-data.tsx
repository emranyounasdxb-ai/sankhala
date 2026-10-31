import { site } from "@/lib/site";

export function OrganizationData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": new URL("/#organization", site.url).href,
    name: site.name,
    url: site.url.href,
    description: site.description,
    logo: new URL("/brand/logos/logo-on-light-800.png", site.url).href,
    email: site.contact.email,
    telephone: site.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.office.streetAddress,
      addressLocality: site.office.city,
      addressCountry: site.office.countryCode,
    },
    areaServed: { "@type": "Country", name: "United Arab Emirates" },
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD uses confirmed site data and escapes HTML delimiters.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organization).replace(/</g, "\\u003c"),
      }}
    />
  );
}
