import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Trophy, 
  Medal, 
  Clock, 
  BarChart, 
  Users,
  Calendar,
  Sparkles,
  Hourglass,
  Dices
} from 'lucide-react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TeamHistory, 
  HistoricalMatchup, 
  HistoricalDraft, 
  HistoricalTrade,
  LeagueHistorySummary,
  RivalryData,
  leagueHistoryService
} from '@/services/LeagueHistoryService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface LeagueHistoryArchiveProps {
  leagueId: string;
}

const LeagueHistoryArchive: React.FC<LeagueHistoryArchiveProps> = ({ leagueId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [teamHistories, setTeamHistories] = useState<TeamHistory[]>([]);
  const [historicalMatchups, setHistoricalMatchups] = useState<HistoricalMatchup[]>([]);
  const [historicalDrafts, setHistoricalDrafts] = useState<HistoricalDraft[]>([]);
  const [historicalTrades, setHistoricalTrades] = useState<HistoricalTrade[]>([]);
  const [leagueHistory, setLeagueHistory] = useState<LeagueHistorySummary | null>(null);
  const [rivalryData, setRivalryData] = useState<RivalryData | null>(null);
  const [selectedTeam1, setSelectedTeam1] = useState<string>('');
  const [selectedTeam2, setSelectedTeam2] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6B6B', '#4CAF50', '#9C27B0', '#FF9800', '#607D8B'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          teamHistoriesData,
          matchupsData,
          draftsData,
          tradesData,
          historySummary
        ] = await Promise.all([
          leagueHistoryService.getTeamHistories(leagueId),
          leagueHistoryService.getHistoricalMatchups(leagueId),
          leagueHistoryService.getHistoricalDrafts(leagueId),
          leagueHistoryService.getHistoricalTrades(leagueId),
          leagueHistoryService.getLeagueHistorySummary(leagueId)
        ]);
        
        setTeamHistories(teamHistoriesData);
        setHistoricalMatchups(matchupsData);
        setHistoricalDrafts(draftsData);
        setHistoricalTrades(tradesData);
        setLeagueHistory(historySummary);
        
        // Set default selected teams for rivalry
        if (teamHistoriesData.length >= 2) {
          setSelectedTeam1(teamHistoriesData[0].teamId);
          setSelectedTeam2(teamHistoriesData[1].teamId);
          
          // Fetch rivalry data
          const rivalryDataResult = await leagueHistoryService.getRivalryData(
            leagueId, 
            teamHistoriesData[0].teamId, 
            teamHistoriesData[1].teamId
          );
          setRivalryData(rivalryDataResult);
        }
      } catch (error) {
        console.error('Error fetching league history data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [leagueId]);

  // Fetch rivalry data when selected teams change
  useEffect(() => {
    const fetchRivalryData = async () => {
      if (selectedTeam1 && selectedTeam2 && selectedTeam1 !== selectedTeam2) {
        try {
          const data = await leagueHistoryService.getRivalryData(
            leagueId,
            selectedTeam1,
            selectedTeam2
          );
          setRivalryData(data);
        } catch (error) {
          console.error('Error fetching rivalry data:', error);
        }
      }
    };
    
    fetchRivalryData();
  }, [leagueId, selectedTeam1, selectedTeam2]);

  const handleSeasonChange = (value: string) => {
    setSelectedSeason(value);
  };

  const handleTeam1Change = (value: string) => {
    setSelectedTeam1(value);
  };

  const handleTeam2Change = (value: string) => {
    setSelectedTeam2(value);
  };

  // Filter data by selected season
  const getSeasonFilteredMatchups = () => {
    if (selectedSeason === 'all') {
      return historicalMatchups;
    }
    return historicalMatchups.filter(m => m.season.toString() === selectedSeason);
  };

  const getSeasonFilteredTrades = () => {
    if (selectedSeason === 'all') {
      return historicalTrades;
    }
    return historicalTrades.filter(t => t.season.toString() === selectedSeason);
  };

  const getSeasonFilteredDrafts = () => {
    if (selectedSeason === 'all') {
      return historicalDrafts;
    }
    return historicalDrafts.filter(d => d.season.toString() === selectedSeason);
  };

  // Data for championship distribution chart
  const getChampionshipData = () => {
    return teamHistories
      .filter(team => team.championships > 0)
      .map(team => ({
        name: team.teamName,
        value: team.championships
      }));
  };

  // Data for win-loss record chart
  const getWinLossData = () => {
    return teamHistories.map(team => ({
      name: team.teamName,
      wins: team.totalWins,
      losses: team.totalLosses,
      ties: team.totalTies
    }));
  };

  // Data for points scored chart
  const getPointsData = () => {
    return teamHistories.map(team => ({
      name: team.teamName,
      pointsFor: team.totalPointsFor,
      pointsAgainst: team.totalPointsAgainst
    }));
  };

  // Data for team trends over seasons
  const getTeamTrendsData = (teamId: string) => {
    const team = teamHistories.find(t => t.teamId === teamId);
    if (!team) return [];
    
    return Object.entries(team.seasons).map(([year, record]) => ({
      year,
      wins: record.wins,
      losses: record.losses,
      pointsFor: record.pointsFor,
      standing: record.standing
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-[500px] w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">League History Archive</h1>
        
        <div className="flex items-center gap-4">
          <Select value={selectedSeason} onValueChange={handleSeasonChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              {leagueHistory?.seasons.map(season => (
                <SelectItem key={season} value={season.toString()}>
                  {season}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-sleeper-dark grid grid-cols-5 h-12 mb-6">
          <TabsTrigger value="overview" className="tab-trigger">Overview</TabsTrigger>
          <TabsTrigger value="team-history" className="tab-trigger">Team History</TabsTrigger>
          <TabsTrigger value="matchups" className="tab-trigger">Matchups</TabsTrigger>
          <TabsTrigger value="drafts" className="tab-trigger">Drafts</TabsTrigger>
          <TabsTrigger value="trades" className="tab-trigger">Trades</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* League Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  League Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Current Champion</h3>
                    <div className="flex items-center space-x-3 p-3 bg-sleeper-dark rounded-md">
                      <div className="team-avatar">
                        {leagueHistory?.currentChampion?.teamName.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-semibold">{leagueHistory?.currentChampion?.teamName}</p>
                        <p className="text-sleeper-gray text-sm">{leagueHistory?.currentChampion?.ownerName}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Most Championships</h3>
                    <div className="flex items-center space-x-3 p-3 bg-sleeper-dark rounded-md">
                      <div className="team-avatar">
                        {leagueHistory?.mostChampionships?.teamName.charAt(0) || 'M'}
                      </div>
                      <div>
                        <p className="font-semibold">{leagueHistory?.mostChampionships?.teamName}</p>
                        <p className="text-sleeper-gray text-sm">{leagueHistory?.mostChampionships?.count} Championships</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Highest Scoring Game</h3>
                    <div className="p-3 bg-sleeper-dark rounded-md">
                      <p className="font-semibold">{leagueHistory?.highestScoringGame?.teamName}</p>
                      <p className="text-sleeper-gray text-sm">
                        {leagueHistory?.highestScoringGame?.score} points in {leagueHistory?.highestScoringGame?.season} (Week {leagueHistory?.highestScoringGame?.week})
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Longest Win Streak</h3>
                    <div className="p-3 bg-sleeper-dark rounded-md">
                      <p className="font-semibold">{leagueHistory?.longestWinStreak?.teamName}</p>
                      <p className="text-sleeper-gray text-sm">
                        {leagueHistory?.longestWinStreak?.count} consecutive wins ({new Date(leagueHistory?.longestWinStreak?.startDate || '').toLocaleDateString()} - {new Date(leagueHistory?.longestWinStreak?.endDate || '').toLocaleDateString()})
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Championship Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-yellow-500" />
                  Championship Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getChampionshipData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getChampionshipData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Championship${value !== 1 ? 's' : ''}`, 'Championships']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Win-Loss Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-blue-500" />
                All-Time Win-Loss Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={getWinLossData()}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="wins" stackId="a" fill="#4CAF50" name="Wins" />
                    <Bar dataKey="losses" stackId="a" fill="#FF5252" name="Losses" />
                    <Bar dataKey="ties" stackId="a" fill="#FFC107" name="Ties" />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Points Scored */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-green-500" />
                All-Time Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart
                    data={getPointsData()}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pointsFor" fill="#2196F3" name="Points For" />
                    <Bar dataKey="pointsAgainst" fill="#FF5722" name="Points Against" />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Team Rivalry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-red-500" />
                Team Rivalry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sleeper-gray mb-1">Team 1</p>
                  <Select value={selectedTeam1} onValueChange={handleTeam1Change}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Team 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamHistories.map(team => (
                        <SelectItem key={team.teamId} value={team.teamId}>
                          {team.teamName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-xl font-bold">VS</div>
                </div>
                
                <div>
                  <p className="text-sleeper-gray mb-1">Team 2</p>
                  <Select value={selectedTeam2} onValueChange={handleTeam2Change}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Team 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamHistories.map(team => (
                        <SelectItem key={team.teamId} value={team.teamId}>
                          {team.teamName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {rivalryData && (
                <div className="space-y-4">
                  <div className="bg-sleeper-dark p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Head-to-Head Record</h3>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{rivalryData.team1Wins}</p>
                        <p className="text-sleeper-gray">Wins</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{rivalryData.ties}</p>
                        <p className="text-sleeper-gray">Ties</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{rivalryData.team2Wins}</p>
                        <p className="text-sleeper-gray">Wins</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-center">
                        <p className="text-sm">{rivalryData.team1Name}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm">{rivalryData.team2Name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-sleeper-dark p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">Last Matchup</h3>
                      <p className="text-sm text-sleeper-gray">{new Date(rivalryData.lastMatchup?.date || '').toLocaleDateString()}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-center">
                          <p className="text-xl font-bold">{rivalryData.lastMatchup?.team1Score.toFixed(2)}</p>
                          <p className="text-sm">{rivalryData.team1Name}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm">VS</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold">{rivalryData.lastMatchup?.team2Score.toFixed(2)}</p>
                          <p className="text-sm">{rivalryData.team2Name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-sleeper-gray mt-2">
                        Winner: {rivalryData.lastMatchup?.winner}
                      </p>
                    </div>
                    
                    <div className="bg-sleeper-dark p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2">Rivalry Stats</h3>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-sleeper-gray">Total Games:</span> {rivalryData.totalGames}
                        </p>
                        <p className="text-sm">
                          <span className="text-sleeper-gray">Playoff Matchups:</span> {rivalryData.playoffMatchups}
                        </p>
                        <p className="text-sm">
                          <span className="text-sleeper-gray">Championship Matchups:</span> {rivalryData.championshipMatchups}
                        </p>
                        <p className="text-sm">
                          <span className="text-sleeper-gray">Largest Victory:</span> {rivalryData.largestVictoryMargin.winningTeam} by {rivalryData.largestVictoryMargin.margin.toFixed(2)} points
                        </p>
                        <p className="text-sm">
                          <span className="text-sleeper-gray">Closest Game:</span> {rivalryData.closestMatchup.winner} by {rivalryData.closestMatchup.margin.toFixed(2)} points
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team History Tab */}
        <TabsContent value="team-history" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamHistories.map(team => (
              <Card key={team.teamId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="team-avatar">
                      {team.teamName.charAt(0)}
                    </div>
                    {team.teamName}
                  </CardTitle>
                  <CardDescription>{team.ownerName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-sleeper-dark p-2 rounded-md text-center">
                        <p className="text-xl font-bold">{team.championships}</p>
                        <p className="text-xs text-sleeper-gray">Championships</p>
                      </div>
                      <div className="bg-sleeper-dark p-2 rounded-md text-center">
                        <p className="text-xl font-bold">{team.runnerUps}</p>
                        <p className="text-xs text-sleeper-gray">Runner-Ups</p>
                      </div>
                      <div className="bg-sleeper-dark p-2 rounded-md text-center">
                        <p className="text-xl font-bold">{team.playoffAppearances}</p>
                        <p className="text-xs text-sleeper-gray">Playoff Appearances</p>
                      </div>
                    </div>
                    
                    <div className="bg-sleeper-dark p-3 rounded-md">
                      <h4 className="font-semibold mb-2">Record</h4>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">
                          <span className="text-sleeper-gray">Wins:</span> {team.totalWins}
                        </p>
                        <p className="text-sm">
                          <span className="text-sleeper-gray">Losses:</span> {team.totalLosses}
                        </p>
                        <p className="text-sm">
                          <span className="text-sleeper-gray">Ties:</span> {team.totalTies}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm">
                          <span className="text-sleeper-gray">Win %:</span> {((team.totalWins / (team.totalWins + team.totalLosses + team.totalTies)) * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm">
                          <span className="text-sleeper-gray">Best Finish:</span> {team.bestFinish}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Season History</h4>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={getTeamTrendsData(team.teamId)}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="wins" stroke="#4CAF50" name="Wins" />
                            <Line type="monotone" dataKey="standing" stroke="#FF5252" name="Standing" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-sleeper-dark p-2 rounded-md">
                        <p className="text-sm text-sleeper-gray">Longest Win Streak</p>
                        <p className="text-lg font-semibold">{team.longestWinStreak} Games</p>
                      </div>
                      <div className="bg-sleeper-dark p-2 rounded-md">
                        <p className="text-sm text-sleeper-gray">Longest Lose Streak</p>
                        <p className="text-lg font-semibold">{team.longestLoseStreak} Games</p>
                      </div>
                    </div>
                    
                    <div className="bg-sleeper-dark p-3 rounded-md">
                      <h4 className="font-semibold mb-2">Season-by-Season</h4>
                      <div className="max-h-40 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Season</TableHead>
                              <TableHead>Record</TableHead>
                              <TableHead>Finish</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(team.seasons)
                              .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                              .map(([year, record]) => (
                                <TableRow key={year}>
                                  <TableCell>{year}</TableCell>
                                  <TableCell>{record.wins}-{record.losses}{record.ties > 0 ? `-${record.ties}` : ''}</TableCell>
                                  <TableCell>{record.standing}{getSuffixForNumber(record.standing)}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Matchups Tab */}
        <TabsContent value="matchups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Historical Matchups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getSeasonFilteredMatchups()
                  .filter(matchup => matchup.matchupType === 'championship')
                  .length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Championship Games</h3>
                    <div className="space-y-2">
                      {getSeasonFilteredMatchups()
                        .filter(matchup => matchup.matchupType === 'championship')
                        .sort((a, b) => b.season - a.season)
                        .map(matchup => {
                          const team1 = teamHistories.find(t => t.teamId === matchup.team1Id);
                          const team2 = teamHistories.find(t => t.teamId === matchup.team2Id);
                          return (
                            <div key={matchup.id} className="bg-sleeper-dark p-3 rounded-md">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <div className="team-avatar mr-2">
                                    {team1?.teamName.charAt(0) || 'T'}
                                  </div>
                                  <div>
                                    <p className="font-semibold">{team1?.teamName}</p>
                                    <p className="text-xs text-sleeper-gray">{team1?.ownerName}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div className="flex items-center">
                                    <span className={`text-lg font-bold ${matchup.team1Score > matchup.team2Score ? 'text-green-500' : ''}`}>
                                      {matchup.team1Score.toFixed(2)}
                                    </span>
                                    <span className="mx-2 text-sleeper-gray">-</span>
                                    <span className={`text-lg font-bold ${matchup.team2Score > matchup.team1Score ? 'text-green-500' : ''}`}>
                                      {matchup.team2Score.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-sleeper-gray">
                                    {matchup.season} Championship
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div>
                                    <p className="font-semibold text-right">{team2?.teamName}</p>
                                    <p className="text-xs text-sleeper-gray text-right">{team2?.ownerName}</p>
                                  </div>
                                  <div className="team-avatar ml-2">
                                    {team2?.teamName.charAt(0) || 'T'}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 text-xs">
                                <span className="text-sleeper-gray">Winner: </span>
                                <span className="font-semibold">
                                  {matchup.isTie ? 'Tie' : (
                                    matchup.team1Score > matchup.team2Score ? team1?.teamName : team2?.teamName
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">All Matchups</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Season</TableHead>
                          <TableHead>Week</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Team 1</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Team 2</TableHead>
                          <TableHead>Winner</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getSeasonFilteredMatchups()
                          .sort((a, b) => b.season - a.season || b.week - a.week)
                          .slice(0, 50) // Limit to 50 matchups to prevent overloading
                          .map(matchup => {
                            const team1 = teamHistories.find(t => t.teamId === matchup.team1Id);
                            const team2 = teamHistories.find(t => t.teamId === matchup.team2Id);
                            return (
                              <TableRow key={matchup.id}>
                                <TableCell>{matchup.season}</TableCell>
                                <TableCell>{matchup.week}</TableCell>
                                <TableCell className="capitalize">
                                  {matchup.matchupType}
                                </TableCell>
                                <TableCell>{team1?.teamName}</TableCell>
                                <TableCell>
                                  {matchup.team1Score.toFixed(2)} - {matchup.team2Score.toFixed(2)}
                                </TableCell>
                                <TableCell>{team2?.teamName}</TableCell>
                                <TableCell>
                                  {matchup.isTie ? 'Tie' : (
                                    matchup.team1Score > matchup.team2Score ? team1?.teamName : team2?.teamName
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Draft History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getSeasonFilteredDrafts().map(draft => {
                  return (
                    <div key={draft.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          {draft.season} {draft.draftType === 'startup' ? 'Startup' : 'Rookie'} Draft
                        </h3>
                        <div className="text-sleeper-gray text-sm">
                          {draft.rounds} Rounds
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Round</TableHead>
                              <TableHead>Pick</TableHead>
                              <TableHead>Team</TableHead>
                              <TableHead>Player</TableHead>
                              <TableHead>Position</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {draft.picks
                              .sort((a, b) => a.round - b.round || a.pick - b.pick)
                              .map(pick => {
                                const team = teamHistories.find(t => t.teamId === pick.teamId);
                                return (
                                  <TableRow key={pick.id}>
                                    <TableCell>{pick.round}</TableCell>
                                    <TableCell>{pick.pick}</TableCell>
                                    <TableCell>{team?.teamName}</TableCell>
                                    <TableCell>{pick.playerName}</TableCell>
                                    <TableCell>{pick.position}</TableCell>
                                  </TableRow>
                                );
                              })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trades Tab */}
        <TabsContent value="trades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dices className="h-5 w-5 text-orange-500" />
                Trade History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getSeasonFilteredTrades()
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map(trade => (
                    <div key={trade.id} className="bg-sleeper-dark p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-sleeper-gray">
                          {new Date(trade.timestamp).toLocaleDateString()} (Season {trade.season}, Week {trade.week})
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trade.teams.map((team, index) => (
                          <div key={index} className="border border-border rounded-md p-3">
                            <div className="font-semibold mb-2">{team.teamName} receives:</div>
                            <div className="space-y-2">
                              {trade.teams.filter(t => t.teamId !== team.teamId).map((otherTeam, otherIndex) => (
                                <div key={otherIndex}>
                                  {otherTeam.gives.players.length > 0 && (
                                    <div>
                                      <div className="text-sm text-sleeper-gray mb-1">Players:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {otherTeam.gives.players.map((player, playerIndex) => (
                                          <div key={playerIndex} className="text-sm bg-sleeper-darker px-2 py-1 rounded">
                                            {player.name} ({player.position})
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {otherTeam.gives.picks.length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-sm text-sleeper-gray mb-1">Draft Picks:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {otherTeam.gives.picks.map((pick, pickIndex) => (
                                          <div key={pickIndex} className="text-sm bg-sleeper-darker px-2 py-1 rounded">
                                            {pick.season} Round {pick.round}
                                            {pick.originalTeam && ` (${pick.originalTeam})`}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to get ordinal suffix for numbers
function getSuffixForNumber(i: number) {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
}

export default LeagueHistoryArchive;