
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Matchup {
  id: string;
  leagueId: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam?: {
    name: string;
    avatar?: string;
  };
  awayTeam?: {
    name: string;
    avatar?: string;
  };
}

interface MatchupsState {
  matchups: Matchup[];
  currentWeek: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: MatchupsState = {
  matchups: [],
  currentWeek: 1,
  isLoading: false,
  error: null,
};

const matchupsSlice = createSlice({
  name: 'matchups',
  initialState,
  reducers: {
    setMatchups: (state, action: PayloadAction<Matchup[]>) => {
      state.matchups = action.payload;
    },
    setCurrentWeek: (state, action: PayloadAction<number>) => {
      state.currentWeek = action.payload;
    },
    updateMatchup: (state, action: PayloadAction<Matchup>) => {
      const index = state.matchups.findIndex(matchup => matchup.id === action.payload.id);
      if (index !== -1) {
        state.matchups[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setMatchups, setCurrentWeek, updateMatchup, setLoading, setError } = matchupsSlice.actions;
export default matchupsSlice.reducer;
