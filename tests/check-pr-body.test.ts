import { describe, expect, it } from 'vitest';
import { checkBody } from '../scripts/check-pr-body.mjs';

const block = (heading: string, content: string) => `## ${heading}\n\n\`\`\`text\n${content}\n\`\`\`\n`;
const files = ['index.html', 'precepts/index.html', 'councils/burnley/index.html'];

describe('pull request description check', () => {
  it('passes a description with no controls and says the diff runs strict', () => {
    const result = checkBody('A colour only change.', files);
    expect(result.errors).toEqual([]);
    expect(result.notes.join(' ')).toContain('runs strict');
    expect(result.notes.join(' ')).toContain('three default pages');
  });
  it('fails a heading with prose where the fenced block should be', () => {
    const result = checkBody('## Pages allowed to differ\n\n`/precepts/**`\n', files);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Number diff');
  });
  it('fails an allowed glob written as a URL path', () => {
    const result = checkBody(block('Pages allowed to differ', '/precepts/'), files);
    expect(result.errors[0]).toContain('/precepts/index.html');
  });
  it('passes built file globs and warns when one matches nothing', () => {
    expect(checkBody(block('Pages allowed to differ', '/precepts/index.html\ncouncils/**'), files))
      .toMatchObject({ errors: [], warnings: [] });
    expect(checkBody(block('Pages allowed to differ', 'towns/**'), files).warnings).toHaveLength(1);
  });
  it('fails capture paths the design check would reject and warns on unknown pages', () => {
    expect(checkBody(block('Pages to capture', 'dist/index.html'), files).errors[0]).toContain('Design check');
    expect(checkBody(block('Pages to capture', '/\n/councils/burnley/'), files)).toMatchObject({ errors: [], warnings: [] });
    expect(checkBody(block('Pages to capture', '/councils/nowhere/'), files).warnings).toHaveLength(1);
  });
  it('skips the built page checks when there is no dist', () => {
    expect(checkBody(block('Pages allowed to differ', 'towns/**'), null)).toMatchObject({ errors: [], warnings: [] });
  });
});
