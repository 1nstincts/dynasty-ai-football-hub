import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '../ui/use-toast';
import { Brain, TrendingUp, LineChart as LineChartIcon, Users, Sparkles, AlertTriangle, Check, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

import AIAnalysisService, { 
  TeamAnalysis, 
  Team, 
  Player, 
  Recommendation 
} from '../../services/AIAnalysisService';

type AnalysisTab = 'overview' | 'recommendations' | 'roster' | 'trends';

const AITeamAnalysis: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AnalysisTab>('overview');
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [analysis, setAnalysis] = useState<TeamAnalysis | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch team and analysis data
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
        
        // Fetch AI analysis
        const analysisData = await AIAnalysisService.analyzeTeam(teamId);
        if (!analysisData) {
          throw new Error('Failed to generate team analysis');
        }
        setAnalysis(analysisData);
      } catch (error) {
        console.error('Error fetching team analysis:', error);
        toast({
          title: "Error Loading Analysis",
          description: "Failed to load team data or generate analysis.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [teamId, toast]);

  const refreshAnalysis = async () => {
    if (!teamId) return;
    
    setRefreshing(true);
    try {
      // Fetch updated analysis
      const analysisData = await AIAnalysisService.analyzeTeam(teamId);
      if (!analysisData) {
        throw new Error('Failed to generate updated team analysis');
      }
      setAnalysis(analysisData);
      
      toast({
        title: "Analysis Updated",
        description: "Team analysis has been refreshed with the latest data.",
      });
    } catch (error) {
      console.error('Error refreshing analysis:', error);
      toast({
        title: "Error Refreshing Analysis",
        description: "Failed to generate updated analysis.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getCompetitiveWindowColor = (window: string): string => {
    switch (window) {
      case 'win-now': return 'bg-red-500';
      case 'contender': return 'bg-orange-500';
      case 'retooling': return 'bg-blue-500';
      case 'rebuilding': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-blue-600';
    if (rating >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getImpactBadge = (impact: number) => {
    const absoluteImpact = Math.abs(impact);
    let color = 'bg-gray-500';
    let label = 'Neutral';
    let icon = <ArrowRight className="h-3 w-3" />;
    
    if (impact > 7) {
      color = 'bg-green-600';
      label = 'Very Positive';
      icon = <ArrowUp className="h-3 w-3" />;
    } else if (impact > 3) {
      color = 'bg-green-500';
      label = 'Positive';
      icon = <ArrowUp className="h-3 w-3" />;
    } else if (impact > 0) {
      color = 'bg-green-400';
      label = 'Slightly Positive';
      icon = <ArrowUp className="h-3 w-3" />;
    } else if (impact < -7) {
      color = 'bg-red-600';
      label = 'Very Negative';
      icon = <ArrowDown className="h-3 w-3" />;
    } else if (impact < -3) {
      color = 'bg-red-500';
      label = 'Negative';
      icon = <ArrowDown className="h-3 w-3" />;
    } else if (impact < 0) {
      color = 'bg-red-400';
      label = 'Slightly Negative';
      icon = <ArrowDown className="h-3 w-3" />;
    }
    
    return (
      <Badge className={`${color} text-white`}>
        {icon}
        <span className="ml-1">{label}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
      </div>
    );
  }

  if (!team || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Analysis Unavailable</h3>
        <p className="text-gray-500 max-w-md text-center">
          We couldn't generate an analysis for this team. Please try again later or contact support if this issue persists.
        </p>
        <Button onClick={refreshAnalysis} className="mt-4">
          Retry Analysis
        </Button>
      </div>
    );
  }

  // Prepare data for charts
  const positionDistributionData = [
    { name: 'QB', value: team.roster.filter(p => p.position === 'QB').length },
    { name: 'RB', value: team.roster.filter(p => p.position === 'RB').length },
    { name: 'WR', value: team.roster.filter(p => p.position === 'WR').length },
    { name: 'TE', value: team.roster.filter(p => p.position === 'TE').length },
    { name: 'K', value: team.roster.filter(p => p.position === 'K').length },
    { name: 'DEF', value: team.roster.filter(p => p.position === 'DEF').length }
  ].filter(item => item.value > 0);
  
  const positionRatingData = [
    { name: 'QB', rating: analysis.rosterBalance.qbRating },
    { name: 'RB', rating: analysis.rosterBalance.rbRating },
    { name: 'WR', rating: analysis.rosterBalance.wrRating },
    { name: 'TE', rating: analysis.rosterBalance.teRating }
  ];
  
  const POSITION_COLORS = {
    QB: '#FF8042',
    RB: '#00C49F',
    WR: '#0088FE',
    TE: '#FFBB28',
    K: '#9146FF',
    DEF: '#FF6666'
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">{team.name}</h2>
          <p className="text-gray-500">Owned by {team.owner_name}</p>
        </div>
        
        <Button 
          onClick={refreshAnalysis} 
          disabled={refreshing}
          variant="outline"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Analysis'}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AnalysisTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="roster">Roster Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Team Rating Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Team Rating</CardTitle>
                <CardDescription>
                  Overall team strength assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-center h-28">
                  <div className="text-5xl font-bold relative">
                    <span className={getRatingColor(analysis.overallRating)}>{analysis.overallRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground absolute -right-6 top-3">/10</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-sm text-muted-foreground text-center w-full">
                  Based on roster talent, depth, and age profile
                </p>
              </CardFooter>
            </Card>
            
            {/* Competitive Window Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Competitive Window</CardTitle>
                <CardDescription>
                  Current team competitive status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-28">
                  <Badge className={`${getCompetitiveWindowColor(analysis.competitiveWindow.currentWindow)} text-white mb-2 text-lg px-3 py-1`}>
                    {analysis.competitiveWindow.currentWindow.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Badge>
                  <div className="text-lg">
                    <span className="font-semibold">{analysis.competitiveWindow.windowLength}</span> year window
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-sm text-muted-foreground text-center w-full">
                  Core players avg age: {analysis.competitiveWindow.corePlayersAverageAge.toFixed(1)} years
                </p>
              </CardFooter>
            </Card>
            
            {/* Position Balance Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Position Breakdown</CardTitle>
                <CardDescription>
                  Roster composition by position
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={positionDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {positionDistributionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={POSITION_COLORS[entry.name as keyof typeof POSITION_COLORS] || '#777'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Strengths & Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                  Strengths & Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 flex items-center mb-2">
                    <Check className="h-4 w-4 mr-1" /> Strengths
                  </h4>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    {analysis.strengthsAndWeaknesses.strengths.length > 0 ? (
                      analysis.strengthsAndWeaknesses.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm">{strength}</li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500">No significant strengths identified</li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-red-600 flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 mr-1" /> Weaknesses
                  </h4>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    {analysis.strengthsAndWeaknesses.weaknesses.length > 0 ? (
                      analysis.strengthsAndWeaknesses.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="text-sm">{weakness}</li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500">No significant weaknesses identified</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            {/* Position Group Ratings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Position Group Ratings
                </CardTitle>
                <CardDescription>Evaluation of each position group strength</CardDescription>
              </CardHeader>
              <CardContent className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={positionRatingData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip 
                      formatter={(value: number) => [
                        `${value.toFixed(1)}/10`, 
                        'Rating'
                      ]}
                    />
                    <Bar 
                      dataKey="rating" 
                      name="Position Rating" 
                      barSize={40}
                    >
                      {positionRatingData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={POSITION_COLORS[entry.name as keyof typeof POSITION_COLORS] || '#777'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Top Recommendations Preview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  Top Recommendations
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTab('recommendations')}
                >
                  View All
                </Button>
              </div>
              <CardDescription>AI-generated recommendations to improve your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.recommendations.slice(0, 3).map((rec, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className={`p-1.5 rounded-full 
                    ${rec.priority === 'high' 
                      ? 'bg-red-100 text-red-600' 
                      : rec.priority === 'medium' 
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {rec.type === 'trade' && <Users className="h-4 w-4" />}
                    {rec.type === 'waiver' && <TrendingUp className="h-4 w-4" />}
                    {rec.type === 'start-sit' && <Check className="h-4 w-4" />}
                    {rec.type === 'general' && <Brain className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              ))}
              
              {analysis.recommendations.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No recommendations available at this time. Try refreshing the analysis.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-500" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>
                Personalized insights and suggestions to improve your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter by recommendation type */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer">All</Badge>
                <Badge variant="outline" className="cursor-pointer">Trade</Badge>
                <Badge variant="outline" className="cursor-pointer">Waiver</Badge>
                <Badge variant="outline" className="cursor-pointer">Start/Sit</Badge>
                <Badge variant="outline" className="cursor-pointer">General</Badge>
              </div>
              
              {analysis.recommendations.length > 0 ? (
                analysis.recommendations.map((rec, idx) => (
                  <Card key={idx} className="border border-muted">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Badge className={`
                            ${rec.priority === 'high' 
                              ? 'bg-red-500' 
                              : rec.priority === 'medium' 
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                            } text-white mr-2`}
                          >
                            {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                          </Badge>
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                        </div>
                        <Badge variant="outline">
                          {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
                      
                      {rec.players?.trade && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Give</h4>
                            {rec.players.trade.give.map(player => (
                              <div key={player.id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-3">
                                  {player.position}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{player.name}</p>
                                  <p className="text-xs text-gray-500">{player.team} • Value: {player.dynasty_value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Receive</h4>
                            {rec.players.trade.receive.map(player => (
                              <div key={player.id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-3">
                                  {player.position}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{player.name}</p>
                                  <p className="text-xs text-gray-500">{player.team} • Value: {player.dynasty_value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {rec.players?.add && (
                        <div className="space-y-2 mt-4">
                          <h4 className="text-sm font-medium">Add</h4>
                          {rec.players.add.map(player => (
                            <div key={player.id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-3">
                                {player.position}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{player.name}</p>
                                <p className="text-xs text-gray-500">{player.team} • {player.projected_points ? `Proj: ${player.projected_points}pts` : `Value: ${player.dynasty_value}`}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {rec.players?.drop && (
                        <div className="space-y-2 mt-4">
                          <h4 className="text-sm font-medium">Drop</h4>
                          {rec.players.drop.map(player => (
                            <div key={player.id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-3">
                                {player.position}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{player.name}</p>
                                <p className="text-xs text-gray-500">{player.team} • Value: {player.dynasty_value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    {rec.impact && (
                      <CardFooter className="border-t pt-4 flex justify-between">
                        <div>
                          <span className="text-sm font-medium mr-2">Short-term impact:</span>
                          {getImpactBadge(rec.impact.short_term)}
                        </div>
                        <div>
                          <span className="text-sm font-medium mr-2">Long-term impact:</span>
                          {getImpactBadge(rec.impact.long_term)}
                        </div>
                      </CardFooter>
                    )}
                  </Card>
                ))
              ) : (
                <div className="text-center py-10">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Recommendations Available</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
                    We don't have any recommendations for your team at this time. This could be because your team is already well-balanced or there are no clear improvement opportunities.
                  </p>
                  <Button onClick={refreshAnalysis} className="mt-4">
                    Refresh Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Roster Analysis Tab */}
        <TabsContent value="roster" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Roster Analysis
              </CardTitle>
              <CardDescription>
                Detailed breakdown of your roster by position and value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['QB', 'RB', 'WR', 'TE'].map((position) => {
                  const positionPlayers = team.roster.filter(p => p.position === position)
                    .sort((a, b) => b.dynasty_value - a.dynasty_value);
                  
                  if (positionPlayers.length === 0) return null;
                  
                  const positionRating = analysis.rosterBalance[`${position.toLowerCase()}Rating` as keyof typeof analysis.rosterBalance];
                  
                  return (
                    <div key={position} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{
                          position === 'QB' ? 'Quarterbacks' :
                          position === 'RB' ? 'Running Backs' :
                          position === 'WR' ? 'Wide Receivers' :
                          'Tight Ends'
                        }</h3>
                        <Badge className={`font-bold ${getRatingColor(positionRating)}`}>
                          {positionRating.toFixed(1)}/10
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {positionPlayers.map((player) => (
                          <Card key={player.id} className="flex items-center p-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium mr-3">
                              {player.position}
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">{player.name}</p>
                              <div className="flex items-center text-xs text-gray-500">
                                <span>{player.team}</span>
                                <span className="mx-1">•</span>
                                <span>Age: {player.age}</span>
                                {player.injury_status && player.injury_status !== 'Healthy' && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <span className="text-red-500">{player.injury_status}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-lg font-bold">
                              {player.dynasty_value}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Age Distribution */}
                <div className="pt-6">
                  <h3 className="text-lg font-semibold mb-3">Age Distribution</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { age: '21-', count: team.roster.filter(p => p.age <= 21).length },
                          { age: '22-24', count: team.roster.filter(p => p.age >= 22 && p.age <= 24).length },
                          { age: '25-27', count: team.roster.filter(p => p.age >= 25 && p.age <= 27).length },
                          { age: '28-30', count: team.roster.filter(p => p.age >= 28 && p.age <= 30).length },
                          { age: '31+', count: team.roster.filter(p => p.age >= 31).length }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Players" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChartIcon className="h-5 w-5 mr-2 text-green-500" />
                Performance Trends
              </CardTitle>
              <CardDescription>
                Historical performance and projected trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Team Record Trend */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Team Performance</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { week: 1, points: 105.2 },
                          { week: 2, points: 112.8 },
                          { week: 3, points: 98.6 },
                          { week: 4, points: 122.4 },
                          { week: 5, points: 93.7 },
                          { week: 6, points: 118.5 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" label={{ value: 'Week', position: 'insideBottomRight', offset: -5 }} />
                        <YAxis label={{ value: 'Fantasy Points', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="points" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <Separator />
                
                {/* Value Trend */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Dynasty Value Trajectory</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { month: 'Jan', value: 1850 },
                          { month: 'Feb', value: 1890 },
                          { month: 'Mar', value: 1950 },
                          { month: 'Apr', value: 2050 },
                          { month: 'May', value: 1980 },
                          { month: 'Jun', value: 2100 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={['dataMin - 100', 'dataMax + 100']} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#00C49F" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-center mt-2 text-muted-foreground">
                    Dynasty value trend over the last 6 months
                  </p>
                </div>
                
                <Separator />
                
                {/* Core Player Development */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Core Players Development</h3>
                  <div className="space-y-2">
                    {team.roster
                      .filter(p => p.dynasty_value >= 75)
                      .slice(0, 4)
                      .map(player => (
                        <div key={player.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{player.name}</span>
                            <span className="text-sm">{player.team} {player.position}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                player.position === 'QB' ? 'bg-orange-500' :
                                player.position === 'RB' ? 'bg-green-500' :
                                player.position === 'WR' ? 'bg-blue-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${player.dynasty_value}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Current Value: {player.dynasty_value}</span>
                            <span>Trend: <span className="text-green-500">+5%</span></span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AITeamAnalysis;