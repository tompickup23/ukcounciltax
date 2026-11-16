import {expect, it} from 'vitest';
import {referendumTriggerPence, serviceAtTick, stepService} from '../src/scripts/budget-freeze';
import {calculateFreeze, initialFreezeInputs, referendumTriggered, parsePence} from '../src/lib/budget-freeze';
import {freezePilots} from '../src/lib/budget-freeze-data';

it('selects the first triggering penny for every held council, including strict district limits', () => {
  for (const pilot of freezePilots()) {
    const trigger = referendumTriggerPence(pilot)!;
    expect(referendumTriggered(pilot.rule, BigInt(pilot.priorOwnPence), trigger)).toBe(true);
    expect(referendumTriggered(pilot.rule, BigInt(pilot.priorOwnPence), trigger-1n)).toBe(false);
    expect(trigger).toBeLessThanOrEqual(BigInt(pilot.ownPence) * 2n);
  }
  expect(referendumTriggerPence({rule:'district', priorOwnPence:'12345'})).toBe(12846n);
  expect(referendumTriggerPence({rule:'ordinary-social-care', priorOwnPence:'173105'})).toBe(181761n);
  expect(referendumTriggerPence({rule:'unknown' as never, priorOwnPence:'12345'})).toBeNull();
  expect(referendumTriggerPence({rule:'district', priorOwnPence:'0'})).toBeNull();
});

it('uses half-percent steps with penny rounding and exact endpoints', () => {
  expect(serviceAtTick('100000', 199)).toBe('995.00');
  expect(serviceAtTick('101', 100)).toBe('0.51');
  expect(serviceAtTick('1234567890123', 200)).toBe('12345678901.23');
  expect(serviceAtTick('101', 0)).toBe('0.00');
  expect(serviceAtTick('101', 400)).toBe('2.02');
  for (const tick of [-1, 401, 199.5, NaN]) expect(() => serviceAtTick('101', tick)).toThrow();
});

it('gives all sixteen frozen councils a service scenario without touching held entries or arithmetic precision', () => {
  const frozen = freezePilots().filter(p => p.ownPence === p.priorOwnPence);
  expect(frozen).toHaveLength(16);
  for (const pilot of frozen) {
    const original = JSON.stringify(pilot);
    const inputs = initialFreezeInputs(pilot);
    let change = 0n;
    for (const service of pilot.services.filter(s => s.editable)) {
      inputs.servicePounds[service.id] = serviceAtTick(service.pence, 190);
      change += (parsePence(inputs.servicePounds[service.id])-BigInt(service.pence)) * 100n;
    }
    const result = calculateFreeze(pilot, inputs);
    expect(result.remaining).toBe(change);
    expect(result.remaining).toBeLessThan(0n);
    expect(result.financingChange).toBe(0n);
    expect(JSON.stringify(pilot)).toBe(original);
  }
});

it('keeps an exact pounds entry when stepping and clamps only at the exploration endpoints', () => {
  expect(stepService('100000', '123.45', 1)).toBe('128.45');
  expect(stepService('100000', '123.45', -1)).toBe('118.45');
  expect(stepService('100000', '0.01', -1)).toBe('0.00');
  expect(stepService('100000', '1999.99', 1)).toBe('2000.00');
});
