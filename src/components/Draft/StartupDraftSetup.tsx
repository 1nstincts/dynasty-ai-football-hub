import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { DraftService } from '@/services/DraftService';
import { DraftSettings } from '@/types/draft';
import { useToast } from '@/components/ui/use-toast';
import { Shuffle, Clock, Users, Trophy } from 'lucide-react';

interface StartupDraftSetupProps {
  leagueId: string;
  leagueSize: number;
  onStartDraft: (draftId: string) => void;
}

const StartupDraftSetup: React.FC<StartupDraftSetupProps> = ({
  leagueId,
  leagueSize,
  onStartDraft,
}) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [settings, setSettings] = useState<DraftSettings>({
    rounds: 16,
    pickTimeLimit: 90,
    draftOrder: [],
    randomizeDraftOrder: true,
    snakeDraft: true,
  });

  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    // Load available players count
    const loadPlayerCount = async () => {
      try {
        const players = await DraftService.getDraftablePlayers();
        setPlayerCount(players.length);
      } catch (error) {
        console.error('Failed to load players:', error);
      }
    };

    loadPlayerCount();
  }, []);

  const handleSettingChange = (key: keyof DraftSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreateDraft = async () => {
    setIsCreating(true);
    try {
      // Generate team IDs for the league
      const teamIds = Array.from({ length: leagueSize }, (_, i) => 
        i === 0 ? 'user-team' : `ai-team-${i}`
      );

      const draft = await DraftService.createDraft(leagueId, teamIds, settings);
      
      toast({
        title: "Draft Created!",
        description: "Your startup draft is ready to begin.",
        variant: "default",
      });

      onStartDraft(draft.id);
    } catch (error) {
      console.error('Failed to create draft:', error);
      toast({
        title: "Error Creating Draft",
        description: "Failed to create startup draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const totalPicks = leagueSize * settings.rounds;
  const estimatedDraftTime = Math.ceil((totalPicks * settings.pickTimeLimit) / 60); // minutes

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Trophy className="h-16 w-16 text-sleeper-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">Startup Draft Setup</h1>
          <p className="text-sleeper-gray text-lg">
            Before you can start playing, you need to draft your initial roster from all available NFL players.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-sleeper-dark border-sleeper-dark">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-sleeper-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{leagueSize}</div>
            <div className="text-sm text-sleeper-gray">Teams</div>
          </CardContent>
        </Card>
        
        <Card className="bg-sleeper-dark border-sleeper-dark">
          <CardContent className="pt-6 text-center">
            <Trophy className="h-8 w-8 text-sleeper-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{playerCount.toLocaleString()}</div>
            <div className="text-sm text-sleeper-gray">Available Players</div>
          </CardContent>
        </Card>
        
        <Card className="bg-sleeper-dark border-sleeper-dark">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-sleeper-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{estimatedDraftTime}</div>
            <div className="text-sm text-sleeper-gray">Est. Minutes</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-sleeper-dark border-sleeper-dark">
        <CardHeader>
          <CardTitle>Draft Settings</CardTitle>
          <CardDescription>
            Configure your startup draft preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="rounds">Draft Rounds: {settings.rounds}</Label>
                <Slider
                  value={[settings.rounds]}
                  min={10}
                  max={20}
                  step={1}
                  onValueChange={(value) => handleSettingChange('rounds', value[0])}
                  className="my-2"
                />
                <div className="flex justify-between text-xs text-sleeper-gray">
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                </div>
                <p className="text-sm text-sleeper-gray">
                  Total picks per team: {settings.rounds}
                </p>
              </div>

              <div>
                <Label htmlFor="pickTime">Pick Time Limit: {settings.pickTimeLimit}s</Label>
                <Select 
                  value={settings.pickTimeLimit.toString()} 
                  onValueChange={(value) => handleSettingChange('pickTimeLimit', parseInt(value))}
                >
                  <SelectTrigger className="bg-sleeper-darker border-border">
                    <SelectValue placeholder="Select time limit" />
                  </SelectTrigger>
                  <SelectContent className="bg-sleeper-dark border-border">
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="90">1.5 minutes</SelectItem>
                    <SelectItem value="120">2 minutes</SelectItem>
                    <SelectItem value="180">3 minutes</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-sleeper-gray mt-1">
                  Time limit for each draft pick
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="snakeDraft">Snake Draft</Label>
                  <p className="text-sm text-sleeper-gray">
                    Draft order reverses each round
                  </p>
                </div>
                <Switch
                  id="snakeDraft"
                  checked={settings.snakeDraft}
                  onCheckedChange={(checked) => handleSettingChange('snakeDraft', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="randomOrder">
                    <div className="flex items-center gap-2">
                      <Shuffle className="h-4 w-4" />
                      Randomize Draft Order
                    </div>
                  </Label>
                  <p className="text-sm text-sleeper-gray">
                    Randomly assign draft positions
                  </p>
                </div>
                <Switch
                  id="randomOrder"
                  checked={settings.randomizeDraftOrder}
                  onCheckedChange={(checked) => handleSettingChange('randomizeDraftOrder', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="bg-sleeper-darker rounded-lg p-4">
            <h3 className="font-semibold mb-2">Draft Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-sleeper-gray">Total Picks:</span>
                <span className="float-right">{totalPicks}</span>
              </div>
              <div>
                <span className="text-sleeper-gray">Estimated Time:</span>
                <span className="float-right">{estimatedDraftTime} minutes</span>
              </div>
              <div>
                <span className="text-sleeper-gray">Draft Type:</span>
                <span className="float-right">{settings.snakeDraft ? 'Snake' : 'Linear'}</span>
              </div>
              <div>
                <span className="text-sleeper-gray">Pick Time:</span>
                <span className="float-right">{settings.pickTimeLimit}s</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleCreateDraft}
              disabled={isCreating}
              className="flex-1 bg-sleeper-accent text-sleeper-dark hover:bg-sleeper-accent/90"
            >
              {isCreating ? "Creating Draft..." : "Start Startup Draft"}
            </Button>
            
            <Button
              variant="outline"
              disabled={isCreating}
              className="flex-1"
              onClick={() => {
                // In a real app, this would go back to league settings
                console.log('Cancel draft setup');
              }}
            >
              Cancel
            </Button>
          </div>

          <div className="text-xs text-sleeper-gray space-y-1">
            <p>• You'll draft against AI opponents with different strategies</p>
            <p>• All current NFL players are available in the draft pool</p>
            <p>• Your league won't be active until the draft is completed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StartupDraftSetup;