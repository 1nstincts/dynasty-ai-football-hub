
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface League {
  id: string;
  name: string;
  type: string;
  size: number;
  teams: string[];
}

interface LeaguesState {
  leagues: League[];
  currentLeague: League | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LeaguesState = {
  leagues: [],
  currentLeague: null,
  isLoading: false,
  error: null,
};

const leaguesSlice = createSlice({
  name: 'leagues',
  initialState,
  reducers: {
    setLeagues: (state, action: PayloadAction<League[]>) => {
      state.leagues = action.payload;
    },
    addLeague: (state, action: PayloadAction<League>) => {
      state.leagues.push(action.payload);
    },
    setCurrentLeague: (state, action: PayloadAction<League>) => {
      state.currentLeague = action.payload;
    },
    updateLeague: (state, action: PayloadAction<League>) => {
      const index = state.leagues.findIndex(league => league.id === action.payload.id);
      if (index !== -1) {
        state.leagues[index] = action.payload;
        if (state.currentLeague?.id === action.payload.id) {
          state.currentLeague = action.payload;
        }
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

export const { setLeagues, addLeague, setCurrentLeague, updateLeague, setLoading, setError } = leaguesSlice.actions;
export default leaguesSlice.reducer;
