/**
 * postMessage contract between this native shell and the web/ micro-app.
 *
 * Hand-mirrored (not imported) from web/src/contract.ts — web/ is not
 * evaluated and must only emit/receive postMessage, so each side keeps its
 * own copy of the contract shape, matching web/README.md's stated design.
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

/** Type guard for the one message this app expects from the web micro-app. Anything else is ignored. */
export function isDepositConfirmedMessage(value: unknown): value is WebToNativeMessage {
  if (!isRecord(value) || value.type !== 'DEPOSIT_CONFIRMED' || !isRecord(value.payload)) {
    return false;
  }
  const { payload } = value;
  return typeof payload.goalId === 'string' && typeof payload.amount === 'number';
}

export function buildInitSessionMessage(
  sessionId: string,
  userInfo: UserInfo,
  goal: GoalSnapshot,
): NativeToWebMessage {
  return {
    type: 'INIT_SESSION',
    payload: { sessionId, goalId: goal.id, userInfo, goal },
  };
}
