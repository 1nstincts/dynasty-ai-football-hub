import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  AlertCircle,
  ArrowBigDown,
  ArrowBigUp,
  ArrowUp,
  BarChart as BarChartIcon,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  FlameKindling,
  History,
  Info,
  Layers,
  LineChart,
  Play,
  Shield,
  Star,
  Swords,
  TrendingDown,
  TrendingUp,
  Users
} from 'lucide-react';
import MatchupForecastService, {
  MatchupProbability,
  ImpactPlayer,
  KeyMatchup,
  AnalysisFactor
} from '../../services/MatchupForecastService';
import MatchupService from '../../services/MatchupService';

interface MatchupProbabilityForecastProps {
  matchupId: string;
  leagueId: string;
}

const MatchupProbabilityForecast: React.FC<MatchupProbabilityForecastProps> = ({ 
  matchupId,
  leagueId
}) => {
  // State for matchup probability data
  const [probability, setProbability] = useState<MatchupProbability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');
  const [refreshing, setRefreshing] = useState(false);
  
  // Get data from Redux store
  const { teams } = useSelector((state: RootState) => state.teams);
  
  // Fetch matchup probability data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get matchup data first to get team names
        const matchup = await MatchupService.getMatchupById(leagueId, matchupId);
        if (matchup) {
          // Find team names
          const team1 = teams.find(t => t.id === matchup.team1Id);
          const team2 = teams.find(t => t.id === matchup.team2Id);
          
          if (team1) setTeam1Name(team1.name);
          if (team2) setTeam2Name(team2.name);
        }
        
        // Get probability data
        const data = await MatchupForecastService.getMatchupProbability(leagueId, matchupId);
        if (data) {
          setProbability(data);
        } else {
          // Use mock data for demo purposes
          const mockData = MatchupForecastService.getMockMatchupProbability(leagueId, matchupId);
          setProbability(mockData);
        }
      } catch (err) {
        console.error('Error fetching matchup probability:', err);
        setError('Failed to load matchup probability data');
        
        // Use mock data for demo purposes
        const mockData = MatchupForecastService.getMockMatchupProbability(leagueId, matchupId);
        setProbability(mockData);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [matchupId, leagueId, teams]);
  
  // Handle refreshing the forecast
  const handleRefresh = async () => {
    setRefreshing(true);
    
    try {
      // Generate a new forecast
      const data = await MatchupForecastService.generateMatchupProbability(leagueId, matchupId);
      if (data) {
        setProbability(data);
      }
    } catch (err) {
      console.error('Error refreshing matchup probability:', err);
      setError('Failed to refresh matchup probability data');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Matchup Probability</CardTitle>
          <CardDescription>Loading forecast data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error && !probability) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Matchup Probability</CardTitle>
          <CardDescription>Error loading forecast data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            <p className="text-center text-red-500">{error}</p>
            <Button className="mt-4" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Return early if probability data is not available
  if (!probability) {
    return null;
  }
  
  // Prepare data for win probability chart
  const winProbabilityData = [
    {
      name: team1Name,
      value: probability.winProbabilityTeam1,
      color: '#4f46e5'
    },
    {
      name: team2Name,
      value: probability.winProbabilityTeam2,
      color: '#ef4444'
    }
  ];
  
  // Prepare data for projected points chart
  const projectedPointsData = [
    {
      name: team1Name,
      min: probability.team1PointRange[0],
      projected: probability.projectedPointsTeam1,
      max: probability.team1PointRange[1],
      color: '#4f46e5'
    },
    {
      name: team2Name,
      min: probability.team2PointRange[0],
      projected: probability.projectedPointsTeam2,
      max: probability.team2PointRange[1],
      color: '#ef4444'
    }
  ];
  
  // Function to format percentage
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;
  
  // Function to get confidence level badge color
  const getConfidenceBadgeColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };
  
  // Function to get risk level badge color
  const getRiskBadgeColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };
  
  // Function to get factor type badge color
  const getFactorBadgeColor = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
  };
  
  // Render impact player card
  const renderImpactPlayerCard = (player: ImpactPlayer) => {
    const isTeam1 = player.teamId === probability.teamId1;
    
    return (
      <Card key={player.playerId} className="overflow-hidden">
        <div className={`h-1 ${isTeam1 ? 'bg-indigo-600' : 'bg-red-600'}`}></div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{player.name}</h4>
                <div className="flex items-center text-sm">
                  <Badge variant="outline" className="mr-2">
                    {player.position}
                  </Badge>
                  <Badge className={getRiskBadgeColor(player.riskLevel)}>
                    {player.riskLevel.charAt(0).toUpperCase() + player.riskLevel.slice(1)} Risk
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{player.projectedPoints.toFixed(1)}</div>
              <div className="text-xs text-gray-500">
                Projected Points
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1 text-sm">
              <span>Impact Score</span>
              <span className="font-medium">{player.impactScore.toFixed(0)}/100</span>
            </div>
            <Progress value={player.impactScore} className="h-2" />
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            {player.reasonForImpact}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Main component render
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Matchup Win Probability</CardTitle>
            <CardDescription>
              Week {probability.week} • {team1Name} vs {team2Name}
            </CardDescription>
          </div>
          <Badge className={getConfidenceBadgeColor(probability.confidenceLevel)}>
            {probability.confidenceLevel.charAt(0).toUpperCase() + probability.confidenceLevel.slice(1)} Confidence
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">
              <BarChartIcon className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="players">
              <Star className="h-4 w-4 mr-2" />
              Key Players
            </TabsTrigger>
            <TabsTrigger value="matchups">
              <Swords className="h-4 w-4 mr-2" />
              Position Matchups
            </TabsTrigger>
            <TabsTrigger value="factors">
              <Layers className="h-4 w-4 mr-2" />
              Analysis Factors
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Win Probability</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={winProbabilityData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${formatPercent(value)}`}
                      >
                        {winProbabilityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatPercent(value)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card className="bg-indigo-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-indigo-800">{team1Name}</h4>
                          <p className="text-2xl font-bold text-indigo-900">
                            {formatPercent(probability.winProbabilityTeam1)}
                          </p>
                        </div>
                        {probability.winProbabilityTeam1 > 0.5 && (
                          <Badge className="bg-indigo-100 text-indigo-800">
                            Favored
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-red-800">{team2Name}</h4>
                          <p className="text-2xl font-bold text-red-900">
                            {formatPercent(probability.winProbabilityTeam2)}
                          </p>
                        </div>
                        {probability.winProbabilityTeam2 > 0.5 && (
                          <Badge className="bg-red-100 text-red-800">
                            Favored
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Projected Points</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectedPointsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="projected"
                        name="Projected Points"
                        fill="#8884d8"
                        radius={[4, 4, 4, 4]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium text-gray-500">{team1Name}</h4>
                      <p className="text-2xl font-bold">
                        {probability.projectedPointsTeam1.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Range: {probability.team1PointRange[0].toFixed(1)} - {probability.team1PointRange[1].toFixed(1)}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium text-gray-500">{team2Name}</h4>
                      <p className="text-2xl font-bold">
                        {probability.projectedPointsTeam2.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Range: {probability.team2PointRange[0].toFixed(1)} - {probability.team2PointRange[1].toFixed(1)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {probability.analysisFactors.map((factor, index) => (
                      <li key={index} className="flex items-start">
                        <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 text-indigo-500" />
                        <span>{factor.description}</span>
                      </li>
                    ))}
                    
                    {Math.abs(probability.projectedPointsTeam1 - probability.projectedPointsTeam2) < 5 && (
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 text-indigo-500" />
                        <span>This matchup is projected to be very close with only {Math.abs(probability.projectedPointsTeam1 - probability.projectedPointsTeam2).toFixed(1)} points separating the teams.</span>
                      </li>
                    )}
                    
                    {probability.impactPlayers.length > 0 && (
                      <li className="flex items-start">
                        <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 text-indigo-500" />
                        <span>
                          {probability.impactPlayers[0].name} could be the most influential player in this matchup with {probability.impactPlayers[0].projectedPoints.toFixed(1)} projected points.
                        </span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="players">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Impact Players</h3>
              <p className="text-gray-500">
                Players who could have the biggest impact on this matchup's outcome
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {probability.impactPlayers.map(player => renderImpactPlayerCard(player))}
            </div>
            
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Understanding Impact Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-start">
                      <div className="bg-gray-100 rounded-full p-2 mr-3">
                        <LineChart className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <h4 className="font-medium">Projected Points</h4>
                        <p className="text-sm text-gray-600">
                          Based on historical performance, matchup, and recent trends
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-gray-100 rounded-full p-2 mr-3">
                        <TrendingDown className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <h4 className="font-medium">Consistency</h4>
                        <p className="text-sm text-gray-600">
                          How reliably a player performs to their projection
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-gray-100 rounded-full p-2 mr-3">
                        <FlameKindling className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <h4 className="font-medium">Boom/Bust Potential</h4>
                        <p className="text-sm text-gray-600">
                          How likely a player is to significantly over or underperform
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-gray-100 rounded-full p-2 mr-3">
                        <Shield className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <h4 className="font-medium">Risk Level</h4>
                        <p className="text-sm text-gray-600">
                          Combines injury risk, matchup difficulty, and consistency
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="matchups">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Position Matchups</h3>
              <p className="text-gray-500">
                Head-to-head comparisons at each position
              </p>
            </div>
            
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>{team1Name}</TableHead>
                    <TableHead className="text-center">Projection</TableHead>
                    <TableHead className="text-center">Advantage</TableHead>
                    <TableHead className="text-center">Projection</TableHead>
                    <TableHead>{team2Name}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {probability.keyMatchups.map((matchup, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{matchup.position}</TableCell>
                      <TableCell>{matchup.team1PlayerName}</TableCell>
                      <TableCell className="text-center">{matchup.team1PlayerProjection.toFixed(1)}</TableCell>
                      <TableCell className="text-center">
                        {matchup.advantageTeam === 1 ? (
                          <div className="flex items-center justify-center text-green-600">
                            <ArrowBigUp className="h-5 w-5 mr-1" />
                            <span>+{matchup.advantageAmount.toFixed(1)}</span>
                          </div>
                        ) : matchup.advantageTeam === 2 ? (
                          <div className="flex items-center justify-center text-red-600">
                            <ArrowBigDown className="h-5 w-5 mr-1" />
                            <span>-{matchup.advantageAmount.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-yellow-600">Even</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{matchup.team2PlayerProjection.toFixed(1)}</TableCell>
                      <TableCell>{matchup.team2PlayerName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{team1Name} Advantages</CardTitle>
                </CardHeader>
                <CardContent>
                  {probability.keyMatchups.filter(m => m.advantageTeam === 1).length > 0 ? (
                    <ul className="space-y-2">
                      {probability.keyMatchups
                        .filter(m => m.advantageTeam === 1)
                        .map((matchup, index) => (
                          <li key={index} className="flex items-start">
                            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                            <span>
                              <strong>{matchup.position}:</strong> {matchup.team1PlayerName} is projected to outscore {matchup.team2PlayerName} by {matchup.advantageAmount.toFixed(1)} points
                            </span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No significant advantages found
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{team2Name} Advantages</CardTitle>
                </CardHeader>
                <CardContent>
                  {probability.keyMatchups.filter(m => m.advantageTeam === 2).length > 0 ? (
                    <ul className="space-y-2">
                      {probability.keyMatchups
                        .filter(m => m.advantageTeam === 2)
                        .map((matchup, index) => (
                          <li key={index} className="flex items-start">
                            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                            <span>
                              <strong>{matchup.position}:</strong> {matchup.team2PlayerName} is projected to outscore {matchup.team1PlayerName} by {matchup.advantageAmount.toFixed(1)} points
                            </span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No significant advantages found
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="factors">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Analysis Factors</h3>
              <p className="text-gray-500">
                Key factors influencing the matchup outcome
              </p>
            </div>
            
            <div className="space-y-4">
              {probability.analysisFactors.map((factor, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="bg-gray-100 rounded-full p-2 mr-3">
                          <Info className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <div className="flex items-center mb-1">
                            <h4 className="font-medium mr-2">{factor.factorName}</h4>
                            <Badge className={getFactorBadgeColor(factor.factorType)}>
                              {factor.factorType.charAt(0).toUpperCase() + factor.factorType.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600">{factor.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">{team1Name} Impact</span>
                          <span className="text-sm font-medium">
                            {factor.team1Impact > 0 ? '+' : ''}{factor.team1Impact}
                          </span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                factor.team1Impact >= 0 ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.abs(factor.team1Impact))}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">{team2Name} Impact</span>
                          <span className="text-sm font-medium">
                            {factor.team2Impact > 0 ? '+' : ''}{factor.team2Impact}
                          </span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                factor.team2Impact >= 0 ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.abs(factor.team2Impact))}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Model Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-start">
                      <div className="bg-gray-100 rounded-full p-2 mr-3">
                        <Play className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <h4 className="font-medium">Simulation Based</h4>
                        <p className="text-sm text-gray-600">
                          10,000+ simulations of this matchup are run to generate probabilities
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-gray-100 rounded-full p-2 mr-3">
                        <History className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <h4 className="font-medium">Historical Data</h4>
                        <p className="text-sm text-gray-600">
                          Player projections are based on historical performance and matchup data
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-gray-100 rounded-full p-2 mr-3">
                        <Calendar className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <h4 className="font-medium">Last Updated</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(probability.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Last updated: {new Date(probability.updatedAt).toLocaleString()}
        </p>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Forecast
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MatchupProbabilityForecast;