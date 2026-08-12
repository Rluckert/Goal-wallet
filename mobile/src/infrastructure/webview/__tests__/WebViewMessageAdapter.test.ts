import { WebViewMessageAdapter } from '../WebViewMessageAdapter';

describe('WebViewMessageAdapter.parseIncoming', () => {
  const adapter = new WebViewMessageAdapter();

  it('translates a raw DEPOSIT_CONFIRMED postMessage string into a typed event', () => {
    const raw = JSON.stringify({
      type: 'DEPOSIT_CONFIRMED',
      payload: { goalId: 'g-1', amount: 50000 },
    });

    expect(adapter.parseIncoming(raw)).toEqual({
      type: 'DEPOSIT_CONFIRMED',
      goalId: 'g-1',
      amount: 50000,
    });
  });

  it('returns null for invalid JSON instead of throwing', () => {
    expect(adapter.parseIncoming('not json{')).toBeNull();
  });

  it('returns null for well-formed JSON outside the contract', () => {
    expect(adapter.parseIncoming(JSON.stringify({ type: 'SOMETHING_ELSE' }))).toBeNull();
  });
});

describe('WebViewMessageAdapter.buildInitSessionPayload', () => {
  const adapter = new WebViewMessageAdapter();

  it('serializes the native->web handshake as a JSON string', () => {
    const goal = { id: 'g-1', name: 'New Laptop', targetAmount: 1000, savedAmount: 350 };
    const userInfo = { id: 'u-1', name: 'Test User' };

    const payload = adapter.buildInitSessionPayload('session-1', userInfo, goal);
    const parsed = JSON.parse(payload);

    expect(parsed).toEqual({
      type: 'INIT_SESSION',
      payload: { sessionId: 'session-1', goalId: 'g-1', userInfo, goal },
    });
  });
});
