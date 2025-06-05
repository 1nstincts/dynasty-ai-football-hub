import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlayerStats {
  rushing?: {
    yards: number;
    touchdowns: number;
    attempts: number;
  };
  receiving?: {
    yards: number;
    touchdowns: number;
    receptions: number;
    targets: number;
  };
  passing?: {
    yards: number;
    touchdowns: number;
    interceptions: number;
    completions: number;
    attempts: number;
  };
}

export interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  age: number;
  experience: number;
  dynasty_value?: number;
  redraft_value?: number;
  dynasty_rank?: {
    overall: number;
    position: number;
  };
  trending?: {
    direction: 'up' | 'down';
    value: number;
  };
  stats?: {
    passing?: {
      yards: number;
      touchdowns: number;
      interceptions: number;
    };
    rushing?: {
      yards: number;
      touchdowns: number;
    };
    receiving?: {
      yards: number;
      touchdowns: number;
      receptions: number;
    };
  };
}

interface PlayersState {
  players: Player[];
  filteredPlayers: Player[];
  searchQuery: string;
  positionFilter: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: PlayersState = {
  players: [],
  filteredPlayers: [],
  searchQuery: '',
  positionFilter: 'ALL',
  isLoading: false,
  error: null,
};

const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    setPlayers: (state, action: PayloadAction<Player[]>) => {
      state.players = action.payload;
      state.filteredPlayers = filterPlayers(
        action.payload,
        state.searchQuery,
        state.positionFilter
      );
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredPlayers = filterPlayers(
        state.players,
        action.payload,
        state.positionFilter
      );
    },
    setPositionFilter: (state, action: PayloadAction<string>) => {
      state.positionFilter = action.payload;
      state.filteredPlayers = filterPlayers(
        state.players,
        state.searchQuery,
        action.payload
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

function filterPlayers(players: Player[], query: string, position: string): Player[] {
  let filtered = [...players];
  
  if (query) {
    filtered = filtered.filter(
      player => player.name.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  if (position !== 'ALL') {
    filtered = filtered.filter(player => player.position === position);
  }
  
  return filtered;
}

export const { setPlayers, setSearchQuery, setPositionFilter, setLoading, setError } = playersSlice.actions;
export default playersSlice.reducer;
