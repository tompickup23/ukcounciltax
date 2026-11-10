import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

const workflow = readFileSync('.github/workflows/release.yml', 'utf8');
const detectors = [...workflow.matchAll(/name: Detect documents only changes\n[\s\S]*?script: \|\n((?:            .*\n)+)/g)]
  .map(match => match[1].split('\n').map(line => line.slice(12)).join('\n'));
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
async function detect(eventName: string, files: object[], extra = {}) {
  let output: string | undefined;
  await new AsyncFunction('context', 'github', 'core', detectors[0])({
    eventName, repo: {owner: 'test', repo: 'test'}, issue: {number: 1},
    payload: {before: 'a'.repeat(40)}, sha: 'b'.repeat(40), ...extra,
  }, {
    paginate: async () => files,
    rest: {pulls: {listFiles: {}}, repos: {compareCommitsWithBasehead: async () => ({data: {status: 'ahead', files}})}},
  }, {setOutput: (_: string, value: string) => { output = value; }, info: () => {}});
  return output;
}

describe('documents only release checks', () => {
  it('starts each existing job with the same detector and keeps all job names', () => {
    expect(detectors).toHaveLength(3);
    expect(new Set(detectors).size).toBe(1);
    expect(workflow).not.toContain('paths-ignore:');
    for (const job of ['site', 'number-diff', 'design-check']) {
      const section = workflow.split(`  ${job}:\n`)[1].split(/\n  [a-z][a-z-]+:\n/)[0];
      expect(section.split('    steps:')[0]).not.toMatch(/^    if:/m);
      expect(section).toMatch(/steps:\n      - name: Detect documents only changes/);
      const steps = section.split(/^      - /m).slice(2);
      for (const step of steps) expect(step).toContain("if: steps.changes.outputs.docs-only != 'true'");
    }
  });
  for (const event of ['pull_request']) {
    it(`passes documents only ${event} changes, including root Markdown`, async () => {
      expect(await detect(event, [{filename: 'docs/notes.txt'}, {filename: 'README.md'}, {filename: 'docs/nested/guide.md'}])).toBe('true');
    });
    it(`keeps the gate for mixed ${event} changes and renames out of code`, async () => {
      expect(await detect(event, [{filename: 'docs/notes.md'}, {filename: 'src/lib/figures.ts'}])).toBe('false');
      expect(await detect(event, [{filename: 'docs/old.md', previous_filename: 'src/old.ts'}])).toBe('false');
      expect(await detect(event, [{filename: 'src/new.ts', previous_filename: 'docs/old.md'}])).toBe('false');
      expect(await detect(event, [{filename: 'src/pages/guide.md'}])).toBe('false');
      expect(await detect(event, [])).toBe('false');
    });
  }
  it('always runs the gate on a push, so a cancelled code release is never skipped by a documents only push', async () => {
    expect(await detect('push', [{filename: 'docs/notes.md'}, {filename: 'README.md'}])).toBe('false');
  });
  it('fails closed for truncated lists, new branches and manual runs', async () => {
    expect(await detect('push', Array(300).fill({filename: 'README.md'}))).toBe('false');
    expect(await detect('pull_request', Array(3000).fill({filename: 'README.md'}))).toBe('false');
    expect(await detect('push', [{filename: 'README.md'}], {payload: {before: '0'.repeat(40)}})).toBe('false');
    expect(await detect('workflow_dispatch', [{filename: 'README.md'}])).toBe('false');
  });
});
