import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '../ui/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import ScheduleService, { Team, Game, Schedule, ScheduleGeneratorOptions } from '../../services/ScheduleService';

const ScheduleGenerator: React.FC = () => {
  const { toast } = useToast();
  const { leagues } = useSelector((state: RootState) => state.leagues);
  const [teams, setTeams] = useState<Team[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');
  const [formData, setFormData] = useState<ScheduleGeneratorOptions>({
    leagueId: '',
    seasonYear: new Date().getFullYear(),
    regularSeasonWeeks: 14,
    playoffWeeks: 3,
    balanceDivisions: true,
    randomizeMatchups: true,
    avoidBackToBack: true
  });

  // Fetch teams for the selected league
  useEffect(() => {
    const fetchTeams = async () => {
      if (!formData.leagueId) return;
      
      setLoading(true);
      try {
        const leagueTeams = await ScheduleService.getTeamsByLeagueId(formData.leagueId);
        setTeams(leagueTeams);
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast({
          title: "Error",
          description: "Failed to fetch teams for this league.",
          variant: "destructive",
        });
        // Use mock data if the API fails
        setTeams([
          { id: '1', name: 'Dynasty Dragons', owner: 'John Smith' },
          { id: '2', name: 'Fantasy Falcons', owner: 'Emily Johnson' },
          { id: '3', name: 'Touchdown Titans', owner: 'Michael Brown' },
          { id: '4', name: 'Gridiron Giants', owner: 'Sarah Davis' },
          { id: '5', name: 'Field Goal Phoenixes', owner: 'David Wilson' },
          { id: '6', name: 'Playoff Patriots', owner: 'Jessica Martinez' },
          { id: '7', name: 'Championship Chiefs', owner: 'Robert Taylor' },
          { id: '8', name: 'Super Bowl Saints', owner: 'Jennifer Anderson' },
          { id: '9', name: 'Comeback Colts', owner: 'Christopher Thomas' },
          { id: '10', name: 'Winning Warriors', owner: 'Amanda Garcia' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, [formData.leagueId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const generateSchedule = async () => {
    if (!formData.leagueId) {
      toast({
        title: "Error",
        description: "Please select a league first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Call the schedule service to generate a new schedule
      const result = await ScheduleService.generateSchedule(formData);
      
      if (!result) {
        throw new Error('Failed to generate schedule');
      }
      
      const { schedule: newSchedule, games: newGames } = result;
      
      // Set the schedule and games in state
      setSchedule(newSchedule);
      setGames(newGames);
      setActiveTab('view');
      
      toast({
        title: "Schedule Generated",
        description: `Created ${newGames.length} games across ${formData.regularSeasonWeeks} weeks.`,
      });
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to generate schedule. Using mock data instead.",
        variant: "destructive",
      });
      
      // Fall back to mock data if the API call fails
      const mockGames: Game[] = [];
      
      // Simple algorithm to generate a round-robin schedule
      for (let week = 1; week <= formData.regularSeasonWeeks; week++) {
        // Shuffle teams for each week if randomizeMatchups is enabled
        const weekTeams = [...teams];
        if (formData.randomizeMatchups) {
          for (let i = weekTeams.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [weekTeams[i], weekTeams[j]] = [weekTeams[j], weekTeams[i]];
          }
        }
        
        // Create matchups
        for (let i = 0; i < weekTeams.length; i += 2) {
          if (i + 1 < weekTeams.length) {
            mockGames.push({
              id: `game-${week}-${i/2}`,
              week,
              homeTeamId: weekTeams[i].id,
              awayTeamId: weekTeams[i + 1].id,
              homeTeam: weekTeams[i],
              awayTeam: weekTeams[i + 1],
              status: 'scheduled',
              homeScore: Math.floor(Math.random() * 150),
              awayScore: Math.floor(Math.random() * 150),
              startTime: new Date(formData.seasonYear, 8, week * 7).toISOString(),
              seasonYear: formData.seasonYear,
              leagueId: formData.leagueId
            });
          }
        }
      }
      
      const mockSchedule: Schedule = {
        id: `schedule-${Date.now()}`,
        leagueId: formData.leagueId,
        seasonYear: formData.seasonYear,
        regularSeasonWeeks: formData.regularSeasonWeeks,
        playoffWeeks: formData.playoffWeeks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setSchedule(mockSchedule);
      setGames(mockGames);
      setActiveTab('view');
    } finally {
      setLoading(false);
    }
  };

  const exportSchedule = () => {
    if (!schedule || !games.length) return;
    
    const csvContent = [
      ['Week', 'Home Team', 'Away Team', 'Date', 'Time', 'Status', 'Home Score', 'Away Score'].join(','),
      ...games.map(game => [
        game.week,
        game.homeTeam?.name || 'Unknown Team',
        game.awayTeam?.name || 'Unknown Team',
        game.startTime ? new Date(game.startTime).toLocaleDateString() : 'TBD',
        game.startTime ? new Date(game.startTime).toLocaleTimeString() : 'TBD',
        game.status,
        game.homeScore || '0',
        game.awayScore || '0'
      ].join(','))
    ].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `schedule-${schedule.seasonYear}.csv`);
    link.click();
    
    toast({
      title: "Schedule Exported",
      description: "Schedule data has been exported as CSV file.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Schedule Generator</TabsTrigger>
          <TabsTrigger value="view" disabled={!schedule}>View Schedule</TabsTrigger>
          <TabsTrigger value="live" disabled={!schedule}>Live Scores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>League Schedule Generator</CardTitle>
              <CardDescription>
                Create a balanced schedule for your fantasy football league
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leagueId">League ID</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('leagueId', value)}
                    defaultValue={formData.leagueId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a league" />
                    </SelectTrigger>
                    <SelectContent>
                      {leagues.length > 0 ? (
                        leagues.map(league => (
                          <SelectItem key={league.id} value={league.id}>
                            {league.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>No leagues available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seasonYear">Season Year</Label>
                  <Input
                    id="seasonYear"
                    name="seasonYear"
                    type="number"
                    value={formData.seasonYear}
                    onChange={handleNumberChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="regularSeasonWeeks">Regular Season Weeks</Label>
                  <Input
                    id="regularSeasonWeeks"
                    name="regularSeasonWeeks"
                    type="number"
                    min="1"
                    max="17"
                    value={formData.regularSeasonWeeks}
                    onChange={handleNumberChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="playoffWeeks">Playoff Weeks</Label>
                  <Input
                    id="playoffWeeks"
                    name="playoffWeeks"
                    type="number"
                    min="1"
                    max="4"
                    value={formData.playoffWeeks}
                    onChange={handleNumberChange}
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Schedule Options</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="balanceDivisions">Balance Division Matchups</Label>
                    <Switch
                      id="balanceDivisions"
                      checked={formData.balanceDivisions}
                      onCheckedChange={(checked) => handleSwitchChange('balanceDivisions', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="randomizeMatchups">Randomize Matchups</Label>
                    <Switch
                      id="randomizeMatchups"
                      checked={formData.randomizeMatchups}
                      onCheckedChange={(checked) => handleSwitchChange('randomizeMatchups', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="avoidBackToBack">Avoid Back-to-Back Matchups</Label>
                    <Switch
                      id="avoidBackToBack"
                      checked={formData.avoidBackToBack}
                      onCheckedChange={(checked) => handleSwitchChange('avoidBackToBack', checked)}
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={generateSchedule} 
                disabled={loading || !formData.leagueId}
                className="w-full"
              >
                {loading ? "Generating Schedule..." : "Generate Schedule"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>League Schedule</CardTitle>
                <CardDescription>
                  {schedule ? `${schedule.seasonYear} Season - ${schedule.regularSeasonWeeks} Week Regular Season` : 'No schedule generated'}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={exportSchedule} disabled={!schedule}>
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {schedule && games.length > 0 ? (
                <div className="space-y-4">
                  <Select 
                    defaultValue="all" 
                    onValueChange={(value) => console.log(value)}
                  >
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Filter by week" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Weeks</SelectItem>
                      {Array.from({length: schedule.regularSeasonWeeks}, (_, i) => i + 1).map(week => (
                        <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Week</TableHead>
                          <TableHead>Home Team</TableHead>
                          <TableHead>Away Team</TableHead>
                          <TableHead className="hidden md:table-cell">Date</TableHead>
                          <TableHead className="hidden md:table-cell">Time</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {games.map((game) => (
                          <TableRow key={game.id}>
                            <TableCell>{game.week}</TableCell>
                            <TableCell>{game.homeTeam?.name || 'Team ' + game.homeTeamId}</TableCell>
                            <TableCell>{game.awayTeam?.name || 'Team ' + game.awayTeamId}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {game.startTime ? new Date(game.startTime).toLocaleDateString() : 'TBD'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {game.startTime ? new Date(game.startTime).toLocaleTimeString() : 'TBD'}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`px-2 py-1 rounded text-xs ${
                                game.status === 'scheduled' 
                                  ? 'bg-gray-200 text-gray-800' 
                                  : game.status === 'in_progress'
                                    ? 'bg-green-200 text-green-800'
                                    : 'bg-blue-200 text-blue-800'
                              }`}>
                                {game.status === 'scheduled' 
                                  ? 'Scheduled' 
                                  : game.status === 'in_progress'
                                    ? 'Live'
                                    : 'Final'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-gray-500 mb-4">No schedule has been generated yet.</p>
                  <Button onClick={() => setActiveTab('generator')}>
                    Go to Schedule Generator
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Game Stats</CardTitle>
              <CardDescription>
                Real-time fantasy football game scores and stats
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedule && games.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {games.slice(0, 5).map((game) => (
                      <Card key={game.id} className="overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 text-white">
                          <div className="flex justify-between items-center">
                            <span>Week {game.week}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              game.status === 'scheduled' 
                                ? 'bg-gray-200 text-gray-800' 
                                : game.status === 'in_progress'
                                  ? 'bg-green-200 text-green-800'
                                  : 'bg-blue-200 text-blue-800'
                            }`}>
                              {game.status === 'scheduled' 
                                ? 'Scheduled' 
                                : game.status === 'in_progress'
                                  ? 'Live'
                                  : 'Final'}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-0">
                          <div className="flex flex-col">
                            <div className="flex justify-between items-center p-4 border-b">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                                <div>
                                  <p className="font-semibold">{game.homeTeam?.name || 'Team ' + game.homeTeamId}</p>
                                  <p className="text-sm text-gray-500">{game.homeTeam?.owner || 'Unknown Owner'}</p>
                                </div>
                              </div>
                              <div className="text-2xl font-bold">{game.homeScore || '0'}</div>
                            </div>
                            <div className="flex justify-between items-center p-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                                <div>
                                  <p className="font-semibold">{game.awayTeam?.name || 'Team ' + game.awayTeamId}</p>
                                  <p className="text-sm text-gray-500">{game.awayTeam?.owner || 'Unknown Owner'}</p>
                                </div>
                              </div>
                              <div className="text-2xl font-bold">{game.awayScore || '0'}</div>
                            </div>
                          </div>
                          {game.status === 'in_progress' && (
                            <div className="p-4 border-t bg-gray-50">
                              <h4 className="font-medium text-sm mb-2">Live Updates</h4>
                              <div className="space-y-2">
                                <div className="text-xs text-gray-600">
                                  T. Hill just scored a 45-yard TD for {game.homeTeam?.name || 'Home Team'}! +10.5 pts
                                </div>
                                <div className="text-xs text-gray-600">
                                  J. Jefferson with a 23-yard reception for {game.awayTeam?.name || 'Away Team'}. +2.3 pts
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-center">
                    <Button variant="outline">Load More Games</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScheduleGenerator;