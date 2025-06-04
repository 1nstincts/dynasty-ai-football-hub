import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Calculator, Save, Download, RefreshCw, PlusCircle, ChevronRight, LineChart } from 'lucide-react';
import PlayerService from '@/services/PlayerService';
import { Player } from '@/store/slices/playersSlice';

interface ScoringSettings {
  passingYards: number;
  passingTD: number;
  interception: number;
  rushingYards: number;
  rushingTD: number;
  receivingYards: number;
  receivingTD: number;
  reception: number;
  fumble: number;
  twoPoint: number;
}

interface PointsProjection {
  player: Player;
  stats: {
    passing?: {
      completions: number;
      attempts: number;
      yards: number;
      touchdowns: number;
      interceptions: number;
    };
    rushing?: {
      attempts: number;
      yards: number;
      touchdowns: number;
    };
    receiving?: {
      targets: number;
      receptions: number;
      yards: number;
      touchdowns: number;
    };
    fumbles?: number;
    twoPointConversions?: number;
  };
  projectedPoints: number;
}

interface ScoringPreset {
  name: string;
  settings: ScoringSettings;
}

const PointsProjectionCalculator: React.FC = () => {
  // Default scoring settings (Half PPR)
  const defaultSettings: ScoringSettings = {
    passingYards: 0.04,    // 1 point per 25 yards
    passingTD: 4,          // 4 points per TD
    interception: -1,      // -1 point per INT
    rushingYards: 0.1,     // 1 point per 10 yards
    rushingTD: 6,          // 6 points per TD
    receivingYards: 0.1,   // 1 point per 10 yards
    receivingTD: 6,        // 6 points per TD
    reception: 0.5,        // 0.5 points per reception (Half PPR)
    fumble: -2,            // -2 points per fumble
    twoPoint: 2            // 2 points per 2pt conversion
  };
  
  // Pre-defined scoring presets
  const scoringPresets: ScoringPreset[] = [
    {
      name: 'Standard',
      settings: {
        ...defaultSettings,
        reception: 0
      }
    },
    {
      name: 'Half PPR',
      settings: defaultSettings
    },
    {
      name: 'PPR',
      settings: {
        ...defaultSettings,
        reception: 1
      }
    },
    {
      name: 'TE Premium',
      settings: {
        ...defaultSettings,
        reception: 1
      }
      // In real implementation, TE Premium would be handled separately for TEs
    },
    {
      name: '6pt Passing TD',
      settings: {
        ...defaultSettings,
        passingTD: 6
      }
    },
    {
      name: 'SuperFlex',
      settings: defaultSettings
      // SuperFlex affects lineup construction, not scoring
    }
  ];
  
  const [selectedPreset, setSelectedPreset] = useState('Half PPR');
  const [scoringSettings, setScoringSettings] = useState<ScoringSettings>(defaultSettings);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [projections, setProjections] = useState<PointsProjection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Load players on mount
  useEffect(() => {
    fetchPlayers();
  }, []);
  
  // Apply preset when it changes
  useEffect(() => {
    const preset = scoringPresets.find(p => p.name === selectedPreset);
    if (preset) {
      setScoringSettings(preset.settings);
    }
  }, [selectedPreset]);
  
  // Recalculate projections when settings or selected players change
  useEffect(() => {
    if (selectedPlayers.length > 0) {
      calculateProjections();
    }
  }, [scoringSettings, selectedPlayers]);
  
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
  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Filter players based on search query
    const results = players.filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.position.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort by relevance
    const sorted = results.sort((a, b) => {
      // Exact name match first
      if (a.name.toLowerCase() === searchQuery.toLowerCase()) return -1;
      if (b.name.toLowerCase() === searchQuery.toLowerCase()) return 1;
      
      // Starts with second
      if (a.name.toLowerCase().startsWith(searchQuery.toLowerCase())) return -1;
      if (b.name.toLowerCase().startsWith(searchQuery.toLowerCase())) return 1;
      
      // Then by position and name
      if (a.position !== b.position) {
        return a.position.localeCompare(b.position);
      }
      
      return a.name.localeCompare(b.name);
    });
    
    setSearchResults(sorted.slice(0, 20)); // Limit to 20 results
    setIsSearching(false);
  };
  
  const addPlayer = (player: Player) => {
    // Check if player is already selected
    if (selectedPlayers.some(p => p.id === player.id)) return;
    
    setSelectedPlayers([...selectedPlayers, player]);
  };
  
  const removePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
    setProjections(projections.filter(p => p.player.id !== playerId));
  };
  
  const calculateProjections = () => {
    setIsCalculating(true);
    
    const newProjections: PointsProjection[] = selectedPlayers.map(player => {
      // Generate or use existing projections
      const projection = projections.find(p => p.player.id === player.id);
      
      let stats;
      if (projection) {
        // Use existing stats if player is already in projections
        stats = projection.stats;
      } else {
        // Generate new stats based on position and player data
        stats = generateProjectedStats(player);
      }
      
      // Calculate points based on stats and current scoring settings
      const points = calculatePoints(stats, scoringSettings, player.position);
      
      return {
        player,
        stats,
        projectedPoints: points
      };
    });
    
    // Sort by projected points (highest first)
    newProjections.sort((a, b) => b.projectedPoints - a.projectedPoints);
    
    setProjections(newProjections);
    setIsCalculating(false);
  };
  
  // Generate reasonable stats projections based on player position and data
  const generateProjectedStats = (player: Player) => {
    const stats: PointsProjection['stats'] = {};
    
    // Use existing stats as a baseline if available
    const baseStats = player.stats || {};
    const baseProjections = player.projections || {};
    
    // Vary by position
    switch (player.position) {
      case 'QB':
        stats.passing = {
          completions: baseProjections.passing?.completions || baseStats.passing?.completions || Math.floor(Math.random() * 100) + 250,
          attempts: baseProjections.passing?.attempts || baseStats.passing?.attempts || Math.floor(Math.random() * 150) + 350,
          yards: baseProjections.passing?.yards || baseStats.passing?.yards || Math.floor(Math.random() * 1500) + 2500,
          touchdowns: baseProjections.passing?.touchdowns || baseStats.passing?.touchdowns || Math.floor(Math.random() * 15) + 15,
          interceptions: baseProjections.passing?.interceptions || baseStats.passing?.interceptions || Math.floor(Math.random() * 8) + 5
        };
        stats.rushing = {
          attempts: baseProjections.rushing?.attempts || baseStats.rushing?.attempts || Math.floor(Math.random() * 50) + 30,
          yards: baseProjections.rushing?.yards || baseStats.rushing?.yards || Math.floor(Math.random() * 200) + 100,
          touchdowns: baseProjections.rushing?.touchdowns || baseStats.rushing?.touchdowns || Math.floor(Math.random() * 3) + 1
        };
        stats.fumbles = Math.floor(Math.random() * 3) + 1;
        stats.twoPointConversions = Math.floor(Math.random() * 3);
        break;
        
      case 'RB':
        stats.rushing = {
          attempts: baseProjections.rushing?.attempts || baseStats.rushing?.attempts || Math.floor(Math.random() * 100) + 150,
          yards: baseProjections.rushing?.yards || baseStats.rushing?.yards || Math.floor(Math.random() * 500) + 800,
          touchdowns: baseProjections.rushing?.touchdowns || baseStats.rushing?.touchdowns || Math.floor(Math.random() * 6) + 5
        };
        stats.receiving = {
          targets: baseProjections.receiving?.targets || baseStats.receiving?.targets || Math.floor(Math.random() * 30) + 30,
          receptions: baseProjections.receiving?.receptions || baseStats.receiving?.receptions || Math.floor(Math.random() * 20) + 20,
          yards: baseProjections.receiving?.yards || baseStats.receiving?.yards || Math.floor(Math.random() * 200) + 200,
          touchdowns: baseProjections.receiving?.touchdowns || baseStats.receiving?.touchdowns || Math.floor(Math.random() * 3) + 1
        };
        stats.fumbles = Math.floor(Math.random() * 2) + 1;
        stats.twoPointConversions = Math.floor(Math.random() * 2);
        break;
        
      case 'WR':
        stats.receiving = {
          targets: baseProjections.receiving?.targets || baseStats.receiving?.targets || Math.floor(Math.random() * 50) + 80,
          receptions: baseProjections.receiving?.receptions || baseStats.receiving?.receptions || Math.floor(Math.random() * 30) + 50,
          yards: baseProjections.receiving?.yards || baseStats.receiving?.yards || Math.floor(Math.random() * 500) + 800,
          touchdowns: baseProjections.receiving?.touchdowns || baseStats.receiving?.touchdowns || Math.floor(Math.random() * 5) + 5
        };
        stats.rushing = {
          attempts: baseProjections.rushing?.attempts || baseStats.rushing?.attempts || Math.floor(Math.random() * 5) + 1,
          yards: baseProjections.rushing?.yards || baseStats.rushing?.yards || Math.floor(Math.random() * 30) + 10,
          touchdowns: baseProjections.rushing?.touchdowns || baseStats.rushing?.touchdowns || Math.random() > 0.8 ? 1 : 0
        };
        stats.fumbles = Math.floor(Math.random() * 2);
        stats.twoPointConversions = Math.floor(Math.random() * 2);
        break;
        
      case 'TE':
        stats.receiving = {
          targets: baseProjections.receiving?.targets || baseStats.receiving?.targets || Math.floor(Math.random() * 30) + 50,
          receptions: baseProjections.receiving?.receptions || baseStats.receiving?.receptions || Math.floor(Math.random() * 20) + 35,
          yards: baseProjections.receiving?.yards || baseStats.receiving?.yards || Math.floor(Math.random() * 300) + 500,
          touchdowns: baseProjections.receiving?.touchdowns || baseStats.receiving?.touchdowns || Math.floor(Math.random() * 3) + 3
        };
        stats.fumbles = Math.floor(Math.random() * 1);
        stats.twoPointConversions = Math.floor(Math.random() * 1);
        break;
        
      default:
        // For other positions like K, DEF
        break;
    }
    
    return stats;
  };
  
  // Calculate fantasy points based on stats and scoring settings
  const calculatePoints = (stats: PointsProjection['stats'], settings: ScoringSettings, position: string): number => {
    let points = 0;
    
    // Passing stats
    if (stats.passing) {
      points += stats.passing.yards * settings.passingYards;
      points += stats.passing.touchdowns * settings.passingTD;
      points += stats.passing.interceptions * settings.interception;
    }
    
    // Rushing stats
    if (stats.rushing) {
      points += stats.rushing.yards * settings.rushingYards;
      points += stats.rushing.touchdowns * settings.rushingTD;
    }
    
    // Receiving stats
    if (stats.receiving) {
      points += stats.receiving.yards * settings.receivingYards;
      points += stats.receiving.touchdowns * settings.receivingTD;
      
      // TE Premium logic (only if TE Premium and player is a TE)
      if (position === 'TE' && selectedPreset === 'TE Premium') {
        points += stats.receiving.receptions * 1.5; // 1.5 PPR for TEs
      } else {
        points += stats.receiving.receptions * settings.reception;
      }
    }
    
    // Other stats
    if (stats.fumbles) {
      points += stats.fumbles * settings.fumble;
    }
    
    if (stats.twoPointConversions) {
      points += stats.twoPointConversions * settings.twoPoint;
    }
    
    return Math.round(points * 10) / 10; // Round to 1 decimal place
  };
  
  // Update individual stats for a player
  const updatePlayerStats = (playerId: string, statCategory: string, statName: string, value: number) => {
    const newProjections = [...projections];
    const index = newProjections.findIndex(p => p.player.id === playerId);
    
    if (index !== -1) {
      const projection = newProjections[index];
      
      // Ensure the category exists
      if (!projection.stats[statCategory]) {
        projection.stats[statCategory] = {};
      }
      
      // Update the specific stat
      projection.stats[statCategory][statName] = value;
      
      // Recalculate points
      projection.projectedPoints = calculatePoints(projection.stats, scoringSettings, projection.player.position);
      
      setProjections(newProjections);
    }
  };
  
  // Export projections as CSV
  const exportProjections = () => {
    if (projections.length === 0) return;
    
    let csv = 'Player,Position,Team,';
    
    // Add stat headers
    csv += 'Pass Yds,Pass TD,INT,';
    csv += 'Rush Att,Rush Yds,Rush TD,';
    csv += 'Rec,Targets,Rec Yds,Rec TD,';
    csv += 'Fumbles,2PT,';
    csv += 'Projected Points\n';
    
    // Add player data
    projections.forEach(projection => {
      const { player, stats, projectedPoints } = projection;
      
      csv += `${player.name},${player.position},${player.team},`;
      
      // Passing stats
      csv += `${stats.passing?.yards || 0},${stats.passing?.touchdowns || 0},${stats.passing?.interceptions || 0},`;
      
      // Rushing stats
      csv += `${stats.rushing?.attempts || 0},${stats.rushing?.yards || 0},${stats.rushing?.touchdowns || 0},`;
      
      // Receiving stats
      csv += `${stats.receiving?.receptions || 0},${stats.receiving?.targets || 0},${stats.receiving?.yards || 0},${stats.receiving?.touchdowns || 0},`;
      
      // Other stats
      csv += `${stats.fumbles || 0},${stats.twoPointConversions || 0},`;
      
      // Projected points
      csv += `${projectedPoints}\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `fantasy_projections_${selectedPreset.replace(' ', '_')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Reset all projections to default values
  const resetProjections = () => {
    setIsCalculating(true);
    
    const newProjections = selectedPlayers.map(player => {
      // Generate fresh stats
      const stats = generateProjectedStats(player);
      
      // Calculate points
      const points = calculatePoints(stats, scoringSettings, player.position);
      
      return {
        player,
        stats,
        projectedPoints: points
      };
    });
    
    // Sort by projected points
    newProjections.sort((a, b) => b.projectedPoints - a.projectedPoints);
    
    setProjections(newProjections);
    setIsCalculating(false);
  };
  
  // Get position styling
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
  
  // Get team colors
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
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2);
  };
  
  // Render the stat editor for a player
  const renderStatEditor = (projection: PointsProjection) => {
    const { player, stats } = projection;
    
    return (
      <div className="border border-sleeper-border rounded-md p-4 mb-4 bg-sleeper-dark">
        <div className="flex items-center mb-4">
          <Avatar className="h-10 w-10 mr-3">
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
              <div className="font-medium">{player.name}</div>
              <Badge className={`${getPositionClass(player.position)} ml-2 text-xs`}>
                {player.position}
              </Badge>
            </div>
            <div className="text-xs text-sleeper-gray">{player.team} • {player.age} yrs</div>
          </div>
          <div className="ml-auto">
            <div className="text-xl font-bold">{projection.projectedPoints}</div>
            <div className="text-xs text-sleeper-gray">Projected Pts</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Passing Stats */}
          {player.position === 'QB' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Passing</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`${player.id}-passing-yards`} className="text-xs">Yards</Label>
                  <Input
                    id={`${player.id}-passing-yards`}
                    type="number"
                    className="h-8 bg-sleeper-darker border-sleeper-border"
                    value={stats.passing?.yards || 0}
                    onChange={(e) => updatePlayerStats(player.id, 'passing', 'yards', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor={`${player.id}-passing-td`} className="text-xs">TDs</Label>
                  <Input
                    id={`${player.id}-passing-td`}
                    type="number"
                    className="h-8 bg-sleeper-darker border-sleeper-border"
                    value={stats.passing?.touchdowns || 0}
                    onChange={(e) => updatePlayerStats(player.id, 'passing', 'touchdowns', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor={`${player.id}-passing-int`} className="text-xs">INTs</Label>
                  <Input
                    id={`${player.id}-passing-int`}
                    type="number"
                    className="h-8 bg-sleeper-darker border-sleeper-border"
                    value={stats.passing?.interceptions || 0}
                    onChange={(e) => updatePlayerStats(player.id, 'passing', 'interceptions', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor={`${player.id}-passing-cmp`} className="text-xs">Comp/Att</Label>
                  <div className="flex items-center space-x-1">
                    <Input
                      id={`${player.id}-passing-cmp`}
                      type="number"
                      className="h-8 bg-sleeper-darker border-sleeper-border"
                      value={stats.passing?.completions || 0}
                      onChange={(e) => updatePlayerStats(player.id, 'passing', 'completions', parseInt(e.target.value) || 0)}
                    />
                    <span className="text-xs">/</span>
                    <Input
                      id={`${player.id}-passing-att`}
                      type="number"
                      className="h-8 bg-sleeper-darker border-sleeper-border"
                      value={stats.passing?.attempts || 0}
                      onChange={(e) => updatePlayerStats(player.id, 'passing', 'attempts', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Rushing Stats */}
          {(player.position === 'QB' || player.position === 'RB' || player.position === 'WR') && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Rushing</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`${player.id}-rushing-yards`} className="text-xs">Yards</Label>
                  <Input
                    id={`${player.id}-rushing-yards`}
                    type="number"
                    className="h-8 bg-sleeper-darker border-sleeper-border"
                    value={stats.rushing?.yards || 0}
                    onChange={(e) => updatePlayerStats(player.id, 'rushing', 'yards', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor={`${player.id}-rushing-td`} className="text-xs">TDs</Label>
                  <Input
                    id={`${player.id}-rushing-td`}
                    type="number"
                    className="h-8 bg-sleeper-darker border-sleeper-border"
                    value={stats.rushing?.touchdowns || 0}
                    onChange={(e) => updatePlayerStats(player.id, 'rushing', 'touchdowns', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor={`${player.id}-rushing-att`} className="text-xs">Attempts</Label>
                  <Input
                    id={`${player.id}-rushing-att`}
                    type="number"
                    className="h-8 bg-sleeper-darker border-sleeper-border"
                    value={stats.rushing?.attempts || 0}
                    onChange={(e) => updatePlayerStats(player.id, 'rushing', 'attempts', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Receiving Stats */}
          {(player.position === 'RB' || player.position === 'WR' || player.position === 'TE') && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Receiving</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`${player.id}-receiving-yards`} className="text-xs">Yards</Label>
                  <Input
                    id={`${player.id}-receiving-yards`}
                    type="number"
                    className="h-8 bg-sleeper-darker border-sleeper-border"
                    value={stats.receiving?.yards || 0}
                    onChange={(e) => updatePlayerStats(player.id, 'receiving', 'yards', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor={`${player.id}-receiving-td`} className="text-xs">TDs</Label>
                  <Input
                    id={`${player.id}-receiving-td`}
                    type="number"
                    className="h-8 bg-sleeper-darker border-sleeper-border"
                    value={stats.receiving?.touchdowns || 0}
                    onChange={(e) => updatePlayerStats(player.id, 'receiving', 'touchdowns', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor={`${player.id}-receiving-rec`} className="text-xs">Receptions</Label>
                  <Input
                    id={`${player.id}-receiving-rec`}
                    type="number"
                    className="h-8 bg-sleeper-darker border-sleeper-border"
                    value={stats.receiving?.receptions || 0}
                    onChange={(e) => updatePlayerStats(player.id, 'receiving', 'receptions', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor={`${player.id}-receiving-tgt`} className="text-xs">Targets</Label>
                  <Input
                    id={`${player.id}-receiving-tgt`}
                    type="number"
                    className="h-8 bg-sleeper-darker border-sleeper-border"
                    value={stats.receiving?.targets || 0}
                    onChange={(e) => updatePlayerStats(player.id, 'receiving', 'targets', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Other Stats */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Other</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor={`${player.id}-fumbles`} className="text-xs">Fumbles</Label>
                <Input
                  id={`${player.id}-fumbles`}
                  type="number"
                  className="h-8 bg-sleeper-darker border-sleeper-border"
                  value={stats.fumbles || 0}
                  onChange={(e) => updatePlayerStats(player.id, 'fumbles', '', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor={`${player.id}-2pt`} className="text-xs">2PT Conv</Label>
                <Input
                  id={`${player.id}-2pt`}
                  type="number"
                  className="h-8 bg-sleeper-darker border-sleeper-border"
                  value={stats.twoPointConversions || 0}
                  onChange={(e) => updatePlayerStats(player.id, 'twoPointConversions', '', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <Card className="bg-sleeper-dark border-sleeper-dark">
        <CardHeader>
          <CardTitle>Fantasy Points Projection Calculator</CardTitle>
          <CardDescription>Calculate fantasy projections with custom scoring settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
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
            <CardTitle>Fantasy Points Projection Calculator</CardTitle>
            <CardDescription>Calculate fantasy projections with custom scoring settings</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={selectedPreset}
              onValueChange={setSelectedPreset}
            >
              <SelectTrigger className="w-32 bg-sleeper-darker border-sleeper-border">
                <SelectValue placeholder="Scoring" />
              </SelectTrigger>
              <SelectContent>
                {scoringPresets.map(preset => (
                  <SelectItem key={preset.name} value={preset.name}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={resetProjections}
              disabled={selectedPlayers.length === 0}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            <Button 
              variant="outline" 
              onClick={exportProjections}
              disabled={projections.length === 0}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="players">
          <TabsList className="bg-sleeper-darker border border-sleeper-dark mb-4">
            <TabsTrigger value="players" className="flex items-center">
              <LineChart className="h-4 w-4 mr-2" />
              Player Projections
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center">
              <Calculator className="h-4 w-4 mr-2" />
              Scoring Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="players">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-full sm:w-1/3 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sleeper-gray h-4 w-4" />
                    <Input
                      placeholder="Search players..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                      }}
                      className="pl-10 bg-sleeper-darker border-sleeper-border"
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSearch}
                      disabled={!searchQuery.trim()}
                    >
                      Search
                    </Button>
                    
                    <div className="text-sm text-sleeper-gray">
                      {selectedPlayers.length} players selected
                    </div>
                  </div>
                  
                  <Card className="bg-sleeper-darker border-sleeper-border">
                    <CardContent className="p-3">
                      <h3 className="text-sm font-medium mb-2">Search Results</h3>
                      
                      <ScrollArea className="h-[300px]">
                        {isSearching ? (
                          <div className="space-y-2">
                            {Array(5).fill(0).map((_, i) => (
                              <div key={i} className="flex items-center p-2 bg-sleeper-dark rounded-md">
                                <Skeleton className="h-8 w-8 rounded-full mr-2" />
                                <div className="flex-1">
                                  <Skeleton className="h-4 w-24 mb-1" />
                                  <Skeleton className="h-3 w-16" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="space-y-2">
                            {searchResults.map(player => (
                              <div 
                                key={player.id} 
                                className="flex items-center p-2 bg-sleeper-dark rounded-md cursor-pointer hover:bg-sleeper-border"
                                onClick={() => addPlayer(player)}
                              >
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
                                    <div className="font-medium text-sm">{player.name}</div>
                                    <Badge className={`${getPositionClass(player.position)} ml-2 text-xs`}>
                                      {player.position}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-sleeper-gray">{player.team} • {player.age} yrs</div>
                                </div>
                                <PlusCircle className="h-4 w-4 text-sleeper-gray" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-sleeper-gray">
                            {searchQuery ? 'No players found matching your search' : 'Search for players to add'}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="w-full sm:w-2/3">
                  <Card className="bg-sleeper-darker border-sleeper-border">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium">Player Projections</h3>
                        
                        {projections.length > 0 && (
                          <div className="text-sm">
                            <span className="text-sleeper-gray">Total:</span> {' '}
                            <span className="font-medium">{projections.reduce((sum, p) => sum + p.projectedPoints, 0).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      
                      <ScrollArea className="h-[500px]">
                        {projections.length > 0 ? (
                          <div className="space-y-4">
                            {projections.map(projection => renderStatEditor(projection))}
                          </div>
                        ) : selectedPlayers.length > 0 ? (
                          <div className="text-center py-8">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={calculateProjections}
                              className="flex items-center"
                            >
                              <Calculator className="h-4 w-4 mr-2" />
                              Calculate Projections
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-sleeper-gray">
                            Search and add players to generate projections
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {selectedPlayers.length > 0 && projections.length > 0 && (
                <div className="pt-4 flex justify-end space-x-2">
                  <Button 
                    onClick={() => {
                      setSelectedPlayers([]);
                      setProjections([]);
                    }}
                    variant="outline"
                    className="flex items-center"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="scoring">
            <Card className="bg-sleeper-darker border-sleeper-border">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Passing Settings</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="passing-yards">Passing Yards</Label>
                        <div className="flex items-center">
                          <Input
                            id="passing-yards"
                            type="number"
                            className="w-16 h-8 bg-sleeper-dark border-sleeper-border"
                            value={scoringSettings.passingYards}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setScoringSettings({
                                ...scoringSettings,
                                passingYards: isNaN(value) ? 0 : value
                              });
                            }}
                            step="0.01"
                          />
                          <span className="ml-2 text-xs text-sleeper-gray">per yard</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Label htmlFor="passing-td">Passing TD</Label>
                        <div className="flex items-center">
                          <Input
                            id="passing-td"
                            type="number"
                            className="w-16 h-8 bg-sleeper-dark border-sleeper-border"
                            value={scoringSettings.passingTD}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setScoringSettings({
                                ...scoringSettings,
                                passingTD: isNaN(value) ? 0 : value
                              });
                            }}
                            step="0.5"
                          />
                          <span className="ml-2 text-xs text-sleeper-gray">per TD</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Label htmlFor="interception">Interception</Label>
                        <div className="flex items-center">
                          <Input
                            id="interception"
                            type="number"
                            className="w-16 h-8 bg-sleeper-dark border-sleeper-border"
                            value={scoringSettings.interception}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setScoringSettings({
                                ...scoringSettings,
                                interception: isNaN(value) ? 0 : value
                              });
                            }}
                            step="0.5"
                          />
                          <span className="ml-2 text-xs text-sleeper-gray">per INT</span>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-medium mt-4">Rushing Settings</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="rushing-yards">Rushing Yards</Label>
                        <div className="flex items-center">
                          <Input
                            id="rushing-yards"
                            type="number"
                            className="w-16 h-8 bg-sleeper-dark border-sleeper-border"
                            value={scoringSettings.rushingYards}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setScoringSettings({
                                ...scoringSettings,
                                rushingYards: isNaN(value) ? 0 : value
                              });
                            }}
                            step="0.01"
                          />
                          <span className="ml-2 text-xs text-sleeper-gray">per yard</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Label htmlFor="rushing-td">Rushing TD</Label>
                        <div className="flex items-center">
                          <Input
                            id="rushing-td"
                            type="number"
                            className="w-16 h-8 bg-sleeper-dark border-sleeper-border"
                            value={scoringSettings.rushingTD}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setScoringSettings({
                                ...scoringSettings,
                                rushingTD: isNaN(value) ? 0 : value
                              });
                            }}
                            step="0.5"
                          />
                          <span className="ml-2 text-xs text-sleeper-gray">per TD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Receiving Settings</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="receiving-yards">Receiving Yards</Label>
                        <div className="flex items-center">
                          <Input
                            id="receiving-yards"
                            type="number"
                            className="w-16 h-8 bg-sleeper-dark border-sleeper-border"
                            value={scoringSettings.receivingYards}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setScoringSettings({
                                ...scoringSettings,
                                receivingYards: isNaN(value) ? 0 : value
                              });
                            }}
                            step="0.01"
                          />
                          <span className="ml-2 text-xs text-sleeper-gray">per yard</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Label htmlFor="receiving-td">Receiving TD</Label>
                        <div className="flex items-center">
                          <Input
                            id="receiving-td"
                            type="number"
                            className="w-16 h-8 bg-sleeper-dark border-sleeper-border"
                            value={scoringSettings.receivingTD}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setScoringSettings({
                                ...scoringSettings,
                                receivingTD: isNaN(value) ? 0 : value
                              });
                            }}
                            step="0.5"
                          />
                          <span className="ml-2 text-xs text-sleeper-gray">per TD</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Label htmlFor="reception">Reception</Label>
                        <div className="flex items-center">
                          <Input
                            id="reception"
                            type="number"
                            className="w-16 h-8 bg-sleeper-dark border-sleeper-border"
                            value={scoringSettings.reception}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setScoringSettings({
                                ...scoringSettings,
                                reception: isNaN(value) ? 0 : value
                              });
                            }}
                            step="0.5"
                          />
                          <span className="ml-2 text-xs text-sleeper-gray">per catch</span>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-medium mt-4">Other Settings</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="fumble">Fumble Lost</Label>
                        <div className="flex items-center">
                          <Input
                            id="fumble"
                            type="number"
                            className="w-16 h-8 bg-sleeper-dark border-sleeper-border"
                            value={scoringSettings.fumble}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setScoringSettings({
                                ...scoringSettings,
                                fumble: isNaN(value) ? 0 : value
                              });
                            }}
                            step="0.5"
                          />
                          <span className="ml-2 text-xs text-sleeper-gray">per fumble</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Label htmlFor="two-point">2PT Conversion</Label>
                        <div className="flex items-center">
                          <Input
                            id="two-point"
                            type="number"
                            className="w-16 h-8 bg-sleeper-dark border-sleeper-border"
                            value={scoringSettings.twoPoint}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setScoringSettings({
                                ...scoringSettings,
                                twoPoint: isNaN(value) ? 0 : value
                              });
                            }}
                            step="0.5"
                          />
                          <span className="ml-2 text-xs text-sleeper-gray">per 2PT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-sleeper-border">
                  <div className="text-sm">
                    <span className="font-medium">Current Scoring Format: </span>
                    <Badge variant="outline" className="ml-1">
                      {selectedPreset}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {scoringPresets.map(preset => (
                      <Button
                        key={preset.name}
                        variant={selectedPreset === preset.name ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedPreset(preset.name)}
                        className={selectedPreset === preset.name ? 'bg-sleeper-accent text-sleeper-dark' : ''}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PointsProjectionCalculator;