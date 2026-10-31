import type { Metadata } from "next";
import { site } from "@/lib/site";

export function createPageMetadata(
  title: string,
  description: string,
  pathname: string,
): Metadata {
  const url = new URL(pathname, site.url);
  const fullTitle = `${title} | ${site.name}`;
  const image = new URL("/brand/social/og-light-1200x630.png", site.url).href;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    robots: { index: site.indexable, follow: site.indexable },
    openGraph: {
      type: "website",
      title: fullTitle,
      description,
      url,
      siteName: site.name,
      locale: "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
