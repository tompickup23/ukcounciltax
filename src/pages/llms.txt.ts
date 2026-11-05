import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { APIRoute } from "astro";
import { YEARS, loadYear } from "../lib/council-tax";
import { devolved } from "../lib/devolved";
import { localBills } from "../lib/local-bill-data";
import { loadRegistry } from "../lib/registry";
import { CONTACT_EMAIL, DEFAULT_DESCRIPTION, NAV_GROUPS, SITE_NAME, absoluteUrl } from "../lib/site";

/**
 * /llms.txt, in the llmstxt.org shape: a title, a one paragraph summary, then
 * lists of links. Built from site data rather than kept as a static file, so
 * the section list follows NAV_GROUPS and the source list follows the source
 * manifests in data/ with no second copy to fall out of step.
 *
 * It carries no figure. Nothing in this file is a number: source titles,
 * publishers and section names are read from data, and tests/llms.test.ts
 * fails if a digit is ever typed here (the utf8 encoding name aside).
 */

interface Named {
  publisher: string;
  title: string;
  url: string;
}

const DATA = join(process.cwd(), "data");
const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8"));

/**
 * GOV.WALES appends its download link label (file type and size) to the
 * publication title in the retained record. That label is page furniture, not
 * part of the title, so it is cut at the first ", file type:".
 */
const cleanTitle = (title: string) => {
  const [head] = title.split(/\s*,\s*file type:/i);
  return head.trim();
};

function sources(): Named[] {
  const england = YEARS.map((year) => {
    const { source } = loadYear(year);
    return { publisher: source.publisher, title: source.title, url: source.url };
  });
  const national = Object.values(readJson(join(DATA, "national", "sources.json")) as Record<string, Named>).map(
    ({ publisher, title, url }) => ({ publisher, title, url }),
  );
  const nations = devolved.editions.map((edition) => ({
    publisher: edition.nation === "Scotland" ? "Scottish Government" : "Welsh Government",
    title: cleanTitle(edition.source.title),
    url: edition.source.url,
  }));
  const bills = localBills.map((bill) => ({ publisher: bill.source.publisher, title: bill.source.title, url: bill.source.url }));
  const precepts = readdirSync(join(DATA, "precepts"))
    .filter((name) => name.endsWith(".json"))
    .map((name) => readJson(join(DATA, "precepts", name)).source as Named)
    .map(({ publisher, title, url }) => ({ publisher, title, url }));
  const geography = readJson(join(DATA, "geography", "source.json")) as Named;
  const seen = new Set<string>();
  return [...england, ...national, ...nations, ...bills, ...precepts, { publisher: geography.publisher, title: geography.title, url: geography.url }]
    .filter((source) => {
      if (seen.has(source.title)) return false;
      seen.add(source.title);
      return true;
    });
}

export function llmsText(): string {
  const registry = loadRegistry();
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${DEFAULT_DESCRIPTION}`,
    "",
    `${SITE_NAME} is an independent reference publisher. Every published charge is read from an official table and carries its source line. Missing bands are not derived from other bands, figures are not carried forward from earlier years, and an unknown value is shown as unknown, never as zero. Scottish charges exclude water and sewerage. Calculated changes and user scenarios are labelled separately from published figures. Area averages are not address level bills; a parish or town council precept can change the bill for a particular address.`,
    "",
    `Canonical site: ${absoluteUrl("/")}. Sitemap: ${absoluteUrl("/sitemap.xml")}. Method: ${absoluteUrl("/methodology/")}.`,
  ];
  if (CONTACT_EMAIL) lines.push("", `Contact and corrections: ${CONTACT_EMAIL} (see ${absoluteUrl("/corrections/")}).`);
  for (const group of NAV_GROUPS) {
    lines.push("", `## ${group.label}`, "");
    for (const item of group.items) lines.push(`- [${item.label}](${absoluteUrl(item.href)})`);
  }
  lines.push("", "## Sources", "");
  for (const source of sources()) lines.push(`- [${source.title}](${source.url}): ${source.publisher}`);
  lines.push(`- [UK Places registry](${registry.source.spine}): council names and web addresses`);
  lines.push("- [postcodes.io](https://postcodes.io/): postcode lookup, built on Office for National Statistics postcode data");
  return `${lines.join("\n")}\n`;
}

export const GET: APIRoute = () =>
  new Response(llmsText(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
