import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Crawlers must be able to read the noindex metadata on prelaunch pages.
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(site.indexable && site.url
      ? { sitemap: new URL("/sitemap.xml", site.url).href }
      : {}),
  };
}
