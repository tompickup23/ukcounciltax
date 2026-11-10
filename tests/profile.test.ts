import {expect, it} from 'vitest';
import {profileBandCells} from '../src/lib/profile-bands';
it('keeps absent bands distinct from a published zero', () => {
  expect(profileBandCells(null)).toEqual(['Unavailable', 'Unavailable', 'Unavailable']);
  expect(profileBandCells(undefined)).toEqual(['Unavailable', 'Unavailable', 'Unavailable']);
  expect(profileBandCells(0)).toEqual(['£0.00', '£0.00', '£0.00']);
  expect(profileBandCells(2549.42)).toEqual(['£2,549.42', '£254.94', '£212.45']);
  expect(profileBandCells(5098.84)).toEqual(['£5,098.84', '£509.88', '£424.90']);
});

import {profileProblems} from '../scripts/lib/profile.mjs';
it('rejects an incomplete static profile answer', () => {
  expect(profileProblems('<main><section id="council-tax"></section></main>', 'example')).toEqual(expect.arrayContaining(['one published band table is required', 'eight band bars with D marked are required']));
});
