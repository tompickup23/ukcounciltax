import { expect, test } from "@playwright/test";

// W5, D8 option B. The beacon is stopped as in layout.spec.ts.
test.beforeEach(async ({ page }) => {
  await page.route("https://static.cloudflareinsights.com/**", (route) => route.abort());
  await page.route("https://cloudflareinsights.com/**", (route) => route.abort());
});

const PAGES = ["/", "/councils/king-s-lynn-and-west-norfolk/", "/tools/budget/trafford/set/", "/council-tax/towns/"];

for (const width of [375, 390]) {
  test(`the phone header is one row under 72 px at ${width} with Your bill, Game and Menu`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const path of PAGES) {
      await page.goto(path);
      const bar = page.locator(".site-header-bar");
      const box = await bar.boundingBox();
      expect(box!.height, path).toBeLessThan(72);
      const tops = await page.locator(".site-header > :visible, .site-tools > :visible, .header-quick > :visible").evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2)));
      expect(Math.max(...tops) - Math.min(...tops), `${path} items share one row`).toBeLessThanOrEqual(4);
      await expect(page.getByRole("link", { name: "Your bill", exact: true }).first()).toBeVisible();
      await expect(page.getByRole("link", { name: "Budget game", exact: true })).toBeVisible();
      await expect(page.locator("[data-site-drawer] > summary")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(2);
    }
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the drawer opens as a details element and leads with search, then two cards, then flat lists", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/compare/");
    await page.locator("[data-site-drawer] > summary").click();
    const panel = page.locator("[data-site-drawer] .drawer-panel");
    await expect(panel).toBeVisible();
    await expect(panel.locator("a").first()).toHaveAttribute("href", "/councils/");
    await expect(panel.locator(".drawer-card")).toHaveCount(2);
    await expect(panel.locator(".drawer-card").first()).toHaveAttribute("href", "/tools/budget/#set-the-budget");
    await expect(panel.locator("details")).toHaveCount(0);
    await expect(panel.getByRole("link", { name: "Wales" })).toBeVisible();
  });

  test("the More menu opens as a details element in three columns", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("[data-nav-more] > summary").click();
    await expect(page.locator("[data-nav-more] .nav-col")).toHaveCount(3);
    await expect(page.locator("[data-nav-more] .nav-panel").getByRole("link", { name: /Set a budget yourself/ })).toBeVisible();
    const box = await page.locator("[data-nav-more] .nav-panel").boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(1440);
  });
});

test("Escape closes the More menu and returns focus to it, and the active bar marks Compare", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/compare/");
  await expect(page.locator('.site-nav a[href="/compare/"]')).toHaveAttribute("data-active", "true");
  await page.locator("[data-nav-more] > summary").click();
  await expect(page.locator("[data-nav-more]")).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-nav-more]")).not.toHaveAttribute("open", "");
  await expect(page.locator("[data-nav-more] > summary")).toBeFocused();
});

test("the footer carries four columns and the sister sites with UK Councils first", async ({ page }) => {
  await page.goto("/about/");
  const footer = page.locator("footer.site-footer");
  await expect(footer.locator(".footer-cols > div")).toHaveCount(4);
  const sisters = await footer.locator("[data-sister-sites] a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  expect(sisters[0]).toBe("https://ukcouncils.co.uk/");
  expect(sisters).toContain("https://ukfoodhygiene.co.uk/");
  expect(sisters).toContain("https://ukplaces.co.uk/");
});
