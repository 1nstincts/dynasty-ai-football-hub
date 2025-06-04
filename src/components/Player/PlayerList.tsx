import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { Search, TrendingUp, RefreshCw } from 'lucide-react';
import { Player } from '@/store/slices/playersSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PlayerService from '@/services/PlayerService';
import SleeperService from '@/services/SleeperService';

interface PlayerListProps {
  leagueId: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ leagueId }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  
  // Define the current NFL season and week
  const currentYear = new Date().getFullYear();
  const currentSeason = currentYear >= 9 && currentYear <= 2 ? currentYear - 1 : currentYear;
  const [currentWeek, setCurrentWeek] = useState(1); // Default to week 1
  
  useEffect(() => {
    // Fetch players from Sleeper API
    const fetchPlayerData = async () => {
      setIsLoading(true);
      try {
        const data = await PlayerService.getAllPlayers(true);
        setPlayers(data);
      } catch (err) {
        console.error('Failed to fetch players:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlayerData();
    
    // Set up interval for auto-refresh (every 5 minutes)
    const refreshInterval = setInterval(() => {
      refreshPlayerData();
    }, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Function to manually refresh player data
  const refreshPlayerData = async () => {
    setIsRefreshing(true);
    try {
      // Update the current week if needed (could be calculated based on current date)
      PlayerService.setCurrentPeriod(currentSeason, currentWeek);
      
      // If viewing trending players
      if (showTrending) {
        const trendingPlayers = await PlayerService.getTrendingPlayers();
        setPlayers(trendingPlayers);
      } else {
        // Normal refresh of all player data
        const updatedPlayers = await PlayerService.refreshPlayerData(players);
        setPlayers(updatedPlayers);
      }
    } catch (error) {
      console.error('Error refreshing player data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Toggle between all players and trending players
  const toggleTrendingPlayers = async () => {
    setIsLoading(true);
    try {
      if (!showTrending) {
        // Fetch trending players
        const trendingPlayers = await PlayerService.getTrendingPlayers();
        setPlayers(trendingPlayers);
      } else {
        // Go back to all players
        const allPlayers = await PlayerService.getAllPlayers();
        setPlayers(allPlayers);
      }
      setShowTrending(!showTrending);
    } catch (error) {
      console.error('Error toggling trending players:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter players based on search and position
  const filteredPlayers = players.filter(player => {
    // Search filter
    if (searchQuery && !player.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !player.team.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Position filter
    if (positionFilter !== 'ALL' && player.position !== positionFilter) {
      return false;
    }
    
    return true;
  });

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

  const getPointsDisplay = (player: Player) => {
    // Calculate total fantasy points from stats
    let points = 0;
    
    if (player.stats) {
      // Passing stats (4pt per TD, 0.04pt per yard, -1 per INT)
      if (player.stats.passing) {
        points += (player.stats.passing.touchdowns || 0) * 4;
        points += (player.stats.passing.yards || 0) * 0.04;
        points -= (player.stats.passing.interceptions || 0);
      }
      
      // Rushing stats (6pt per TD, 0.1pt per yard)
      if (player.stats.rushing) {
        points += (player.stats.rushing.touchdowns || 0) * 6;
        points += (player.stats.rushing.yards || 0) * 0.1;
      }
      
      // Receiving stats (6pt per TD, 0.1pt per yard, 0.5pt per reception - half PPR)
      if (player.stats.receiving) {
        points += (player.stats.receiving.touchdowns || 0) * 6;
        points += (player.stats.receiving.yards || 0) * 0.1;
        points += (player.stats.receiving.receptions || 0) * 0.5;
      }
    }
    
    return points > 0 ? Math.round(points * 10) / 10 : '-';
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Players</h2>
        </div>

        <div className="fantasy-card">
          <div className="text-xs text-sleeper-gray px-4 py-2 border-b border-sleeper-dark grid grid-cols-12">
            <div className="col-span-1">POS</div>
            <div className="col-span-4">Name</div>
            <div className="col-span-1 text-center">Age</div>
            <div className="col-span-2 text-center">Team</div>
            <div className="col-span-2 text-center">Exp</div>
            <div className="col-span-2 text-center">Points</div>
          </div>
          
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="player-row grid grid-cols-12">
              <div className="col-span-1"><Skeleton className="h-6 w-10" /></div>
              <div className="col-span-4"><Skeleton className="h-6 w-40" /></div>
              <div className="col-span-1 text-center"><Skeleton className="h-6 w-6 mx-auto" /></div>
              <div className="col-span-2 text-center"><Skeleton className="h-6 w-12 mx-auto" /></div>
              <div className="col-span-2 text-center"><Skeleton className="h-6 w-12 mx-auto" /></div>
              <div className="col-span-2 text-center"><Skeleton className="h-6 w-16 mx-auto" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {showTrending ? 'Trending Players' : 'Players'}
        </h2>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-sleeper-gray" />
            <input
              type="text"
              placeholder="Find player Ctrl + K"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 bg-sleeper-dark border border-sleeper-dark rounded text-white placeholder-sleeper-gray text-sm"
            />
          </div>
          
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="bg-sleeper-dark border border-sleeper-dark text-white rounded p-2 text-sm"
          >
            <option value="ALL">ALL</option>
            <option value="QB">QB</option>
            <option value="RB">RB</option>
            <option value="WR">WR</option>
            <option value="TE">TE</option>
            <option value="K">K</option>
            <option value="DEF">DEF</option>
          </select>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={toggleTrendingPlayers}
            className={showTrending ? "bg-red-600 text-white" : ""}
          >
            <TrendingUp className="h-4 w-4 mr-1" /> 
            {showTrending ? "Show All" : "Trending"}
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshPlayerData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="fantasy-card">
        <div className="text-xs text-sleeper-gray px-4 py-2 border-b border-sleeper-dark grid grid-cols-12">
          <div className="col-span-1">POS</div>
          <div className="col-span-4">Name</div>
          <div className="col-span-1 text-center">Age</div>
          <div className="col-span-2 text-center">Team</div>
          <div className="col-span-2 text-center">Exp</div>
          <div className="col-span-2 text-center">{showTrending ? 'Trend' : 'Points'}</div>
        </div>

        {filteredPlayers.length === 0 ? (
          <div className="py-8 text-center text-sleeper-gray">
            No players found matching your criteria
          </div>
        ) : (
          filteredPlayers.map(player => (
            <div key={player.id} className="player-row grid grid-cols-12">
              <div className="col-span-1">
                <Badge variant="outline" className={`${getPositionClass(player.position)} justify-center`}>
                  {player.position}
                </Badge>
              </div>
              <div className="col-span-4 font-medium flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={`https://sleepercdn.com/content/nfl/players/${player.id}.jpg`} alt={player.name} />
                  <AvatarFallback style={getTeamColorStyle(player)}>{getInitials(player.name)}</AvatarFallback>
                </Avatar>
                <a 
                  href={`/players/${player.id}`} 
                  className="truncate hover:text-primary hover:underline"
                >
                  {player.name}
                </a>
                {player.trending && (
                  <TrendingUp className="h-4 w-4 ml-2 text-green-500" />
                )}
              </div>
              <div className="col-span-1 text-center">
                {player.age || '-'}
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-semibold">{player.team}</span>
              </div>
              <div className="col-span-2 text-center">
                {player.experience || '-'}
              </div>
              <div className="col-span-2 text-center">
                {showTrending && player.trending 
                  ? <span className="text-green-500">+{player.trending.value}</span>
                  : getPointsDisplay(player)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlayerList;