import type { APIRoute } from "astro";
import { releaseItems } from "../lib/releases";
import { DEFAULT_DESCRIPTION, SITE_NAME, absoluteUrl } from "../lib/site";

/**
 * The feed. One item per data update the site holds, dated by the dataset's
 * own edition date (its publication date where the source manifest records
 * one, otherwise the date it was accessed or generated, as the item says),
 * plus one item per findings note. /changes/ lists the same items.
 * Items name no person.
 */
const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = () => {
  const items = releaseItems()
    .map((item) => {
      const date = new Date(`${item.date}T09:30:00Z`).toUTCString();
      return `    <item>
      <title>${escape(item.title)}</title>
      <link>${absoluteUrl(item.path)}</link>
      <guid isPermaLink="false">${escape(item.id)}</guid>
      <pubDate>${date}</pubDate>
      <description>${escape(item.description)}</description>
    </item>`;
    })
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(SITE_NAME)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escape(DEFAULT_DESCRIPTION)}</description>
    <language>en-gb</language>
${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
