import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  BarChart,
  Calendar,
  Clock,
  Info,
  LineChart,
  RefreshCw,
  TrendingUp,
  User
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  projectedPoints: number;
  impactScore: number;
  reasonForImpact: string;
}

export const MatchupProbabilityForecast: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('projections');
  
  // Mock data
  const teamA = {
    name: "Touchdown Titans",
    owner: "John Smith",
    winProbability: 62,
    projectedPoints: 142.8,
    players: [
      {
        id: "1",
        name: "Patrick Mahomes",
        position: "QB",
        team: "KC",
        projectedPoints: 28.7,
        impactScore: 92,
        reasonForImpact: "Favorable matchup against weak secondary, expected high passing volume."
      },
      {
        id: "2",
        name: "Justin Jefferson",
        position: "WR",
        team: "MIN",
        projectedPoints: 22.4,
        impactScore: 88,
        reasonForImpact: "High target share, returning from injury with strong practice reports."
      },
      {
        id: "3",
        name: "Saquon Barkley",
        position: "RB",
        team: "PHI",
        projectedPoints: 19.6,
        impactScore: 85,
        reasonForImpact: "Facing a bottom 5 run defense, expected high workload."
      }
    ]
  };
  
  const teamB = {
    name: "Gridiron Giants",
    owner: "Sarah Johnson",
    winProbability: 38,
    projectedPoints: 124.3,
    players: [
      {
        id: "4",
        name: "Ja'Marr Chase",
        position: "WR",
        team: "CIN",
        projectedPoints: 21.2,
        impactScore: 86,
        reasonForImpact: "High ceiling but facing tough cornerback matchup."
      },
      {
        id: "5",
        name: "Josh Allen",
        position: "QB",
        team: "BUF",
        projectedPoints: 26.5,
        impactScore: 84,
        reasonForImpact: "Dual-threat upside with rushing floor, weather concerns."
      },
      {
        id: "6",
        name: "Travis Kelce",
        position: "TE",
        team: "KC",
        projectedPoints: 16.8,
        impactScore: 75,
        reasonForImpact: "Strong red zone target share but facing top TE defense."
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Matchup Probability Forecast</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main matchup card */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <CardTitle>Week 8 Matchup Forecast</CardTitle>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Projections
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-5 w-5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Projections are based on historical performance, recent trends, matchup data, and injury reports.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold">{teamA.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start">
                  <User className="h-3 w-3 mr-1" /> {teamA.owner}
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-4 md:gap-10">
                  <div className="text-3xl font-bold text-green-600">{teamA.winProbability}%</div>
                  <div className="text-lg">vs</div>
                  <div className="text-3xl font-bold text-red-600">{teamB.winProbability}%</div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Win Probability</p>
                
                <div className="w-full max-w-md mt-4">
                  <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600 rounded-full" 
                      style={{ width: `${teamA.winProbability}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <h3 className="text-xl font-bold">{teamB.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-end">
                  <User className="h-3 w-3 mr-1" /> {teamB.owner}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-between mt-6">
              <div className="flex-1 text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center">
                  <BarChart className="h-4 w-4 mr-1" /> Projected Points
                </div>
                <div className="text-3xl font-bold">{teamA.projectedPoints.toFixed(1)}</div>
              </div>
              
              <div className="flex flex-col justify-center items-center">
                <div className="text-sm font-medium">Matchup Details</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Sunday, 1:00 PM
                  <Clock className="h-3 w-3 ml-2" /> 3h 15m
                </div>
              </div>
              
              <div className="flex-1 text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center">
                  <BarChart className="h-4 w-4 mr-1" /> Projected Points
                </div>
                <div className="text-3xl font-bold">{teamB.projectedPoints.toFixed(1)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Team tabs */}
        <div className="col-span-1 lg:col-span-3">
          <Tabs defaultValue="projections" className="w-full" onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="projections">
                <BarChart className="h-4 w-4 mr-2" />
                Projections
              </TabsTrigger>
              <TabsTrigger value="trends">
                <LineChart className="h-4 w-4 mr-2" />
                Matchup Trends
              </TabsTrigger>
              <TabsTrigger value="key-players">
                <TrendingUp className="h-4 w-4 mr-2" />
                Key Players
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="projections" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team A players */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{teamA.name} Key Players</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {teamA.players.map(player => (
                      <PlayerProjectionCard key={player.id} player={player} />
                    ))}
                  </CardContent>
                </Card>
                
                {/* Team B players */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{teamB.name} Key Players</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {teamB.players.map(player => (
                      <PlayerProjectionCard key={player.id} player={player} />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="trends" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historical Matchup Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Historical performance data and head-to-head records would be displayed here.
                  </p>
                  <div className="h-60 flex items-center justify-center border border-dashed rounded-md">
                    <p className="text-muted-foreground">Trend visualization would appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="key-players" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Impact Players Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Detailed analysis of key players who will likely determine the outcome of this matchup.
                  </p>
                  <div className="h-60 flex items-center justify-center border border-dashed rounded-md">
                    <p className="text-muted-foreground">Player impact analysis would appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Helper component for player projection cards
const PlayerProjectionCard: React.FC<{player: Player}> = ({player}) => {
  return (
    <div className="border rounded-lg p-4 mb-4 last:mb-0">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-bold">{player.name}</div>
          <div className="text-xs text-gray-500">
            {player.position} • {player.team}
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
    </div>
  );
};