import { buildDepositConfirmedMessage, isInitSessionMessage, type GoalSnapshot } from './contract';
import { renderGoal, type GoalElements } from './render';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

function requireElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing #${id} in index.html`);
  }
  return el as T;
}

function getElements(): GoalElements {
  return {
    goalName: requireElement('goal-name'),
    status: requireElement('status'),
    progressCard: requireElement('progress-card'),
    savedAmount: requireElement('saved-amount'),
    targetAmount: requireElement('target-amount'),
    progressFill: requireElement('progress-fill'),
    progressLabel: requireElement('progress-label'),
    depositForm: requireElement('deposit-form'),
  };
}

/**
 * Sends a message to the native shell. Falls back to console.log when
 * ReactNativeWebView isn't present (e.g. opening dist/index.html directly
 * in a desktop browser to check rendering/validation without the app).
 */
function postToNative(message: unknown): void {
  const serialized = JSON.stringify(message);
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(serialized);
  } else {
    console.log('[postMessage -> native]', serialized);
  }
}

function parseAmount(rawValue: string): number | null {
  if (rawValue.trim() === '') {
    return null;
  }
  const amount = Number(rawValue);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return Math.round(amount * 100) / 100;
}

function main(): void {
  const elements = getElements();
  const amountInput = requireElement<HTMLInputElement>('amount-input');
  const formError = requireElement('form-error');
  const confirmation = requireElement('confirmation');
  const form = elements.depositForm as HTMLFormElement;

  let currentGoal: GoalSnapshot | null = null;

  function handleIncomingMessage(event: MessageEvent): void {
    let parsed: unknown;
    try {
      parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch {
      return; // not JSON, not for us
    }

    if (!isInitSessionMessage(parsed)) {
      return; // ignore anything outside the contract
    }

    currentGoal = parsed.payload.goal;
    renderGoal(elements, currentGoal);
  }

  // Android delivers WebView messages on `document`, iOS on `window`.
  // Both listeners are wired so the contract holds on either platform.
  document.addEventListener('message', handleIncomingMessage as EventListener);
  window.addEventListener('message', handleIncomingMessage as EventListener);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    formError.textContent = '';
    confirmation.textContent = '';

    if (!currentGoal) {
      formError.textContent = 'Session not ready yet.';
      return;
    }

    const amount = parseAmount(amountInput.value);
    if (amount === null) {
      formError.textContent = 'Enter a valid amount greater than 0.';
      return;
    }

    postToNative(buildDepositConfirmedMessage(currentGoal.id, amount));
    confirmation.textContent = `Deposit of ${amount.toFixed(2)} sent.`;
    amountInput.value = '';
  });
}

main();
