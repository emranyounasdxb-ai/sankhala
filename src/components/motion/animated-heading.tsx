"use client";

import type { SplitText as SplitTextInstance } from "gsap/SplitText";
import { useEffect, useRef } from "react";
import { loadScrollMotion, observeMotion } from "./deferred-motion";

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: Changing the heading tag replaces the observed DOM element.
  useEffect(() => {
    const element = heading.current;
    if (!element) return;

    played.current = false;
    return observeMotion(element, async (isCurrent) => {
      if (played.current) return;
      const [gsap, { SplitText }] = await Promise.all([
        loadScrollMotion(),
        import("gsap/SplitText"),
      ]);
      if (!isCurrent()) return;
      gsap.registerPlugin(SplitText);
      let split: SplitTextInstance | undefined;
      const context = gsap.context(() => {
        try {
          split = SplitText.create(element, {
            type: "lines,words",
            autoSplit: true,
            aria: "auto",
            onSplit(self) {
              // Returning this animation lets SplitText revert and time-sync resplits.
              return gsap.fromTo(
                self.words,
                { opacity: 0.3 },
                {
                  opacity: 1,
                  duration: 0.65,
                  stagger: { amount: 0.3 },
                  ease: "power3.out",
                  immediateRender: false,
                  clearProps: "opacity",
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
      }, element);
      return () => {
        context.revert();
        split?.revert();
      };
    });
  }, [children, Heading]);

  return (
    <Heading
      ref={heading}
      className={["animated-heading", className].filter(Boolean).join(" ")}
    >
      {children}
    </Heading>
  );
}
