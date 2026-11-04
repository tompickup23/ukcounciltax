import { readFileSync } from "node:fs";
import { join } from "node:path";
import { absoluteUrl } from "./site";

const { mappings } = JSON.parse(
  readFileSync(join(process.cwd(), "data", "canonical-map.json"), "utf8"),
) as { mappings: Record<string, string> };

/** Only reviewed pairs from the live sitemap snapshot can change the canonical. */
export function canonicalUrl(path: string): string {
  const ownUrl = absoluteUrl(path);
  return mappings[ownUrl] ?? ownUrl;
}
