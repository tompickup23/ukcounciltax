import { siteFigures } from "./figures";

/** "Drawn from" and each figure's publisher, title and table or page, for a task card's drawing; figures sharing a document collapse into one. */
export function drawnFrom(keys: string[], suffix = ""): string {
  const figures = siteFigures();
  const docs = new Map<string, string[]>();
  for (const key of keys) {
    const { publisher, title, table, page } = figures.get(key).source;
    const doc = `${publisher}, ${title}`;
    const where = table ?? page;
    docs.set(doc, [...new Set([...(docs.get(doc) ?? []), ...(where ? [where] : [])])]);
  }
  return `Drawn from ${[...docs].map(([doc, where]) => [doc, ...where].join(", ")).join("; ")}${suffix}.`;
}
