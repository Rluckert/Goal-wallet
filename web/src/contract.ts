/**
 * postMessage contract between the native shell (mobile/) and this micro-app.
 *
 * This is the source of truth for the contract shape. It is intentionally
 * NOT imported from mobile/ (and vice versa) — web/ is not evaluated and
 * must only emit/receive postMessage, so the contract is hand-mirrored on
 * both sides. See mobile/src/infrastructure/webview/contracts.ts for the
 * native-side copy.
 */

export interface GoalSnapshot {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
}

export interface UserInfo {
  id: string;
  name: string;
}

export type NativeToWebMessage = {
  type: 'INIT_SESSION';
  payload: {
    sessionId: string;
    goalId: string;
    userInfo: UserInfo;
    goal: GoalSnapshot;
  };
};

export type WebToNativeMessage = {
  type: 'DEPOSIT_CONFIRMED';
  payload: {
    goalId: string;
    amount: number;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isGoalSnapshot(value: unknown): value is GoalSnapshot {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.targetAmount === 'number' &&
    typeof value.savedAmount === 'number'
  );
}

function isUserInfo(value: unknown): value is UserInfo {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string';
}

/** Type guard for the one message this app expects from native. Anything else is ignored. */
export function isInitSessionMessage(value: unknown): value is NativeToWebMessage {
  if (!isRecord(value) || value.type !== 'INIT_SESSION' || !isRecord(value.payload)) {
    return false;
  }
  const { payload } = value;
  return (
    typeof payload.sessionId === 'string' &&
    typeof payload.goalId === 'string' &&
    isUserInfo(payload.userInfo) &&
    isGoalSnapshot(payload.goal)
  );
}

export function buildDepositConfirmedMessage(goalId: string, amount: number): WebToNativeMessage {
  return { type: 'DEPOSIT_CONFIRMED', payload: { goalId, amount } };
}
