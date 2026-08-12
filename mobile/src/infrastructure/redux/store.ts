import { configureStore } from '@reduxjs/toolkit';
import { goalsReducer } from './goalsSlice';

export const store = configureStore({
  reducer: {
    goals: goalsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
