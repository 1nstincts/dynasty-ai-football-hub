import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '../ui/use-toast';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Check, 
  Download, 
  BarChart2, 
  Trophy, 
  Users, 
  Clock1,
  Clock4,
  Clock9,
  Hourglass
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
  AreaChart,
  Area,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import AIAnalysisService, { Team, Player } from '../../services/AIAnalysisService';

interface WindowAnalysis {
  competitiveWindow: {
    status: 'win-now' | 'contender' | 'retooling' | 'rebuilding';
    length: number;
    peakYear: number;
    confidence: number; // 0-100%
  };
  rosterBreakdown: {
    coreVeterans: Player[];
    youngAssets: Player[];
    depthPlayers: Player[];
    valueByPosition: {
      QB: number;
      RB: number;
      WR: number;
      TE: number;
    };
    ageByPosition: {
      QB: number;
      RB: number;
      WR: number;
      TE: number;
    };
  };
  valueProjection: {
    year: number;
    totalValue: number;
    qbValue: number;
    rbValue: number;
    wrValue: number;
    teValue: number;
  }[];
  recommendations: {
    type: 'trade' | 'strategy' | 'draft';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
  }[];
}

const DynastyWindowCalculator: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [analysis, setAnalysis] = useState<WindowAnalysis | null>(null);
  const [comparisonTeam, setComparisonTeam] = useState<string>('');
  const [timeframeYears, setTimeframeYears] = useState<number>(5);
  const [excludeQBs, setExcludeQBs] = useState<boolean>(false);
  const [showProjections, setShowProjections] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch team and generate analysis
  useEffect(() => {
    const fetchData = async () => {
      if (!teamId) return;
      
      setLoading(true);
      try {
        // Fetch team data
        const teamData = await AIAnalysisService.getTeamWithRoster(teamId);
        if (!teamData) {
          throw new Error('Failed to load team data');
        }
        setTeam(teamData);
        
        // Generate window analysis
        const windowAnalysis = generateWindowAnalysis(teamData);
        setAnalysis(windowAnalysis);
      } catch (error) {
        console.error('Error loading team data:', error);
        toast({
          title: "Error",
          description: "Failed to load team data or generate analysis.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [teamId, toast]);
  
  // Refresh analysis with current settings
  const refreshAnalysis = () => {
    if (!team) return;
    
    setRefreshing(true);
    
    // Simulate delay for API call
    setTimeout(() => {
      const windowAnalysis = generateWindowAnalysis(team);
      setAnalysis(windowAnalysis);
      
      toast({
        title: "Analysis Updated",
        description: "Dynasty window analysis has been refreshed with current settings.",
      });
      
      setRefreshing(false);
    }, 1000);
  };
  
  // Generate the window analysis from team data
  const generateWindowAnalysis = (team: Team): WindowAnalysis => {
    // Sort players by dynasty value
    const sortedPlayers = [...team.roster].sort((a, b) => b.dynasty_value - a.dynasty_value);
    
    // Categorize players
    const coreVeterans = sortedPlayers.filter(p => p.age >= 27 && p.dynasty_value >= 75);
    const youngAssets = sortedPlayers.filter(p => p.age <= 25 && p.dynasty_value >= 70);
    const depthPlayers = sortedPlayers.filter(p => 
      p.dynasty_value < 70 || (p.age > 25 && p.age < 27 && p.dynasty_value >= 70)
    );
    
    // Calculate average age by position
    const positionPlayers = {
      QB: sortedPlayers.filter(p => p.position === 'QB'),
      RB: sortedPlayers.filter(p => p.position === 'RB'),
      WR: sortedPlayers.filter(p => p.position === 'WR'),
      TE: sortedPlayers.filter(p => p.position === 'TE')
    };
    
    const ageByPosition = {
      QB: positionPlayers.QB.length > 0 
        ? positionPlayers.QB.reduce((sum, p) => sum + p.age, 0) / positionPlayers.QB.length 
        : 0,
      RB: positionPlayers.RB.length > 0 
        ? positionPlayers.RB.reduce((sum, p) => sum + p.age, 0) / positionPlayers.RB.length 
        : 0,
      WR: positionPlayers.WR.length > 0 
        ? positionPlayers.WR.reduce((sum, p) => sum + p.age, 0) / positionPlayers.WR.length 
        : 0,
      TE: positionPlayers.TE.length > 0 
        ? positionPlayers.TE.reduce((sum, p) => sum + p.age, 0) / positionPlayers.TE.length 
        : 0
    };
    
    // Calculate value by position
    const valueByPosition = {
      QB: positionPlayers.QB.reduce((sum, p) => sum + p.dynasty_value, 0),
      RB: positionPlayers.RB.reduce((sum, p) => sum + p.dynasty_value, 0),
      WR: positionPlayers.WR.reduce((sum, p) => sum + p.dynasty_value, 0),
      TE: positionPlayers.TE.reduce((sum, p) => sum + p.dynasty_value, 0)
    };
    
    // Determine competitive window status
    let status: 'win-now' | 'contender' | 'retooling' | 'rebuilding';
    let windowLength: number;
    let peakYear: number;
    let confidence: number;
    
    const currentYear = new Date().getFullYear();
    const topTalentCount = sortedPlayers.filter(p => p.dynasty_value >= 85).length;
    const solidTalentCount = sortedPlayers.filter(p => p.dynasty_value >= 75 && p.dynasty_value < 85).length;
    const youngTalentRatio = youngAssets.length / Math.max(1, coreVeterans.length);
    
    // Make an assessment based on roster composition
    if (coreVeterans.length >= 5 && youngAssets.length <= 2) {
      status = 'win-now';
      windowLength = Math.min(3, Math.max(1, 4 - Math.floor(ageByPosition.RB / 27)));
      peakYear = currentYear;
      confidence = 80 + Math.min(0, (topTalentCount - 3) * 5);
    } else if (topTalentCount >= 3 && solidTalentCount >= 4) {
      status = 'contender';
      windowLength = Math.min(4, Math.max(2, 5 - Math.floor((ageByPosition.RB + ageByPosition.WR) / 2 / 26)));
      peakYear = currentYear + 1;
      confidence = 75 + Math.min(0, (topTalentCount - 2) * 5);
    } else if (youngTalentRatio > 1.5 || youngAssets.length >= 5) {
      status = 'rebuilding';
      windowLength = 3;
      peakYear = currentYear + 2;
      confidence = 70 + Math.min(0, (youngAssets.length - 4) * 5);
    } else {
      status = 'retooling';
      windowLength = 2;
      peakYear = currentYear + 1;
      confidence = 65;
    }
    
    // Generate value projections for the next 5 years
    const valueProjection = [];
    let totalValue = sortedPlayers.reduce((sum, p) => sum + p.dynasty_value, 0);
    let qbValue = valueByPosition.QB;
    let rbValue = valueByPosition.RB;
    let wrValue = valueByPosition.WR;
    let teValue = valueByPosition.TE;
    
    for (let i = 0; i <= 5; i++) {
      // Apply age-based depreciation
      const qbDepreciation = i === 0 ? 1 : (ageByPosition.QB < 30 ? 0.98 : 0.93) ** i;
      const rbDepreciation = i === 0 ? 1 : (ageByPosition.RB < 25 ? 0.99 : 0.85) ** i;
      const wrDepreciation = i === 0 ? 1 : (ageByPosition.WR < 27 ? 0.99 : 0.9) ** i;
      const teDepreciation = i === 0 ? 1 : (ageByPosition.TE < 26 ? 0.99 : 0.92) ** i;
      
      // Calculate projected values
      const projectedQbValue = qbValue * qbDepreciation;
      const projectedRbValue = rbValue * rbDepreciation;
      const projectedWrValue = wrValue * wrDepreciation;
      const projectedTeValue = teValue * teDepreciation;
      const projectedTotalValue = projectedQbValue + projectedRbValue + projectedWrValue + projectedTeValue;
      
      valueProjection.push({
        year: currentYear + i,
        totalValue: Math.round(projectedTotalValue),
        qbValue: Math.round(projectedQbValue),
        rbValue: Math.round(projectedRbValue),
        wrValue: Math.round(projectedWrValue),
        teValue: Math.round(projectedTeValue)
      });
    }
    
    // Generate strategic recommendations
    const recommendations = [];
    
    if (status === 'win-now') {
      recommendations.push({
        type: 'strategy',
        priority: 'high',
        title: 'All-In for Championship',
        description: 'Your roster is built to win now. Consider trading future assets (rookie picks, young developmental players) for win-now veterans to maximize your championship window.'
      });
      
      if (ageByPosition.RB > 27) {
        recommendations.push({
          type: 'trade',
          priority: 'medium',
          title: 'Acquire RB Depth',
          description: 'Your RB room is aging. Consider acquiring younger RB talent for depth and to extend your competitive window.'
        });
      }
    } else if (status === 'contender') {
      recommendations.push({
        type: 'strategy',
        priority: 'medium',
        title: 'Balanced Approach',
        description: 'Your team has a good mix of win-now and future assets. Look to make strategic trades that help now without mortgaging the future.'
      });
      
      const weakestPosition = Object.entries(valueByPosition)
        .sort(([, valueA], [, valueB]) => valueA - valueB)[0][0];
      
      recommendations.push({
        type: 'trade',
        priority: 'medium',
        title: `Upgrade at ${weakestPosition}`,
        description: `Your ${weakestPosition} position has the lowest value. Consider upgrading to improve your championship odds.`
      });
    } else if (status === 'rebuilding') {
      recommendations.push({
        type: 'strategy',
        priority: 'high',
        title: 'Commit to Rebuild',
        description: 'Your roster is young with lots of potential. Trade aging veterans for future assets (rookie picks, young players) to align your championship window.'
      });
      
      if (coreVeterans.length > 0) {
        recommendations.push({
          type: 'trade',
          priority: 'high',
          title: 'Trade Aging Veterans',
          description: `Players like ${coreVeterans[0].name} could bring back significant draft capital or young players to accelerate your rebuild.`
        });
      }
      
      recommendations.push({
        type: 'draft',
        priority: 'medium',
        title: 'Prioritize Young WRs',
        description: 'WRs typically take longer to develop but have longer careers. Focus on acquiring young WRs to build a sustainable foundation.'
      });
    } else {
      recommendations.push({
        type: 'strategy',
        priority: 'medium',
        title: 'Decide Your Direction',
        description: 'Your team is at a crossroads. You need to decide whether to push for contention or rebuild. Avoid staying in the middle for too long.'
      });
      
      if (ageByPosition.RB > 26 && ageByPosition.WR < 25) {
        recommendations.push({
          type: 'trade',
          priority: 'medium',
          title: 'Trade Aging RBs',
          description: 'Your RBs are aging while your WRs are young. Consider trading RBs for draft capital or younger talent to align your windows.'
        });
      }
    }
    
    return {
      competitiveWindow: {
        status,
        length: windowLength,
        peakYear,
        confidence
      },
      rosterBreakdown: {
        coreVeterans,
        youngAssets,
        depthPlayers,
        valueByPosition,
        ageByPosition
      },
      valueProjection,
      recommendations
    };
  };
  
  const getWindowStatusIcon = (status: string) => {
    switch (status) {
      case 'win-now':
        return <Trophy className="h-5 w-5 mr-2 text-red-500" />;
      case 'contender':
        return <Clock1 className="h-5 w-5 mr-2 text-orange-500" />;
      case 'retooling':
        return <Clock4 className="h-5 w-5 mr-2 text-blue-500" />;
      case 'rebuilding':
        return <Clock9 className="h-5 w-5 mr-2 text-green-500" />;
      default:
        return <Hourglass className="h-5 w-5 mr-2 text-gray-500" />;
    }
  };
  
  const getWindowColor = (status: string) => {
    switch (status) {
      case 'win-now':
        return 'bg-red-500';
      case 'contender':
        return 'bg-orange-500';
      case 'retooling':
        return 'bg-blue-500';
      case 'rebuilding':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'trade':
        return <Users className="h-4 w-4" />;
      case 'strategy':
        return <TrendingUp className="h-4 w-4" />;
      case 'draft':
        return <BarChart2 className="h-4 w-4" />;
      default:
        return <Check className="h-4 w-4" />;
    }
  };
  
  const exportAnalysis = () => {
    if (!analysis || !team) return;
    
    const analysisData = {
      team: {
        name: team.name,
        owner: team.owner_name
      },
      window: analysis.competitiveWindow,
      roster: {
        coreVeterans: analysis.rosterBreakdown.coreVeterans.map(p => 
          ({ name: p.name, position: p.position, age: p.age, value: p.dynasty_value })),
        youngAssets: analysis.rosterBreakdown.youngAssets.map(p => 
          ({ name: p.name, position: p.position, age: p.age, value: p.dynasty_value })),
      },
      projections: analysis.valueProjection,
      recommendations: analysis.recommendations
    };
    
    const jsonString = JSON.stringify(analysisData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${team.name.replace(/\s+/g, '_')}_window_analysis.json`;
    link.click();
    
    toast({
      title: "Analysis Exported",
      description: "Dynasty window analysis has been exported successfully.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-12 w-[300px]" />
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
        <Skeleton className="h-[300px] mt-6" />
      </div>
    );
  }

  if (!team || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Analysis Unavailable</h3>
        <p className="text-muted-foreground max-w-md">
          We couldn't analyze your team's dynasty window. Please try again later or select a different team.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            {getWindowStatusIcon(analysis.competitiveWindow.status)}
            {team.name}
          </h1>
          <p className="text-muted-foreground">Owned by {team.owner_name}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={exportAnalysis}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>
          <Button 
            onClick={refreshAnalysis}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Analysis'}
          </Button>
        </div>
      </div>
      
      {/* Competitive Window Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Competitive Window</CardTitle>
            <CardDescription>Your team's championship timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center">
              <Badge className={`${getWindowColor(analysis.competitiveWindow.status)} text-white mb-2 text-lg py-1 px-3`}>
                {analysis.competitiveWindow.status.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Badge>
              <div className="text-3xl font-bold my-2">
                {analysis.competitiveWindow.length} {analysis.competitiveWindow.length === 1 ? 'Year' : 'Years'}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Peak performance expected in {analysis.competitiveWindow.peakYear}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div 
                  className={`h-2.5 rounded-full ${getWindowColor(analysis.competitiveWindow.status)}`}
                  style={{ width: `${analysis.competitiveWindow.confidence}%` }}
                ></div>
              </div>
              <p className="text-xs text-right w-full mt-1">
                Confidence: {analysis.competitiveWindow.confidence}%
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Roster Age Profile</CardTitle>
            <CardDescription>Age distribution by position</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['QB', 'RB', 'WR', 'TE'].map(position => (
                <div key={position} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{position}</span>
                    <span className="font-medium">
                      {analysis.rosterBreakdown.ageByPosition[position as keyof typeof analysis.rosterBreakdown.ageByPosition].toFixed(1)} years
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${
                        position === 'QB'
                          ? analysis.rosterBreakdown.ageByPosition.QB > 30 ? 'bg-red-500' : 'bg-green-500'
                          : position === 'RB'
                            ? analysis.rosterBreakdown.ageByPosition.RB > 26 ? 'bg-red-500' : 'bg-green-500'
                            : position === 'WR'
                              ? analysis.rosterBreakdown.ageByPosition.WR > 28 ? 'bg-red-500' : 'bg-green-500'
                              : analysis.rosterBreakdown.ageByPosition.TE > 28 ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (
                          position === 'QB'
                            ? (analysis.rosterBreakdown.ageByPosition.QB / 40) * 100
                            : position === 'RB'
                              ? (analysis.rosterBreakdown.ageByPosition.RB / 35) * 100
                              : (analysis.rosterBreakdown.ageByPosition[position as keyof typeof analysis.rosterBreakdown.ageByPosition] / 38) * 100
                        ))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Average career length by position: QB (15y), RB (7y), WR (10y), TE (9y)
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Talent Distribution</CardTitle>
            <CardDescription>Core players vs young assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Core Veterans', value: analysis.rosterBreakdown.coreVeterans.length, color: '#FF8042' },
                      { name: 'Young Assets', value: analysis.rosterBreakdown.youngAssets.length, color: '#00C49F' },
                      { name: 'Depth Players', value: analysis.rosterBreakdown.depthPlayers.length, color: '#8884d8' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Core Veterans', value: analysis.rosterBreakdown.coreVeterans.length, color: '#FF8042' },
                      { name: 'Young Assets', value: analysis.rosterBreakdown.youngAssets.length, color: '#00C49F' },
                      { name: 'Depth Players', value: analysis.rosterBreakdown.depthPlayers.length, color: '#8884d8' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [value, name]}
                    itemStyle={{ color: '#111' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Value Projection Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                    Dynasty Value Projection
                  </CardTitle>
                  <CardDescription>
                    Estimated team value over the next {timeframeYears} years
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="exclude-qbs"
                      checked={excludeQBs}
                      onCheckedChange={setExcludeQBs}
                    />
                    <Label htmlFor="exclude-qbs">Exclude QBs</Label>
                  </div>
                  <Select
                    value={timeframeYears.toString()}
                    onValueChange={(value) => setTimeframeYears(parseInt(value))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Years</SelectItem>
                      <SelectItem value="5">5 Years</SelectItem>
                      <SelectItem value="7">7 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analysis.valueProjection.filter(d => d.year <= new Date().getFullYear() + timeframeYears)}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} pts`, 'Value']}
                    />
                    <Legend />
                    {!excludeQBs && (
                      <Area 
                        type="monotone" 
                        dataKey="qbValue" 
                        name="QB Value" 
                        stackId="1"
                        stroke="#FF8042" 
                        fill="#FF8042"
                        fillOpacity={0.6} 
                      />
                    )}
                    <Area 
                      type="monotone" 
                      dataKey="rbValue" 
                      name="RB Value" 
                      stackId="1"
                      stroke="#00C49F" 
                      fill="#00C49F"
                      fillOpacity={0.6} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="wrValue" 
                      name="WR Value" 
                      stackId="1"
                      stroke="#0088FE" 
                      fill="#0088FE"
                      fillOpacity={0.6} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="teValue" 
                      name="TE Value" 
                      stackId="1"
                      stroke="#FFBB28" 
                      fill="#FFBB28"
                      fillOpacity={0.6} 
                    />
                    <Line
                      type="monotone"
                      dataKey="totalValue"
                      name="Total Value"
                      stroke="#ff0000"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Values decline based on age curves by position: QB (slowest), RB (fastest), WR/TE (moderate)
              </p>
            </CardContent>
          </Card>
          
          {/* Team Composition */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-500" />
                Team Composition
              </CardTitle>
              <CardDescription>
                Core players by age and value
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="core-veterans">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="core-veterans">Core Veterans</TabsTrigger>
                  <TabsTrigger value="young-assets">Young Assets</TabsTrigger>
                  <TabsTrigger value="depth">Depth Players</TabsTrigger>
                </TabsList>
                
                <TabsContent value="core-veterans" className="space-y-4">
                  {analysis.rosterBreakdown.coreVeterans.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Window</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysis.rosterBreakdown.coreVeterans.map(player => (
                            <TableRow key={player.id}>
                              <TableCell>{player.name}</TableCell>
                              <TableCell>{player.position}</TableCell>
                              <TableCell>{player.age}</TableCell>
                              <TableCell>{player.dynasty_value}</TableCell>
                              <TableCell>
                                <Badge className={
                                  player.position === 'QB'
                                    ? player.age > 32 ? 'bg-red-500' : player.age > 28 ? 'bg-orange-500' : 'bg-green-500'
                                    : player.position === 'RB'
                                      ? player.age > 28 ? 'bg-red-500' : player.age > 25 ? 'bg-orange-500' : 'bg-green-500'
                                      : player.position === 'WR' || player.position === 'TE'
                                        ? player.age > 30 ? 'bg-red-500' : player.age > 27 ? 'bg-orange-500' : 'bg-green-500'
                                        : 'bg-gray-500'
                                }>
                                  {
                                    player.position === 'QB'
                                      ? player.age > 32 ? '1-2 Years' : player.age > 28 ? '2-4 Years' : '4+ Years'
                                      : player.position === 'RB'
                                        ? player.age > 28 ? '1 Year' : player.age > 25 ? '1-2 Years' : '3+ Years'
                                        : player.position === 'WR' || player.position === 'TE'
                                          ? player.age > 30 ? '1-2 Years' : player.age > 27 ? '2-3 Years' : '4+ Years'
                                          : 'Unknown'
                                  }
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No core veterans found in your roster.
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="young-assets" className="space-y-4">
                  {analysis.rosterBreakdown.youngAssets.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Development</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysis.rosterBreakdown.youngAssets.map(player => (
                            <TableRow key={player.id}>
                              <TableCell>{player.name}</TableCell>
                              <TableCell>{player.position}</TableCell>
                              <TableCell>{player.age}</TableCell>
                              <TableCell>{player.dynasty_value}</TableCell>
                              <TableCell>
                                <Badge className={
                                  player.experience < 2 
                                    ? 'bg-yellow-500' 
                                    : player.experience < 3
                                      ? 'bg-blue-500'
                                      : 'bg-green-500'
                                }>
                                  {player.experience < 2 
                                    ? 'Early Development' 
                                    : player.experience < 3
                                      ? 'Rising'
                                      : 'Prime Approaching'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No young assets found in your roster.
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="depth" className="space-y-4">
                  {analysis.rosterBreakdown.depthPlayers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Role</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysis.rosterBreakdown.depthPlayers.slice(0, 8).map(player => (
                            <TableRow key={player.id}>
                              <TableCell>{player.name}</TableCell>
                              <TableCell>{player.position}</TableCell>
                              <TableCell>{player.age}</TableCell>
                              <TableCell>{player.dynasty_value}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {player.dynasty_value > 60 
                                    ? 'Solid Contributor' 
                                    : player.dynasty_value > 40
                                      ? 'Rotational Player'
                                      : 'Depth'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {analysis.rosterBreakdown.depthPlayers.length > 8 && (
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                          Showing 8 of {analysis.rosterBreakdown.depthPlayers.length} depth players
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No depth players found in your roster.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Recommendations and Strategy */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Window Strategy
              </CardTitle>
              <CardDescription>
                Recommendations based on your roster composition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.recommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  className={`border rounded-md p-4 ${
                    rec.priority === 'high' 
                      ? 'border-red-200 bg-red-50 dark:bg-red-900/20' 
                      : rec.priority === 'medium'
                        ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start mb-2">
                    <div className={`p-1.5 rounded-full flex-shrink-0 ${
                      rec.priority === 'high' 
                        ? 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300' 
                        : rec.priority === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-300'
                          : 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                    }`}>
                      {getRecommendationIcon(rec.type)}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">{rec.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                Window Timeline
              </CardTitle>
              <CardDescription>
                Your team's competitive trajectory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pb-12">
                {/* Timeline display */}
                <div className="absolute h-full w-0.5 bg-gray-200 left-6 top-0"></div>
                
                <div className="relative mb-8">
                  <div className="flex items-center">
                    <div className="absolute flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-red-100 text-red-600 dark:border-gray-900 dark:bg-red-900 dark:text-red-300 left-0 z-10">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div className="ml-16">
                      <h3 className="text-lg font-semibold">Current Season ({new Date().getFullYear()})</h3>
                      <p className="text-sm text-muted-foreground">
                        {analysis.competitiveWindow.status === 'win-now' 
                          ? 'Championship window is now'
                          : analysis.competitiveWindow.status === 'contender'
                            ? 'Competitive window is open'
                            : analysis.competitiveWindow.status === 'retooling'
                              ? 'Transitional period'
                              : 'Building for the future'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="relative mb-8">
                  <div className="flex items-center">
                    <div className={`absolute flex items-center justify-center w-12 h-12 rounded-full border-4 border-white 
                      ${analysis.competitiveWindow.peakYear === new Date().getFullYear() + 1
                        ? 'bg-green-100 text-green-600 dark:border-gray-900 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-blue-100 text-blue-600 dark:border-gray-900 dark:bg-blue-900 dark:text-blue-300'} left-0 z-10`}
                    >
                      <Clock1 className="h-6 w-6" />
                    </div>
                    <div className="ml-16">
                      <h3 className="text-lg font-semibold">Next Season ({new Date().getFullYear() + 1})</h3>
                      <p className="text-sm text-muted-foreground">
                        {analysis.competitiveWindow.peakYear === new Date().getFullYear() + 1
                          ? 'Expected peak performance year'
                          : analysis.competitiveWindow.status === 'win-now'
                            ? 'Window potentially closing'
                            : analysis.competitiveWindow.status === 'contender'
                              ? 'Strong competitive window'
                              : 'Building toward contention'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center">
                    <div className={`absolute flex items-center justify-center w-12 h-12 rounded-full border-4 border-white 
                      ${analysis.competitiveWindow.peakYear >= new Date().getFullYear() + 2
                        ? 'bg-green-100 text-green-600 dark:border-gray-900 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-yellow-100 text-yellow-600 dark:border-gray-900 dark:bg-yellow-900 dark:text-yellow-300'} left-0 z-10`}
                    >
                      <Clock4 className="h-6 w-6" />
                    </div>
                    <div className="ml-16">
                      <h3 className="text-lg font-semibold">{new Date().getFullYear() + 2}-{new Date().getFullYear() + 3}</h3>
                      <p className="text-sm text-muted-foreground">
                        {analysis.competitiveWindow.peakYear >= new Date().getFullYear() + 2
                          ? 'Expected peak performance window'
                          : analysis.competitiveWindow.status === 'win-now' || analysis.competitiveWindow.status === 'contender'
                            ? 'Window likely closing, rebuild may be needed'
                            : 'Prime competitive window opens'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="text-sm text-muted-foreground w-full">
                <div className="flex justify-between mb-2">
                  <span>Current Value:</span>
                  <span className="font-semibold">{analysis.valueProjection[0].totalValue} points</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Peak Window Value:</span>
                  <span className="font-semibold">
                    {Math.max(...analysis.valueProjection.map(p => p.totalValue))} points
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>5-Year Value Trend:</span>
                  <span className={
                    analysis.valueProjection[0].totalValue > analysis.valueProjection[analysis.valueProjection.length - 1].totalValue
                      ? 'text-red-500 font-semibold flex items-center'
                      : 'text-green-500 font-semibold flex items-center'
                  }>
                    {analysis.valueProjection[0].totalValue > analysis.valueProjection[analysis.valueProjection.length - 1].totalValue
                      ? <TrendingDown className="h-3 w-3 mr-1" />
                      : <TrendingUp className="h-3 w-3 mr-1" />
                    }
                    {Math.abs(
                      analysis.valueProjection[analysis.valueProjection.length - 1].totalValue - 
                      analysis.valueProjection[0].totalValue
                    )} points
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DynastyWindowCalculator;