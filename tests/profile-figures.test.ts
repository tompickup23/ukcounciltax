import {describe, expect, it} from 'vitest';
import {siteFigures} from '../src/lib/figures';
import {RANK_CLASSES} from '../src/lib/rankings';

describe('A3 published figure records', () => {
  it('holds every billing authority and the four compatible classes', () => {
    const set = siteFigures();
    expect(set.keys().filter(key => /^council\..*\.bands$/.test(key))).toHaveLength(296);
    expect(set.keys().filter(key => /^council\..*\.area_bandd$/.test(key))).toHaveLength(296);
    expect(RANK_CLASSES.map(cls => set.series(`class.${cls.slug}.area_bandd`).points.length)).toEqual([164, 63, 36, 33]);
    expect(set.value('council.burnley.area_bandd').value).toBe(2549.42);
    for (const cls of RANK_CLASSES) {
      expect(set.series(`class.${cls.slug}.area_bandd`).source).toEqual(set.value('council.burnley.area_bandd').source);
    }
  });
});
