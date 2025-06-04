import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Player } from '@/store/slices/playersSlice';
import PlayerService from '@/services/PlayerService';
import SleeperService, { PlayerNews } from '@/services/SleeperService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Clock, Calendar, Info, BarChart, LineChart, Award, AlertCircle, Newspaper, ExternalLink } from 'lucide-react';

interface PlayerProfileProps {
  playerId?: string;
}

interface CareerStats {
  season: number;
  team: string;
  games_played: number;
  stats: Player['stats'];
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ playerId: propPlayerId }) => {
  const navigate = useNavigate();
  const { id: paramPlayerId } = useParams<{ id: string }>();
  const playerId = propPlayerId || paramPlayerId;
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [careerStats, setCareerStats] = useState<CareerStats[]>([]);
  const [playerNews, setPlayerNews] = useState<PlayerNews[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchPlayerData = async () => {
      setIsLoading(true);
      try {
        if (!playerId) {
          throw new Error('No player ID provided');
        }
        
        // Fetch player data
        const allPlayers = await PlayerService.getAllPlayers(true);
        const foundPlayer = allPlayers.find(p => p.id === playerId);
        
        if (!foundPlayer) {
          throw new Error('Player not found');
        }
        
        setPlayer(foundPlayer);
        
        // Fetch career stats (simulated for now, will need API support)
        const mockCareerStats = generateMockCareerStats(foundPlayer);
        setCareerStats(mockCareerStats);
        
        // Fetch player news from Sleeper API
        const news = await SleeperService.getPlayerNews(playerId);
        setPlayerNews(news);
      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlayerData();
  }, [playerId]);
  
  // Generate mock career stats based on player info
  const generateMockCareerStats = (player: Player): CareerStats[] => {
    const currentYear = new Date().getFullYear();
    const careerLength = player.experience || 1;
    const stats: CareerStats[] = [];
    
    // Create stats for each year of career
    for (let i = 0; i < careerLength; i++) {
      const season = currentYear - i;
      const seasonStats: CareerStats = {
        season,
        team: player.team,
        games_played: Math.floor(Math.random() * 7) + 10, // Random number between 10-16 games
        stats: {
          passing: player.position === 'QB' ? {
            yards: Math.floor(Math.random() * 2000) + 2000,
            touchdowns: Math.floor(Math.random() * 20) + 10,
            interceptions: Math.floor(Math.random() * 10) + 1,
            completions: Math.floor(Math.random() * 200) + 200,
            attempts: Math.floor(Math.random() * 200) + 300
          } : undefined,
          rushing: (player.position === 'RB' || player.position === 'QB') ? {
            yards: player.position === 'RB' 
              ? Math.floor(Math.random() * 800) + 400 
              : Math.floor(Math.random() * 300) + 100,
            touchdowns: player.position === 'RB' 
              ? Math.floor(Math.random() * 10) + 2 
              : Math.floor(Math.random() * 3) + 1,
            attempts: player.position === 'RB' 
              ? Math.floor(Math.random() * 150) + 100 
              : Math.floor(Math.random() * 50) + 30
          } : undefined,
          receiving: (player.position === 'WR' || player.position === 'TE' || player.position === 'RB') ? {
            yards: player.position === 'WR' 
              ? Math.floor(Math.random() * 800) + 400 
              : Math.floor(Math.random() * 400) + 100,
            touchdowns: player.position === 'WR' 
              ? Math.floor(Math.random() * 8) + 2 
              : Math.floor(Math.random() * 4) + 1,
            receptions: player.position === 'WR' 
              ? Math.floor(Math.random() * 60) + 30 
              : Math.floor(Math.random() * 30) + 10,
            targets: player.position === 'WR' 
              ? Math.floor(Math.random() * 40) + 80 
              : Math.floor(Math.random() * 20) + 30
          } : undefined
        }
      };
      
      stats.push(seasonStats);
    }
    
    return stats;
  };
  
  const getTeamColorStyle = (team: string) => {
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
    
    if (team && teamColors[team]) {
      return { 
        backgroundColor: teamColors[team].primary,
        color: teamColors[team].secondary
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
  
  const calculateFantasyPoints = (stats: Player['stats'], ppr: number = 0.5): number => {
    let points = 0;
    
    if (stats) {
      // Passing stats (4pt per TD, 0.04pt per yard, -1 per INT)
      if (stats.passing) {
        points += (stats.passing.touchdowns || 0) * 4;
        points += (stats.passing.yards || 0) * 0.04;
        points -= (stats.passing.interceptions || 0);
      }
      
      // Rushing stats (6pt per TD, 0.1pt per yard)
      if (stats.rushing) {
        points += (stats.rushing.touchdowns || 0) * 6;
        points += (stats.rushing.yards || 0) * 0.1;
      }
      
      // Receiving stats (6pt per TD, 0.1pt per yard, ppr per reception)
      if (stats.receiving) {
        points += (stats.receiving.touchdowns || 0) * 6;
        points += (stats.receiving.yards || 0) * 0.1;
        points += (stats.receiving.receptions || 0) * ppr;
      }
    }
    
    return Math.round(points * 10) / 10;
  };
  
  const renderOverviewTab = () => {
    if (!player) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-sleeper-dark border-sleeper-dark">
          <CardHeader>
            <CardTitle className="text-base">Player Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-sleeper-gray" />
                <span className="text-sleeper-gray">Age:</span>
                <span className="font-medium">{player.age} years</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-sleeper-gray" />
                <span className="text-sleeper-gray">Experience:</span>
                <span className="font-medium">{player.experience} {player.experience === 1 ? 'year' : 'years'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-sleeper-gray" />
                <span className="text-sleeper-gray">Draft:</span>
                <span className="font-medium">Round {Math.floor(Math.random() * 7) + 1}, {2023 - (player.experience || 0)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-sleeper-gray" />
                <span className="text-sleeper-gray">Contract:</span>
                <span className="font-medium">{Math.floor(Math.random() * 4) + 1} years remaining</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Dynasty Value</h4>
              <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sleeper-gray">Value Score</span>
                  <span className="font-bold text-lg">{player.dynasty_value || Math.floor(Math.random() * 50) + 50}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sleeper-gray">ADP</span>
                  <span>{player.adp || Math.floor(Math.random() * 100) + 1}</span>
                </div>
                {player.trending && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sleeper-gray">Trending</span>
                    <span className="flex items-center text-green-500">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {player.trending.value}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2 bg-sleeper-dark border-sleeper-dark">
          <CardHeader>
            <CardTitle className="text-base">Current Season Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {player.stats.passing && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-sleeper-gray">Passing</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                      <div className="text-xs text-sleeper-gray">Yards</div>
                      <div className="text-lg font-bold">{player.stats.passing.yards.toLocaleString()}</div>
                    </div>
                    <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                      <div className="text-xs text-sleeper-gray">TDs</div>
                      <div className="text-lg font-bold">{player.stats.passing.touchdowns}</div>
                    </div>
                    <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                      <div className="text-xs text-sleeper-gray">INTs</div>
                      <div className="text-lg font-bold">{player.stats.passing.interceptions}</div>
                    </div>
                    <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                      <div className="text-xs text-sleeper-gray">Comp/Att</div>
                      <div className="text-lg font-bold">{player.stats.passing.completions}/{player.stats.passing.attempts}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {player.stats.rushing && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-sleeper-gray">Rushing</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                      <div className="text-xs text-sleeper-gray">Yards</div>
                      <div className="text-lg font-bold">{player.stats.rushing.yards.toLocaleString()}</div>
                    </div>
                    <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                      <div className="text-xs text-sleeper-gray">TDs</div>
                      <div className="text-lg font-bold">{player.stats.rushing.touchdowns}</div>
                    </div>
                    <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                      <div className="text-xs text-sleeper-gray">Attempts</div>
                      <div className="text-lg font-bold">{player.stats.rushing.attempts}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {player.stats.receiving && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-sleeper-gray">Receiving</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                      <div className="text-xs text-sleeper-gray">Yards</div>
                      <div className="text-lg font-bold">{player.stats.receiving.yards.toLocaleString()}</div>
                    </div>
                    <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                      <div className="text-xs text-sleeper-gray">TDs</div>
                      <div className="text-lg font-bold">{player.stats.receiving.touchdowns}</div>
                    </div>
                    <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                      <div className="text-xs text-sleeper-gray">Receptions</div>
                      <div className="text-lg font-bold">{player.stats.receiving.receptions}</div>
                    </div>
                    <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                      <div className="text-xs text-sleeper-gray">Targets</div>
                      <div className="text-lg font-bold">{player.stats.receiving.targets}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-2 text-sleeper-gray">Fantasy Points</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                    <div className="text-xs text-sleeper-gray">Standard</div>
                    <div className="text-lg font-bold">{calculateFantasyPoints(player.stats, 0)}</div>
                  </div>
                  <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                    <div className="text-xs text-sleeper-gray">Half PPR</div>
                    <div className="text-lg font-bold">{calculateFantasyPoints(player.stats, 0.5)}</div>
                  </div>
                  <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                    <div className="text-xs text-sleeper-gray">Full PPR</div>
                    <div className="text-lg font-bold">{calculateFantasyPoints(player.stats, 1)}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderCareerStatsTab = () => {
    if (!player || careerStats.length === 0) return null;
    
    return (
      <Card className="bg-sleeper-dark border-sleeper-dark">
        <CardHeader>
          <CardTitle className="text-base">Career Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="border-b border-sleeper-border text-sleeper-gray">
                  <th className="px-4 py-2 text-left">Season</th>
                  <th className="px-4 py-2 text-left">Team</th>
                  <th className="px-4 py-2 text-left">Games</th>
                  {player.position === 'QB' && (
                    <>
                      <th className="px-4 py-2 text-right">Pass Yds</th>
                      <th className="px-4 py-2 text-right">Pass TD</th>
                      <th className="px-4 py-2 text-right">INTs</th>
                      <th className="px-4 py-2 text-right">Comp/Att</th>
                    </>
                  )}
                  {(player.position === 'RB' || player.position === 'QB') && (
                    <>
                      <th className="px-4 py-2 text-right">Rush Yds</th>
                      <th className="px-4 py-2 text-right">Rush TD</th>
                      <th className="px-4 py-2 text-right">Attempts</th>
                    </>
                  )}
                  {(player.position === 'WR' || player.position === 'TE' || player.position === 'RB') && (
                    <>
                      <th className="px-4 py-2 text-right">Rec Yds</th>
                      <th className="px-4 py-2 text-right">Rec TD</th>
                      <th className="px-4 py-2 text-right">Receptions</th>
                      <th className="px-4 py-2 text-right">Targets</th>
                    </>
                  )}
                  <th className="px-4 py-2 text-right">Fantasy Pts</th>
                </tr>
              </thead>
              <tbody>
                {careerStats.map((season, index) => (
                  <tr key={index} className="border-b border-sleeper-border hover:bg-sleeper-darker">
                    <td className="px-4 py-2">{season.season}</td>
                    <td className="px-4 py-2">{season.team}</td>
                    <td className="px-4 py-2">{season.games_played}</td>
                    {player.position === 'QB' && season.stats.passing && (
                      <>
                        <td className="px-4 py-2 text-right">{season.stats.passing.yards.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{season.stats.passing.touchdowns}</td>
                        <td className="px-4 py-2 text-right">{season.stats.passing.interceptions}</td>
                        <td className="px-4 py-2 text-right">{season.stats.passing.completions}/{season.stats.passing.attempts}</td>
                      </>
                    )}
                    {(player.position === 'RB' || player.position === 'QB') && season.stats.rushing && (
                      <>
                        <td className="px-4 py-2 text-right">{season.stats.rushing.yards.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{season.stats.rushing.touchdowns}</td>
                        <td className="px-4 py-2 text-right">{season.stats.rushing.attempts}</td>
                      </>
                    )}
                    {(player.position === 'WR' || player.position === 'TE' || player.position === 'RB') && season.stats.receiving && (
                      <>
                        <td className="px-4 py-2 text-right">{season.stats.receiving.yards.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{season.stats.receiving.touchdowns}</td>
                        <td className="px-4 py-2 text-right">{season.stats.receiving.receptions}</td>
                        <td className="px-4 py-2 text-right">{season.stats.receiving.targets}</td>
                      </>
                    )}
                    <td className="px-4 py-2 text-right">{calculateFantasyPoints(season.stats, 0.5)}</td>
                  </tr>
                ))}
                
                {/* Career totals row */}
                <tr className="bg-sleeper-darker font-medium">
                  <td className="px-4 py-2">Career</td>
                  <td className="px-4 py-2">-</td>
                  <td className="px-4 py-2">{careerStats.reduce((sum, season) => sum + season.games_played, 0)}</td>
                  {player.position === 'QB' && (
                    <>
                      <td className="px-4 py-2 text-right">
                        {careerStats.reduce((sum, season) => sum + (season.stats.passing?.yards || 0), 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {careerStats.reduce((sum, season) => sum + (season.stats.passing?.touchdowns || 0), 0)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {careerStats.reduce((sum, season) => sum + (season.stats.passing?.interceptions || 0), 0)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {careerStats.reduce((sum, season) => sum + (season.stats.passing?.completions || 0), 0)}/
                        {careerStats.reduce((sum, season) => sum + (season.stats.passing?.attempts || 0), 0)}
                      </td>
                    </>
                  )}
                  {(player.position === 'RB' || player.position === 'QB') && (
                    <>
                      <td className="px-4 py-2 text-right">
                        {careerStats.reduce((sum, season) => sum + (season.stats.rushing?.yards || 0), 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {careerStats.reduce((sum, season) => sum + (season.stats.rushing?.touchdowns || 0), 0)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {careerStats.reduce((sum, season) => sum + (season.stats.rushing?.attempts || 0), 0)}
                      </td>
                    </>
                  )}
                  {(player.position === 'WR' || player.position === 'TE' || player.position === 'RB') && (
                    <>
                      <td className="px-4 py-2 text-right">
                        {careerStats.reduce((sum, season) => sum + (season.stats.receiving?.yards || 0), 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {careerStats.reduce((sum, season) => sum + (season.stats.receiving?.touchdowns || 0), 0)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {careerStats.reduce((sum, season) => sum + (season.stats.receiving?.receptions || 0), 0)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {careerStats.reduce((sum, season) => sum + (season.stats.receiving?.targets || 0), 0)}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-2 text-right">
                    {careerStats.reduce((sum, season) => sum + calculateFantasyPoints(season.stats, 0.5), 0).toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderNewsTab = () => {
    if (!player) return null;
    
    // Format date from timestamp
    const formatDate = (timestamp: number) => {
      const date = new Date(timestamp * 1000);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    };
    
    return (
      <Card className="bg-sleeper-dark border-sleeper-dark">
        <CardHeader>
          <CardTitle className="text-base">Latest News</CardTitle>
        </CardHeader>
        <CardContent>
          {playerNews.length === 0 ? (
            <div className="text-center py-6 text-sleeper-gray">
              <Newspaper className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent news found for this player.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {playerNews.map((news) => (
                <div key={news.id} className="border-b border-sleeper-border pb-4 last:border-none last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{news.title}</h3>
                    <Badge variant="outline" className="text-xs bg-sleeper-dark">
                      {news.source}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-sleeper-gray mb-3">{news.description}</p>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-sleeper-gray">{formatDate(news.timestamp)}</span>
                    
                    <div className="flex space-x-4">
                      {news.injuryStatus && (
                        <Badge variant="outline" className="text-xs bg-red-900 text-red-100">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {news.injuryStatus}
                        </Badge>
                      )}
                      
                      <a 
                        href={news.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-sleeper-gray hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Source
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  const renderComparisonTab = () => {
    if (!player) return null;
    
    // Mock player comparison data
    const comparisonPlayers = [
      {
        name: `Similar Player 1`,
        team: ['KC', 'GB', 'SF', 'BUF', 'DAL'][Math.floor(Math.random() * 5)],
        age: player.age + Math.floor(Math.random() * 3) - 1,
        stats: {
          fantasy_points: calculateFantasyPoints(player.stats, 0.5) + Math.floor(Math.random() * 20) - 10
        },
        dynasty_value: (player.dynasty_value || 75) + Math.floor(Math.random() * 10) - 5
      },
      {
        name: `Similar Player 2`,
        team: ['MIN', 'PHI', 'CIN', 'LAC', 'BAL'][Math.floor(Math.random() * 5)],
        age: player.age + Math.floor(Math.random() * 3) - 1,
        stats: {
          fantasy_points: calculateFantasyPoints(player.stats, 0.5) + Math.floor(Math.random() * 20) - 10
        },
        dynasty_value: (player.dynasty_value || 75) + Math.floor(Math.random() * 10) - 5
      },
      {
        name: `Similar Player 3`,
        team: ['NYG', 'NO', 'ATL', 'DET', 'HOU'][Math.floor(Math.random() * 5)],
        age: player.age + Math.floor(Math.random() * 3) - 1,
        stats: {
          fantasy_points: calculateFantasyPoints(player.stats, 0.5) + Math.floor(Math.random() * 20) - 10
        },
        dynasty_value: (player.dynasty_value || 75) + Math.floor(Math.random() * 10) - 5
      }
    ];
    
    return (
      <Card className="bg-sleeper-dark border-sleeper-dark">
        <CardHeader>
          <CardTitle className="text-base">Player Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="border-b border-sleeper-border text-sleeper-gray">
                  <th className="px-4 py-2 text-left">Player</th>
                  <th className="px-4 py-2 text-left">Team</th>
                  <th className="px-4 py-2 text-center">Age</th>
                  <th className="px-4 py-2 text-center">Fantasy Pts</th>
                  <th className="px-4 py-2 text-center">Dynasty Value</th>
                </tr>
              </thead>
              <tbody>
                {/* Current player row */}
                <tr className="border-b border-sleeper-border bg-sleeper-darker font-medium">
                  <td className="px-4 py-2">{player.name}</td>
                  <td className="px-4 py-2">{player.team}</td>
                  <td className="px-4 py-2 text-center">{player.age}</td>
                  <td className="px-4 py-2 text-center">{calculateFantasyPoints(player.stats, 0.5)}</td>
                  <td className="px-4 py-2 text-center">{player.dynasty_value || 75}</td>
                </tr>
                
                {/* Comparison players rows */}
                {comparisonPlayers.map((comp, index) => (
                  <tr key={index} className="border-b border-sleeper-border hover:bg-sleeper-darker">
                    <td className="px-4 py-2">{comp.name}</td>
                    <td className="px-4 py-2">{comp.team}</td>
                    <td className="px-4 py-2 text-center">{comp.age}</td>
                    <td className="px-4 py-2 text-center">{comp.stats.fantasy_points}</td>
                    <td className="px-4 py-2 text-center">{comp.dynasty_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-4 text-sleeper-gray">Similarity Score Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-4">
                <h5 className="font-medium mb-2">Statistical Similarity</h5>
                <p className="text-sleeper-gray text-sm">
                  Players with comparable production patterns over the past seasons.
                  Based on similar usage rates and fantasy production.
                </p>
              </div>
              
              <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-4">
                <h5 className="font-medium mb-2">Dynasty Outlook</h5>
                <p className="text-sleeper-gray text-sm">
                  Similar career trajectory and future value projection.
                  Consider age, contract situation, and team context.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderProjectionsTab = () => {
    if (!player) return null;
    
    // Generate projections based on current stats
    const generateProjections = () => {
      const weeklyProjections = [];
      const currentWeek = 5; // Example current week
      
      for (let i = currentWeek; i <= 17; i++) {
        const weekProjection = {
          week: i,
          opponent: ['KC', 'GB', 'SF', 'BUF', 'DAL', 'MIN', 'PHI'][Math.floor(Math.random() * 7)],
          projectedPoints: (Math.random() * 5 + 10).toFixed(1), // Random projection between 10-15 points
          projectedStats: {}
        };
        
        if (player.position === 'QB') {
          weekProjection.projectedStats = {
            passing_yards: Math.floor(Math.random() * 100 + 250),
            passing_tds: Math.floor(Math.random() * 3),
            interceptions: Math.floor(Math.random() * 2),
            rushing_yards: Math.floor(Math.random() * 30)
          };
        } else if (player.position === 'RB') {
          weekProjection.projectedStats = {
            rushing_yards: Math.floor(Math.random() * 50 + 50),
            rushing_tds: Math.random() > 0.7 ? 1 : 0,
            receptions: Math.floor(Math.random() * 4),
            receiving_yards: Math.floor(Math.random() * 30 + 10)
          };
        } else if (player.position === 'WR' || player.position === 'TE') {
          weekProjection.projectedStats = {
            targets: Math.floor(Math.random() * 5 + 5),
            receptions: Math.floor(Math.random() * 4 + 3),
            receiving_yards: Math.floor(Math.random() * 50 + 40),
            receiving_tds: Math.random() > 0.8 ? 1 : 0
          };
        }
        
        weeklyProjections.push(weekProjection);
      }
      
      return weeklyProjections;
    };
    
    const weeklyProjections = generateProjections();
    
    return (
      <Card className="bg-sleeper-dark border-sleeper-dark">
        <CardHeader>
          <CardTitle className="text-base">Season Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2 text-sleeper-gray">Rest of Season Projection</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                <div className="text-xs text-sleeper-gray">Total Projected Pts</div>
                <div className="text-lg font-bold">
                  {weeklyProjections.reduce((sum, week) => sum + parseFloat(week.projectedPoints), 0).toFixed(1)}
                </div>
              </div>
              <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                <div className="text-xs text-sleeper-gray">Avg Per Game</div>
                <div className="text-lg font-bold">
                  {(weeklyProjections.reduce((sum, week) => sum + parseFloat(week.projectedPoints), 0) / weeklyProjections.length).toFixed(1)}
                </div>
              </div>
              <div className="bg-sleeper-dark border border-sleeper-border rounded-md p-3">
                <div className="text-xs text-sleeper-gray">Projected Finish</div>
                <div className="text-lg font-bold">
                  {player.position}{Math.floor(Math.random() * 12) + 1}
                </div>
              </div>
            </div>
          </div>
          
          <h4 className="text-sm font-medium mb-2 text-sleeper-gray">Weekly Projections</h4>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="border-b border-sleeper-border text-sleeper-gray">
                  <th className="px-4 py-2 text-left">Week</th>
                  <th className="px-4 py-2 text-left">Opponent</th>
                  <th className="px-4 py-2 text-right">Projected Pts</th>
                  {player.position === 'QB' && (
                    <>
                      <th className="px-4 py-2 text-right">Pass Yds</th>
                      <th className="px-4 py-2 text-right">Pass TDs</th>
                      <th className="px-4 py-2 text-right">INTs</th>
                      <th className="px-4 py-2 text-right">Rush Yds</th>
                    </>
                  )}
                  {player.position === 'RB' && (
                    <>
                      <th className="px-4 py-2 text-right">Rush Yds</th>
                      <th className="px-4 py-2 text-right">Rush TDs</th>
                      <th className="px-4 py-2 text-right">Rec</th>
                      <th className="px-4 py-2 text-right">Rec Yds</th>
                    </>
                  )}
                  {(player.position === 'WR' || player.position === 'TE') && (
                    <>
                      <th className="px-4 py-2 text-right">Targets</th>
                      <th className="px-4 py-2 text-right">Rec</th>
                      <th className="px-4 py-2 text-right">Rec Yds</th>
                      <th className="px-4 py-2 text-right">Rec TDs</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {weeklyProjections.map((week, index) => (
                  <tr key={index} className="border-b border-sleeper-border hover:bg-sleeper-darker">
                    <td className="px-4 py-2">Week {week.week}</td>
                    <td className="px-4 py-2">vs {week.opponent}</td>
                    <td className="px-4 py-2 text-right">{week.projectedPoints}</td>
                    {player.position === 'QB' && (
                      <>
                        <td className="px-4 py-2 text-right">{week.projectedStats.passing_yards}</td>
                        <td className="px-4 py-2 text-right">{week.projectedStats.passing_tds}</td>
                        <td className="px-4 py-2 text-right">{week.projectedStats.interceptions}</td>
                        <td className="px-4 py-2 text-right">{week.projectedStats.rushing_yards}</td>
                      </>
                    )}
                    {player.position === 'RB' && (
                      <>
                        <td className="px-4 py-2 text-right">{week.projectedStats.rushing_yards}</td>
                        <td className="px-4 py-2 text-right">{week.projectedStats.rushing_tds}</td>
                        <td className="px-4 py-2 text-right">{week.projectedStats.receptions}</td>
                        <td className="px-4 py-2 text-right">{week.projectedStats.receiving_yards}</td>
                      </>
                    )}
                    {(player.position === 'WR' || player.position === 'TE') && (
                      <>
                        <td className="px-4 py-2 text-right">{week.projectedStats.targets}</td>
                        <td className="px-4 py-2 text-right">{week.projectedStats.receptions}</td>
                        <td className="px-4 py-2 text-right">{week.projectedStats.receiving_yards}</td>
                        <td className="px-4 py-2 text-right">{week.projectedStats.receiving_tds}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" className="mr-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Player Profile</h1>
        </div>
        <div className="fantasy-card p-6 animate-pulse">
          <div className="flex flex-col space-y-4">
            <div className="h-8 bg-sleeper-dark rounded w-1/3"></div>
            <div className="h-24 bg-sleeper-dark rounded"></div>
            <div className="h-64 bg-sleeper-dark rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!player) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" className="mr-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Player Not Found</h1>
        </div>
        <div className="fantasy-card p-6">
          <p>The player you're looking for could not be found.</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" className="mr-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Player Profile</h1>
      </div>
      
      <div className="fantasy-card mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center mb-6">
            <div className="flex items-center mb-4 md:mb-0">
              <Avatar className="h-16 w-16 mr-4">
                <AvatarImage 
                  src={`https://sleepercdn.com/content/nfl/players/${player.id}.jpg`} 
                  alt={player.name} 
                />
                <AvatarFallback style={getTeamColorStyle(player.team)}>
                  {getInitials(player.name)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-2xl font-bold">{player.name}</h2>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className={`${getPositionClass(player.position)} mr-2`}>
                    {player.position}
                  </Badge>
                  <span className="text-sleeper-gray">
                    {player.team} • #{Math.floor(Math.random() * 99) + 1}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="md:ml-auto flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-sleeper-dark">
                <BarChart className="h-4 w-4 mr-1" />
                Rank: {player.position}{Math.floor(Math.random() * 12) + 1}
              </Badge>
              <Badge variant="outline" className="bg-sleeper-dark">
                <LineChart className="h-4 w-4 mr-1" />
                ADP: {player.adp || Math.floor(Math.random() * 100) + 1}
              </Badge>
              {player.trending && (
                <Badge variant="outline" className="bg-green-900 text-green-100">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Trending: +{player.trending.value}%
                </Badge>
              )}
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="career">Career Stats</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderOverviewTab()}
            </TabsContent>
            
            <TabsContent value="career">
              {renderCareerStatsTab()}
            </TabsContent>
            
            <TabsContent value="projections">
              {renderProjectionsTab()}
            </TabsContent>
            
            <TabsContent value="news">
              {renderNewsTab()}
            </TabsContent>
            
            <TabsContent value="comparison">
              {renderComparisonTab()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;