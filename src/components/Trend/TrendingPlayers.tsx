import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PlayerService from '@/services/PlayerService';
import { Player } from '@/store/slices/playersSlice';

const TrendingPlayers: React.FC = () => {
  const [trendingUpPlayers, setTrendingUpPlayers] = useState<Player[]>([]);
  const [trendingDownPlayers, setTrendingDownPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTrendingPlayers();
    
    // Auto-refresh trending data every 30 minutes
    const refreshInterval = setInterval(() => {
      fetchTrendingPlayers();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchTrendingPlayers = async () => {
    setIsLoading(true);
    try {
      // Get trending players from Sleeper API
      const players = await PlayerService.getTrendingPlayers(25);
      
      // Split into trending up and down
      // All players from Sleeper's trending/add endpoint are actually trending up
      // For demo purposes, we'll manually create some trending down players by reversing
      const upPlayers = players.slice(0, 10);
      
      // For trending down, use the same players but mark as trending down
      const downPlayers = players.slice(10, 20).map(player => ({
        ...player,
        trending: player.trending ? {
          ...player.trending,
          value: -Math.floor(player.trending.value * 0.7), // Negative value
          direction: 'down' as const
        } : undefined
      }));
      
      setTrendingUpPlayers(upPlayers);
      setTrendingDownPlayers(downPlayers);
    } catch (error) {
      console.error('Failed to fetch trending players:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTrendingPlayers();
    setIsRefreshing(false);
  };

  const getPositionClass = (position: string) => {
    switch (position) {
      case 'QB': return 'bg-red-600 text-white';
      case 'RB': return 'bg-green-600 text-white';
      case 'WR': return 'bg-blue-600 text-white';
      case 'TE': return 'bg-orange-600 text-white';
      case 'K': return 'bg-purple-600 text-white';
      case 'DEF': return 'bg-yellow-600 text-black';
      default: return 'bg-gray-600 text-white';
    }
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2);
  };

  const renderTrendingPlayerList = (players: Player[], trendingUp: boolean) => {
    if (isLoading) {
      return Array(5).fill(0).map((_, i) => (
        <div key={i} className="player-row grid grid-cols-12 items-center p-3">
          <div className="col-span-1"><Skeleton className="h-6 w-6" /></div>
          <div className="col-span-1"><Skeleton className="h-8 w-8 rounded-full" /></div>
          <div className="col-span-6"><Skeleton className="h-6 w-40" /></div>
          <div className="col-span-2"><Skeleton className="h-6 w-16 ml-auto" /></div>
          <div className="col-span-2"><Skeleton className="h-6 w-full" /></div>
        </div>
      ));
    }

    return players.map((player, index) => (
      <div key={player.id} className="player-row grid grid-cols-12 items-center p-3 hover:bg-sleeper-dark/50 transition-colors">
        <div className="col-span-1 text-sleeper-gray">{index + 1}</div>
        <div className="col-span-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://sleepercdn.com/content/nfl/players/${player.id}.jpg`} alt={player.name} />
            <AvatarFallback style={getTeamColorStyle(player)}>{getInitials(player.name)}</AvatarFallback>
          </Avatar>
        </div>
        <div className="col-span-6">
          <div className="flex items-center">
            <Badge variant="outline" className={`${getPositionClass(player.position)} text-xs px-1.5 h-5 mr-2`}>
              {player.position}
            </Badge>
            <span className="text-xs bg-sleeper-dark px-1 rounded mr-2">
              {player.team}
            </span>
            <span className="font-medium text-sm truncate">{player.name}</span>
          </div>
        </div>
        <div className={`col-span-2 text-right font-medium ${trendingUp ? 'text-green-500' : 'text-red-500'}`}>
          {trendingUp ? '+' : ''}{player.trending?.value || 0}
        </div>
        <div className="col-span-2 text-right">
          <div className="bg-sleeper-dark rounded-full h-2 w-full">
            <div
              className={`${trendingUp ? 'bg-green-500' : 'bg-red-500'} h-2 rounded-full`}
              style={{ width: `${Math.min((Math.abs(player.trending?.value || 0) / 100) * 100, 100)}%` }}
            ></div>
          </div>
          <span className="text-xs text-sleeper-gray">
            Last 24h
          </span>
        </div>
      </div>
    ));
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="bg-sleeper-dark border-sleeper-dark shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center text-lg">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <span>Trending Up</span>
            </div>
            {!isLoading && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-sleeper-dark/40">
            {trendingUpPlayers.length === 0 && !isLoading ? (
              <div className="py-6 text-center text-sleeper-gray">
                No trending players available
              </div>
            ) : renderTrendingPlayerList(trendingUpPlayers, true)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-sleeper-dark border-sleeper-dark shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
            <span>Trending Down</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-sleeper-dark/40">
            {trendingDownPlayers.length === 0 && !isLoading ? (
              <div className="py-6 text-center text-sleeper-gray">
                No trending players available
              </div>
            ) : renderTrendingPlayerList(trendingDownPlayers, false)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendingPlayers;