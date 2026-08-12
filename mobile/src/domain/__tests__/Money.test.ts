import { Money } from '../Money';

describe('Money', () => {
  it('rounds to cents', () => {
    expect(Money.of(10.005).toNumber()).toBe(10.01);
    expect(Money.of(10.004).toNumber()).toBe(10);
  });

  it('rejects negative amounts', () => {
    expect(() => Money.of(-1)).toThrow(/must not be negative/);
  });

  it('rejects non-finite amounts', () => {
    expect(() => Money.of(NaN)).toThrow(/must be finite/);
    expect(() => Money.of(Infinity)).toThrow(/must be finite/);
  });

  it('allows zero', () => {
    expect(Money.zero().toNumber()).toBe(0);
    expect(Money.zero().isPositive()).toBe(false);
  });

  it('adds two amounts', () => {
    expect(Money.of(10.5).add(Money.of(4.25)).toNumber()).toBe(14.75);
  });

  it('compares amounts', () => {
    expect(Money.of(10).isGreaterThan(Money.of(5))).toBe(true);
    expect(Money.of(5).isGreaterThan(Money.of(10))).toBe(false);
    expect(Money.of(5).isGreaterThan(Money.of(5))).toBe(false);
  });

  it('isPositive is true only above zero', () => {
    expect(Money.of(0.01).isPositive()).toBe(true);
    expect(Money.of(0).isPositive()).toBe(false);
  });
});
