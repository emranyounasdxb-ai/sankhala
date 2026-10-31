import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium, devices } from "@playwright/test";

const origin = "http://127.0.0.1:3001";
if (
  process.env.ATS_PUBLIC_ORIGIN !== origin ||
  !process.env.ATS_DB_NAME?.endsWith("_local")
)
  throw new Error("Browser checks are restricted to the isolated local ATS.");
const directory = path.resolve(".playwright-mcp/ats");
await mkdir(directory, { recursive: true });
const credentials = await readFile(
    path.join(process.env.ATS_PRIVATE_ROOT, "initial-admin.txt"),
    "utf8",
  ),
  password = credentials.match(/Initial password: (.+)/)[1];
const browser = await chromium.launch();
const problems = [];
try {
  for (const device of [null, devices["iPhone 13"]])
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext(
        device ? { ...device } : { viewport: { width: 1440, height: 1000 } },
      );
      const page = await context.newPage();
      page.setDefaultTimeout(20000);
      await page.goto(`${origin}/admin/login`);
      await page
        .getByLabel("Work email", { exact: true })
        .fill(process.env.ATS_INITIAL_ADMIN_EMAIL);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await page.waitForURL("**/admin?tab=overview");
      await page
        .getByRole("heading", { name: "Recruitment overview" })
        .waitFor();
      await page.evaluate((theme) => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("sankhala-theme", theme);
      }, theme);
      for (const [tab, heading] of [
        ["overview", "Recruitment overview"],
        ["applications", "Applications"],
        ["jobs", "Vacancies"],
        ["team", "Team access"],
      ]) {
        await page.goto(`${origin}/admin?tab=${tab}`);
        await page
          .getByRole("heading", { name: heading, exact: true })
          .waitFor();
        await page.locator(".ats-loading").waitFor({ state: "detached" });
        await page.evaluate(() => document.fonts.ready);
        const results = await new AxeBuilder({ page }).analyze();
        if (results.violations.length)
          problems.push({
            device: device ? "mobile" : "desktop",
            theme,
            tab,
            violations: results.violations.map((value) => ({
              id: value.id,
              nodes: value.nodes.map((node) => node.target),
            })),
          });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        );
        assert.equal(
          overflow,
          false,
          `Overflow ${tab} ${theme} ${device ? "mobile" : "desktop"}`,
        );
        await page.screenshot({
          path: path.join(
            directory,
            `${device ? "mobile" : "desktop"}-${theme}-${tab}.png`,
          ),
          fullPage: true,
        });
      }
      if (!device && theme === "light") {
        await page.goto(`${origin}/admin?tab=jobs`);
        await page
          .getByRole("button", { name: "Create vacancy", exact: true })
          .click();
        for (const [label, value] of [
          ["Job title", "[TEST] Browser draft"],
          ["Country", "UAE"],
          ["Work location", "[TEST] Dubai"],
          ["Minimum monthly salary in AED", "2000"],
          ["Maximum monthly salary in AED", "3000"],
          ["Closing date", "2026-12-31"],
          ["Duty hours", "Test schedule"],
          ["Weekly off", "Test day"],
          ["Experience requirements", "Test experience"],
          ["Required licence or certification", "None for test"],
          ["Confirmed benefits", "Test benefits"],
          [
            "Role responsibilities and requirements",
            "Local browser fixture only. Not a real vacancy.",
          ],
        ])
          await page.getByLabel(label, { exact: true }).fill(value);
        await page
          .getByLabel("Category", { exact: true })
          .selectOption("Cleaning & Facilities");
        await page.getByLabel("Emirate", { exact: true }).selectOption("Dubai");
        await page
          .getByRole("button", { name: "Save vacancy", exact: true })
          .click();
        await page
          .getByRole("status")
          .filter({ hasText: "Vacancy saved." })
          .waitFor();
      }
      await page.goto(`${origin}/submit-cv?role=Office%20Assistant`);
      await page
        .getByRole("button", { name: "Review application", exact: true })
        .waitFor();
      await page.evaluate(() => document.fonts.ready);
      const results = await new AxeBuilder({ page }).analyze();
      if (results.violations.length)
        problems.push({
          device: device ? "mobile" : "desktop",
          theme,
          tab: "submit-cv",
          violations: results.violations.map((value) => ({
            id: value.id,
            nodes: value.nodes.map((node) => node.target),
          })),
        });
      await page.screenshot({
        path: path.join(
          directory,
          `${device ? "mobile" : "desktop"}-${theme}-application.png`,
        ),
        fullPage: true,
      });
      if (!device && theme === "light") {
        await page
          .getByRole("button", { name: "Review application", exact: true })
          .click();
        await page.locator(".form-error-summary").waitFor();
        assert.ok((await page.locator(".form-error-summary a").count()) > 0);
        const run = randomUUID().slice(0, 8);
        for (const [label, value] of [
          ["Full name", `[TEST] Browser candidate ${run}`],
          ["Email address", `browser-${run}@example.invalid`],
          ["Mobile / WhatsApp number", `+97150${String(Date.now()).slice(-7)}`],
          ["Preferred work location", "Dubai"],
          ["Relevant skills", "Administration and document organization"],
          ["Languages", "English"],
          ["Qualifications", "Secondary education"],
          ["Expected monthly salary in AED", "3000"],
        ])
          await page.getByLabel(label, { exact: true }).fill(value);
        await page
          .getByLabel("Current emirate", { exact: true })
          .selectOption("Dubai");
        await page.getByLabel("Your CV", { exact: true }).setInputFiles({
          name: "[TEST]-browser-cv.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from(
            "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
          ),
        });
        await page.getByLabel(/I consent to Sankhala/).check();
        await page
          .getByRole("button", { name: "Review application", exact: true })
          .click();
        await page
          .getByRole("button", { name: "Send application", exact: true })
          .click();
        await page
          .getByRole("status")
          .filter({ hasText: "Application reference: APP-" })
          .waitFor();
        await page.screenshot({
          path: path.join(directory, "application-receipt.png"),
          fullPage: true,
        });
      }
      await context.close();
    }
  console.log(
    JSON.stringify(
      { accessibilityProblems: problems, artifacts: directory },
      null,
      2,
    ),
  );
  assert.equal(
    problems.length,
    0,
    "Resolve the reported accessibility problems.",
  );
} finally {
  await browser.close();
}
