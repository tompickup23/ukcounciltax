import type { Page } from "@playwright/test";

/**
 * W5 (D8 option B): the header's Search button shows from 961 px; below that,
 * search is the first item in the phone drawer. Returns the control that opens
 * the search dialog at the page's width (opening the drawer first on a phone)
 * and the control focus returns to when the dialog closes.
 */
export async function searchControls(page: Page) {
  const header = page.locator("[data-search-open]");
  if (await header.isVisible()) return { trigger: header, returnTo: header };
  const summary = page.locator("[data-site-drawer] > summary");
  await summary.click();
  return { trigger: page.locator("[data-search-drawer]"), returnTo: summary };
}

export async function searchTrigger(page: Page) {
  return (await searchControls(page)).trigger;
}
