import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { site } from "@/lib/site";
import { bodyFont, headingFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  metadataBase: site.url,
  robots: { index: site.indexable, follow: site.indexable },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  ...(site.url
    ? {
        openGraph: {
          type: "website",
          locale: "en_US",
          siteName: site.name,
          title: site.name,
          description: site.description,
          images: [
            {
              url: "/brand/social/og-light-1200x630.png",
              width: 1200,
              height: 630,
              alt: site.name,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: site.name,
          description: site.description,
          images: ["/brand/social/og-light-1200x630.png"],
        },
      }
    : {}),
};

export const viewport: Viewport = { themeColor: "#FFFFFF" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
