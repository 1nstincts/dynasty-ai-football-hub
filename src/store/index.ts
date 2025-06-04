
import { configureStore } from '@reduxjs/toolkit';
import leaguesReducer from './slices/leaguesSlice';
import teamsReducer from './slices/teamsSlice';
import playersReducer from './slices/playersSlice';
import userReducer from './slices/userSlice';
import matchupsReducer from './slices/matchupsSlice';
import tradesReducer from './slices/tradesSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    leagues: leaguesReducer,
    teams: teamsReducer,
    players: playersReducer,
    user: userReducer,
    matchups: matchupsReducer,
    trades: tradesReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
