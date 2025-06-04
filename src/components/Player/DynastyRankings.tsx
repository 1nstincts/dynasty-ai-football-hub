import React, { useState, useEffect } from 'react';
import PlayerService from '@/services/PlayerService';
import { Player } from '@/store/slices/playersSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Search, ArrowUpDown, ArrowDownAZ, ChevronDown, ChevronUp, Download, Settings, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DynastyRankingsProps {
  limit?: number;
}

type SortOption = 'rank' | 'name' | 'age' | 'value' | 'position';
type SortDirection = 'asc' | 'desc';

const DynastyRankings: React.FC<DynastyRankingsProps> = ({ limit = 100 }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  
  useEffect(() => {
    fetchPlayers();
  }, [limit]);
  
  useEffect(() => {
    applyFilters();
  }, [players, activeTab, searchQuery, sortBy, sortDirection, experienceFilter, ageFilter]);
  
  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const allPlayers = await PlayerService.getAllPlayers(true);
      
      // Add dynasty rankings (simulating for now, would come from actual dynasty rankings API)
      const rankedPlayers = allPlayers.map((player, index) => ({
        ...player,
        dynasty_value: player.dynasty_value || Math.floor(Math.random() * 5000) + 5000,
        dynasty_rank: {
          overall: Math.floor(Math.random() * 200) + 1,
          position: Math.floor(Math.random() * 50) + 1
        }
      }));
      
      setPlayers(rankedPlayers);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFilters = () => {
    let result = [...players];
    
    // Apply position filter based on active tab
    if (activeTab !== 'overall') {
      result = result.filter(player => player.position === activeTab);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(player => 
        player.name.toLowerCase().includes(query) || 
        player.team.toLowerCase().includes(query)
      );
    }
    
    // Apply experience filter
    if (experienceFilter !== 'all') {
      if (experienceFilter === 'rookie') {
        result = result.filter(player => player.experience === 0);
      } else if (experienceFilter === 'sophomore') {
        result = result.filter(player => player.experience === 1);
      } else if (experienceFilter === 'veteran') {
        result = result.filter(player => player.experience >= 4);
      }
    }
    
    // Apply age filter
    if (ageFilter !== 'all') {
      if (ageFilter === 'under23') {
        result = result.filter(player => player.age < 23);
      } else if (ageFilter === '23-26') {
        result = result.filter(player => player.age >= 23 && player.age <= 26);
      } else if (ageFilter === '27-30') {
        result = result.filter(player => player.age >= 27 && player.age <= 30);
      } else if (ageFilter === 'over30') {
        result = result.filter(player => player.age > 30);
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'rank') {
        const aRank = activeTab === 'overall' ? (a.dynasty_rank?.overall || 999) : (a.dynasty_rank?.position || 999);
        const bRank = activeTab === 'overall' ? (b.dynasty_rank?.overall || 999) : (b.dynasty_rank?.position || 999);
        return sortDirection === 'asc' ? aRank - bRank : bRank - aRank;
      } else if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'age') {
        return sortDirection === 'asc' 
          ? (a.age || 0) - (b.age || 0) 
          : (b.age || 0) - (a.age || 0);
      } else if (sortBy === 'value') {
        return sortDirection === 'asc' 
          ? (a.dynasty_value || 0) - (b.dynasty_value || 0) 
          : (b.dynasty_value || 0) - (a.dynasty_value || 0);
      } else if (sortBy === 'position') {
        return sortDirection === 'asc' 
          ? a.position.localeCompare(b.position) 
          : b.position.localeCompare(a.position);
      }
      return 0;
    });
    
    // Limit results if needed
    if (limit) {
      result = result.slice(0, limit);
    }
    
    setFilteredPlayers(result);
  };
  
  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      // Toggle direction if same option clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort option with default direction
      setSortBy(option);
      setSortDirection('asc');
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
  
  const getDynastyTier = (value: number) => {
    if (value > 9000) return { tier: 'S', className: 'bg-purple-700 text-white' };
    if (value > 8000) return { tier: 'A+', className: 'bg-red-600 text-white' };
    if (value > 7000) return { tier: 'A', className: 'bg-red-500 text-white' };
    if (value > 6000) return { tier: 'B+', className: 'bg-orange-500 text-white' };
    if (value > 5000) return { tier: 'B', className: 'bg-orange-400 text-white' };
    if (value > 4000) return { tier: 'C+', className: 'bg-yellow-500 text-black' };
    if (value > 3000) return { tier: 'C', className: 'bg-yellow-400 text-black' };
    if (value > 2000) return { tier: 'D+', className: 'bg-green-500 text-white' };
    return { tier: 'D', className: 'bg-green-400 text-white' };
  };
  
  // Export rankings to CSV
  const exportRankings = () => {
    let csv = 'Rank,Name,Position,Team,Age,Experience,Dynasty Value,Tier\n';
    
    filteredPlayers.forEach((player, index) => {
      const rank = activeTab === 'overall' ? player.dynasty_rank?.overall : player.dynasty_rank?.position;
      const tier = getDynastyTier(player.dynasty_value || 0).tier;
      
      csv += `${rank},${player.name},${player.position},${player.team},${player.age},${player.experience},${player.dynasty_value},${tier}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `dynasty_rankings_${activeTab}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  if (isLoading) {
    return (
      <Card className="bg-sleeper-dark border-sleeper-dark">
        <CardHeader>
          <CardTitle>Dynasty Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-2">
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-5 w-8 mr-3" />
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-12 mr-2" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-sleeper-dark border-sleeper-dark">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dynasty Rankings</CardTitle>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Dynasty Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Experience</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setExperienceFilter('all')} className={experienceFilter === 'all' ? 'bg-accent' : ''}>
                  All Players
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExperienceFilter('rookie')} className={experienceFilter === 'rookie' ? 'bg-accent' : ''}>
                  Rookies Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExperienceFilter('sophomore')} className={experienceFilter === 'sophomore' ? 'bg-accent' : ''}>
                  Sophomores
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExperienceFilter('veteran')} className={experienceFilter === 'veteran' ? 'bg-accent' : ''}>
                  Veterans (4+ years)
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Age</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setAgeFilter('all')} className={ageFilter === 'all' ? 'bg-accent' : ''}>
                  All Ages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAgeFilter('under23')} className={ageFilter === 'under23' ? 'bg-accent' : ''}>
                  Under 23
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAgeFilter('23-26')} className={ageFilter === '23-26' ? 'bg-accent' : ''}>
                  23-26 Years
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAgeFilter('27-30')} className={ageFilter === '27-30' ? 'bg-accent' : ''}>
                  27-30 Years
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAgeFilter('over30')} className={ageFilter === 'over30' ? 'bg-accent' : ''}>
                  Over 30
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={exportRankings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sleeper-gray h-4 w-4" />
              <Input
                className="bg-sleeper-darker border-sleeper-dark pl-10"
                placeholder="Search player or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-shrink-0">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort('rank')} className={sortBy === 'rank' ? 'bg-accent' : ''}>
                  {sortBy === 'rank' && sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  Rank
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('name')} className={sortBy === 'name' ? 'bg-accent' : ''}>
                  {sortBy === 'name' && sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('age')} className={sortBy === 'age' ? 'bg-accent' : ''}>
                  {sortBy === 'age' && sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  Age
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('value')} className={sortBy === 'value' ? 'bg-accent' : ''}>
                  {sortBy === 'value' && sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  Dynasty Value
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('position')} className={sortBy === 'position' ? 'bg-accent' : ''}>
                  {sortBy === 'position' && sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  Position
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {(experienceFilter !== 'all' || ageFilter !== 'all') && (
              <Button variant="outline" className="flex-shrink-0">
                <Filter className="h-4 w-4 mr-2" />
                {experienceFilter !== 'all' && ageFilter !== 'all' ? 'Filters (2)' :
                 experienceFilter !== 'all' ? `${experienceFilter.charAt(0).toUpperCase() + experienceFilter.slice(1)}s` :
                 `Age: ${ageFilter}`}
              </Button>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-sleeper-darker border border-sleeper-dark">
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="QB">QB</TabsTrigger>
              <TabsTrigger value="RB">RB</TabsTrigger>
              <TabsTrigger value="WR">WR</TabsTrigger>
              <TabsTrigger value="TE">TE</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="space-y-2">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-6 text-sleeper-gray">
              No players found matching your criteria
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 text-xs text-sleeper-gray py-2 px-3 border-b border-sleeper-border">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">Player</div>
                <div className="col-span-2 text-center">Age/Exp</div>
                <div className="col-span-2 text-center">Tier</div>
                <div className="col-span-2 text-right">Value</div>
              </div>
              
              {filteredPlayers.map((player, index) => {
                const rank = activeTab === 'overall' ? player.dynasty_rank?.overall : player.dynasty_rank?.position;
                const tierInfo = getDynastyTier(player.dynasty_value || 0);
                
                return (
                  <div 
                    key={player.id} 
                    className="grid grid-cols-12 items-center px-3 py-2 hover:bg-sleeper-darker rounded-md"
                  >
                    <div className="col-span-1 font-medium text-sm">
                      {rank || index + 1}
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
                      <Badge className={`${tierInfo.className} text-xs px-2 py-0.5`}>
                        {tierInfo.tier}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-right font-medium">
                      {(player.dynasty_value || 0).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DynastyRankings;