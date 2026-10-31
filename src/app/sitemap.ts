import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.indexable || !site.url) return [];
  // Add only real public pages as they are implemented; use real content dates.
  return [{ url: site.url.href }];
}
