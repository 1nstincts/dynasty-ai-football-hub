import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { Plus, Search, TrendingUp, Trophy, Newspaper, BarChart3, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LeagueService } from '@/services/LeagueService';
import { setLoading, setLeagues } from '@/store/slices/leaguesSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import PlayerService from '@/services/PlayerService';
import { Player } from '@/store/slices/playersSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import TrendingPlayers from '@/components/Trend/TrendingPlayers';
import NewsFeed from '@/components/Player/NewsFeed';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const { leagues, isLoading } = useSelector((state: RootState) => state.leagues);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);

  useEffect(() => {
    const fetchLeagues = async () => {
      dispatch(setLoading(true));
      try {
        const leaguesData = await LeagueService.getUserLeagues('temp-user'); // In a real app, get the actual user ID
        dispatch(setLeagues(leaguesData));
      } catch (error) {
        console.error('Failed to fetch leagues:', error);
        toast({
          title: "Error Loading Leagues",
          description: "Could not load your leagues. Please try again later.",
          variant: "destructive",
        });
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchLeagues();
    
    // Fetch top players using Sleeper API
    const fetchTopPlayers = async () => {
      setPlayersLoading(true);
      try {
        const players = await PlayerService.getAllPlayers(true);
        // Get top 5 players (sorted by some criteria - in a real app this could be ADP or projected points)
        setTopPlayers(players.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch players:', error);
      } finally {
        setPlayersLoading(false);
      }
    };
    
    fetchTopPlayers();
  }, [dispatch, toast]);

  // Re-fetch leagues when component mounts (e.g., returning from create league)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const fetchLeagues = async () => {
          const leaguesData = await LeagueService.getUserLeagues('temp-user');
          dispatch(setLeagues(leaguesData));
        };
        fetchLeagues();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [dispatch]);

  const handleCreateLeague = () => {
    navigate('/create-league');
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

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Fantasy Football Hub</h1>
            <p className="text-sleeper-gray">Manage your dynasty leagues, check player stats, and make strategic moves all in one place.</p>
          </div>
          <Button 
            className="mt-4 md:mt-0 bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90 font-bold"
            size="lg"
            onClick={() => navigate('/new-features')}
          >
            Explore New Features
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-sleeper-dark border-sleeper-dark hover:border-sleeper-accent transition-colors cursor-pointer" onClick={handleCreateLeague}>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-sleeper-primary flex items-center justify-center mb-4">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create New League</h3>
              <p className="text-sm text-sleeper-gray">Start a new dynasty, keeper, or redraft league with AI opponents</p>
            </CardContent>
          </Card>
          
          <Card className="bg-sleeper-dark border-sleeper-dark hover:border-sleeper-accent transition-colors cursor-pointer" onClick={() => navigate('/players')}>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-sleeper-primary flex items-center justify-center mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Player Database</h3>
              <p className="text-sm text-sleeper-gray">Browse players, check stats, and analyze performance</p>
            </CardContent>
          </Card>
          
          <Card className="bg-sleeper-dark border-sleeper-dark hover:border-sleeper-accent transition-colors cursor-pointer" onClick={() => navigate('/rankings')}>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-sleeper-primary flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dynasty Rankings</h3>
              <p className="text-sm text-sleeper-gray">View position and overall rankings for dynasty leagues</p>
            </CardContent>
          </Card>
          
          <Card className="bg-sleeper-dark border-sleeper-dark hover:border-sleeper-accent transition-colors cursor-pointer" onClick={() => navigate('/trade-analyzer')}>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-sleeper-primary flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Trade Analyzer</h3>
              <p className="text-sm text-sleeper-gray">Evaluate trades and analyze their impact on your team</p>
            </CardContent>
          </Card>
          
          <Card className="bg-sleeper-accent border-sleeper-accent hover:border-sleeper-primary transition-colors cursor-pointer" onClick={() => navigate('/new-features')}>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-sleeper-dark flex items-center justify-center mb-4">
                <ExternalLink className="h-6 w-6 text-sleeper-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-sleeper-dark">New Features</h3>
              <p className="text-sm text-sleeper-dark">Explore all our latest dynasty fantasy football tools</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Top Players</h2>
            <Button 
              variant="outline" 
              className="text-sm"
              onClick={() => navigate('/players')}
            >
              View All
            </Button>
          </div>
          
          <Card className="bg-sleeper-dark border-sleeper-dark shadow-md">
            <CardContent className="p-4">
              {playersLoading ? (
                <>
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center py-3 border-b border-sleeper-dark/20 last:border-0">
                      <Skeleton className="h-10 w-10 rounded-full mr-3" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-40 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-8 w-12" />
                    </div>
                  ))}
                </>
              ) : (
                <div className="divide-y divide-sleeper-dark/20">
                  {topPlayers.map((player) => (
                    <div key={player.id} className="flex items-center py-3">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage 
                          src={`https://sleepercdn.com/content/nfl/players/${player.id}.jpg`}
                          alt={player.name}
                        />
                        <AvatarFallback style={getTeamColorStyle(player)}>
                          {getInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <a 
                            href={`/players/${player.id}`}
                            className="font-semibold hover:text-primary hover:underline"
                          >
                            {player.name}
                          </a>
                          <Badge className={`${getPositionClass(player.position)} ml-2 text-xs`}>
                            {player.position}
                          </Badge>
                        </div>
                        <p className="text-xs text-sleeper-gray">{player.team} • {player.age} yrs</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-sm font-medium">
                          #{player.dynasty_value ? Math.floor(player.dynasty_value / 100) : '?'}
                        </div>
                        <div className="text-xs text-sleeper-gray">Value</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  className="w-full text-sleeper-accent border-sleeper-accent hover:bg-sleeper-accent/10"
                  onClick={() => navigate('/players')}
                >
                  Browse Full Player Database
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Trending Players</h2>
          </div>
          <TrendingPlayers />
        </div>
        
        <div className="lg:col-span-1">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Latest News</h2>
          </div>
          <NewsFeed limit={5} />
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Leagues</h2>
        <Button 
          className="bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90"
          onClick={handleCreateLeague}
        >
          <Plus className="h-4 w-4 mr-2" /> Create League
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="fantasy-card">
              <div className="flex items-center mb-2">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : leagues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leagues.map(league => (
            <Link 
              to={`/league/${league.id}`} 
              key={league.id} 
              className="fantasy-card hover:border-sleeper-accent transition-colors"
            >
              <div className="flex items-center mb-2">
                <div className="team-avatar mr-3">
                  {league.name.charAt(0)}
                </div>
                <h2 className="text-lg font-semibold">{league.name}</h2>
              </div>
              <div className="text-sm text-sleeper-gray">
                <div className="flex justify-between">
                  <span>{league.type.charAt(0).toUpperCase() + league.type.slice(1)}</span>
                  <span>{league.size} Teams</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border border-dashed border-sleeper-dark rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No Leagues Yet</h3>
          <p className="text-sleeper-gray mb-4">Start by creating your first league</p>
          <Button 
            className="bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90"
            onClick={handleCreateLeague}
          >
            <Plus className="h-4 w-4 mr-2" /> Create League
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;