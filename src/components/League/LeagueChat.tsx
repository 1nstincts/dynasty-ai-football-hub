
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { MessageSquare, Send } from 'lucide-react';
import { Message } from '../../store/slices/chatSlice';

interface LeagueChatProps {
  leagueId: string;
}

const LeagueChat: React.FC<LeagueChatProps> = ({ leagueId }) => {
  const [newMessage, setNewMessage] = useState('');
  const messages = useSelector((state: RootState) => 
    state.chat.messages[leagueId] || []
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useSelector((state: RootState) => state.user.currentUser);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    // In a real app, this would dispatch an action to add the message
    // For now, we're just simulating it
    console.log('Sending message:', newMessage);
    
    setNewMessage('');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-sleeper-darker border-l border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" /> League Chat
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message: Message) => (
          <div key={message.id} className="flex">
            <div 
              className="w-8 h-8 rounded-full bg-sleeper-primary flex items-center justify-center mr-2"
              title={message.user?.username || "Unknown"}
            >
              {message.user?.username.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <span className="font-semibold text-sm">
                  {message.user?.username || "Unknown"}
                </span>
                <span className="ml-2 text-xs text-sleeper-gray">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <p className="text-white text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Enter Message"
          className="flex-1 bg-sleeper-dark border border-border rounded p-2 text-white"
        />
        <button 
          type="submit" 
          className="ml-2 bg-sleeper-accent text-sleeper-dark p-2 rounded hover:bg-sleeper-accent/90"
          disabled={!newMessage.trim()}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default LeagueChat;
