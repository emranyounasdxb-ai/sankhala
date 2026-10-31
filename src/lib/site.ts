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
    "Recruitment services for companies and job seekers across Dubai and the UAE.",
  serviceArea: "Dubai and all UAE emirates",
  contact: {
    email: "info@sankhala.ae",
    emailHref: "mailto:info@sankhala.ae",
    phone: "+971 56 524 3800",
    phoneHref: "tel:+971565243800",
    whatsappHref: "https://wa.me/971565243800",
  },
  url,
  indexable,
};
