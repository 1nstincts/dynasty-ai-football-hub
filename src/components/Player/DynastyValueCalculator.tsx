import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { useToast } from '../ui/use-toast';
import { Search, Info, Download, BarChart2 } from 'lucide-react';
import DynastyValueService, { 
  Player, 
  DraftPick, 
  ValueSettings, 
  ValueTier 
} from '../../services/DynastyValueService';

interface PlayerSearchResult extends Player {
  score: number;
}

type ValueCategory = 'dynasty' | 'redraft' | 'rookie' | 'picks';
type LeagueType = 'dynasty' | 'keeper' | 'redraft';

const DynastyValueCalculator: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlayerSearchResult[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [selectedPicks, setSelectedPicks] = useState<DraftPick[]>([]);
  const [valueCategory, setValueCategory] = useState<ValueCategory>('dynasty');
  const [leagueType, setLeagueType] = useState<LeagueType>('dynasty');
  const [teamCount, setTeamCount] = useState(12);
  const [qbPremium, setQbPremium] = useState(false);
  const [tePremium, setTePremium] = useState(false);
  const [customValueFactors, setCustomValueFactors] = useState({
    age: 1,
    experience: 0.8,
    position: {
      QB: 1,
      RB: 1,
      WR: 1,
      TE: 1
    },
    talent: 1
  });

  // Use the value tiers from the service
  const valueTiers = DynastyValueService.valueTiers;

  // Mock draft picks data
  const availablePicks: DraftPick[] = [
    { id: '1', year: 2024, round: 1, original_owner: 'Team A', current_owner: 'Team A', value: 90, description: '2024 Round 1 (Early)' },
    { id: '2', year: 2024, round: 1, original_owner: 'Team B', current_owner: 'Team B', value: 85, description: '2024 Round 1 (Mid)' },
    { id: '3', year: 2024, round: 1, original_owner: 'Team C', current_owner: 'Team C', value: 80, description: '2024 Round 1 (Late)' },
    { id: '4', year: 2024, round: 2, original_owner: 'Team A', current_owner: 'Team A', value: 70, description: '2024 Round 2 (Early)' },
    { id: '5', year: 2024, round: 2, original_owner: 'Team B', current_owner: 'Team B', value: 65, description: '2024 Round 2 (Mid)' },
    { id: '6', year: 2024, round: 2, original_owner: 'Team C', current_owner: 'Team C', value: 60, description: '2024 Round 2 (Late)' },
    { id: '7', year: 2025, round: 1, original_owner: 'Team A', current_owner: 'Team A', value: 75, description: '2025 Round 1 (Projected Early)' },
    { id: '8', year: 2025, round: 1, original_owner: 'Team B', current_owner: 'Team B', value: 70, description: '2025 Round 1 (Projected Mid)' }
  ];

  // Fetch players based on search query
  useEffect(() => {
    const searchPlayers = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }
      
      setLoading(true);
      try {
        // Call the service to search for players
        const players = await DynastyValueService.searchPlayers(searchQuery);
        
        // Transform and sort results
        const results = players
          .map(player => ({
            ...player,
            score: player.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 2 : 1
          }))
          .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
          .slice(0, 5);
        
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching players:', error);
        toast({
          title: "Error",
          description: "Failed to search players. Using mock data instead.",
          variant: "destructive",
        });
        
        // Fall back to mock data
        const mockPlayers: Player[] = [
          { id: '1', name: 'Christian McCaffrey', position: 'RB', team: 'SF', age: 27, experience: 7, dynasty_value: 95, redraft_value: 99 },
          { id: '2', name: 'Bijan Robinson', position: 'RB', team: 'ATL', age: 22, experience: 1, dynasty_value: 94, redraft_value: 91 },
          { id: '3', name: 'CeeDee Lamb', position: 'WR', team: 'DAL', age: 25, experience: 4, dynasty_value: 92, redraft_value: 94 },
          { id: '4', name: 'Justin Jefferson', position: 'WR', team: 'MIN', age: 25, experience: 4, dynasty_value: 93, redraft_value: 95 },
          { id: '5', name: 'Ja\'Marr Chase', position: 'WR', team: 'CIN', age: 24, experience: 3, dynasty_value: 92, redraft_value: 93 },
          { id: '6', name: 'Patrick Mahomes', position: 'QB', team: 'KC', age: 28, experience: 7, dynasty_value: 90, redraft_value: 92 },
          { id: '7', name: 'Travis Kelce', position: 'TE', team: 'KC', age: 34, experience: 11, dynasty_value: 78, redraft_value: 90 },
          { id: '8', name: 'Lamar Jackson', position: 'QB', team: 'BAL', age: 27, experience: 6, dynasty_value: 88, redraft_value: 90 },
          { id: '9', name: 'Saquon Barkley', position: 'RB', team: 'PHI', age: 27, experience: 6, dynasty_value: 84, redraft_value: 89 },
          { id: '10', name: 'Jahmyr Gibbs', position: 'RB', team: 'DET', age: 22, experience: 1, dynasty_value: 87, redraft_value: 85 }
        ];
        
        const query = searchQuery.toLowerCase();
        const results = mockPlayers
          .filter(player => 
            player.name.toLowerCase().includes(query) || 
            player.position.toLowerCase().includes(query) ||
            player.team.toLowerCase().includes(query)
          )
          .map(player => ({
            ...player,
            score: player.name.toLowerCase().includes(query) ? 2 : 1
          }))
          .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
          .slice(0, 5);
        
        setSearchResults(results);
      } finally {
        setLoading(false);
      }
    };
    
    const debounceTimeout = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        searchPlayers();
      }
    }, 300);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, toast]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const addPlayer = (player: Player) => {
    if (!selectedPlayers.some(p => p.id === player.id)) {
      setSelectedPlayers([...selectedPlayers, player]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const removePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(player => player.id !== playerId));
  };

  const addPick = (pick: DraftPick) => {
    if (!selectedPicks.some(p => p.id === pick.id)) {
      setSelectedPicks([...selectedPicks, pick]);
    }
  };

  const removePick = (pickId: string) => {
    setSelectedPicks(selectedPicks.filter(pick => pick.id !== pickId));
  };

  const handlePositionValueChange = (position: keyof typeof customValueFactors.position, value: number) => {
    setCustomValueFactors({
      ...customValueFactors,
      position: {
        ...customValueFactors.position,
        [position]: value
      }
    });
  };

  const handleFactorChange = (factor: keyof typeof customValueFactors, value: number) => {
    if (factor !== 'position') {
      setCustomValueFactors({
        ...customValueFactors,
        [factor]: value
      });
    }
  };

  const calculateAdjustedValue = (player: Player): number => {
    if (!player) return 0;
    
    // Create settings object from component state
    const settings: ValueSettings = {
      leagueType,
      teamCount,
      qbPremium,
      tePremium,
      valueFactors: customValueFactors
    };
    
    // Use service to calculate the adjusted value
    return DynastyValueService.calculateAdjustedValue(
      player, 
      settings, 
      valueCategory === 'redraft' ? 'redraft' : valueCategory === 'rookie' ? 'rookie' : 'dynasty'
    );
  };

  const getTotalValue = (players: Player[]): number => {
    return players.reduce((total, player) => total + calculateAdjustedValue(player), 0);
  };

  const getTotalPickValue = (picks: DraftPick[]): number => {
    return picks.reduce((total, pick) => total + pick.value, 0);
  };

  const getValueTier = (value: number): ValueTier => {
    return DynastyValueService.getValueTier(value);
  };

  const exportValues = () => {
    const allItems = [
      ...selectedPlayers.map(player => ({
        type: 'Player',
        name: player.name,
        details: `${player.position} | ${player.team} | Age: ${player.age}`,
        value: calculateAdjustedValue(player)
      })),
      ...selectedPicks.map(pick => ({
        type: 'Pick',
        name: pick.description,
        details: `${pick.year} Round ${pick.round} (${pick.original_owner})`,
        value: pick.value
      }))
    ];
    
    const csvContent = [
      ['Type', 'Name', 'Details', 'Value', 'Tier'].join(','),
      ...allItems.map(item => [
        item.type,
        item.name,
        item.details,
        item.value,
        getValueTier(item.value).name
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dynasty-values-${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    
    toast({
      title: "Values Exported",
      description: "Dynasty values have been exported as CSV file.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Value Calculator</TabsTrigger>
          <TabsTrigger value="chart">Value Chart</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Add Players & Picks</CardTitle>
                <CardDescription>
                  Search for players and add draft picks to calculate values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      className="pl-10"
                      placeholder="Search players..."
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>
                  
                  {searchQuery.trim() !== '' && searchResults.length > 0 && (
                    <div className="mt-1 bg-white shadow-lg rounded-md border overflow-hidden">
                      <ul className="divide-y divide-gray-200">
                        {searchResults.map(player => (
                          <li 
                            key={player.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => addPlayer(player)}
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-3">
                                {player.position}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{player.name}</p>
                                <p className="text-xs text-gray-500">{player.team} • Age: {player.age}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Draft Picks</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {availablePicks.slice(0, 6).map(pick => (
                        <Button 
                          key={pick.id}
                          variant="outline" 
                          className="justify-start text-left h-auto py-2"
                          onClick={() => addPick(pick)}
                        >
                          <span className="truncate">
                            {pick.year} R{pick.round} ({pick.original_owner})
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Value Results</CardTitle>
                  <Select
                    value={valueCategory}
                    onValueChange={(value) => setValueCategory(value as ValueCategory)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Value Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dynasty">Dynasty Value</SelectItem>
                      <SelectItem value="redraft">Redraft Value</SelectItem>
                      <SelectItem value="rookie">Rookie Value</SelectItem>
                      <SelectItem value="picks">Pick Value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>
                  Player and pick values adjusted for {leagueType} leagues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedPlayers.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className="text-right"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPlayers.map(player => {
                            const adjustedValue = calculateAdjustedValue(player);
                            const tier = getValueTier(adjustedValue);
                            
                            return (
                              <TableRow key={player.id}>
                                <TableCell>
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-2">
                                      {player.position}
                                    </div>
                                    <div>
                                      <p className="font-medium">{player.name}</p>
                                      <p className="text-xs text-gray-500">{player.team} • Age: {player.age}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <div className="font-bold mr-2">{adjustedValue}</div>
                                    <Badge className={`${tier.color} text-white`}>{tier.name}</Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePlayer(player.id)}
                                  >
                                    Remove
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No players selected. Search and add players to see their values.
                    </div>
                  )}
                  
                  {selectedPicks.length > 0 && (
                    <div className="pt-4">
                      <h3 className="text-sm font-medium mb-3">Draft Picks</h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Pick</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead className="text-right"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedPicks.map(pick => {
                              const tier = getValueTier(pick.value);
                              
                              return (
                                <TableRow key={pick.id}>
                                  <TableCell>
                                    <p className="font-medium">{pick.description}</p>
                                    <p className="text-xs text-gray-500">From: {pick.original_owner}</p>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      <div className="font-bold mr-2">{pick.value}</div>
                                      <Badge className={`${tier.color} text-white`}>{tier.name}</Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removePick(pick.id)}
                                    >
                                      Remove
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <div className="w-full space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Value:</span>
                    <span className="text-xl font-bold">
                      {getTotalValue(selectedPlayers) + getTotalPickValue(selectedPicks)}
                    </span>
                  </div>
                  <Button 
                    variant="default" 
                    className="w-full" 
                    onClick={exportValues}
                    disabled={selectedPlayers.length === 0 && selectedPicks.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Values
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="chart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dynasty Value Chart</CardTitle>
              <CardDescription>
                Current player values adjusted for {leagueType} leagues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Select
                    defaultValue="all"
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      <SelectItem value="QB">Quarterback</SelectItem>
                      <SelectItem value="RB">Running Back</SelectItem>
                      <SelectItem value="WR">Wide Receiver</SelectItem>
                      <SelectItem value="TE">Tight End</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <BarChart2 className="mr-2 h-4 w-4" />
                      Graph View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export Chart
                    </Button>
                  </div>
                </div>
                
                {/* Value tiers display */}
                <div className="space-y-8">
                  {valueTiers.slice(0, 5).map(tier => (
                    <div key={tier.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold flex items-center">
                          <div className={`w-4 h-4 rounded-full ${tier.color} mr-2`}></div>
                          {tier.name} Tier ({tier.min}-{tier.max})
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {Array.from({ length: tier.name === 'Elite' ? 3 : tier.name === 'Premium' ? 4 : 6 }).map((_, i) => {
                          const mockValue = tier.max - Math.floor(Math.random() * (tier.max - tier.min + 1));
                          return (
                            <Card key={i} className="flex items-center p-2 space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                                {['QB', 'RB', 'WR', 'TE'][Math.floor(Math.random() * 4)]}
                              </div>
                              <div className="flex-grow">
                                <p className="text-sm font-medium truncate">Player Name</p>
                                <p className="text-xs text-gray-500">NFL Team</p>
                              </div>
                              <div className="text-lg font-bold">{mockValue}</div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Draft Pick Values</CardTitle>
              <CardDescription>
                Current values for future draft picks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">2024 Picks</h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(round => (
                        <div key={round} className="flex items-center space-x-2">
                          <div className="w-14 text-center">
                            <Badge variant={round === 1 ? "destructive" : round === 2 ? "default" : "secondary"}>
                              Round {round}
                            </Badge>
                          </div>
                          <div className="flex-grow bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${round === 1 ? 90 : round === 2 ? 70 : round === 3 ? 40 : 20}%` }}
                            ></div>
                          </div>
                          <div className="w-10 text-right font-medium">
                            {round === 1 ? '85' : round === 2 ? '65' : round === 3 ? '35' : '15'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">2025 Picks</h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(round => (
                        <div key={round} className="flex items-center space-x-2">
                          <div className="w-14 text-center">
                            <Badge variant={round === 1 ? "destructive" : round === 2 ? "default" : "secondary"}>
                              Round {round}
                            </Badge>
                          </div>
                          <div className="flex-grow bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${round === 1 ? 75 : round === 2 ? 55 : round === 3 ? 30 : 10}%` }}
                            ></div>
                          </div>
                          <div className="w-10 text-right font-medium">
                            {round === 1 ? '70' : round === 2 ? '50' : round === 3 ? '25' : '10'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Value Settings</CardTitle>
              <CardDescription>
                Customize how dynasty values are calculated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">League Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leagueType">League Type</Label>
                    <Select
                      value={leagueType}
                      onValueChange={(value) => setLeagueType(value as LeagueType)}
                    >
                      <SelectTrigger id="leagueType">
                        <SelectValue placeholder="League Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dynasty">Dynasty</SelectItem>
                        <SelectItem value="keeper">Keeper</SelectItem>
                        <SelectItem value="redraft">Redraft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="teamCount">Team Count</Label>
                    <Select
                      value={teamCount.toString()}
                      onValueChange={(value) => setTeamCount(parseInt(value))}
                    >
                      <SelectTrigger id="teamCount">
                        <SelectValue placeholder="Team Count" />
                      </SelectTrigger>
                      <SelectContent>
                        {[8, 10, 12, 14, 16].map(count => (
                          <SelectItem key={count} value={count.toString()}>
                            {count} Teams
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="qbPremium">QB Premium Scoring</Label>
                    <Switch 
                      id="qbPremium"
                      checked={qbPremium}
                      onCheckedChange={setQbPremium}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tePremium">TE Premium Scoring</Label>
                    <Switch 
                      id="tePremium"
                      checked={tePremium}
                      onCheckedChange={setTePremium}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Value Factors</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Adjust how much each factor influences player values
                </p>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="ageImportance">Age Importance</Label>
                      <span className="text-sm">{customValueFactors.age.toFixed(1)}x</span>
                    </div>
                    <Slider 
                      id="ageImportance"
                      min={0} 
                      max={2} 
                      step={0.1} 
                      value={[customValueFactors.age]}
                      onValueChange={([value]) => handleFactorChange('age', value)}
                    />
                    <p className="text-xs text-gray-500">
                      Higher values place more importance on player age in dynasty
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="experienceImportance">Experience/Youth Upside</Label>
                      <span className="text-sm">{customValueFactors.experience.toFixed(1)}x</span>
                    </div>
                    <Slider 
                      id="experienceImportance"
                      min={0} 
                      max={1.5} 
                      step={0.1} 
                      value={[customValueFactors.experience]}
                      onValueChange={([value]) => handleFactorChange('experience', value)}
                    />
                    <p className="text-xs text-gray-500">
                      Higher values give more upside to rookies and young players
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Position Value Adjustments</Label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="qbValue">QB Value</Label>
                          <span className="text-sm">{customValueFactors.position.QB.toFixed(1)}x</span>
                        </div>
                        <Slider 
                          id="qbValue"
                          min={0.5} 
                          max={1.5} 
                          step={0.1} 
                          value={[customValueFactors.position.QB]}
                          onValueChange={([value]) => handlePositionValueChange('QB', value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="rbValue">RB Value</Label>
                          <span className="text-sm">{customValueFactors.position.RB.toFixed(1)}x</span>
                        </div>
                        <Slider 
                          id="rbValue"
                          min={0.5} 
                          max={1.5} 
                          step={0.1} 
                          value={[customValueFactors.position.RB]}
                          onValueChange={([value]) => handlePositionValueChange('RB', value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="wrValue">WR Value</Label>
                          <span className="text-sm">{customValueFactors.position.WR.toFixed(1)}x</span>
                        </div>
                        <Slider 
                          id="wrValue"
                          min={0.5} 
                          max={1.5} 
                          step={0.1} 
                          value={[customValueFactors.position.WR]}
                          onValueChange={([value]) => handlePositionValueChange('WR', value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="teValue">TE Value</Label>
                          <span className="text-sm">{customValueFactors.position.TE.toFixed(1)}x</span>
                        </div>
                        <Slider 
                          id="teValue"
                          min={0.5} 
                          max={1.5} 
                          step={0.1} 
                          value={[customValueFactors.position.TE]}
                          onValueChange={([value]) => handlePositionValueChange('TE', value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <Button variant="outline">
                  Reset to Defaults
                </Button>
                <Button>
                  Apply Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DynastyValueCalculator;
