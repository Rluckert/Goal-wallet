import {
  buildInitSessionMessage,
  isDepositConfirmedMessage,
  type GoalSnapshot,
  type UserInfo,
} from './contracts';

export interface DepositConfirmedEvent {
  type: 'DEPOSIT_CONFIRMED';
  goalId: string;
  amount: number;
}

/**
 * Adapter pattern: translates the raw postMessage string the WebView
 * delivers (JSON, no compile-time shape guarantee) into a typed domain
 * event, and serializes the outgoing native->web handshake. Nothing else
 * in presentation/ or infrastructure/ parses postMessage JSON directly —
 * it all goes through here.
 */
export class WebViewMessageAdapter {
  /** Returns null for anything malformed or outside the contract — callers just ignore it, no throwing. */
  parseIncoming(raw: string): DepositConfirmedEvent | null {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }

    if (!isDepositConfirmedMessage(parsed)) {
      return null;
    }

    return {
      type: 'DEPOSIT_CONFIRMED',
      goalId: parsed.payload.goalId,
      amount: parsed.payload.amount,
    };
  }

  buildInitSessionPayload(sessionId: string, userInfo: UserInfo, goal: GoalSnapshot): string {
    return JSON.stringify(buildInitSessionMessage(sessionId, userInfo, goal));
  }
}
