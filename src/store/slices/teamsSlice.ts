
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Team {
  id: string;
  name: string;
  userId: string;
  leagueId: string;
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  standings: number;
  avatar?: string;
}

interface TeamsState {
  teams: Team[];
  currentTeam: Team | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  teams: [],
  currentTeam: null,
  isLoading: false,
  error: null,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setTeams: (state, action: PayloadAction<Team[]>) => {
      state.teams = action.payload;
    },
    addTeam: (state, action: PayloadAction<Team>) => {
      state.teams.push(action.payload);
    },
    setCurrentTeam: (state, action: PayloadAction<Team>) => {
      state.currentTeam = action.payload;
    },
    updateTeam: (state, action: PayloadAction<Team>) => {
      const index = state.teams.findIndex(team => team.id === action.payload.id);
      if (index !== -1) {
        state.teams[index] = action.payload;
        if (state.currentTeam?.id === action.payload.id) {
          state.currentTeam = action.payload;
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

export const { setTeams, addTeam, setCurrentTeam, updateTeam, setLoading, setError } = teamsSlice.actions;
export default teamsSlice.reducer;
