import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DraftService } from '@/services/DraftService';
import { Draft, DraftablePlayer } from '@/types/draft';
import { useToast } from '@/components/ui/use-toast';
import { Clock, Search, User, Trophy } from 'lucide-react';

interface DraftRoomProps {
  draftId: string;
  onDraftComplete: () => void;
}

const DraftRoom: React.FC<DraftRoomProps> = ({ draftId, onDraftComplete }) => {
  const { toast } = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<DraftablePlayer[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<DraftablePlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(90);

  useEffect(() => {
    const loadDraftData = async () => {
      try {
        // Load players and existing picks
        const [players, existingPicks] = await Promise.all([
          DraftService.getDraftablePlayers(draftId),
          DraftService.getDraftPicks(draftId)
        ]);
        
        setAvailablePlayers(players);
        setFilteredPlayers(players.filter(p => !p.isDrafted));
        
        // Create mock draft state - in real implementation this would be stored
        const leagueSize = 8; // This should come from league settings
        const rounds = 16;
        const draftOrder = Array.from({ length: leagueSize }, (_, i) => 
          i === 0 ? 'user-team' : `ai-team-${i}`
        );
        
        const currentOverallPick = existingPicks.length + 1;
        const currentRound = Math.ceil(currentOverallPick / leagueSize);
        const pickInRound = ((currentOverallPick - 1) % leagueSize) + 1;
        
        // Determine current team (snake draft logic)
        let currentTeamIndex;
        if (currentRound % 2 === 1) {
          // Odd rounds: normal order
          currentTeamIndex = pickInRound - 1;
        } else {
          // Even rounds: reverse order
          currentTeamIndex = leagueSize - pickInRound;
        }
        
        const mockDraft: Draft = {
          id: draftId,
          leagueId: 'league-1',
          status: currentOverallPick > (leagueSize * rounds) ? 'completed' : 'in_progress',
          currentPick: currentOverallPick,
          currentRound,
          currentTeamId: draftOrder[currentTeamIndex],
          settings: {
            rounds,
            pickTimeLimit: 90,
            draftOrder,
            randomizeDraftOrder: true,
            snakeDraft: true,
          },
          picks: existingPicks,
        };
        
        setDraft(mockDraft);
        setTimeRemaining(mockDraft.settings.pickTimeLimit);
        
        // If draft is complete, notify parent
        if (mockDraft.status === 'completed') {
          onDraftComplete();
        }
      } catch (error) {
        console.error('Failed to load draft data:', error);
        toast({
          title: "Error Loading Draft",
          description: "Failed to load draft data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDraftData();
  }, [draftId, toast, onDraftComplete]);

  useEffect(() => {
    // Filter players based on search and position
    let filtered = availablePlayers.filter(player => !player.isDrafted);
    
    if (searchQuery) {
      filtered = filtered.filter(player =>
        player.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedPosition !== 'ALL') {
      filtered = filtered.filter(player => player.position === selectedPosition);
    }

    // Sort by ADP
    filtered.sort((a, b) => (a.adp || 999) - (b.adp || 999));
    
    setFilteredPlayers(filtered);
  }, [availablePlayers, searchQuery, selectedPosition]);

  useEffect(() => {
    // Draft timer
    if (draft?.status === 'in_progress' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-pick for user if time runs out
            handleAutoPick();
            return draft.settings.pickTimeLimit;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [draft, timeRemaining]);\n\n  // AI auto-pick effect\n  useEffect(() => {\n    if (draft?.status === 'in_progress' && draft.currentTeamId !== 'user-team') {\n      // AI turn - auto pick after 2-5 seconds\n      const aiDelay = Math.random() * 3000 + 2000;\n      const aiTimer = setTimeout(async () => {\n        const recommendation = await DraftService.getAIRecommendation(\n          draft.id, \n          draft.currentTeamId, \n          availablePlayers,\n          draft.currentRound\n        );\n        \n        if (recommendation && !recommendation.isDrafted) {\n          await handlePlayerSelect(recommendation);\n        }\n      }, aiDelay);\n      \n      return () => clearTimeout(aiTimer);\n    }\n  }, [draft?.currentTeamId, draft?.currentPick, availablePlayers]);

  const handlePlayerSelect = async (player: DraftablePlayer) => {
    if (!draft || player.isDrafted) return;

    try {
      const currentRound = draft.currentRound;
      const leagueSize = draft.settings.draftOrder.length;
      const pickInRound = ((draft.currentPick - 1) % leagueSize) + 1;
      
      // Make the pick
      await DraftService.makePick(draft.id, player.player_id, draft.currentTeamId, {
        round: currentRound,
        pick: pickInRound,
        overallPick: draft.currentPick
      });
      
      toast({
        title: "Player Drafted!",
        description: `You drafted ${player.full_name}`,
        variant: "default",
      });

      // Reload draft data to get updated state
      window.location.reload(); // Simple approach - in production would update state properly

    } catch (error) {
      console.error('Failed to make pick:', error);
      toast({
        title: "Draft Error",
        description: error instanceof Error ? error.message : "Failed to make pick. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAutoPick = async () => {
    if (!draft) return;

    try {
      const recommendation = await DraftService.getAIRecommendation(
        draft.id, 
        draft.currentTeamId, 
        availablePlayers,
        draft.currentRound
      );

      if (recommendation) {
        await handlePlayerSelect(recommendation);
        toast({
          title: "Auto-Pick",
          description: `Time expired. Auto-drafted ${recommendation.full_name}`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Failed to auto-pick:', error);
    }
  };

  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <h2 className="text-xl font-bold text-red-500">Draft Not Found</h2>
        <p className="text-sleeper-gray">The draft could not be loaded.</p>
      </div>
    );
  }

  const isUserTurn = draft.currentTeamId === 'user-team';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Draft Header */}
      <Card className="bg-sleeper-dark border-sleeper-dark">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Startup Draft</h1>
              <p className="text-sleeper-gray">
                Round {draft.currentRound} • Pick {draft.currentPick}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-sleeper-accent">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-sleeper-gray">Time Remaining</div>
              </div>
              
              <div className={`px-4 py-2 rounded-lg ${
                isUserTurn ? 'bg-sleeper-accent text-sleeper-dark' : 'bg-sleeper-darker'
              }`}>
                <div className="flex items-center gap-2">
                  {isUserTurn ? <User className="h-4 w-4" /> : <Trophy className="h-4 w-4" />}
                  <span className="font-semibold">
                    {isUserTurn ? "Your Turn" : "AI Picking..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Selection */}
        <div className="lg:col-span-2">
          <Card className="bg-sleeper-dark border-sleeper-dark">
            <CardHeader>
              <CardTitle>Available Players</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sleeper-gray" />
                    <Input
                      placeholder="Search players..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-sleeper-darker border-border"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {positions.map(pos => (
                    <Button
                      key={pos}
                      variant={selectedPosition === pos ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPosition(pos)}
                      className={selectedPosition === pos ? "bg-sleeper-accent text-sleeper-dark" : ""}
                    >
                      {pos}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPlayers.slice(0, 100).map(player => (
                  <div
                    key={player.player_id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      player.isDrafted 
                        ? 'border-sleeper-darker bg-sleeper-darker/50 opacity-50 cursor-not-allowed'
                        : isUserTurn 
                          ? 'border-sleeper-darker hover:border-sleeper-accent cursor-pointer'
                          : 'border-sleeper-darker cursor-not-allowed'
                    }`}
                    onClick={() => isUserTurn && !player.isDrafted && handlePlayerSelect(player)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`w-12 justify-center ${
                          player.position === 'QB' ? 'bg-red-600 text-white' :
                          player.position === 'RB' ? 'bg-green-600 text-white' :
                          player.position === 'WR' ? 'bg-blue-600 text-white' :
                          player.position === 'TE' ? 'bg-orange-600 text-white' :
                          player.position === 'K' ? 'bg-purple-600 text-white' :
                          'bg-yellow-600 text-black'
                        }`}
                      >
                        {player.position}
                      </Badge>
                      <div>
                        <div className={`font-semibold ${player.isDrafted ? 'line-through' : ''}`}>
                          {player.full_name}
                        </div>
                        <div className="text-sm text-sleeper-gray">{player.team}</div>
                        {player.isDrafted && (
                          <div className="text-xs text-red-400">DRAFTED</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-sleeper-gray">ADP</div>
                      <div className="font-semibold">{Math.round(player.adp || 999)}</div>
                    </div>
                  </div>
                ))}
                
                {filteredPlayers.length === 0 && (
                  <div className="text-center py-8 text-sleeper-gray">
                    No players found matching your criteria
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Draft Board */}
        <div>
          <Card className="bg-sleeper-dark border-sleeper-dark">
            <CardHeader>
              <CardTitle>Recent Picks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {draft.picks.length === 0 ? (
                  <div className="text-center py-8 text-sleeper-gray">
                    Draft hasn't started yet
                  </div>
                ) : (
                  draft.picks.slice(-10).reverse().map(pick => (
                    <div key={pick.id} className="flex justify-between items-center p-2 border border-sleeper-darker rounded">
                      <div>
                        <div className="font-semibold text-sm">{pick.playerName}</div>
                        <div className="text-xs text-sleeper-gray">
                          {pick.isUserPick ? 'Your Team' : `AI Team ${pick.teamId.replace('ai-team-', '')}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-sleeper-gray">#{pick.overallPick}</div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            pick.position === 'QB' ? 'bg-red-600 text-white' :
                            pick.position === 'RB' ? 'bg-green-600 text-white' :
                            pick.position === 'WR' ? 'bg-blue-600 text-white' :
                            pick.position === 'TE' ? 'bg-orange-600 text-white' :
                            pick.position === 'K' ? 'bg-purple-600 text-white' :
                            'bg-yellow-600 text-black'
                          }`}
                        >
                          {pick.position}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DraftRoom;