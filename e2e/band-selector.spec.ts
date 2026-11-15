import { expect, test } from "@playwright/test";
import { band } from "./helpers/current";
const BURNLEY = "E07000117";

// The analytics beacon is on every page. Test runs are not page loads, so its
// requests are stopped here; the browser has already checked them against the
// CSP by the time a route sees them.
test.beforeEach(async ({ page }) => {
  await page.route("https://static.cloudflareinsights.com/**", (route) => route.abort());
  await page.route("https://cloudflareinsights.com/**", (route) => route.abort());
});


/**
 * The band selector is eight radio inputs and CSS. It has to work with
 * JavaScript off, and every band's figure has to be in the HTML whichever is
 * shown.
 */
test.use({ javaScriptEnabled: false });

test("shows Band D first and switches band without JavaScript", async ({ page }) => {
  await page.goto("/councils/burnley/");
  const panel = (band: string) => page.locator(`[data-band-panel="${band}"]`);
  await expect(panel("D")).toBeVisible();
  await expect(panel("A")).toBeHidden();
  await expect(panel("D")).toContainText(band(BURNLEY, "D"));
  await page.locator('label[data-band-label="A"]').click();
  await expect(panel("A")).toBeVisible();
  await expect(panel("D")).toBeHidden();
  await expect(panel("A")).toContainText(band(BURNLEY, "A"));
});

test("puts all eight figures in the HTML", async ({ request }) => {
  const html = await (await request.get("/councils/burnley/")).text();
  for (const figure of [band(BURNLEY, "A"), band(BURNLEY, "D"), band(BURNLEY, "H")]) expect(html).toContain(figure);
});
