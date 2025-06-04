
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TradePlayer {
  id: string;
  playerId: string;
  fromTeam: boolean;
  playerName?: string;
  position?: string;
  team?: string;
}

export interface Trade {
  id: string;
  leagueId: string;
  fromTeamId: string;
  toTeamId: string;
  status: 'pending' | 'accepted' | 'rejected';
  players: TradePlayer[];
  fromTeam?: {
    name: string;
    avatar?: string;
  };
  toTeam?: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface TradesState {
  trades: Trade[];
  activeTrades: Trade[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TradesState = {
  trades: [],
  activeTrades: [],
  isLoading: false,
  error: null,
};

const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    setTrades: (state, action: PayloadAction<Trade[]>) => {
      state.trades = action.payload;
      state.activeTrades = action.payload.filter(trade => trade.status === 'pending');
    },
    addTrade: (state, action: PayloadAction<Trade>) => {
      state.trades.push(action.payload);
      if (action.payload.status === 'pending') {
        state.activeTrades.push(action.payload);
      }
    },
    updateTrade: (state, action: PayloadAction<Trade>) => {
      const index = state.trades.findIndex(trade => trade.id === action.payload.id);
      if (index !== -1) {
        state.trades[index] = action.payload;
        
        state.activeTrades = state.trades.filter(trade => trade.status === 'pending');
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

export const { setTrades, addTrade, updateTrade, setLoading, setError } = tradesSlice.actions;
export default tradesSlice.reducer;
