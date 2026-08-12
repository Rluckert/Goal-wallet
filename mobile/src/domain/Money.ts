/**
 * A non-negative monetary amount, rounded to cents. Framework-free — no
 * react/react-native/redux imports allowed in this file or anywhere under
 * domain/.
 */
export class Money {
  private readonly amount: number;

  private constructor(amount: number) {
    this.amount = amount;
  }

  static of(amount: number): Money {
    if (!Number.isFinite(amount)) {
      throw new Error(`Money.of: amount must be finite, got ${amount}.`);
    }
    if (amount < 0) {
      throw new Error(`Money.of: amount must not be negative, got ${amount}.`);
    }
    return new Money(Math.round(amount * 100) / 100);
  }

  static zero(): Money {
    return new Money(0);
  }

  add(other: Money): Money {
    return Money.of(this.amount + other.amount);
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  toNumber(): number {
    return this.amount;
  }
}
