import { createAsyncThunk, createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { computeProgressPercent } from '../../domain/Progress';
import type { SavingsGoal } from '../../domain/SavingsGoal';
import { GetGoals } from '../../application/GetGoals';
import { MakeDeposit } from '../../application/MakeDeposit';
import { CreateGoal } from '../../application/CreateGoal';
import { AsyncStorageGoalsRepository } from '../repositories/AsyncStorageGoalsRepository';
import { SavingsNotifier } from '../nativeLibrary/SavingsNotifier';

/**
 * Plain, serializable DTO — Redux state must not hold class instances.
 * Structurally the same shape as AsyncStorageGoalsRepository's StoredGoal,
 * and deliberately not shared with it — see that file's comment on why
 * Redux state and the on-disk storage schema are kept independently mapped.
 */
export interface GoalDTO {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
}

function toDTO(goal: SavingsGoal): GoalDTO {
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount.toNumber(),
    savedAmount: goal.savedAmount.toNumber(),
  };
}

export interface GoalsState {
  goals: Record<string, GoalDTO>;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
}

const initialState: GoalsState = {
  goals: {},
  status: 'idle',
  error: null,
};

/**
 * Composition: a single repository instance backs every use-case call this
 * slice makes. No extra composition-root indirection for a project this
 * size — this is the one place infrastructure/ wires application/ up.
 */
const repository = new AsyncStorageGoalsRepository();

export const loadGoals = createAsyncThunk('goals/load', async () => {
  const goals = await new GetGoals(repository).execute();
  return goals.map(toDTO);
});

export const makeDeposit = createAsyncThunk(
  'goals/makeDeposit',
  async (input: { goalId: string; amount: number }) => {
    const result = await new MakeDeposit(repository).execute(input);
    if (result.justCompleted) {
      SavingsNotifier.notifyGoalCompleted(result.goal.name);
    }
    return toDTO(result.goal);
  },
);

export const createGoal = createAsyncThunk(
  'goals/create',
  async (input: { name: string; targetAmount: number }) => {
    const goal = await new CreateGoal(repository).execute(input);
    return toDTO(goal);
  },
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadGoals.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadGoals.fulfilled, (state, action: PayloadAction<GoalDTO[]>) => {
        state.status = 'ready';
        state.goals = Object.fromEntries(action.payload.map(goal => [goal.id, goal]));
      })
      .addCase(loadGoals.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Failed to load goals.';
      })
      .addCase(makeDeposit.fulfilled, (state, action: PayloadAction<GoalDTO>) => {
        state.goals[action.payload.id] = action.payload;
      })
      .addCase(makeDeposit.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to make deposit.';
      })
      .addCase(createGoal.fulfilled, (state, action: PayloadAction<GoalDTO>) => {
        state.goals[action.payload.id] = action.payload;
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to create goal.';
      });
  },
});

export const goalsReducer = goalsSlice.reducer;

export interface GoalsRootState {
  goals: GoalsState;
}

export const selectAllGoals = createSelector(
  (state: GoalsRootState) => state.goals.goals,
  goals => Object.values(goals),
);

export function selectGoalById(state: GoalsRootState, id: string): GoalDTO | undefined {
  return state.goals.goals[id];
}

export function selectGoalProgress(goal: GoalDTO): number {
  return computeProgressPercent(goal.savedAmount, goal.targetAmount);
}
