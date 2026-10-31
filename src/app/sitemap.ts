import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.indexable || !site.url) return [];
  return [
    "/",
    "/about",
    "/services",
    "/contact",
    "/hire-talent",
    "/jobs",
    "/submit-cv",
    "/privacy",
  ].map((path) => ({ url: new URL(path, site.url).href }));
}
