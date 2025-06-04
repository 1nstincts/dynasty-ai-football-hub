import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Trash2, AlertTriangle, ThumbsUp, Scale, ArrowRight, BarChart, TrendingUp, TrendingDown } from 'lucide-react';
import PlayerService from '@/services/PlayerService';
import { Player } from '@/store/slices/playersSlice';
import AIService from '@/services/AIService';

interface TradePlayer extends Player {
  selected?: boolean;
}

interface TradeTeam {
  id: string;
  name: string;
  players: TradePlayer[];
}

interface TradeAnalysis {
  valueTeamA: number;
  valueTeamB: number;
  difference: number;
  winner: 'A' | 'B' | 'even';
  shortTerm: {
    teamA: string;
    teamB: string;
    winner: 'A' | 'B' | 'even';
  };
  longTerm: {
    teamA: string;
    teamB: string;
    winner: 'A' | 'B' | 'even';
  };
  comments: string[];
  keyPlayers: {
    teamA: string[];
    teamB: string[];
  };
}

const TradeAnalyzer: React.FC = () => {
  // Teams in the trade
  const [teamA, setTeamA] = useState<TradeTeam>({
    id: 'A',
    name: 'Team A',
    players: []
  });
  const [teamB, setTeamB] = useState<TradeTeam>({
    id: 'B',
    name: 'Team B',
    players: []
  });
  
  // Search and available players
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');
  const [leagueType, setLeagueType] = useState<'dynasty' | 'redraft'>('dynasty');
  
  // Analysis state
  const [analysis, setAnalysis] = useState<TradeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Handle player search
  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      const allPlayers = await PlayerService.getAllPlayers(true);
      
      // Filter based on search query
      const filtered = allPlayers.filter(player => 
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Sort by most relevant first
      const sorted = filtered.sort((a, b) => {
        // Exact match first
        if (a.name.toLowerCase() === searchQuery.toLowerCase()) return -1;
        if (b.name.toLowerCase() === searchQuery.toLowerCase()) return 1;
        
        // Starts with second
        if (a.name.toLowerCase().startsWith(searchQuery.toLowerCase())) return -1;
        if (b.name.toLowerCase().startsWith(searchQuery.toLowerCase())) return 1;
        
        // Otherwise by dynasty value
        return (b.dynasty_value || 0) - (a.dynasty_value || 0);
      });
      
      setSearchResults(sorted.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error('Error searching players:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle adding player to a team
  const addPlayerToTeam = (player: Player, teamId: 'A' | 'B') => {
    if (teamId === 'A') {
      if (teamA.players.some(p => p.id === player.id)) return; // Already added
      setTeamA({
        ...teamA,
        players: [...teamA.players, { ...player, selected: true }]
      });
    } else {
      if (teamB.players.some(p => p.id === player.id)) return; // Already added
      setTeamB({
        ...teamB,
        players: [...teamB.players, { ...player, selected: true }]
      });
    }
    
    // Clear analysis when players change
    setAnalysis(null);
  };
  
  // Handle removing player from a team
  const removePlayerFromTeam = (playerId: string, teamId: 'A' | 'B') => {
    if (teamId === 'A') {
      setTeamA({
        ...teamA,
        players: teamA.players.filter(p => p.id !== playerId)
      });
    } else {
      setTeamB({
        ...teamB,
        players: teamB.players.filter(p => p.id !== playerId)
      });
    }
    
    // Clear analysis when players change
    setAnalysis(null);
  };
  
  // Clear all players from a team
  const clearTeam = (teamId: 'A' | 'B') => {
    if (teamId === 'A') {
      setTeamA({
        ...teamA,
        players: []
      });
    } else {
      setTeamB({
        ...teamB,
        players: []
      });
    }
    
    // Clear analysis when players change
    setAnalysis(null);
  };
  
  // Clear the entire trade
  const clearTrade = () => {
    setTeamA({
      ...teamA,
      players: []
    });
    setTeamB({
      ...teamB,
      players: []
    });
    setAnalysis(null);
  };
  
  // Analyze the trade
  const analyzeTrade = async () => {
    if (teamA.players.length === 0 || teamB.players.length === 0) return;
    
    setIsAnalyzing(true);
    
    try {
      // In a real implementation, this would call an API endpoint for trade analysis
      // For now, we'll simulate it with a local function
      const result = simulateTradeAnalysis(teamA, teamB, leagueType);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing trade:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Helper functions
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
  
  // Render player card
  const renderPlayerCard = (player: Player, teamId: 'A' | 'B', isInTrade: boolean = false) => {
    return (
      <div 
        key={player.id} 
        className={`bg-sleeper-darker border border-sleeper-border rounded-md p-3 mb-2 relative ${isInTrade ? '' : 'cursor-pointer hover:border-primary'}`}
        onClick={isInTrade ? undefined : () => addPlayerToTeam(player, selectedTeam)}
      >
        <div className="flex items-center">
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
            <div className="font-medium">{player.name}</div>
            <div className="flex items-center">
              <Badge variant="outline" className={`${getPositionClass(player.position)} mr-2 text-xs h-5`}>
                {player.position}
              </Badge>
              <span className="text-xs text-sleeper-gray">{player.team} • {player.age} yrs</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-sm font-medium">
              {player.dynasty_value ? Math.floor(player.dynasty_value / 100) : '?'}
            </div>
            <div className="text-xs text-sleeper-gray">Value</div>
          </div>
          
          {isInTrade && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-1 right-1 h-6 w-6 p-0 text-sleeper-gray hover:text-red-500 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                removePlayerFromTeam(player.id, teamId);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };
  
  // Function to simulate trade analysis (would be replaced with an API call)
  const simulateTradeAnalysis = (teamA: TradeTeam, teamB: TradeTeam, leagueType: 'dynasty' | 'redraft'): TradeAnalysis => {
    // Calculate total value for each team
    const calculateValue = (team: TradeTeam) => {
      return team.players.reduce((total, player) => total + (player.dynasty_value || 0), 0);
    };
    
    const valueTeamA = calculateValue(teamA);
    const valueTeamB = calculateValue(teamB);
    const difference = Math.abs(valueTeamA - valueTeamB);
    
    let winner: 'A' | 'B' | 'even' = 'even';
    if (difference > 500) { // Threshold for declaring a winner
      winner = valueTeamA > valueTeamB ? 'A' : 'B';
    }
    
    // Generate analysis
    const shortTermWinner = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'A' : 'B') : 'even';
    const longTermWinner = leagueType === 'dynasty' ? (Math.random() > 0.6 ? (Math.random() > 0.5 ? 'A' : 'B') : 'even') : 'even';
    
    // Generate comments
    const comments = [];
    
    if (winner === 'even') {
      comments.push('This is a fairly balanced trade in terms of overall value.');
    } else {
      comments.push(`${winner === 'A' ? teamA.name : teamB.name} appears to be getting more value in this trade.`);
    }
    
    if (leagueType === 'dynasty') {
      if (teamA.players.some(p => p.age > 28) && teamB.players.some(p => p.age < 25)) {
        comments.push(`${teamB.name} is acquiring younger assets, which is good for a rebuild strategy.`);
      } else if (teamB.players.some(p => p.age > 28) && teamA.players.some(p => p.age < 25)) {
        comments.push(`${teamA.name} is acquiring younger assets, which is good for a rebuild strategy.`);
      }
    }
    
    // Position-specific comments
    if (teamA.players.some(p => p.position === 'QB') && !teamB.players.some(p => p.position === 'QB')) {
      comments.push(`${teamA.name} is acquiring quarterback talent, which is crucial for long-term success.`);
    } else if (teamB.players.some(p => p.position === 'QB') && !teamA.players.some(p => p.position === 'QB')) {
      comments.push(`${teamB.name} is acquiring quarterback talent, which is crucial for long-term success.`);
    }
    
    if (teamA.players.filter(p => p.position === 'RB').length > 1) {
      comments.push(`${teamA.name} is adding depth at the running back position.`);
    } else if (teamB.players.filter(p => p.position === 'RB').length > 1) {
      comments.push(`${teamB.name} is adding depth at the running back position.`);
    }
    
    if (teamA.players.filter(p => p.position === 'WR').length > 1) {
      comments.push(`${teamA.name} is strengthening their wide receiver corps.`);
    } else if (teamB.players.filter(p => p.position === 'WR').length > 1) {
      comments.push(`${teamB.name} is strengthening their wide receiver corps.`);
    }
    
    // Find key players (highest value players)
    const keyPlayersA = teamA.players
      .sort((a, b) => (b.dynasty_value || 0) - (a.dynasty_value || 0))
      .slice(0, 2)
      .map(p => p.name);
    
    const keyPlayersB = teamB.players
      .sort((a, b) => (b.dynasty_value || 0) - (a.dynasty_value || 0))
      .slice(0, 2)
      .map(p => p.name);
    
    // Final analysis
    return {
      valueTeamA,
      valueTeamB,
      difference,
      winner,
      shortTerm: {
        teamA: shortTermWinner === 'A' ? 'Better' : shortTermWinner === 'B' ? 'Worse' : 'Even',
        teamB: shortTermWinner === 'B' ? 'Better' : shortTermWinner === 'A' ? 'Worse' : 'Even',
        winner: shortTermWinner
      },
      longTerm: {
        teamA: longTermWinner === 'A' ? 'Better' : longTermWinner === 'B' ? 'Worse' : 'Even',
        teamB: longTermWinner === 'B' ? 'Better' : longTermWinner === 'A' ? 'Worse' : 'Even',
        winner: longTermWinner
      },
      comments,
      keyPlayers: {
        teamA: keyPlayersA,
        teamB: keyPlayersB
      }
    };
  };
  
  // Calculate if the Analyze button should be enabled
  const canAnalyze = teamA.players.length > 0 && teamB.players.length > 0;
  
  return (
    <div>
      <Card className="bg-sleeper-dark border-sleeper-dark mb-6">
        <CardHeader>
          <CardTitle>Trade Analyzer</CardTitle>
          <CardDescription>
            Evaluate trades with our advanced dynasty and redraft analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Select value={leagueType} onValueChange={(value: 'dynasty' | 'redraft') => setLeagueType(value)}>
                <SelectTrigger className="w-36 bg-sleeper-darker border-sleeper-border">
                  <SelectValue placeholder="League Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dynasty">Dynasty</SelectItem>
                  <SelectItem value="redraft">Redraft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" size="sm" onClick={clearTrade}>
              Clear Trade
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team A */}
            <Card className="bg-sleeper-darker border-sleeper-border">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">
                    <Input
                      className="max-w-[150px] h-7 px-2 py-1 text-sm font-semibold bg-transparent border-sleeper-dark"
                      value={teamA.name}
                      onChange={(e) => setTeamA({ ...teamA, name: e.target.value })}
                    />
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-sleeper-gray hover:text-white"
                    onClick={() => clearTeam('A')}
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[250px] pr-4">
                  {teamA.players.length === 0 ? (
                    <div className="text-center py-8 text-sleeper-gray">
                      <Plus className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>Add players from below</p>
                    </div>
                  ) : (
                    teamA.players.map(player => renderPlayerCard(player, 'A', true))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Team B */}
            <Card className="bg-sleeper-darker border-sleeper-border">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">
                    <Input
                      className="max-w-[150px] h-7 px-2 py-1 text-sm font-semibold bg-transparent border-sleeper-dark"
                      value={teamB.name}
                      onChange={(e) => setTeamB({ ...teamB, name: e.target.value })}
                    />
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-sleeper-gray hover:text-white"
                    onClick={() => clearTeam('B')}
                  >
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[250px] pr-4">
                  {teamB.players.length === 0 ? (
                    <div className="text-center py-8 text-sleeper-gray">
                      <Plus className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>Add players from below</p>
                    </div>
                  ) : (
                    teamB.players.map(player => renderPlayerCard(player, 'B', true))
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button
              size="lg"
              className="bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90"
              onClick={analyzeTrade}
              disabled={!canAnalyze || isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Trade'}
              {!isAnalyzing && <Scale className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Analysis Results */}
      {analysis && (
        <Card className="bg-sleeper-dark border-sleeper-dark mb-6">
          <CardHeader>
            <CardTitle>Trade Analysis</CardTitle>
            <CardDescription>
              Based on {leagueType} league format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="bg-sleeper-darker border border-sleeper-border mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="impact">Team Impact</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-sleeper-darker border-sleeper-border col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Trade Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-2">
                        {analysis.comments.map((comment, index) => (
                          <div key={index} className="flex items-start">
                            <div className="mr-2 mt-1">•</div>
                            <div>{comment}</div>
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-sleeper-gray">Key Players Received:</div>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium mb-1">{teamA.name}</div>
                          <div className="text-sm">
                            {analysis.keyPlayers.teamA.length > 0 
                              ? analysis.keyPlayers.teamA.join(', ')
                              : 'None'
                            }
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">{teamB.name}</div>
                          <div className="text-sm">
                            {analysis.keyPlayers.teamB.length > 0 
                              ? analysis.keyPlayers.teamB.join(', ')
                              : 'None'
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-sleeper-darker border-sleeper-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Trade Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <div className="text-sm">{teamA.name}</div>
                            <div className="text-sm">{Math.floor(analysis.valueTeamA / 100)}</div>
                          </div>
                          <div className="w-full bg-sleeper-dark rounded-full h-2.5">
                            <div 
                              className="bg-sleeper-accent h-2.5 rounded-full" 
                              style={{ width: `${(analysis.valueTeamA / (analysis.valueTeamA + analysis.valueTeamB)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <div className="text-sm">{teamB.name}</div>
                            <div className="text-sm">{Math.floor(analysis.valueTeamB / 100)}</div>
                          </div>
                          <div className="w-full bg-sleeper-dark rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${(analysis.valueTeamB / (analysis.valueTeamA + analysis.valueTeamB)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <div className="text-sm font-medium mb-1">Value Difference</div>
                          <div className="flex items-center">
                            {analysis.winner === 'even' ? (
                              <Badge className="bg-gray-500 text-white">Even Trade</Badge>
                            ) : (
                              <Badge className={`${analysis.winner === 'A' ? 'bg-sleeper-accent text-sleeper-dark' : 'bg-primary'}`}>
                                {analysis.winner === 'A' ? teamA.name : teamB.name} +{Math.floor(analysis.difference / 100)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-sleeper-darker border-sleeper-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {teamA.name} Receives
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {teamB.players.length === 0 ? (
                        <div className="text-center py-2 text-sleeper-gray">
                          No players
                        </div>
                      ) : (
                        teamB.players.map(player => (
                          <div key={player.id} className="flex items-center">
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
                              <div className="font-medium text-sm">{player.name}</div>
                              <div className="flex items-center text-xs">
                                <Badge variant="outline" className={`${getPositionClass(player.position)} mr-1 text-xs h-4 px-1`}>
                                  {player.position}
                                </Badge>
                                <span className="text-sleeper-gray">{player.team}</span>
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              {Math.floor((player.dynasty_value || 0) / 100)}
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-sleeper-darker border-sleeper-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {teamB.name} Receives
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {teamA.players.length === 0 ? (
                        <div className="text-center py-2 text-sleeper-gray">
                          No players
                        </div>
                      ) : (
                        teamA.players.map(player => (
                          <div key={player.id} className="flex items-center">
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
                              <div className="font-medium text-sm">{player.name}</div>
                              <div className="flex items-center text-xs">
                                <Badge variant="outline" className={`${getPositionClass(player.position)} mr-1 text-xs h-4 px-1`}>
                                  {player.position}
                                </Badge>
                                <span className="text-sleeper-gray">{player.team}</span>
                              </div>
                            </div>
                            <div className="text-sm font-medium">
                              {Math.floor((player.dynasty_value || 0) / 100)}
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Details Tab */}
              <TabsContent value="details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-sleeper-darker border-sleeper-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Value Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">Short-term Impact</div>
                            <div className="flex space-x-3">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-sleeper-accent mr-1"></div>
                                <span className="text-xs">{teamA.name}</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
                                <span className="text-xs">{teamB.name}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {analysis.shortTerm.teamA === 'Better' ? (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              ) : analysis.shortTerm.teamA === 'Worse' ? (
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                              ) : (
                                <ArrowRight className="h-4 w-4 text-sleeper-gray mr-1" />
                              )}
                              <span className={`text-sm ${
                                analysis.shortTerm.teamA === 'Better' ? 'text-green-500' : 
                                analysis.shortTerm.teamA === 'Worse' ? 'text-red-500' : 
                                'text-sleeper-gray'
                              }`}>
                                {analysis.shortTerm.teamA}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              {analysis.shortTerm.teamB === 'Better' ? (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              ) : analysis.shortTerm.teamB === 'Worse' ? (
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                              ) : (
                                <ArrowRight className="h-4 w-4 text-sleeper-gray mr-1" />
                              )}
                              <span className={`text-sm ${
                                analysis.shortTerm.teamB === 'Better' ? 'text-green-500' : 
                                analysis.shortTerm.teamB === 'Worse' ? 'text-red-500' : 
                                'text-sleeper-gray'
                              }`}>
                                {analysis.shortTerm.teamB}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">Long-term Impact</div>
                            <div className="flex space-x-3">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-sleeper-accent mr-1"></div>
                                <span className="text-xs">{teamA.name}</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
                                <span className="text-xs">{teamB.name}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {analysis.longTerm.teamA === 'Better' ? (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              ) : analysis.longTerm.teamA === 'Worse' ? (
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                              ) : (
                                <ArrowRight className="h-4 w-4 text-sleeper-gray mr-1" />
                              )}
                              <span className={`text-sm ${
                                analysis.longTerm.teamA === 'Better' ? 'text-green-500' : 
                                analysis.longTerm.teamA === 'Worse' ? 'text-red-500' : 
                                'text-sleeper-gray'
                              }`}>
                                {analysis.longTerm.teamA}
                              </span>
                            </div>
                            
                            <div className="flex items-center">
                              {analysis.longTerm.teamB === 'Better' ? (
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              ) : analysis.longTerm.teamB === 'Worse' ? (
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                              ) : (
                                <ArrowRight className="h-4 w-4 text-sleeper-gray mr-1" />
                              )}
                              <span className={`text-sm ${
                                analysis.longTerm.teamB === 'Better' ? 'text-green-500' : 
                                analysis.longTerm.teamB === 'Worse' ? 'text-red-500' : 
                                'text-sleeper-gray'
                              }`}>
                                {analysis.longTerm.teamB}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Overall Assessment</div>
                          <div className="p-3 bg-sleeper-dark rounded-md">
                            {analysis.winner === 'even' ? (
                              <div className="flex items-center text-sleeper-gray">
                                <Scale className="h-4 w-4 mr-2" />
                                This trade is relatively balanced in value
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                                <span>
                                  <span className="font-medium">
                                    {analysis.winner === 'A' ? teamA.name : teamB.name}
                                  </span> gets better value in this trade
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-sleeper-darker border-sleeper-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Position Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {['QB', 'RB', 'WR', 'TE'].map(position => {
                          const teamACount = teamA.players.filter(p => p.position === position).length;
                          const teamBCount = teamB.players.filter(p => p.position === position).length;
                          
                          if (teamACount === 0 && teamBCount === 0) return null;
                          
                          return (
                            <div key={position}>
                              <div className="flex justify-between mb-1">
                                <div className="flex items-center">
                                  <Badge className={`${getPositionClass(position)} mr-2`}>{position}</Badge>
                                  <span className="text-sm font-medium">Position Change</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-sleeper-dark p-2 rounded-md">
                                  <div className="text-xs text-sleeper-gray mb-1">{teamA.name} Receives</div>
                                  <div className="text-sm">
                                    {teamBCount > 0 ? (
                                      <div className="flex items-center">
                                        <span>+{teamBCount} {position}{teamBCount > 1 ? 's' : ''}</span>
                                        {teamACount === 0 && (
                                          <Badge className="ml-2 bg-green-600 text-white text-xs">New Position</Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sleeper-gray">None</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="bg-sleeper-dark p-2 rounded-md">
                                  <div className="text-xs text-sleeper-gray mb-1">{teamB.name} Receives</div>
                                  <div className="text-sm">
                                    {teamACount > 0 ? (
                                      <div className="flex items-center">
                                        <span>+{teamACount} {position}{teamACount > 1 ? 's' : ''}</span>
                                        {teamBCount === 0 && (
                                          <Badge className="ml-2 bg-green-600 text-white text-xs">New Position</Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sleeper-gray">None</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        <Separator />
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Age Analysis</div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-sleeper-dark p-2 rounded-md">
                              <div className="text-xs text-sleeper-gray mb-1">{teamA.name} Avg Age</div>
                              <div className="text-sm">
                                Current: {teamA.players.length > 0 
                                  ? (teamA.players.reduce((sum, p) => sum + p.age, 0) / teamA.players.length).toFixed(1)
                                  : 'N/A'}
                              </div>
                              <div className="text-sm">
                                After: {teamB.players.length > 0 
                                  ? (teamB.players.reduce((sum, p) => sum + p.age, 0) / teamB.players.length).toFixed(1)
                                  : 'N/A'}
                              </div>
                            </div>
                            
                            <div className="bg-sleeper-dark p-2 rounded-md">
                              <div className="text-xs text-sleeper-gray mb-1">{teamB.name} Avg Age</div>
                              <div className="text-sm">
                                Current: {teamB.players.length > 0 
                                  ? (teamB.players.reduce((sum, p) => sum + p.age, 0) / teamB.players.length).toFixed(1)
                                  : 'N/A'}
                              </div>
                              <div className="text-sm">
                                After: {teamA.players.length > 0 
                                  ? (teamA.players.reduce((sum, p) => sum + p.age, 0) / teamA.players.length).toFixed(1)
                                  : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Team Impact Tab */}
              <TabsContent value="impact">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-sleeper-darker border-sleeper-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{teamA.name} Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-2">Strategy Assessment</div>
                          <div className="p-3 bg-sleeper-dark rounded-md">
                            {analysis.longTerm.teamA === 'Better' ? (
                              <div className="text-sm">
                                <span className="font-medium">Rebuilding:</span> This trade improves your long-term outlook by acquiring younger assets with growth potential.
                              </div>
                            ) : analysis.shortTerm.teamA === 'Better' ? (
                              <div className="text-sm">
                                <span className="font-medium">Win Now:</span> This trade boosts your immediate competitiveness for a championship push.
                              </div>
                            ) : (
                              <div className="text-sm">
                                <span className="font-medium">Balanced:</span> This trade maintains your team's balance between current production and future potential.
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Roster Implications</div>
                          
                          <div className="space-y-2">
                            {['QB', 'RB', 'WR', 'TE'].map(position => {
                              const sending = teamA.players.filter(p => p.position === position).length;
                              const receiving = teamB.players.filter(p => p.position === position).length;
                              const net = receiving - sending;
                              
                              if (net === 0) return null;
                              
                              return (
                                <div key={position} className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Badge className={`${getPositionClass(position)} mr-2`}>{position}</Badge>
                                    <span className="text-sm">Depth Change</span>
                                  </div>
                                  <div className={`text-sm ${net > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {net > 0 ? `+${net}` : net}
                                  </div>
                                </div>
                              );
                            })}
                            
                            {['QB', 'RB', 'WR', 'TE'].every(position => {
                              const sending = teamA.players.filter(p => p.position === position).length;
                              const receiving = teamB.players.filter(p => p.position === position).length;
                              return sending === receiving;
                            }) && (
                              <div className="text-sm text-sleeper-gray">
                                No significant position depth changes
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Value Gained/Lost</div>
                          <div className="bg-sleeper-dark p-3 rounded-md">
                            <div className="flex justify-between items-center">
                              <div className="text-sm">Total Value Change</div>
                              <div className={`text-sm font-medium ${
                                analysis.valueTeamB > analysis.valueTeamA ? 'text-green-500' : 
                                analysis.valueTeamB < analysis.valueTeamA ? 'text-red-500' : 
                                'text-sleeper-gray'
                              }`}>
                                {analysis.valueTeamB > analysis.valueTeamA ? 
                                  `+${Math.floor((analysis.valueTeamB - analysis.valueTeamA) / 100)}` : 
                                  analysis.valueTeamB < analysis.valueTeamA ? 
                                  `-${Math.floor((analysis.valueTeamA - analysis.valueTeamB) / 100)}` : 
                                  '0'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-sleeper-darker border-sleeper-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{teamB.name} Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-2">Strategy Assessment</div>
                          <div className="p-3 bg-sleeper-dark rounded-md">
                            {analysis.longTerm.teamB === 'Better' ? (
                              <div className="text-sm">
                                <span className="font-medium">Rebuilding:</span> This trade improves your long-term outlook by acquiring younger assets with growth potential.
                              </div>
                            ) : analysis.shortTerm.teamB === 'Better' ? (
                              <div className="text-sm">
                                <span className="font-medium">Win Now:</span> This trade boosts your immediate competitiveness for a championship push.
                              </div>
                            ) : (
                              <div className="text-sm">
                                <span className="font-medium">Balanced:</span> This trade maintains your team's balance between current production and future potential.
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Roster Implications</div>
                          
                          <div className="space-y-2">
                            {['QB', 'RB', 'WR', 'TE'].map(position => {
                              const sending = teamB.players.filter(p => p.position === position).length;
                              const receiving = teamA.players.filter(p => p.position === position).length;
                              const net = receiving - sending;
                              
                              if (net === 0) return null;
                              
                              return (
                                <div key={position} className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Badge className={`${getPositionClass(position)} mr-2`}>{position}</Badge>
                                    <span className="text-sm">Depth Change</span>
                                  </div>
                                  <div className={`text-sm ${net > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {net > 0 ? `+${net}` : net}
                                  </div>
                                </div>
                              );
                            })}
                            
                            {['QB', 'RB', 'WR', 'TE'].every(position => {
                              const sending = teamB.players.filter(p => p.position === position).length;
                              const receiving = teamA.players.filter(p => p.position === position).length;
                              return sending === receiving;
                            }) && (
                              <div className="text-sm text-sleeper-gray">
                                No significant position depth changes
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Value Gained/Lost</div>
                          <div className="bg-sleeper-dark p-3 rounded-md">
                            <div className="flex justify-between items-center">
                              <div className="text-sm">Total Value Change</div>
                              <div className={`text-sm font-medium ${
                                analysis.valueTeamA > analysis.valueTeamB ? 'text-green-500' : 
                                analysis.valueTeamA < analysis.valueTeamB ? 'text-red-500' : 
                                'text-sleeper-gray'
                              }`}>
                                {analysis.valueTeamA > analysis.valueTeamB ? 
                                  `+${Math.floor((analysis.valueTeamA - analysis.valueTeamB) / 100)}` : 
                                  analysis.valueTeamA < analysis.valueTeamB ? 
                                  `-${Math.floor((analysis.valueTeamB - analysis.valueTeamA) / 100)}` : 
                                  '0'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {/* Player Search */}
      <Card className="bg-sleeper-dark border-sleeper-dark">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Add Players to Trade</CardTitle>
            <Select value={selectedTeam} onValueChange={(value: 'A' | 'B') => setSelectedTeam(value)}>
              <SelectTrigger className="w-36 bg-sleeper-darker border-sleeper-border">
                <SelectValue placeholder="Add to Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Add to {teamA.name}</SelectItem>
                <SelectItem value="B">Add to {teamB.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sleeper-gray h-4 w-4" />
              <Input
                className="bg-sleeper-darker border-sleeper-dark pl-10"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
            </div>
            <Button className="ml-2" onClick={handleSearch}>
              Search
            </Button>
          </div>
          
          <ScrollArea className="h-[400px]">
            {isSearching ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center p-3 mb-2 bg-sleeper-darker border border-sleeper-border rounded-md">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))
            ) : searchResults.length > 0 ? (
              searchResults.map(player => renderPlayerCard(player, selectedTeam))
            ) : searchQuery ? (
              <div className="text-center py-6 text-sleeper-gray">
                No players found matching "{searchQuery}"
              </div>
            ) : (
              <div className="text-center py-6 text-sleeper-gray">
                Search for players to add to the trade
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeAnalyzer;