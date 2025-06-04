
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  leagueId: string;
  userId: string;
  content: string;
  type: 'chat' | 'trade' | 'system';
  timestamp: string;
  user?: {
    username: string;
    avatar?: string;
  };
}

interface ChatState {
  messages: Record<string, Message[]>; // leagueId -> messages
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: {},
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<{ leagueId: string; messages: Message[] }>) => {
      const { leagueId, messages } = action.payload;
      state.messages[leagueId] = messages;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const { leagueId } = action.payload;
      if (!state.messages[leagueId]) {
        state.messages[leagueId] = [];
      }
      state.messages[leagueId].push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setMessages, addMessage, setLoading, setError } = chatSlice.actions;
export default chatSlice.reducer;
