import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import { Player } from '@/store/slices/playersSlice';
import PlayerService from '@/services/PlayerService';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface AdvancedPlayerComparisonProps {
  limit?: number;
}

const AdvancedPlayerComparison: React.FC<AdvancedPlayerComparisonProps> = () => {
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchPlayers();
  }, []);
  
  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const allPlayers = await PlayerService.getAllPlayers(true);
      setPlayers(allPlayers);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlayer1Select = (playerId: string) => {
    const selectedPlayer = players.find(player => player.id === playerId) || null;
    setPlayer1(selectedPlayer);
  };
  
  const handlePlayer2Select = (playerId: string) => {
    const selectedPlayer = players.find(player => player.id === playerId) || null;
    setPlayer2(selectedPlayer);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2);
  };
  
  const getTeamColorStyle = (player: Player) => {
    // Using team abbreviation to generate a consistent color
    const teamColors: Record<string, { primary: string, secondary: string }> = {
      'ARI': { primary: '#97233F', secondary: '#FFFFFF' },
      'ATL': { primary: '#A71930', secondary: '#FFFFFF' },
      'BAL': { primary: '#241773', secondary: '#FFFFFF' },
      'BUF': { primary: '#00338D', secondary: '#FFFFFF' },
      'CAR': { primary: '#0085CA', secondary: '#FFFFFF' },
      'CHI': { primary: '#C83803', secondary: '#FFFFFF' },
      'CIN': { primary: '#FB4F14', secondary: '#FFFFFF' },
      'CLE': { primary: '#FF3C00', secondary: '#FFFFFF' },
      'DAL': { primary: '#003594', secondary: '#FFFFFF' },
      'DEN': { primary: '#FB4F14', secondary: '#FFFFFF' },
      'DET': { primary: '#0076B6', secondary: '#FFFFFF' },
      'GB': { primary: '#203731', secondary: '#FFFFFF' },
      'HOU': { primary: '#03202F', secondary: '#FFFFFF' },
      'IND': { primary: '#002C5F', secondary: '#FFFFFF' },
      'JAX': { primary: '#006778', secondary: '#FFFFFF' },
      'KC': { primary: '#E31837', secondary: '#FFFFFF' },
      'LAC': { primary: '#0080C6', secondary: '#FFFFFF' },
      'LA': { primary: '#003594', secondary: '#FFFFFF' },
      'LV': { primary: '#000000', secondary: '#FFFFFF' },
      'MIA': { primary: '#008E97', secondary: '#FFFFFF' },
      'MIN': { primary: '#4F2683', secondary: '#FFFFFF' },
      'NE': { primary: '#002244', secondary: '#FFFFFF' },
      'NO': { primary: '#D3BC8D', secondary: '#000000' },
      'NYG': { primary: '#0B2265', secondary: '#FFFFFF' },
      'NYJ': { primary: '#125740', secondary: '#FFFFFF' },
      'PHI': { primary: '#004C54', secondary: '#FFFFFF' },
      'PIT': { primary: '#FFB612', secondary: '#000000' },
      'SEA': { primary: '#002244', secondary: '#FFFFFF' },
      'SF': { primary: '#AA0000', secondary: '#FFFFFF' },
      'TB': { primary: '#D50A0A', secondary: '#FFFFFF' },
      'TEN': { primary: '#0C2340', secondary: '#FFFFFF' },
      'WAS': { primary: '#773141', secondary: '#FFFFFF' },
      'WSH': { primary: '#773141', secondary: '#FFFFFF' },
    };
    
    if (player.team && teamColors[player.team]) {
      return { 
        backgroundColor: teamColors[player.team].primary,
        color: teamColors[player.team].secondary
      };
    }
    
    return {}; // Default styling
  };
  
  // Mock comparison data
  const comparisonData = [
    { week: 1, player1: 22, player2: 18 },
    { week: 2, player1: 25, player2: 21 },
    { week: 3, player1: 19, player2: 24 },
    { week: 4, player1: 28, player2: 26 },
    { week: 5, player1: 23, player2: 20 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Select Player 1</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select onValueChange={handlePlayer1Select}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={`https://sleepercdn.com/content/nfl/players/${player.id}.jpg`} alt={player.name} />
                          <AvatarFallback style={getTeamColorStyle(player)}>{getInitials(player.name)}</AvatarFallback>
                        </Avatar>
                        {player.name} ({player.position} - {player.team})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {player1 && (
              <div className="mt-4 flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={`https://sleepercdn.com/content/nfl/players/${player1.id}.jpg`} alt={player1.name} />
                  <AvatarFallback style={getTeamColorStyle(player1)}>{getInitials(player1.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{player1.name}</h3>
                  <p className="text-sm text-gray-500">
                    {player1.position} - {player1.team}
                    {player1.trending && (
                      <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Select Player 2</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select onValueChange={handlePlayer2Select}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={`https://sleepercdn.com/content/nfl/players/${player.id}.jpg`} alt={player.name} />
                          <AvatarFallback style={getTeamColorStyle(player)}>{getInitials(player.name)}</AvatarFallback>
                        </Avatar>
                        {player.name} ({player.position} - {player.team})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {player2 && (
              <div className="mt-4 flex items-center">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={`https://sleepercdn.com/content/nfl/players/${player2.id}.jpg`} alt={player2.name} />
                  <AvatarFallback style={getTeamColorStyle(player2)}>{getInitials(player2.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{player2.name}</h3>
                  <p className="text-sm text-gray-500">
                    {player2.position} - {player2.team}
                    {player2.trending && (
                      <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="player1" 
                stroke="#8884d8" 
                strokeDasharray="0"
              />
              <Line 
                type="monotone" 
                dataKey="player2" 
                stroke="#82ca9d" 
                strokeDasharray="0"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedPlayerComparison;
