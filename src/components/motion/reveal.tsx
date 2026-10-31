"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { loadScrollMotion, observeMotion } from "./deferred-motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
};

/** Progressively enhances visible server-rendered content; native scrolling is retained. */
export function Reveal({ children, className, stagger = false }: RevealProps) {
  const container = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    return observeMotion(element, async (isCurrent) => {
      if (played.current) return;
      const gsap = await loadScrollMotion();
      if (!isCurrent()) return;
      const context = gsap.context(() => {
        gsap.fromTo(
          stagger ? Array.from(element.children) : element,
          { y: 24, opacity: 0.5 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: stagger ? 0.08 : 0,
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
      }, element);
      return () => context.revert();
    });
  }, [stagger]);

  return (
    <div ref={container} className={className}>
      {children}
    </div>
  );
}
