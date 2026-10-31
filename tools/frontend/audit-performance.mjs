import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

// Repeatable local lab check, not field Core Web Vitals or an INP measurement.
const origin = process.argv[2] ?? "http://127.0.0.1:3100";
const label = process.argv[3] ?? "current";
if (!/^[a-z0-9-]+$/i.test(label)) throw new Error("Use a simple report label.");
const browser = await chromium.launch();
const samples = [];
try {
  for (let sample = 0; sample < 3; sample++) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      reducedMotion: "no-preference",
      colorScheme: "light",
    });
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send("Network.enable");
    await session.send("Network.setCacheDisabled", { cacheDisabled: true });
    await session.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 200000,
      uploadThroughput: 93750,
    });
    await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      window.__lab = { lcp: 0, cls: 0, longTasks: 0, blockingTime: 0 };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          window.__lab.lcp = entry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput) window.__lab.cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__lab.longTasks++;
          window.__lab.blockingTime += Math.max(0, entry.duration - 50);
        }
      }).observe({ type: "longtask", buffered: true });
    });
    await page.goto(origin, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page
      .getByRole("button", { name: "Switch to dark theme" })
      .first()
      .waitFor();
    samples.push(
      await page.evaluate(() => {
        const resources = performance.getEntriesByType("resource");
        const scripts = resources.filter(
          (entry) => entry.initiatorType === "script",
        );
        return {
          ...window.__lab,
          scriptRequests: scripts.length,
          scriptBytes: scripts.reduce(
            (sum, entry) => sum + entry.encodedBodySize,
            0,
          ),
          transferBytes: resources.reduce(
            (sum, entry) => sum + entry.transferSize,
            0,
          ),
          resources: resources.map((entry) => ({
            path: new URL(entry.name).pathname,
            type: entry.initiatorType,
            bytes: entry.encodedBodySize,
          })),
        };
      }),
    );
    await context.close();
  }
  const median = (key) =>
    [...samples].map((sample) => sample[key]).sort((a, b) => a - b)[1];
  const report = {
    label,
    origin,
    conditions:
      "Chromium, 390x844 DPR1, cold browser cache, 4x CPU, 150ms RTT, 1.6Mbps download; 3 local production samples; no scrolling or interaction",
    median: Object.fromEntries(
      [
        "lcp",
        "cls",
        "blockingTime",
        "scriptBytes",
        "transferBytes",
        "scriptRequests",
      ].map((key) => [key, median(key)]),
    ),
    samples,
  };
  await mkdir("test-results", { recursive: true });
  await writeFile(
    `test-results/performance-${label}.json`,
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify({ label, median: report.median }));
} finally {
  await browser.close();
}
