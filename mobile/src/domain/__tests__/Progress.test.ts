import { computeProgressPercent, isProgressComplete } from '../Progress';

describe('computeProgressPercent', () => {
  it('computes a rounded percentage', () => {
    expect(computeProgressPercent(500, 1000)).toBe(50);
    expect(computeProgressPercent(333, 1000)).toBe(33);
  });

  it('is 0 for a freshly created goal', () => {
    expect(computeProgressPercent(0, 1000)).toBe(0);
  });

  it('is 100 when saved equals target', () => {
    expect(computeProgressPercent(1000, 1000)).toBe(100);
  });

  it('clamps above 100 (should not happen given SavingsGoal.deposit, but the function itself is defensive)', () => {
    expect(computeProgressPercent(1500, 1000)).toBe(100);
  });

  it('returns 0 for a non-positive target instead of dividing by zero', () => {
    expect(computeProgressPercent(0, 0)).toBe(0);
    expect(computeProgressPercent(100, 0)).toBe(0);
    expect(computeProgressPercent(100, -50)).toBe(0);
  });
});

describe('isProgressComplete', () => {
  it('is true at and above 100', () => {
    expect(isProgressComplete(100)).toBe(true);
    expect(isProgressComplete(101)).toBe(true);
  });

  it('is false below 100', () => {
    expect(isProgressComplete(99)).toBe(false);
    expect(isProgressComplete(0)).toBe(false);
  });
});
