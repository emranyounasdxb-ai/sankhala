"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";

type AnimatedHeadingProps = {
  children: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
};

/** Plain text only: keep links and other interactive content outside split headings. */
export function AnimatedHeading({
  children,
  as: Heading = "h2",
  className,
}: AnimatedHeadingProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const played = useRef(false);

  useGSAP(
    () => {
      const element = heading.current;
      if (!element) return;

      played.current = false;
      gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        if (played.current) return;
        let split: SplitText | undefined;

        try {
          split = SplitText.create(element, {
            type: "lines,words",
            autoSplit: true,
            aria: "auto",
            onSplit(self) {
              // Returning this animation lets SplitText revert and time-sync resplits.
              return gsap.fromTo(
                self.words,
                { yPercent: 35, opacity: 0 },
                {
                  yPercent: 0,
                  opacity: 1,
                  duration: 0.65,
                  stagger: { amount: 0.3 },
                  ease: "power3.out",
                  immediateRender: false,
                  clearProps: "transform,opacity",
                  scrollTrigger: {
                    trigger: element,
                    start: "top 88%",
                    once: true,
                  },
                  onStart: () => {
                    played.current = true;
                  },
                  onComplete: () => self.revert(),
                },
              );
            },
          });
        } catch {
          split?.revert();
          // The only allowed child is text, so restoring it is safe and fails open.
          element.textContent = children;
          element.removeAttribute("aria-label");
        }

        return () => split?.revert();
      });

      return () => media.revert();
    },
    { scope: heading, dependencies: [children, Heading], revertOnUpdate: true },
  );

  return (
    <Heading
      ref={heading}
      className={["animated-heading", className].filter(Boolean).join(" ")}
    >
      {children}
    </Heading>
  );
}
