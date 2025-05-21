
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { aiService } from '../services/AIService';
import { LeagueService } from '../services/LeagueService';
import { useToast } from '@/components/ui/use-toast';

const CreateLeague = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [leagueName, setLeagueName] = useState('');
  const [leagueType, setLeagueType] = useState('dynasty');
  const [leagueSize, setLeagueSize] = useState(12);
  const [scoringType, setScoringType] = useState('ppr');
  const [aiTeamCount, setAiTeamCount] = useState(11);
  const [aiStrategies, setAiStrategies] = useState<Record<number, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  
  const maxPlayers = leagueSize - 1; // Excluding the user's team
  
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleCreateLeague();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAiStrategyChange = (index: number, strategy: string) => {
    setAiStrategies({
      ...aiStrategies,
      [index]: strategy,
    });
  };

  const handleCreateLeague = async () => {
    if (!leagueName.trim()) {
      toast({
        title: "League name required",
        description: "Please enter a name for your league",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Generate AI teams with names and strategies
      const aiTeams = Array.from({ length: aiTeamCount }).map((_, index) => ({
        name: `AI Team ${index + 1}`,
        strategy: aiStrategies[index] || 'balanced'
      }));
      
      // Create the league
      const result = await LeagueService.createLeague({
        name: leagueName,
        type: leagueType,
        size: leagueSize,
        aiTeams
      });
      
      if (result.success) {
        toast({
          title: "League Created!",
          description: `Your league "${leagueName}" has been created successfully.`,
          variant: "default",
        });
        
        // Navigate to the new league
        navigate(`/league/${result.leagueId}`);
      } else {
        toast({
          title: "Error Creating League",
          description: result.error || "Failed to create league. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating league:', error);
      toast({
        title: "Error Creating League",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Generate mock AI teams
  const aiTeams = Array.from({ length: aiTeamCount }).map((_, index) => ({
    id: `ai-${index + 1}`,
    name: `AI Team ${index + 1}`,
    strategy: aiStrategies[index] || 'balanced'
  }));

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Card className="bg-sleeper-dark border-sleeper-dark shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create New League</CardTitle>
          <CardDescription>
            Step {step} of 3: {step === 1 ? 'League Settings' : step === 2 ? 'AI Teams' : 'Review'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="leagueName">League Name</Label>
                <Input
                  id="leagueName"
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  className="bg-sleeper-darker border-border"
                  placeholder="Enter league name"
                />
              </div>
              
              <div>
                <Label htmlFor="leagueType">League Type</Label>
                <Select value={leagueType} onValueChange={setLeagueType}>
                  <SelectTrigger className="bg-sleeper-darker border-border">
                    <SelectValue placeholder="Select league type" />
                  </SelectTrigger>
                  <SelectContent className="bg-sleeper-dark border-border">
                    <SelectItem value="dynasty">Dynasty</SelectItem>
                    <SelectItem value="redraft">Redraft</SelectItem>
                    <SelectItem value="keeper">Keeper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="leagueSize">League Size: {leagueSize} teams</Label>
                <Slider
                  value={[leagueSize]}
                  min={4}
                  max={16}
                  step={2}
                  onValueChange={(value) => setLeagueSize(value[0])}
                  className="my-2"
                />
                <div className="flex justify-between text-xs text-sleeper-gray">
                  <span>4</span>
                  <span>8</span>
                  <span>12</span>
                  <span>16</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="scoringType">Scoring Type</Label>
                <Select value={scoringType} onValueChange={setScoringType}>
                  <SelectTrigger className="bg-sleeper-darker border-border">
                    <SelectValue placeholder="Select scoring type" />
                  </SelectTrigger>
                  <SelectContent className="bg-sleeper-dark border-border">
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="ppr">PPR</SelectItem>
                    <SelectItem value="half-ppr">Half PPR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="aiTeamCount">AI Teams: {aiTeamCount} teams</Label>
                <Slider
                  value={[aiTeamCount]}
                  min={0}
                  max={maxPlayers}
                  step={1}
                  onValueChange={(value) => setAiTeamCount(value[0])}
                  className="my-2"
                />
                <div className="flex justify-between text-xs text-sleeper-gray">
                  <span>0</span>
                  <span>{Math.floor(maxPlayers / 2)}</span>
                  <span>{maxPlayers}</span>
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sleeper-gray">Configure AI teams and their strategies</p>
              
              {aiTeams.map((team, index) => (
                <div key={team.id} className="flex items-center border-b border-sleeper-darker pb-3">
                  <div className="team-avatar mr-3">AI</div>
                  <div className="flex-1">
                    <Input
                      value={team.name}
                      onChange={(e) => {/* In a real app, update team name */}}
                      className="bg-sleeper-darker border-border mb-1"
                    />
                  </div>
                  <div className="ml-3 w-1/3">
                    <Select 
                      value={team.strategy} 
                      onValueChange={(value) => handleAiStrategyChange(index, value)}
                    >
                      <SelectTrigger className="bg-sleeper-darker border-border">
                        <SelectValue placeholder="Strategy" />
                      </SelectTrigger>
                      <SelectContent className="bg-sleeper-dark border-border">
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="rebuilding">Rebuilding</SelectItem>
                        <SelectItem value="win_now">Win Now</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              
              {aiTeamCount === 0 && (
                <div className="text-center py-8">
                  <p className="text-sleeper-gray">No AI teams configured</p>
                </div>
              )}
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <div className="border border-sleeper-darker rounded p-4">
                <h3 className="font-semibold mb-2">League Settings</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-sleeper-gray">Name:</div>
                  <div>{leagueName || 'Unnamed League'}</div>
                  
                  <div className="text-sleeper-gray">Type:</div>
                  <div>{leagueType.charAt(0).toUpperCase() + leagueType.slice(1)}</div>
                  
                  <div className="text-sleeper-gray">Size:</div>
                  <div>{leagueSize} teams</div>
                  
                  <div className="text-sleeper-gray">Scoring:</div>
                  <div>{scoringType.toUpperCase()}</div>
                  
                  <div className="text-sleeper-gray">AI Teams:</div>
                  <div>{aiTeamCount} teams</div>
                </div>
              </div>
              
              {aiTeamCount > 0 && (
                <div className="border border-sleeper-darker rounded p-4">
                  <h3 className="font-semibold mb-2">AI Teams</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {aiTeams.map(team => (
                      <div key={team.id} className="flex justify-between text-sm">
                        <div>{team.name}</div>
                        <div className="text-sleeper-accent">{team.strategy.charAt(0).toUpperCase() + team.strategy.slice(1)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack} disabled={isCreating}>
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate('/')} disabled={isCreating}>
                Cancel
              </Button>
            )}
            
            <Button 
              onClick={handleNext}
              className="bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90"
              disabled={isCreating}
            >
              {isCreating ? 
                "Creating..." : 
                (step === 3 ? 'Create League' : 'Next')
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateLeague;
