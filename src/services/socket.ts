
import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { addMessage } from '../store/slices/chatSlice';
import { updateTrade } from '../store/slices/tradesSlice';
import { updateMatchup } from '../store/slices/matchupsSlice';

class SocketService {
  private socket: Socket | null = null;

  connect(url: string = 'http://localhost:3001'): void {
    this.socket = io(url);
    
    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
    
    this.socket.on('chat-message', (message) => {
      store.dispatch(addMessage(message));
    });
    
    this.socket.on('trade-update', (trade) => {
      store.dispatch(updateTrade(trade));
    });
    
    this.socket.on('matchup-update', (matchup) => {
      store.dispatch(updateMatchup(matchup));
    });
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  joinLeague(leagueId: string): void {
    if (this.socket) {
      this.socket.emit('join-league', leagueId);
    }
  }
  
  sendMessage(leagueId: string, message: string): void {
    if (this.socket) {
      this.socket.emit('chat-message', { leagueId, message });
    }
  }
  
  proposeTrade(trade: any): void {
    if (this.socket) {
      this.socket.emit('propose-trade', trade);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
