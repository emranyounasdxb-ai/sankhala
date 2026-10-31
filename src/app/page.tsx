import type { Metadata } from "next";
import Image from "next/image";
import { AnimatedHeading } from "@/components/motion/animated-heading";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  ...(site.url ? { alternates: { canonical: "/" } } : {}),
};

// Minimal local foundation, not the planned homepage in design.md.
export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="foundation">
      <Image
        src="/brand/logos/logo-on-light-800.webp"
        alt="Sankhala Employment"
        width={800}
        height={358}
        sizes="240px"
        className="brand-logo"
        preload
      />
      <Reveal className="foundation-copy">
        <AnimatedHeading as="h1">Our website is taking shape.</AnimatedHeading>
        <p>We’re preparing our new website.</p>
      </Reveal>
    </main>
  );
}
