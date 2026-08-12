import { buildInitSessionMessage, isDepositConfirmedMessage } from '../contracts';

describe('isDepositConfirmedMessage', () => {
  it('accepts a well-formed DEPOSIT_CONFIRMED message', () => {
    const message = { type: 'DEPOSIT_CONFIRMED', payload: { goalId: 'g-1', amount: 50000 } };
    expect(isDepositConfirmedMessage(message)).toBe(true);
  });

  it('rejects a different message type', () => {
    expect(isDepositConfirmedMessage({ type: 'INIT_SESSION', payload: {} })).toBe(false);
  });

  it('rejects a missing payload', () => {
    expect(isDepositConfirmedMessage({ type: 'DEPOSIT_CONFIRMED' })).toBe(false);
  });

  it('rejects wrong-typed payload fields', () => {
    expect(
      isDepositConfirmedMessage({ type: 'DEPOSIT_CONFIRMED', payload: { goalId: 1, amount: '50' } }),
    ).toBe(false);
  });

  it('rejects non-objects', () => {
    expect(isDepositConfirmedMessage('not json')).toBe(false);
    expect(isDepositConfirmedMessage(null)).toBe(false);
    expect(isDepositConfirmedMessage(undefined)).toBe(false);
  });
});

describe('buildInitSessionMessage', () => {
  it('builds the native->web handshake payload', () => {
    const goal = { id: 'g-1', name: 'New Laptop', targetAmount: 1000, savedAmount: 350 };
    const userInfo = { id: 'u-1', name: 'Test User' };

    const message = buildInitSessionMessage('session-1', userInfo, goal);

    expect(message).toEqual({
      type: 'INIT_SESSION',
      payload: { sessionId: 'session-1', goalId: 'g-1', userInfo, goal },
    });
  });
});
