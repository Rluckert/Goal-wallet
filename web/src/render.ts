import type { GoalSnapshot } from './contract';

export interface GoalElements {
  goalName: HTMLElement;
  status: HTMLElement;
  progressCard: HTMLElement;
  savedAmount: HTMLElement;
  targetAmount: HTMLElement;
  progressFill: HTMLElement;
  progressLabel: HTMLElement;
  depositForm: HTMLElement;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Clamped 0-100. A zero-or-negative target is a degenerate goal with no progress to report. */
export function computeProgressPercent(savedAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) {
    return 0;
  }
  const raw = (savedAmount / targetAmount) * 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

export function renderGoal(elements: GoalElements, goal: GoalSnapshot): void {
  const percent = computeProgressPercent(goal.savedAmount, goal.targetAmount);

  elements.goalName.textContent = goal.name;
  elements.status.textContent = '';
  elements.savedAmount.textContent = formatCurrency(goal.savedAmount);
  elements.targetAmount.textContent = `of ${formatCurrency(goal.targetAmount)}`;
  elements.progressFill.style.width = `${percent}%`;
  elements.progressLabel.textContent = `${percent}% complete`;

  elements.progressCard.hidden = false;
  elements.depositForm.hidden = false;
}
