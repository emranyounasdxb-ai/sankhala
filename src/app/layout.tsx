import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { bodyFont, headingFont } from "./fonts";
import "./globals.css";
import "@/components/navigation-polish.css";
import "@/components/company-content.css";
import "@/components/forms/intake-form-polish.css";
import "@/components/ats/ats.css";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  metadataBase: site.url,
  robots: { index: site.indexable, follow: site.indexable },
  icons: {
    icon: [
      {
        url: "/brand/icons/sankhala-favicon.ico?v=20261102",
        type: "image/x-icon",
        sizes: "16x16 32x32 48x48",
      },
      {
        url: "/brand/icons/favicon-on-dark-32.png?v=20261102",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/brand/icons/favicon-on-dark-48.png?v=20261102",
        type: "image/png",
        sizes: "48x48",
      },
    ],
    shortcut: "/brand/icons/sankhala-favicon.ico?v=20261102",
    apple: [
      {
        url: "/brand/icons/apple-touch-icon-on-dark.png?v=20261102",
        sizes: "180x180",
      },
    ],
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#181818" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* This fixed, local script applies the saved theme before first paint. */}
        <script>{THEME_INIT_SCRIPT}</script>
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader contactHref={site.contact.whatsappHref} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
