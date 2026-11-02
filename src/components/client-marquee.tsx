"use client";

import { type ReactNode, useEffect, useState } from "react";

export function ClientMarquee({
  children,
  duplicate,
}: {
  children: ReactNode;
  duplicate: ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  // Server HTML and no-JavaScript visits retain the complete static list.
  useEffect(() => setReady(true), []);

  return (
    <div className="company-marquee" data-ready={ready} data-paused={paused}>
      <section
        id="home-client-logo-strip"
        className="company-marquee-viewport"
        aria-label="Client logos"
        /* biome-ignore lint/a11y/noNoninteractiveTabindex: Focusing the moving strip pauses it for keyboard users. */
        tabIndex={0}
      >
        <div className="company-marquee-track">
          {children}
          {duplicate}
        </div>
      </section>
      <div className="company-marquee-controls">
        <button
          type="button"
          className="button button-ghost company-marquee-toggle"
          aria-controls="home-client-logo-strip"
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? "Resume logos" : "Pause logos"}
        </button>
      </div>
    </div>
  );
}
