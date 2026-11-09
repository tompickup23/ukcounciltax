import type { APIRoute } from "astro";
import { sitemapLastmod } from "../lib/releases";
import { programmaticPaths } from "../lib/paths";
import { STATIC_PATHS, absoluteUrl } from "../lib/site";

/** Every indexable path: the hubs, then every programmatic page. */
export function sitemapPaths(): string[] {
  return [...STATIC_PATHS, ...programmaticPaths()];
}

export const GET: APIRoute = () => {
  // Use held edition dates and explicitly recorded static page releases.
  const urls = sitemapPaths()
    .map((path) => `  <url><loc>${absoluteUrl(path)}</loc><lastmod>${sitemapLastmod(path)}</lastmod></url>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
