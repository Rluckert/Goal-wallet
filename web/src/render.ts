import type { GoalSnapshot } from './contract';

export interface GoalElements {
  goalName: HTMLElement;
  status: HTMLElement;
  amountsCard: HTMLElement;
  savedAmount: HTMLElement;
  targetAmount: HTMLElement;
  depositForm: HTMLElement;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function renderGoal(elements: GoalElements, goal: GoalSnapshot): void {
  elements.goalName.textContent = goal.name;
  elements.status.textContent = '';
  elements.savedAmount.textContent = formatCurrency(goal.savedAmount);
  elements.targetAmount.textContent = `of ${formatCurrency(goal.targetAmount)}`;

  elements.amountsCard.hidden = false;
  elements.depositForm.hidden = false;
}
