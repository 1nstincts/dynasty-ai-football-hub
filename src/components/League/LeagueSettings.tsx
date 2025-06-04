import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  SaveIcon, 
  Lock, 
  Users, 
  Settings as SettingsIcon,
  CalendarDays, 
  Trophy, 
  Ruler, 
  ClipboardList, 
  BookOpen, 
  Trash2,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LeagueService } from '@/services/LeagueService';

interface League {
  id: string;
  name: string;
  type: string;
  size: number;
  qb: number;
  rb: number;
  wr: number;
  te: number;
  flex: number;
  superflex: number;
  def: number;
  k: number;
  bench: number;
  ir: number;
  draftOrder: string;
  scoringType: string;
  playoffTeams: number;
  draftPickTrading: boolean;
  faabBudget: number;
  waiverRules: string;
  tradingEnabled: boolean;
  tradeReviewPeriod: number;
  tradeDeadline: string;
  draftDate: string;
  seasonYear: number;
  maxKeepers?: number;
  rookieDraftRounds?: number;
}

const LeagueSettings: React.FC = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // League settings
  const [league, setLeague] = useState<League>({
    id: leagueId || '',
    name: '',
    type: 'dynasty',
    size: 12,
    qb: 1,
    rb: 2,
    wr: 2,
    te: 1,
    flex: 1,
    superflex: 0,
    def: 1,
    k: 1,
    bench: 7,
    ir: 2,
    draftOrder: 'snake',
    scoringType: 'half_ppr',
    playoffTeams: 6,
    draftPickTrading: true,
    faabBudget: 100,
    waiverRules: 'faab',
    tradingEnabled: true,
    tradeReviewPeriod: 24,
    tradeDeadline: 'Week 12',
    draftDate: '',
    seasonYear: new Date().getFullYear(),
    maxKeepers: 0,
    rookieDraftRounds: 5
  });
  
  // Initialize with current league data
  useEffect(() => {
    if (!leagueId) return;
    
    const fetchLeague = async () => {
      try {
        // In a real implementation, this would fetch from an API
        // For now, we'll simulate it
        const leagueData = await LeagueService.getLeague(leagueId);
        if (leagueData) {
          setLeague(leagueData);
        }
      } catch (error) {
        console.error('Failed to fetch league:', error);
        toast({
          title: 'Error',
          description: 'Failed to load league settings.',
          variant: 'destructive',
        });
      }
    };
    
    fetchLeague();
  }, [leagueId, toast]);
  
  // Handle input changes
  const handleChange = (field: keyof League, value: any) => {
    setLeague(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };
  
  // Calculate total roster spots
  const totalRosterSpots = league.qb + league.rb + league.wr + league.te + league.flex + 
    league.superflex + league.def + league.k + league.bench + league.ir;
  
  // Save league settings
  const saveSettings = async () => {
    if (!leagueId) return;
    
    setIsSaving(true);
    try {
      // In a real implementation, this would send to an API
      await LeagueService.updateLeague(leagueId, league);
      
      toast({
        title: 'Success',
        description: 'League settings have been saved.',
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save league settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save league settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Delete league
  const deleteLeague = async () => {
    if (!leagueId) return;
    
    try {
      // In a real implementation, this would send to an API
      await LeagueService.deleteLeague(leagueId);
      
      toast({
        title: 'Success',
        description: 'League has been deleted.',
      });
      
      // Navigate back to dashboard
      navigate('/');
    } catch (error) {
      console.error('Failed to delete league:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete league.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{league.name} Settings</h1>
          <p className="text-sleeper-gray">{league.type.charAt(0).toUpperCase() + league.type.slice(1)} League • {league.size} Teams</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            disabled={!hasChanges || isSaving}
            onClick={saveSettings}
            className="bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
            {!isSaving && <SaveIcon className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-sleeper-darker border border-sleeper-border">
          <TabsTrigger value="general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="roster">
            <Users className="h-4 w-4 mr-2" />
            Roster
          </TabsTrigger>
          <TabsTrigger value="scoring">
            <ClipboardList className="h-4 w-4 mr-2" />
            Scoring
          </TabsTrigger>
          <TabsTrigger value="draft">
            <BookOpen className="h-4 w-4 mr-2" />
            Draft
          </TabsTrigger>
          <TabsTrigger value="season">
            <CalendarDays className="h-4 w-4 mr-2" />
            Season
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Ruler className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card className="bg-sleeper-dark border-sleeper-dark">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic information about your league</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="league-name">League Name</Label>
                  <Input
                    id="league-name"
                    value={league.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="bg-sleeper-darker border-sleeper-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="league-size">Number of Teams</Label>
                  <Select
                    value={league.size.toString()}
                    onValueChange={(value) => handleChange('size', parseInt(value))}
                  >
                    <SelectTrigger id="league-size" className="bg-sleeper-darker border-sleeper-border">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      {[8, 10, 12, 14, 16].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} Teams
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="league-type">League Type</Label>
                  <Select
                    value={league.type}
                    onValueChange={(value) => handleChange('type', value)}
                  >
                    <SelectTrigger id="league-type" className="bg-sleeper-darker border-sleeper-border">
                      <SelectValue placeholder="Select league type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dynasty">Dynasty</SelectItem>
                      <SelectItem value="keeper">Keeper</SelectItem>
                      <SelectItem value="redraft">Redraft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="season-year">Season Year</Label>
                  <Select
                    value={league.seasonYear.toString()}
                    onValueChange={(value) => handleChange('seasonYear', parseInt(value))}
                  >
                    <SelectTrigger id="season-year" className="bg-sleeper-darker border-sleeper-border">
                      <SelectValue placeholder="Select season year" />
                    </SelectTrigger>
                    <SelectContent>
                      {[new Date().getFullYear(), new Date().getFullYear() + 1].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year} NFL Season
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Additional settings based on league type */}
              {league.type === 'keeper' && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="max-keepers">Maximum Keepers</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="max-keepers"
                      min={1}
                      max={10}
                      step={1}
                      value={[league.maxKeepers || 3]}
                      onValueChange={(value) => handleChange('maxKeepers', value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{league.maxKeepers}</span>
                  </div>
                </div>
              )}
              
              {league.type === 'dynasty' && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="rookie-draft-rounds">Rookie Draft Rounds</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="rookie-draft-rounds"
                      min={1}
                      max={7}
                      step={1}
                      value={[league.rookieDraftRounds || 5]}
                      onValueChange={(value) => handleChange('rookieDraftRounds', value[0])}
                      className="flex-1"
                    />
                    <span className="w-12 text-center">{league.rookieDraftRounds}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Roster Settings */}
        <TabsContent value="roster">
          <Card className="bg-sleeper-dark border-sleeper-dark">
            <CardHeader>
              <CardTitle>Roster Settings</CardTitle>
              <CardDescription>Configure starting lineup and bench spots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-sleeper-gray">Total Roster Size</div>
                <Badge variant="outline" className="bg-sleeper-primary">
                  {totalRosterSpots} Players
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="qb-count">Quarterbacks (QB)</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="qb-count"
                        min={0}
                        max={3}
                        step={1}
                        value={[league.qb]}
                        onValueChange={(value) => handleChange('qb', value[0])}
                        className="flex-1"
                      />
                      <span className="w-8 text-center">{league.qb}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rb-count">Running Backs (RB)</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="rb-count"
                        min={0}
                        max={4}
                        step={1}
                        value={[league.rb]}
                        onValueChange={(value) => handleChange('rb', value[0])}
                        className="flex-1"
                      />
                      <span className="w-8 text-center">{league.rb}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="wr-count">Wide Receivers (WR)</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="wr-count"
                        min={0}
                        max={5}
                        step={1}
                        value={[league.wr]}
                        onValueChange={(value) => handleChange('wr', value[0])}
                        className="flex-1"
                      />
                      <span className="w-8 text-center">{league.wr}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="te-count">Tight Ends (TE)</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="te-count"
                        min={0}
                        max={3}
                        step={1}
                        value={[league.te]}
                        onValueChange={(value) => handleChange('te', value[0])}
                        className="flex-1"
                      />
                      <span className="w-8 text-center">{league.te}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="flex-count">FLEX (RB/WR/TE)</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="flex-count"
                        min={0}
                        max={3}
                        step={1}
                        value={[league.flex]}
                        onValueChange={(value) => handleChange('flex', value[0])}
                        className="flex-1"
                      />
                      <span className="w-8 text-center">{league.flex}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="superflex-count">Super FLEX (QB/RB/WR/TE)</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="superflex-count"
                        min={0}
                        max={2}
                        step={1}
                        value={[league.superflex]}
                        onValueChange={(value) => handleChange('superflex', value[0])}
                        className="flex-1"
                      />
                      <span className="w-8 text-center">{league.superflex}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="def-count">Defense (DEF)</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="def-count"
                        min={0}
                        max={2}
                        step={1}
                        value={[league.def]}
                        onValueChange={(value) => handleChange('def', value[0])}
                        className="flex-1"
                      />
                      <span className="w-8 text-center">{league.def}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="k-count">Kicker (K)</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="k-count"
                        min={0}
                        max={2}
                        step={1}
                        value={[league.k]}
                        onValueChange={(value) => handleChange('k', value[0])}
                        className="flex-1"
                      />
                      <span className="w-8 text-center">{league.k}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bench-count">Bench Spots</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="bench-count"
                      min={3}
                      max={15}
                      step={1}
                      value={[league.bench]}
                      onValueChange={(value) => handleChange('bench', value[0])}
                      className="flex-1"
                    />
                    <span className="w-8 text-center">{league.bench}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ir-count">IR Spots</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="ir-count"
                      min={0}
                      max={5}
                      step={1}
                      value={[league.ir]}
                      onValueChange={(value) => handleChange('ir', value[0])}
                      className="flex-1"
                    />
                    <span className="w-8 text-center">{league.ir}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Scoring Settings */}
        <TabsContent value="scoring">
          <Card className="bg-sleeper-dark border-sleeper-dark">
            <CardHeader>
              <CardTitle>Scoring Settings</CardTitle>
              <CardDescription>Configure how points are awarded in your league</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Scoring Format</Label>
                  <RadioGroup
                    value={league.scoringType}
                    onValueChange={(value) => handleChange('scoringType', value)}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2 bg-sleeper-darker p-3 rounded-md">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1">
                        <div className="font-medium">Standard</div>
                        <div className="text-xs text-sleeper-gray">No points for receptions</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-sleeper-darker p-3 rounded-md">
                      <RadioGroupItem value="half_ppr" id="half_ppr" />
                      <Label htmlFor="half_ppr" className="flex-1">
                        <div className="font-medium">Half PPR</div>
                        <div className="text-xs text-sleeper-gray">0.5 points per reception</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-sleeper-darker p-3 rounded-md">
                      <RadioGroupItem value="ppr" id="ppr" />
                      <Label htmlFor="ppr" className="flex-1">
                        <div className="font-medium">PPR</div>
                        <div className="text-xs text-sleeper-gray">1 point per reception</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-sleeper-darker p-3 rounded-md">
                      <RadioGroupItem value="te_premium" id="te_premium" />
                      <Label htmlFor="te_premium" className="flex-1">
                        <div className="font-medium">TE Premium</div>
                        <div className="text-xs text-sleeper-gray">PPR with 1.5 points per TE reception</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="pt-4">
                  <Label className="mb-2 block">Passing Settings</Label>
                  <div className="space-y-2 bg-sleeper-darker p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Passing Yards</div>
                      <div className="text-sm">1 point per 25 yards</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Passing TD</div>
                      <div className="text-sm">4 points</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Interception</div>
                      <div className="text-sm">-2 points</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Label className="mb-2 block">Rushing/Receiving Settings</Label>
                  <div className="space-y-2 bg-sleeper-darker p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Rushing Yards</div>
                      <div className="text-sm">1 point per 10 yards</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Rushing TD</div>
                      <div className="text-sm">6 points</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Receiving Yards</div>
                      <div className="text-sm">1 point per 10 yards</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Receiving TD</div>
                      <div className="text-sm">6 points</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Reception</div>
                      <div className="text-sm">
                        {league.scoringType === 'standard' ? '0 points' : 
                         league.scoringType === 'half_ppr' ? '0.5 points' : 
                         league.scoringType === 'ppr' ? '1 point' : 
                         'TE: 1.5 points, Others: 1 point'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium">Custom Scoring Settings</div>
                    <div className="text-xs text-sleeper-gray">
                      Further customize point values for specific stats
                    </div>
                  </div>
                  <Button variant="outline">
                    Customize
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Draft Settings */}
        <TabsContent value="draft">
          <Card className="bg-sleeper-dark border-sleeper-dark">
            <CardHeader>
              <CardTitle>Draft Settings</CardTitle>
              <CardDescription>Configure your league's draft options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Draft Order Type</Label>
                  <RadioGroup
                    value={league.draftOrder}
                    onValueChange={(value) => handleChange('draftOrder', value)}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2 bg-sleeper-darker p-3 rounded-md">
                      <RadioGroupItem value="snake" id="snake" />
                      <Label htmlFor="snake" className="flex-1">
                        <div className="font-medium">Snake</div>
                        <div className="text-xs text-sleeper-gray">Order reverses each round (1-10, 10-1, 1-10...)</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-sleeper-darker p-3 rounded-md">
                      <RadioGroupItem value="linear" id="linear" />
                      <Label htmlFor="linear" className="flex-1">
                        <div className="font-medium">Linear</div>
                        <div className="text-xs text-sleeper-gray">Same order each round (1-10, 1-10, 1-10...)</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-sleeper-darker p-3 rounded-md">
                      <RadioGroupItem value="random" id="random" />
                      <Label htmlFor="random" className="flex-1">
                        <div className="font-medium">Random</div>
                        <div className="text-xs text-sleeper-gray">Randomly generated on draft day</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="draft-date">Draft Date & Time</Label>
                  <Input
                    id="draft-date"
                    type="datetime-local"
                    value={league.draftDate}
                    onChange={(e) => handleChange('draftDate', e.target.value)}
                    className="bg-sleeper-darker border-sleeper-border"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="draft-pick-trading"
                    checked={league.draftPickTrading}
                    onCheckedChange={(checked) => handleChange('draftPickTrading', checked)}
                  />
                  <Label htmlFor="draft-pick-trading">
                    <div className="font-medium">Enable Draft Pick Trading</div>
                    <div className="text-xs text-sleeper-gray">Allow teams to trade draft picks before and during the draft</div>
                  </Label>
                </div>
                
                {league.type === 'dynasty' && (
                  <div className="space-y-2 pt-4">
                    <Label>Rookie Draft Settings</Label>
                    <div className="space-y-2 bg-sleeper-darker p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Rookie Draft Rounds</div>
                        <div className="text-sm">{league.rookieDraftRounds}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">Draft Order</div>
                        <div className="text-sm">Inverse of standings</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Season Settings */}
        <TabsContent value="season">
          <Card className="bg-sleeper-dark border-sleeper-dark">
            <CardHeader>
              <CardTitle>Season Settings</CardTitle>
              <CardDescription>Configure your league's season rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="playoff-teams">Playoff Teams</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="playoff-teams"
                      min={2}
                      max={8}
                      step={2}
                      value={[league.playoffTeams]}
                      onValueChange={(value) => handleChange('playoffTeams', value[0])}
                      className="flex-1"
                    />
                    <span className="w-8 text-center">{league.playoffTeams}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Waiver Rules</Label>
                  <RadioGroup
                    value={league.waiverRules}
                    onValueChange={(value) => handleChange('waiverRules', value)}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2 bg-sleeper-darker p-3 rounded-md">
                      <RadioGroupItem value="faab" id="faab" />
                      <Label htmlFor="faab" className="flex-1">
                        <div className="font-medium">FAAB (Free Agent Auction Budget)</div>
                        <div className="text-xs text-sleeper-gray">Teams bid on free agents using a budget</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-sleeper-darker p-3 rounded-md">
                      <RadioGroupItem value="waiver" id="waiver" />
                      <Label htmlFor="waiver" className="flex-1">
                        <div className="font-medium">Waiver Priority</div>
                        <div className="text-xs text-sleeper-gray">Teams get players based on waiver order</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-sleeper-darker p-3 rounded-md">
                      <RadioGroupItem value="first_come" id="first_come" />
                      <Label htmlFor="first_come" className="flex-1">
                        <div className="font-medium">First Come, First Served</div>
                        <div className="text-xs text-sleeper-gray">No waivers, free agents can be added instantly</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {league.waiverRules === 'faab' && (
                  <div className="space-y-2">
                    <Label htmlFor="faab-budget">FAAB Budget</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        id="faab-budget"
                        min={0}
                        max={1000}
                        step={10}
                        value={[league.faabBudget]}
                        onValueChange={(value) => handleChange('faabBudget', value[0])}
                        className="flex-1"
                      />
                      <span className="w-16 text-center">${league.faabBudget}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="trading-enabled"
                    checked={league.tradingEnabled}
                    onCheckedChange={(checked) => handleChange('tradingEnabled', checked)}
                  />
                  <Label htmlFor="trading-enabled">
                    <div className="font-medium">Enable Trading</div>
                    <div className="text-xs text-sleeper-gray">Allow teams to trade with each other</div>
                  </Label>
                </div>
                
                {league.tradingEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="trade-review">Trade Review Period (Hours)</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="trade-review"
                          min={0}
                          max={72}
                          step={12}
                          value={[league.tradeReviewPeriod]}
                          onValueChange={(value) => handleChange('tradeReviewPeriod', value[0])}
                          className="flex-1"
                        />
                        <span className="w-16 text-center">{league.tradeReviewPeriod}h</span>
                      </div>
                      <div className="text-xs text-sleeper-gray">
                        {league.tradeReviewPeriod === 0 
                          ? 'Trades process immediately with no review' 
                          : `Trades are held for ${league.tradeReviewPeriod} hours for review`}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="trade-deadline">Trade Deadline</Label>
                      <Select
                        value={league.tradeDeadline}
                        onValueChange={(value) => handleChange('tradeDeadline', value)}
                      >
                        <SelectTrigger id="trade-deadline" className="bg-sleeper-darker border-sleeper-border">
                          <SelectValue placeholder="Select trade deadline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Week 8">Week 8</SelectItem>
                          <SelectItem value="Week 10">Week 10</SelectItem>
                          <SelectItem value="Week 12">Week 12</SelectItem>
                          <SelectItem value="Week 14">Week 14</SelectItem>
                          <SelectItem value="None">No Deadline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Settings */}
        <TabsContent value="advanced">
          <Card className="bg-sleeper-dark border-sleeper-dark">
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Additional settings and league management options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch id="ai-managers" defaultChecked />
                  <Label htmlFor="ai-managers">
                    <div className="font-medium">Enable AI Managers</div>
                    <div className="text-xs text-sleeper-gray">Allow AI to control vacant teams</div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="ai-assistance" defaultChecked />
                  <Label htmlFor="ai-assistance">
                    <div className="font-medium">AI Trade Assistance</div>
                    <div className="text-xs text-sleeper-gray">Enable AI-powered trade suggestions and analysis</div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="auto-pilot" defaultChecked />
                  <Label htmlFor="auto-pilot">
                    <div className="font-medium">Auto-pilot for Inactive Managers</div>
                    <div className="text-xs text-sleeper-gray">AI takes over teams that are inactive for 2+ weeks</div>
                  </Label>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-red-500">Danger Zone</Label>
                  
                  <div className="space-y-4 bg-sleeper-darker border border-red-900 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Reset League</div>
                        <div className="text-xs text-sleeper-gray">Reset all teams, rosters, and draft picks</div>
                      </div>
                      <Button variant="outline" className="border-red-500 text-red-500">
                        Reset
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Delete League</div>
                        <div className="text-xs text-sleeper-gray">Permanently delete this league and all its data</div>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={() => setConfirmDelete(true)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                    
                    {confirmDelete && (
                      <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-md">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                          <div className="font-medium text-red-500">Confirm League Deletion</div>
                        </div>
                        <p className="text-sm mb-4">
                          This action cannot be undone. It will permanently delete the {league.name} league and all associated data.
                        </p>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setConfirmDelete(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={deleteLeague}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete League
                          </Button>
                        </div>
                      </div>
                    )}
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

export default LeagueSettings;