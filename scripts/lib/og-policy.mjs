import {existsSync} from 'node:fs';
import {join} from 'node:path';

// Production explicitly requires images, even if the entire directory is missing.
// A partial image tree also always receives the full checks.
export function requireImages(dist, env = process.env) {
  return env.BUILD_OG === '1' || existsSync(join(dist, 'og'));
}

// Only the chart download links are absent from an iteration build.
// Page links, ordinary assets and unmarked PNG links still have to resolve.
export function omittedChartPng(path, anchor, imagesRequired) {
  return !imagesRequired && /\bdata-chart-png(?:\s|=|>)/.test(anchor)
    && /^\/og\/(?:charts|budget)\/[a-z0-9/-]+-light\.png$/.test(path);
}
