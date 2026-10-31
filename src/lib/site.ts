import { z } from "zod";

const environment = z.object({
  SEO_INDEXABLE: z.enum(["true", "false"]).default("false"),
  SITE_URL: z.url().optional(),
});

const parsed = environment.parse({
  SEO_INDEXABLE: process.env.SEO_INDEXABLE,
  SITE_URL: process.env.SITE_URL || undefined,
});
const url = parsed.SITE_URL ? new URL(parsed.SITE_URL) : undefined;
const indexable = parsed.SEO_INDEXABLE === "true";

if (
  url &&
  (url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password)
) {
  throw new Error(
    "SITE_URL must be a public origin without a path, query, hash or credentials.",
  );
}
if (indexable && (url?.protocol !== "https:" || url.hostname === "localhost")) {
  throw new Error(
    "SEO_INDEXABLE=true requires the real public HTTPS SITE_URL.",
  );
}

export const site = {
  name: "Sankhala Employment",
  description: "Sankhala Employment Services.",
  url,
  indexable,
};
