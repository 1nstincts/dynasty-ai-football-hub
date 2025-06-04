import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  BarChart, 
  LineChart, 
  Search, 
  BarChart2, 
  ArrowDownAZ
} from 'lucide-react';
import PlayerService from '@/services/PlayerService';
import { Player } from '@/store/slices/playersSlice';

interface ValueChartsProps {
  limit?: number;
}

type ValueType = 'dynasty' | 'redraft' | 'keeper';
type PositionFilter = 'ALL' | 'QB' | 'RB' | 'WR' | 'TE';
type SortOption = 'value' | 'name' | 'age' | 'position';
type SortDirection = 'asc' | 'desc';

interface DynastyTier {
  tier: string;
  min: number;
  max: number;
  className: string;
  description: string;
}

const PlayerValueCharts: React.FC<ValueChartsProps> = ({ limit = 100 }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [valueType, setValueType] = useState<ValueType>('dynasty');
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchPlayers();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [players, valueType, positionFilter, sortBy, sortDirection, searchQuery]);
  
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
  
  const applyFilters = () => {
    let result = [...players];
    
    // Apply position filter
    if (positionFilter !== 'ALL') {
      result = result.filter(player => player.position === positionFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(player => 
        player.name.toLowerCase().includes(query) || 
        player.team.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'value') {
        const valueA = getValueForType(a);
        const valueB = getValueForType(b);
        return sortDirection === 'desc' ? valueB - valueA : valueA - valueB;
      } else if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'age') {
        return sortDirection === 'asc' 
          ? (a.age || 0) - (b.age || 0) 
          : (b.age || 0) - (a.age || 0);
      } else if (sortBy === 'position') {
        return sortDirection === 'asc' 
          ? a.position.localeCompare(b.position) 
          : b.position.localeCompare(a.position);
      }
      return 0;
    });
    
    // Limit the number of players
    if (limit) {
      result = result.slice(0, limit);
    }
    
    setFilteredPlayers(result);
  };
  
  const getValueForType = (player: Player): number => {
    switch (valueType) {
      case 'dynasty':
        return player.dynasty_value || 0;
      case 'redraft':
        // In a real app, this would be a separate value
        // For now, we'll use a variation of dynasty value
        return ((player.dynasty_value || 0) * 0.7) + 
          (player.age < 28 ? 0 : ((player.dynasty_value || 0) * 0.3));
      case 'keeper':
        // Another variation
        return ((player.dynasty_value || 0) * 0.85) + 
          (player.age < 26 ? ((player.dynasty_value || 0) * 0.15) : 0);
      default:
        return player.dynasty_value || 0;
    }
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
  
  const dynastyTiers: DynastyTier[] = [
    { 
      tier: 'S', 
      min: 9000, 
      max: Infinity, 
      className: 'bg-purple-700 text-white',
      description: 'Elite foundational assets'
    },
    { 
      tier: 'A+', 
      min: 8000, 
      max: 9000, 
      className: 'bg-red-600 text-white',
      description: 'Premium building blocks'
    },
    { 
      tier: 'A', 
      min: 7000, 
      max: 8000, 
      className: 'bg-red-500 text-white',
      description: 'High-end core players'
    },
    { 
      tier: 'B+', 
      min: 6000, 
      max: 7000, 
      className: 'bg-orange-500 text-white',
      description: 'Solid starters with upside'
    },
    { 
      tier: 'B', 
      min: 5000, 
      max: 6000, 
      className: 'bg-orange-400 text-white',
      description: 'Reliable starters'
    },
    { 
      tier: 'C+', 
      min: 4000, 
      max: 5000, 
      className: 'bg-yellow-500 text-black',
      description: 'Valuable role players'
    },
    { 
      tier: 'C', 
      min: 3000, 
      max: 4000, 
      className: 'bg-yellow-400 text-black',
      description: 'Depth players with potential'
    },
    { 
      tier: 'D+', 
      min: 2000, 
      max: 3000, 
      className: 'bg-green-500 text-white',
      description: 'Bench stashes and prospects'
    },
    { 
      tier: 'D', 
      min: 0, 
      max: 2000, 
      className: 'bg-green-400 text-white',
      description: 'Deep roster holds'
    }
  ];
  
  const getDynastyTier = (value: number): DynastyTier => {
    return dynastyTiers.find(tier => value >= tier.min && value < tier.max) || dynastyTiers[dynastyTiers.length - 1];
  };
  
  const renderTiersTab = () => {
    const tierGroups: Record<string, Player[]> = {};
    
    // Group players by tier
    filteredPlayers.forEach(player => {
      const value = getValueForType(player);
      const tier = getDynastyTier(value).tier;
      
      if (!tierGroups[tier]) {
        tierGroups[tier] = [];
      }
      
      tierGroups[tier].push(player);
    });
    
    return (
      <div className="space-y-6">
        {dynastyTiers.map(tier => {
          const playersInTier = tierGroups[tier.tier] || [];
          
          if (playersInTier.length === 0) return null;
          
          return (
            <div key={tier.tier} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge className={`${tier.className} text-sm px-3 py-1 mr-3`}>
                    {tier.tier}
                  </Badge>
                  <div className="font-medium">{tier.description}</div>
                </div>
                <div className="text-sm text-sleeper-gray">{playersInTier.length} players</div>
              </div>
              
              <Card className="bg-sleeper-darker border-sleeper-border">
                <CardContent className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {playersInTier.map(player => (
                      <div key={player.id} className="flex items-center p-2 bg-sleeper-dark rounded-md">
                        <Avatar className="h-8 w-8 mr-2">
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
                              className="font-medium text-sm hover:text-primary hover:underline"
                            >
                              {player.name}
                            </a>
                            <Badge className={`${getPositionClass(player.position)} ml-2 text-xs h-5 px-1.5`}>
                              {player.position}
                            </Badge>
                          </div>
                          <div className="text-xs text-sleeper-gray">
                            {player.team} • {player.age} yrs
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {Math.floor(getValueForType(player) / 100)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderListTab = () => {
    return (
      <Card className="bg-sleeper-darker border-sleeper-border">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 text-xs text-sleeper-gray p-3 border-b border-sleeper-border">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2 text-center">Age/Exp</div>
            <div className="col-span-2 text-center">Tier</div>
            <div className="col-span-2 text-right">Value</div>
          </div>
          
          <ScrollArea className="h-[600px]">
            {filteredPlayers.map((player, index) => {
              const value = getValueForType(player);
              const tier = getDynastyTier(value);
              
              return (
                <div 
                  key={player.id} 
                  className="grid grid-cols-12 items-center p-3 border-b border-sleeper-border hover:bg-sleeper-dark"
                >
                  <div className="col-span-1 font-medium">
                    {index + 1}
                  </div>
                  <div className="col-span-5 flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage 
                        src={`https://sleepercdn.com/content/nfl/players/${player.id}.jpg`}
                        alt={player.name}
                      />
                      <AvatarFallback style={getTeamColorStyle(player)}>
                        {getInitials(player.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center">
                        <a 
                          href={`/players/${player.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {player.name}
                        </a>
                        {player.trending && (
                          <TrendingUp className="h-3 w-3 ml-1 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center text-xs text-sleeper-gray">
                        <Badge variant="outline" className={`${getPositionClass(player.position)} mr-1 text-xs h-5 px-1.5`}>
                          {player.position}
                        </Badge>
                        <span>{player.team}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-xs">
                    <div>{player.age} yrs</div>
                    <div className="text-sleeper-gray">{player.experience} {player.experience === 1 ? 'yr' : 'yrs'} exp</div>
                  </div>
                  <div className="col-span-2 text-center">
                    <Badge className={`${tier.className} text-xs px-2 py-0.5`}>
                      {tier.tier}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    {Math.floor(value / 100)}
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };
  
  const renderPositionalTab = () => {
    const positionGroups: Record<string, Player[]> = {
      'QB': [],
      'RB': [],
      'WR': [],
      'TE': []
    };
    
    // Group players by position
    filteredPlayers.forEach(player => {
      if (positionGroups[player.position]) {
        positionGroups[player.position].push(player);
      }
    });
    
    return (
      <div className="space-y-6">
        {Object.entries(positionGroups).map(([position, players]) => {
          if (players.length === 0) return null;
          
          return (
            <div key={position} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge className={`${getPositionClass(position)} text-sm px-3 py-1 mr-3`}>
                    {position}
                  </Badge>
                  <div className="font-medium">{position === 'QB' ? 'Quarterbacks' : 
                                                position === 'RB' ? 'Running Backs' : 
                                                position === 'WR' ? 'Wide Receivers' : 
                                                'Tight Ends'}</div>
                </div>
                <div className="text-sm text-sleeper-gray">{players.length} players</div>
              </div>
              
              <Card className="bg-sleeper-darker border-sleeper-border">
                <CardContent className="p-3">
                  <div className="grid grid-cols-3 text-xs text-sleeper-gray pb-2 mb-2 border-b border-sleeper-border">
                    <div>Player</div>
                    <div className="text-center">Age/Tier</div>
                    <div className="text-right">Value</div>
                  </div>
                  
                  <div className="space-y-1">
                    {players.slice(0, 10).map((player, index) => {
                      const value = getValueForType(player);
                      const tier = getDynastyTier(value);
                      
                      return (
                        <div key={player.id} className="grid grid-cols-3 items-center py-1">
                          <div className="flex items-center">
                            <div className="mr-2 text-sm font-medium text-sleeper-gray">{index + 1}</div>
                            <a 
                              href={`/players/${player.id}`}
                              className="font-medium text-sm hover:text-primary hover:underline truncate"
                            >
                              {player.name}
                            </a>
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="text-xs text-sleeper-gray mr-2">{player.age}y</div>
                            <Badge className={`${tier.className} text-xs px-1.5 py-0.5`}>
                              {tier.tier}
                            </Badge>
                          </div>
                          <div className="text-right text-sm font-medium">
                            {Math.floor(value / 100)}
                          </div>
                        </div>
                      );
                    })}
                    
                    {players.length > 10 && (
                      <div className="text-center text-xs text-sleeper-gray pt-2 border-t border-sleeper-border">
                        +{players.length - 10} more players
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderAgeGroupsTab = () => {
    const ageGroups: Record<string, { label: string, min: number, max: number, players: Player[] }> = {
      'young': { label: 'Young Talent (< 24)', min: 0, max: 24, players: [] },
      'prime': { label: 'Prime Years (24-28)', min: 24, max: 29, players: [] },
      'veteran': { label: 'Veterans (29-32)', min: 29, max: 33, players: [] },
      'older': { label: 'Elder Statesmen (33+)', min: 33, max: Infinity, players: [] }
    };
    
    // Group players by age
    filteredPlayers.forEach(player => {
      for (const groupKey in ageGroups) {
        const group = ageGroups[groupKey];
        if (player.age >= group.min && player.age < group.max) {
          group.players.push(player);
          break;
        }
      }
    });
    
    return (
      <div className="space-y-6">
        {Object.entries(ageGroups).map(([key, group]) => {
          if (group.players.length === 0) return null;
          
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{group.label}</div>
                <div className="text-sm text-sleeper-gray">{group.players.length} players</div>
              </div>
              
              <Card className="bg-sleeper-darker border-sleeper-border">
                <CardContent className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {group.players.slice(0, 10).map(player => {
                      const value = getValueForType(player);
                      
                      return (
                        <div key={player.id} className="flex items-center p-2 bg-sleeper-dark rounded-md">
                          <Avatar className="h-8 w-8 mr-2">
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
                                className="font-medium text-sm hover:text-primary hover:underline"
                              >
                                {player.name}
                              </a>
                              <Badge className={`${getPositionClass(player.position)} ml-2 text-xs h-5 px-1.5`}>
                                {player.position}
                              </Badge>
                            </div>
                            <div className="text-xs text-sleeper-gray">
                              {player.team} • {player.age} yrs
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {Math.floor(value / 100)}
                          </div>
                        </div>
                      );
                    })}
                    
                    {group.players.length > 10 && (
                      <div className="col-span-1 md:col-span-2 text-center text-xs text-sleeper-gray py-2 border-t border-sleeper-border">
                        +{group.players.length - 10} more players
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Export data as CSV
  const exportValueData = () => {
    let csv = 'Rank,Name,Position,Team,Age,Experience,Value,Tier\n';
    
    filteredPlayers.forEach((player, index) => {
      const value = getValueForType(player);
      const tier = getDynastyTier(value).tier;
      
      csv += `${index + 1},${player.name},${player.position},${player.team},${player.age},${player.experience},${Math.floor(value / 100)},${tier}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${valueType}_values.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  if (isLoading) {
    return (
      <Card className="bg-sleeper-dark border-sleeper-dark">
        <CardHeader>
          <CardTitle>Player Value Charts</CardTitle>
          <CardDescription>Analyze fantasy player values for different league formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-[600px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-sleeper-dark border-sleeper-dark">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Player Value Charts</CardTitle>
            <CardDescription>Analyze fantasy player values for different league formats</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={valueType}
              onValueChange={(value: ValueType) => setValueType(value)}
            >
              <SelectTrigger className="w-36 bg-sleeper-darker border-sleeper-border">
                <SelectValue placeholder="Value Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dynasty">Dynasty</SelectItem>
                <SelectItem value="keeper">Keeper</SelectItem>
                <SelectItem value="redraft">Redraft</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportValueData}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sleeper-gray h-4 w-4" />
            <input
              type="text"
              placeholder="Search player or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 w-full bg-sleeper-darker border-sleeper-border rounded text-white placeholder-sleeper-gray text-sm"
            />
          </div>
          
          <Select
            value={positionFilter}
            onValueChange={(value: PositionFilter) => setPositionFilter(value)}
          >
            <SelectTrigger className="w-32 bg-sleeper-darker border-sleeper-border">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Positions</SelectItem>
              <SelectItem value="QB">QB</SelectItem>
              <SelectItem value="RB">RB</SelectItem>
              <SelectItem value="WR">WR</SelectItem>
              <SelectItem value="TE">TE</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={`${sortBy}-${sortDirection}`}
            onValueChange={(value) => {
              const [sort, direction] = value.split('-');
              setSortBy(sort as SortOption);
              setSortDirection(direction as SortDirection);
            }}
          >
            <SelectTrigger className="w-36 bg-sleeper-darker border-sleeper-border">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value-desc">Value (High to Low)</SelectItem>
              <SelectItem value="value-asc">Value (Low to High)</SelectItem>
              <SelectItem value="name-asc">Name (A to Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z to A)</SelectItem>
              <SelectItem value="age-asc">Age (Youngest First)</SelectItem>
              <SelectItem value="age-desc">Age (Oldest First)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="mb-6">
          <Tabs defaultValue="list">
            <TabsList className="bg-sleeper-darker border border-sleeper-dark">
              <TabsTrigger value="list" className="flex items-center">
                <BarChart className="h-4 w-4 mr-2" />
                List View
              </TabsTrigger>
              <TabsTrigger value="tiers" className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                Tier View
              </TabsTrigger>
              <TabsTrigger value="positional" className="flex items-center">
                <ArrowDownAZ className="h-4 w-4 mr-2" />
                Positional
              </TabsTrigger>
              <TabsTrigger value="age" className="flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                Age Groups
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4">
              <TabsContent value="list">
                {renderListTab()}
              </TabsContent>
              
              <TabsContent value="tiers">
                {renderTiersTab()}
              </TabsContent>
              
              <TabsContent value="positional">
                {renderPositionalTab()}
              </TabsContent>
              
              <TabsContent value="age">
                {renderAgeGroupsTab()}
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        <div className="mt-4 border-t border-sleeper-border pt-4">
          <h3 className="text-lg font-medium mb-2">About Value Charts</h3>
          <p className="text-sleeper-gray text-sm mb-4">
            These value charts represent the relative worth of players in fantasy football. Values are expressed on a scale where higher numbers indicate more valuable players.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-1">Dynasty Values</h4>
              <p className="text-sleeper-gray text-xs">
                Long-term values that factor in age, talent, situation, and future production potential. Dynasty values prioritize youth and long-term outlook.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Keeper Values</h4>
              <p className="text-sleeper-gray text-xs">
                Medium-term values that balance current production with future potential. Keeper values give moderate preference to younger players.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Redraft Values</h4>
              <p className="text-sleeper-gray text-xs">
                Single-season values focused entirely on expected production this season. Age has minimal impact except for older players at risk of decline.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerValueCharts;