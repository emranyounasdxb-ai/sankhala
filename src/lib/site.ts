import { z } from "zod";

const environment = z.object({
  SEO_INDEXABLE: z.enum(["true", "false"]).default("false"),
  SITE_URL: z.url().default("https://sankhala.ae"),
});

const parsed = environment.parse({
  SEO_INDEXABLE: process.env.SEO_INDEXABLE,
  SITE_URL: process.env.SITE_URL || undefined,
});
const url = new URL(parsed.SITE_URL);
const indexable = parsed.SEO_INDEXABLE === "true";

if (
  url.pathname !== "/" ||
  url.search ||
  url.hash ||
  url.username ||
  url.password
) {
  throw new Error(
    "SITE_URL must be a public origin without a path, query, hash or credentials.",
  );
}
if (indexable && (url.protocol !== "https:" || url.hostname === "localhost")) {
  throw new Error(
    "SEO_INDEXABLE=true requires the real public HTTPS SITE_URL.",
  );
}

export const site = {
  name: "Sankhala Employment",
  description:
    "Recruitment, manpower supply, staff outsourcing, HR & PRO support and payroll services across Dubai and all UAE emirates.",
  serviceArea: "Dubai and all UAE emirates",
  office: {
    address: "Office 218, Business Village B, Deira, Dubai",
    streetAddress: "Office 218, Business Village B, Deira",
    city: "Dubai",
    countryCode: "AE",
    mapsHref: "https://maps.app.goo.gl/v5aCi9ZYTEtV4eQ67",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d908.7069586994204!2d55.32659347536622!3d25.25727701893566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f5de6b86dd11b%3A0x1292d3673e691666!2sALIYAS%20Real%20Estate!5e1!3m2!1sen!2sae!4v1793443213921!5m2!1sen!2sae",
  },
  contact: {
    email: "info@sankhala.ae",
    emailHref: "mailto:info@sankhala.ae",
    phone: "+971 4 611 3100",
    phoneHref: "tel:+97146113100",
    whatsapp: "+971 56 524 3800",
    whatsappHref: "https://wa.me/971565243800",
  },
  url,
  indexable,
};
