import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '../ui/use-toast';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  Download,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis
} from 'recharts';

// Types
interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  age: number;
  experience: number;
  dynasty_value: number;
  adp: number; // Average Draft Position
  avatar_url?: string;
  stats: PlayerStats;
  advanced_stats: AdvancedStats;
  career_stats: CareerStats[];
}

interface PlayerStats {
  passing?: {
    yards: number;
    touchdowns: number;
    interceptions: number;
    completion_percentage: number;
    attempts: number;
  };
  rushing?: {
    yards: number;
    touchdowns: number;
    attempts: number;
    yards_per_attempt: number;
  };
  receiving?: {
    yards: number;
    touchdowns: number;
    receptions: number;
    targets: number;
    yards_per_reception: number;
    catch_rate: number;
  };
}

interface AdvancedStats {
  fantasy_points: number;
  fantasy_points_per_game: number;
  consistency_rating: number; // 1-10 scale
  boom_bust_ratio: number;
  strength_of_schedule: number; // 1-10 scale
  opportunity_share: number; // Percentage
  red_zone_opportunities: number;
  snap_share: number; // Percentage
  breakaway_runs?: number;
  yards_created?: number;
  average_depth_of_target?: number;
  air_yards_share?: number;
  deep_targets?: number;
  pressures?: number;
  protection_rate?: number;
  true_completion_percentage?: number;
}

interface CareerStats {
  year: number;
  team: string;
  games_played: number;
  fantasy_points: number;
  fantasy_points_per_game: number;
  stats: PlayerStats;
}

const AdvancedPlayerComparison: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [comparisonType, setComparisonType] = useState<'stats' | 'trends' | 'projections' | 'advanced'>('stats');
  const [comparisonStat, setComparisonStat] = useState('fantasy_points');
  const [comparisonTimeframe, setComparisonTimeframe] = useState('season'); // season, lastFiveWeeks, career
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [normalizeByGames, setNormalizeByGames] = useState(true); // Per-game normalization
  
  // Mock data for demonstration
  const getMockPlayers = (): Player[] => [
    {
      id: '1',
      name: 'Patrick Mahomes',
      position: 'QB',
      team: 'KC',
      age: 28,
      experience: 7,
      dynasty_value: 92,
      adp: 24,
      avatar_url: 'https://static.www.nfl.com/image/private/t_player_profile_landscape_2x/f_auto/league/tgpqaunmk8cxsphtmpit',
      stats: {
        passing: {
          yards: 4183,
          touchdowns: 27,
          interceptions: 14,
          completion_percentage: 67.2,
          attempts: 580
        },
        rushing: {
          yards: 389,
          touchdowns: 4,
          attempts: 75,
          yards_per_attempt: 5.2
        }
      },
      advanced_stats: {
        fantasy_points: 359.2,
        fantasy_points_per_game: 21.1,
        consistency_rating: 8.5,
        boom_bust_ratio: 3.2,
        strength_of_schedule: 7.8,
        opportunity_share: 100,
        red_zone_opportunities: 54,
        snap_share: 99,
        pressures: 182,
        protection_rate: 78.5,
        true_completion_percentage: 71.2
      },
      career_stats: [
        {
          year: 2023,
          team: 'KC',
          games_played: 17,
          fantasy_points: 359.2,
          fantasy_points_per_game: 21.1,
          stats: {
            passing: {
              yards: 4183,
              touchdowns: 27,
              interceptions: 14,
              completion_percentage: 67.2,
              attempts: 580
            },
            rushing: {
              yards: 389,
              touchdowns: 4,
              attempts: 75,
              yards_per_attempt: 5.2
            }
          }
        },
        {
          year: 2022,
          team: 'KC',
          games_played: 17,
          fantasy_points: 416.5,
          fantasy_points_per_game: 24.5,
          stats: {
            passing: {
              yards: 5250,
              touchdowns: 41,
              interceptions: 12,
              completion_percentage: 67.1,
              attempts: 648
            },
            rushing: {
              yards: 358,
              touchdowns: 4,
              attempts: 61,
              yards_per_attempt: 5.9
            }
          }
        },
        {
          year: 2021,
          team: 'KC',
          games_played: 17,
          fantasy_points: 374.1,
          fantasy_points_per_game: 22.0,
          stats: {
            passing: {
              yards: 4839,
              touchdowns: 37,
              interceptions: 13,
              completion_percentage: 66.3,
              attempts: 658
            },
            rushing: {
              yards: 381,
              touchdowns: 2,
              attempts: 66,
              yards_per_attempt: 5.8
            }
          }
        }
      ]
    },
    {
      id: '2',
      name: 'Josh Allen',
      position: 'QB',
      team: 'BUF',
      age: 28,
      experience: 6,
      dynasty_value: 90,
      adp: 18,
      avatar_url: 'https://static.www.nfl.com/image/private/t_player_profile_landscape_2x/f_auto/league/ocmcwvvisk0qteownum8',
      stats: {
        passing: {
          yards: 4306,
          touchdowns: 29,
          interceptions: 18,
          completion_percentage: 66.5,
          attempts: 579
        },
        rushing: {
          yards: 524,
          touchdowns: 15,
          attempts: 111,
          yards_per_attempt: 4.7
        }
      },
      advanced_stats: {
        fantasy_points: 388.6,
        fantasy_points_per_game: 22.9,
        consistency_rating: 8.1,
        boom_bust_ratio: 2.8,
        strength_of_schedule: 6.9,
        opportunity_share: 100,
        red_zone_opportunities: 62,
        snap_share: 98,
        pressures: 174,
        protection_rate: 76.4,
        true_completion_percentage: 69.8
      },
      career_stats: [
        {
          year: 2023,
          team: 'BUF',
          games_played: 17,
          fantasy_points: 388.6,
          fantasy_points_per_game: 22.9,
          stats: {
            passing: {
              yards: 4306,
              touchdowns: 29,
              interceptions: 18,
              completion_percentage: 66.5,
              attempts: 579
            },
            rushing: {
              yards: 524,
              touchdowns: 15,
              attempts: 111,
              yards_per_attempt: 4.7
            }
          }
        },
        {
          year: 2022,
          team: 'BUF',
          games_played: 16,
          fantasy_points: 402.7,
          fantasy_points_per_game: 25.2,
          stats: {
            passing: {
              yards: 4283,
              touchdowns: 35,
              interceptions: 14,
              completion_percentage: 63.3,
              attempts: 567
            },
            rushing: {
              yards: 762,
              touchdowns: 7,
              attempts: 124,
              yards_per_attempt: 6.1
            }
          }
        },
        {
          year: 2021,
          team: 'BUF',
          games_played: 17,
          fantasy_points: 417.7,
          fantasy_points_per_game: 24.6,
          stats: {
            passing: {
              yards: 4407,
              touchdowns: 36,
              interceptions: 15,
              completion_percentage: 63.3,
              attempts: 646
            },
            rushing: {
              yards: 763,
              touchdowns: 6,
              attempts: 122,
              yards_per_attempt: 6.3
            }
          }
        }
      ]
    },
    {
      id: '3',
      name: 'Justin Jefferson',
      position: 'WR',
      team: 'MIN',
      age: 25,
      experience: 4,
      dynasty_value: 95,
      adp: 5,
      avatar_url: 'https://static.www.nfl.com/image/private/t_player_profile_landscape_2x/f_auto/league/nfl-player-profiles/177187',
      stats: {
        receiving: {
          yards: 1074,
          touchdowns: 5,
          receptions: 68,
          targets: 100,
          yards_per_reception: 15.8,
          catch_rate: 68.0
        }
      },
      advanced_stats: {
        fantasy_points: 254.4,
        fantasy_points_per_game: 18.2,
        consistency_rating: 8.7,
        boom_bust_ratio: 3.5,
        strength_of_schedule: 6.5,
        opportunity_share: 28.4,
        red_zone_opportunities: 14,
        snap_share: 92.3,
        air_yards_share: 42.8,
        average_depth_of_target: 12.6,
        deep_targets: 24
      },
      career_stats: [
        {
          year: 2023,
          team: 'MIN',
          games_played: 10,
          fantasy_points: 254.4,
          fantasy_points_per_game: 18.2,
          stats: {
            receiving: {
              yards: 1074,
              touchdowns: 5,
              receptions: 68,
              targets: 100,
              yards_per_reception: 15.8,
              catch_rate: 68.0
            }
          }
        },
        {
          year: 2022,
          team: 'MIN',
          games_played: 17,
          fantasy_points: 368.6,
          fantasy_points_per_game: 21.7,
          stats: {
            receiving: {
              yards: 1809,
              touchdowns: 8,
              receptions: 128,
              targets: 184,
              yards_per_reception: 14.1,
              catch_rate: 69.6
            }
          }
        },
        {
          year: 2021,
          team: 'MIN',
          games_played: 17,
          fantasy_points: 330.5,
          fantasy_points_per_game: 19.4,
          stats: {
            receiving: {
              yards: 1616,
              touchdowns: 10,
              receptions: 108,
              targets: 167,
              yards_per_reception: 15.0,
              catch_rate: 64.7
            }
          }
        }
      ]
    },
    {
      id: '4',
      name: 'Christian McCaffrey',
      position: 'RB',
      team: 'SF',
      age: 27,
      experience: 7,
      dynasty_value: 88,
      adp: 1,
      avatar_url: 'https://static.www.nfl.com/image/private/t_player_profile_landscape_2x/f_auto/league/yme4jqoovs38ihbisruj',
      stats: {
        rushing: {
          yards: 1459,
          touchdowns: 14,
          attempts: 272,
          yards_per_attempt: 5.4
        },
        receiving: {
          yards: 564,
          touchdowns: 7,
          receptions: 67,
          targets: 83,
          yards_per_reception: 8.4,
          catch_rate: 80.7
        }
      },
      advanced_stats: {
        fantasy_points: 418.3,
        fantasy_points_per_game: 24.6,
        consistency_rating: 9.4,
        boom_bust_ratio: 4.8,
        strength_of_schedule: 7.2,
        opportunity_share: 75.3,
        red_zone_opportunities: 64,
        snap_share: 82.7,
        breakaway_runs: 18,
        yards_created: 586
      },
      career_stats: [
        {
          year: 2023,
          team: 'SF',
          games_played: 17,
          fantasy_points: 418.3,
          fantasy_points_per_game: 24.6,
          stats: {
            rushing: {
              yards: 1459,
              touchdowns: 14,
              attempts: 272,
              yards_per_attempt: 5.4
            },
            receiving: {
              yards: 564,
              touchdowns: 7,
              receptions: 67,
              targets: 83,
              yards_per_reception: 8.4,
              catch_rate: 80.7
            }
          }
        },
        {
          year: 2022,
          team: 'CAR/SF',
          games_played: 17,
          fantasy_points: 298.5,
          fantasy_points_per_game: 17.6,
          stats: {
            rushing: {
              yards: 1139,
              touchdowns: 8,
              attempts: 244,
              yards_per_attempt: 4.7
            },
            receiving: {
              yards: 741,
              touchdowns: 5,
              receptions: 85,
              targets: 108,
              yards_per_reception: 8.7,
              catch_rate: 78.7
            }
          }
        },
        {
          year: 2021,
          team: 'CAR',
          games_played: 7,
          fantasy_points: 113.9,
          fantasy_points_per_game: 16.3,
          stats: {
            rushing: {
              yards: 442,
              touchdowns: 1,
              attempts: 99,
              yards_per_attempt: 4.5
            },
            receiving: {
              yards: 343,
              touchdowns: 1,
              receptions: 37,
              targets: 41,
              yards_per_reception: 9.3,
              catch_rate: 90.2
            }
          }
        }
      ]
    }
  ];
  
  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Perform search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      // Filter mock data based on search query
      const query = searchQuery.toLowerCase();
      const results = getMockPlayers().filter(player => 
        player.name.toLowerCase().includes(query) || 
        player.position.toLowerCase().includes(query) ||
        player.team.toLowerCase().includes(query)
      ).slice(0, 5);
      
      setSearchResults(results);
      setSearchLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Add player to comparison
  const addPlayer = (player: Player) => {
    if (selectedPlayers.length >= 4) {
      toast({
        title: "Maximum Players Reached",
        description: "You can compare up to 4 players at a time. Remove a player to add another.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedPlayers.some(p => p.id === player.id)) {
      toast({
        title: "Player Already Selected",
        description: `${player.name} is already in your comparison.`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedPlayers([...selectedPlayers, player]);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // Remove player from comparison
  const removePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };
  
  // Clear all selected players
  const clearPlayers = () => {
    setSelectedPlayers([]);
  };
  
  // Get value for current comparison stat
  const getStatValue = (player: Player, stat: string): number => {
    if (!player) return 0;
    
    // Fantasy points
    if (stat === 'fantasy_points') {
      if (comparisonTimeframe === 'season') {
        return player.advanced_stats.fantasy_points;
      } else if (comparisonTimeframe === 'lastFiveWeeks') {
        // In a real app, this would fetch the last 5 weeks of data
        return player.advanced_stats.fantasy_points / 3; // Just a mock approximation
      } else if (comparisonTimeframe === 'career') {
        return player.career_stats.reduce((sum, year) => sum + year.fantasy_points, 0);
      }
    }
    
    // Fantasy points per game
    if (stat === 'fantasy_points_per_game') {
      if (comparisonTimeframe === 'season') {
        return player.advanced_stats.fantasy_points_per_game;
      } else if (comparisonTimeframe === 'lastFiveWeeks') {
        // In a real app, this would fetch the last 5 weeks of data
        return player.advanced_stats.fantasy_points_per_game * 1.1; // Just a mock approximation
      } else if (comparisonTimeframe === 'career') {
        const totalPoints = player.career_stats.reduce((sum, year) => sum + year.fantasy_points, 0);
        const totalGames = player.career_stats.reduce((sum, year) => sum + year.games_played, 0);
        return totalGames > 0 ? totalPoints / totalGames : 0;
      }
    }
    
    // Position-specific stats
    if (player.position === 'QB') {
      if (stat === 'passing_yards') {
        return player.stats.passing?.yards || 0;
      } else if (stat === 'passing_touchdowns') {
        return player.stats.passing?.touchdowns || 0;
      } else if (stat === 'passing_interceptions') {
        return player.stats.passing?.interceptions || 0;
      }
    } else if (player.position === 'RB') {
      if (stat === 'rushing_yards') {
        return player.stats.rushing?.yards || 0;
      } else if (stat === 'rushing_touchdowns') {
        return player.stats.rushing?.touchdowns || 0;
      } else if (stat === 'receptions') {
        return player.stats.receiving?.receptions || 0;
      }
    } else if (player.position === 'WR' || player.position === 'TE') {
      if (stat === 'receiving_yards') {
        return player.stats.receiving?.yards || 0;
      } else if (stat === 'receiving_touchdowns') {
        return player.stats.receiving?.touchdowns || 0;
      } else if (stat === 'receptions') {
        return player.stats.receiving?.receptions || 0;
      } else if (stat === 'targets') {
        return player.stats.receiving?.targets || 0;
      }
    }
    
    // Advanced stats
    if (stat === 'consistency_rating') {
      return player.advanced_stats.consistency_rating;
    } else if (stat === 'boom_bust_ratio') {
      return player.advanced_stats.boom_bust_ratio;
    } else if (stat === 'opportunity_share') {
      return player.advanced_stats.opportunity_share;
    }
    
    return 0;
  };
  
  // Get career trend data for the selected statistic
  const getCareerTrendData = (stat: string) => {
    // Create a year-by-year dataset for all players
    const years = Array.from(new Set(
      selectedPlayers.flatMap(player => 
        player.career_stats.map(year => year.year)
      )
    )).sort();
    
    return years.map(year => {
      const dataPoint: any = { year };
      
      selectedPlayers.forEach(player => {
        const yearStat = player.career_stats.find(y => y.year === year);
        if (yearStat) {
          let value = 0;
          
          if (stat === 'fantasy_points') {
            value = yearStat.fantasy_points;
          } else if (stat === 'fantasy_points_per_game') {
            value = yearStat.fantasy_points_per_game;
          } else if (player.position === 'QB') {
            if (stat === 'passing_yards') {
              value = yearStat.stats.passing?.yards || 0;
            } else if (stat === 'passing_touchdowns') {
              value = yearStat.stats.passing?.touchdowns || 0;
            }
          } else if (player.position === 'RB') {
            if (stat === 'rushing_yards') {
              value = yearStat.stats.rushing?.yards || 0;
            } else if (stat === 'rushing_touchdowns') {
              value = yearStat.stats.rushing?.touchdowns || 0;
            }
          } else if (player.position === 'WR' || player.position === 'TE') {
            if (stat === 'receiving_yards') {
              value = yearStat.stats.receiving?.yards || 0;
            } else if (stat === 'receiving_touchdowns') {
              value = yearStat.stats.receiving?.touchdowns || 0;
            } else if (stat === 'receptions') {
              value = yearStat.stats.receiving?.receptions || 0;
            }
          }
          
          if (normalizeByGames && yearStat.games_played > 0) {
            value = value / yearStat.games_played;
          }
          
          dataPoint[player.name] = value;
        } else {
          dataPoint[player.name] = 0;
        }
      });
      
      return dataPoint;
    });
  };
  
  // Get radar chart data for comparing multiple dimensions
  const getRadarData = () => {
    const categories = [
      { key: 'fantasy_points_per_game', name: 'FP/G' },
      { key: 'consistency_rating', name: 'Consistency' },
      { key: 'opportunity_share', name: 'Opportunity' },
      { key: 'dynasty_value', name: 'Dynasty Value' },
      { key: 'boom_bust_ratio', name: 'Boom/Bust' },
    ];
    
    return selectedPlayers.map(player => {
      const data: any = { player: player.name };
      
      categories.forEach(category => {
        if (category.key === 'fantasy_points_per_game') {
          data[category.name] = player.advanced_stats.fantasy_points_per_game / 30 * 100;
        } else if (category.key === 'consistency_rating') {
          data[category.name] = player.advanced_stats.consistency_rating * 10;
        } else if (category.key === 'opportunity_share') {
          data[category.name] = player.advanced_stats.opportunity_share;
        } else if (category.key === 'dynasty_value') {
          data[category.name] = player.dynasty_value;
        } else if (category.key === 'boom_bust_ratio') {
          data[category.name] = player.advanced_stats.boom_bust_ratio * 20;
        }
      });
      
      return data;
    });
  };
  
  // Get appropriate stat options based on the players being compared
  const getStatOptions = () => {
    const commonOptions = [
      { value: 'fantasy_points', label: 'Fantasy Points' },
      { value: 'fantasy_points_per_game', label: 'Fantasy Points Per Game' },
      { value: 'consistency_rating', label: 'Consistency Rating' },
      { value: 'opportunity_share', label: 'Opportunity Share' },
      { value: 'dynasty_value', label: 'Dynasty Value' }
    ];
    
    if (selectedPlayers.length === 0) return commonOptions;
    
    // Check if all selected players are the same position
    const positions = new Set(selectedPlayers.map(p => p.position));
    if (positions.size === 1) {
      const position = Array.from(positions)[0];
      
      if (position === 'QB') {
        return [
          ...commonOptions,
          { value: 'passing_yards', label: 'Passing Yards' },
          { value: 'passing_touchdowns', label: 'Passing Touchdowns' },
          { value: 'passing_interceptions', label: 'Interceptions' }
        ];
      } else if (position === 'RB') {
        return [
          ...commonOptions,
          { value: 'rushing_yards', label: 'Rushing Yards' },
          { value: 'rushing_touchdowns', label: 'Rushing Touchdowns' },
          { value: 'receptions', label: 'Receptions' }
        ];
      } else if (position === 'WR' || position === 'TE') {
        return [
          ...commonOptions,
          { value: 'receiving_yards', label: 'Receiving Yards' },
          { value: 'receiving_touchdowns', label: 'Receiving Touchdowns' },
          { value: 'receptions', label: 'Receptions' },
          { value: 'targets', label: 'Targets' }
        ];
      }
    }
    
    return commonOptions;
  };
  
  // Export comparison data as CSV
  const exportComparison = () => {
    if (selectedPlayers.length === 0) return;
    
    // Define the stats to include in the export
    const statCategories = [
      { key: 'name', label: 'Player' },
      { key: 'position', label: 'Position' },
      { key: 'team', label: 'Team' },
      { key: 'age', label: 'Age' },
      { key: 'experience', label: 'Experience' },
      { key: 'dynasty_value', label: 'Dynasty Value' },
      { key: 'fantasy_points', label: 'Fantasy Points' },
      { key: 'fantasy_points_per_game', label: 'FP/Game' },
      { key: 'consistency_rating', label: 'Consistency' },
      { key: 'opportunity_share', label: 'Opp. Share %' },
    ];
    
    // Add position-specific stats
    if (selectedPlayers.some(p => p.position === 'QB')) {
      statCategories.push(
        { key: 'passing_yards', label: 'Pass Yards' },
        { key: 'passing_touchdowns', label: 'Pass TDs' },
        { key: 'passing_interceptions', label: 'INTs' }
      );
    }
    
    if (selectedPlayers.some(p => p.position === 'RB')) {
      statCategories.push(
        { key: 'rushing_yards', label: 'Rush Yards' },
        { key: 'rushing_touchdowns', label: 'Rush TDs' }
      );
    }
    
    if (selectedPlayers.some(p => p.position === 'WR' || p.position === 'TE')) {
      statCategories.push(
        { key: 'receiving_yards', label: 'Rec Yards' },
        { key: 'receiving_touchdowns', label: 'Rec TDs' },
        { key: 'receptions', label: 'Receptions' },
        { key: 'targets', label: 'Targets' }
      );
    }
    
    // Create CSV header row
    const headerRow = statCategories.map(cat => cat.label).join(',');
    
    // Create data rows
    const dataRows = selectedPlayers.map(player => {
      return statCategories.map(cat => {
        if (cat.key === 'name' || cat.key === 'position' || cat.key === 'team') {
          return player[cat.key as keyof Player];
        } else if (cat.key === 'age' || cat.key === 'experience' || cat.key === 'dynasty_value') {
          return player[cat.key as keyof Player];
        } else if (cat.key === 'fantasy_points' || cat.key === 'fantasy_points_per_game' || cat.key === 'consistency_rating' || cat.key === 'opportunity_share') {
          return player.advanced_stats[cat.key as keyof AdvancedStats];
        } else if (cat.key.startsWith('passing_') && player.stats.passing) {
          return player.stats.passing[cat.key.replace('passing_', '') as keyof typeof player.stats.passing];
        } else if (cat.key.startsWith('rushing_') && player.stats.rushing) {
          return player.stats.rushing[cat.key.replace('rushing_', '') as keyof typeof player.stats.rushing];
        } else if (cat.key.startsWith('receiving_') && player.stats.receiving) {
          return player.stats.receiving[cat.key.replace('receiving_', '') as keyof typeof player.stats.receiving];
        } else if ((cat.key === 'receptions' || cat.key === 'targets') && player.stats.receiving) {
          return player.stats.receiving[cat.key as keyof typeof player.stats.receiving];
        }
        return '';
      }).join(',');
    });
    
    // Combine header and data rows
    const csvContent = [headerRow, ...dataRows].join('\\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `player_comparison_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Comparison Exported",
      description: `Exported comparison data for ${selectedPlayers.length} players.`,
    });
  };
  
  // Get color for player in charts
  const getPlayerColor = (index: number): string => {
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    return colors[index % colors.length];
  };
  
  // Get sign indicator for a value
  const getValueTrend = (value: number): React.ReactNode => {
    if (value > 0) {
      return <ArrowUp className="h-3 w-3 text-green-500" />;
    } else if (value < 0) {
      return <ArrowDown className="h-3 w-3 text-red-500" />;
    }
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Advanced Player Comparison</CardTitle>
          <CardDescription>
            Compare up to 4 players with detailed stats and visualizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                className="pl-10"
                placeholder="Search for players to compare..."
                value={searchQuery}
                onChange={handleSearch}
              />
              
              {searchQuery.trim() !== '' && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border overflow-hidden max-h-60">
                  <ScrollArea className="max-h-60">
                    {searchLoading ? (
                      <div className="p-2 space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div>
                        {searchResults.map(player => (
                          <div 
                            key={player.id}
                            className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => addPlayer(player)}
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium mr-3">
                              {player.position}
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">{player.name}</p>
                              <p className="text-xs text-muted-foreground">{player.team} • Age: {player.age}</p>
                            </div>
                            <Badge className="ml-2">{player.dynasty_value}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery.trim() !== '' ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No players found matching "{searchQuery}"
                      </div>
                    ) : null}
                  </ScrollArea>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={clearPlayers}
                title="Clear all players"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={exportComparison}
                disabled={selectedPlayers.length === 0}
                title="Export comparison data"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Selected players */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {selectedPlayers.map((player, index) => (
              <Card key={player.id} className="relative overflow-hidden">
                <div 
                  className="absolute top-2 right-2 z-10 hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded-full cursor-pointer"
                  onClick={() => removePlayer(player.id)}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </div>
                <div className={`absolute top-0 left-0 w-1 h-full`} style={{ backgroundColor: getPlayerColor(index) }}></div>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                      {player.position}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{player.name}</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{player.team}</span>
                        <span className="mx-1">•</span>
                        <span>Age: {player.age}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="mr-1 text-xs">ADP: {player.adp}</Badge>
                        <Badge className="text-xs">Value: {player.dynasty_value}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 4 - selectedPlayers.length) }).map((_, i) => (
              <Card key={i} className="border-dashed border-2 bg-transparent flex items-center justify-center p-6">
                <div className="text-center text-muted-foreground">
                  <span className="block text-2xl mb-1">+</span>
                  <span className="text-xs">Add Player</span>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {selectedPlayers.length > 0 ? (
        <Tabs defaultValue="stats" className="w-full" onValueChange={(value) => setComparisonType(value as any)}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <TabsList className="grid w-full md:w-auto grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="stats">Stats Comparison</TabsTrigger>
              <TabsTrigger value="trends">Career Trends</TabsTrigger>
              <TabsTrigger value="projections">Projections</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Metrics</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-wrap gap-2">
              <Select 
                value={comparisonStat} 
                onValueChange={setComparisonStat}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Statistic" />
                </SelectTrigger>
                <SelectContent>
                  {getStatOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={comparisonTimeframe} 
                onValueChange={setComparisonTimeframe}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="season">2023 Season</SelectItem>
                  <SelectItem value="lastFiveWeeks">Last 5 Weeks</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                </SelectContent>
              </Select>
              
              {comparisonType === 'trends' && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="normalize"
                    checked={normalizeByGames}
                    onCheckedChange={setNormalizeByGames}
                  />
                  <Label htmlFor="normalize">Per Game</Label>
                </div>
              )}
            </div>
          </div>
          
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
                  Stats Comparison
                </CardTitle>
                <CardDescription>
                  Compare key statistics between selected players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedPlayers.map(player => ({
                        name: player.name,
                        value: getStatValue(player, comparisonStat)
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        tick={{ dy: 10 }}
                        height={70} 
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="value" 
                        name={getStatOptions().find(opt => opt.value === comparisonStat)?.label || comparisonStat} 
                      >
                        {selectedPlayers.map((player, index) => (
                          <Cell key={player.id} fill={getPlayerColor(index)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <Separator className="my-6" />
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        {getStatOptions().slice(0, 6).map(stat => (
                          <TableHead key={stat.value} className="text-right">
                            {stat.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPlayers.map((player, index) => (
                        <TableRow key={player.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: getPlayerColor(index) }}
                              ></div>
                              <span>{player.name}</span>
                            </div>
                          </TableCell>
                          {getStatOptions().slice(0, 6).map(stat => (
                            <TableCell key={stat.value} className="text-right">
                              {getStatValue(player, stat.value).toFixed(
                                stat.value.includes('percentage') || 
                                stat.value.includes('share') || 
                                stat.value.includes('rating') ? 
                                1 : 0
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Career Trends
                </CardTitle>
                <CardDescription>
                  Year-by-year performance trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getCareerTrendData(comparisonStat)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {selectedPlayers.map((player, index) => (
                        <Line
                          key={player.id}
                          type="monotone"
                          dataKey={player.name}
                          stroke={getPlayerColor(index)}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <Separator className="my-6" />
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        {selectedPlayers.map((player, index) => (
                          <TableHead key={player.id} className="text-right">
                            <div className="flex items-center justify-end">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: getPlayerColor(index) }}
                              ></div>
                              <span>{player.name}</span>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCareerTrendData(comparisonStat).map(yearData => (
                        <TableRow key={yearData.year}>
                          <TableCell>{yearData.year}</TableCell>
                          {selectedPlayers.map(player => (
                            <TableCell key={player.id} className="text-right">
                              {(yearData[player.name] || 0).toFixed(
                                normalizeByGames ? 1 : 0
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                  Future Projections
                </CardTitle>
                <CardDescription>
                  Performance projections based on historical data and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { year: 'Last Year', label: 'Previous' },
                        { year: 'Current', label: 'Current' },
                        { year: 'Next Year', label: 'Projected' },
                        { year: 'Year 2', label: 'Projected' },
                        { year: 'Year 3', label: 'Projected' },
                      ].map(yearData => {
                        const dataPoint: any = { year: yearData.year };
                        
                        selectedPlayers.forEach((player, index) => {
                          let value = 0;
                          
                          if (yearData.year === 'Last Year') {
                            // Last year's value from career stats
                            const lastYearData = player.career_stats.find(y => y.year === 2022);
                            if (lastYearData) {
                              value = comparisonStat === 'fantasy_points' 
                                ? lastYearData.fantasy_points
                                : lastYearData.fantasy_points_per_game;
                            }
                          } else if (yearData.year === 'Current') {
                            // Current year value
                            value = comparisonStat === 'fantasy_points'
                              ? player.advanced_stats.fantasy_points
                              : player.advanced_stats.fantasy_points_per_game;
                          } else {
                            // Future projections with age-based adjustments
                            const currentValue = comparisonStat === 'fantasy_points'
                              ? player.advanced_stats.fantasy_points
                              : player.advanced_stats.fantasy_points_per_game;
                            
                            const yearOffset = yearData.year === 'Next Year' ? 1 
                              : yearData.year === 'Year 2' ? 2 : 3;
                              
                            // Apply age-based adjustment
                            const futureAge = player.age + yearOffset;
                            let ageAdjustment = 1;
                            
                            if (player.position === 'RB') {
                              if (futureAge >= 30) ageAdjustment = 0.7;
                              else if (futureAge >= 28) ageAdjustment = 0.85;
                              else if (futureAge <= 25) ageAdjustment = 1.1;
                            } else if (player.position === 'WR' || player.position === 'TE') {
                              if (futureAge >= 33) ageAdjustment = 0.75;
                              else if (futureAge >= 30) ageAdjustment = 0.9;
                              else if (futureAge <= 25) ageAdjustment = 1.08;
                            } else if (player.position === 'QB') {
                              if (futureAge >= 36) ageAdjustment = 0.85;
                              else if (futureAge >= 33) ageAdjustment = 0.95;
                              else if (futureAge <= 27) ageAdjustment = 1.05;
                            }
                            
                            value = currentValue * ageAdjustment;
                          }
                          
                          dataPoint[player.name] = value;
                        });
                        
                        return dataPoint;
                      })}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {selectedPlayers.map((player, index) => (
                        <Line
                          key={player.id}
                          type="monotone"
                          dataKey={player.name}
                          stroke={getPlayerColor(index)}
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                          // Make projected years dashed
                          strokeDasharray={(data: any) => data && data.year && 
                            (data.year === 'Next Year' || data.year === 'Year 2' || data.year === 'Year 3') ? 
                            '5 5' : '0'
                          }
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <Separator className="my-6" />
                
                {/* Career Projection Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Peak Year</TableHead>
                        <TableHead>Peak Value</TableHead>
                        <TableHead>Years Left</TableHead>
                        <TableHead>Value Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPlayers.map((player, index) => {
                        // Calculate peak year based on position and current age
                        let peakAge = 27;
                        if (player.position === 'QB') peakAge = 30;
                        if (player.position === 'RB') peakAge = 25;
                        if (player.position === 'WR') peakAge = 28;
                        if (player.position === 'TE') peakAge = 27;
                        
                        const peakYear = new Date().getFullYear() + Math.max(0, peakAge - player.age);
                        const yearsLeft = Math.max(0, (player.position === 'QB' ? 38 : player.position === 'RB' ? 30 : 33) - player.age);
                        
                        // Value trend based on age relative to peak
                        let valueTrend = 0;
                        if (player.age < peakAge - 2) valueTrend = 2; // Rising
                        else if (player.age < peakAge) valueTrend = 1; // Slightly rising
                        else if (player.age === peakAge) valueTrend = 0; // Stable
                        else if (player.age < peakAge + 3) valueTrend = -1; // Slightly declining
                        else valueTrend = -2; // Declining
                        
                        return (
                          <TableRow key={player.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: getPlayerColor(index) }}
                                ></div>
                                <span>{player.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{player.age}</TableCell>
                            <TableCell>{peakYear}</TableCell>
                            <TableCell>{Math.round(player.dynasty_value * 1.1)}</TableCell>
                            <TableCell>{yearsLeft}</TableCell>
                            <TableCell className="flex items-center">
                              {getValueTrend(valueTrend)}
                              <span className="ml-1">
                                {valueTrend > 1 ? 'Rising' 
                                  : valueTrend > 0 ? 'Slightly rising'
                                  : valueTrend === 0 ? 'Stable'
                                  : valueTrend > -2 ? 'Slightly declining'
                                  : 'Declining'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-indigo-500" />
                  Advanced Metrics Comparison
                </CardTitle>
                <CardDescription>
                  Multi-dimensional analysis of player performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[450px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={150} data={getRadarData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      {selectedPlayers.map((player, index) => (
                        <Radar
                          key={player.id}
                          name={player.name}
                          dataKey={player.name}
                          stroke={getPlayerColor(index)}
                          fill={getPlayerColor(index)}
                          fillOpacity={0.2}
                        />
                      ))}
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <Separator className="my-6" />
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-right">Dynasty Value</TableHead>
                        <TableHead className="text-right">FP/Game</TableHead>
                        <TableHead className="text-right">Consistency</TableHead>
                        <TableHead className="text-right">Boom/Bust</TableHead>
                        <TableHead className="text-right">Opportunity</TableHead>
                        <TableHead className="text-right">Red Zone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPlayers.map((player, index) => (
                        <TableRow key={player.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: getPlayerColor(index) }}
                              ></div>
                              <span>{player.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{player.dynasty_value}</TableCell>
                          <TableCell className="text-right">{player.advanced_stats.fantasy_points_per_game.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{player.advanced_stats.consistency_rating.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{player.advanced_stats.boom_bust_ratio.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{player.advanced_stats.opportunity_share.toFixed(1)}%</TableCell>
                          <TableCell className="text-right">{player.advanced_stats.red_zone_opportunities}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedPlayers.map((player, index) => (
                    <Card key={player.id} className={`border-t-4`} style={{ borderColor: getPlayerColor(index) }}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{player.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Snap Share:</dt>
                            <dd>{player.advanced_stats.snap_share}%</dd>
                          </div>
                          
                          {player.position === 'RB' && (
                            <>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Breakaway Runs:</dt>
                                <dd>{player.advanced_stats.breakaway_runs}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Yards Created:</dt>
                                <dd>{player.advanced_stats.yards_created}</dd>
                              </div>
                            </>
                          )}
                          
                          {(player.position === 'WR' || player.position === 'TE') && (
                            <>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">aDOT:</dt>
                                <dd>{player.advanced_stats.average_depth_of_target}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Air Yards Share:</dt>
                                <dd>{player.advanced_stats.air_yards_share}%</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Deep Targets:</dt>
                                <dd>{player.advanced_stats.deep_targets}</dd>
                              </div>
                            </>
                          )}
                          
                          {player.position === 'QB' && (
                            <>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Protection Rate:</dt>
                                <dd>{player.advanced_stats.protection_rate}%</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Pressures:</dt>
                                <dd>{player.advanced_stats.pressures}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">True Comp %:</dt>
                                <dd>{player.advanced_stats.true_completion_percentage}%</dd>
                              </div>
                            </>
                          )}
                          
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Strength of Schedule:</dt>
                            <dd>{player.advanced_stats.strength_of_schedule}/10</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Search and Add Players to Compare</h3>
            <p className="text-sm text-gray-500 max-w-md mt-2">
              Use the search box above to find and add players to your comparison. You can add up to 4 players.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedPlayerComparison;