"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useRef } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
};

/** Progressively enhances visible server-rendered content; native scrolling is retained. */
export function Reveal({ children, className }: RevealProps) {
  const container = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useGSAP(
    () => {
      const element = container.current;
      if (!element) return;

      gsap.registerPlugin(useGSAP, ScrollTrigger);
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        if (played.current) return;

        try {
          gsap.fromTo(
            element,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
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
            },
          );
        } catch {
          // Animation is optional: a failed enhancement must not hide the content.
          element.style.removeProperty("opacity");
          element.style.removeProperty("transform");
        }
      });

      return () => media.revert();
    },
    { scope: container },
  );

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  );
}
