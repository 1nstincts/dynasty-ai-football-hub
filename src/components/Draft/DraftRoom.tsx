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
        // In a real implementation, this would load actual draft data
        const players = await DraftService.getDraftablePlayers();
        setAvailablePlayers(players);
        setFilteredPlayers(players);
        
        // Mock draft for demonstration
        const mockDraft: Draft = {
          id: draftId,
          leagueId: 'league-1',
          status: 'in_progress',
          currentPick: 1,
          currentRound: 1,
          currentTeamId: 'user-team',
          settings: {
            rounds: 16,
            pickTimeLimit: 90,
            draftOrder: ['user-team', 'ai-team-1', 'ai-team-2'],
            randomizeDraftOrder: true,
            snakeDraft: true,
          },
          picks: [],
        };
        
        setDraft(mockDraft);
        setTimeRemaining(mockDraft.settings.pickTimeLimit);
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
  }, [draftId, toast]);

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
  }, [draft, timeRemaining]);

  const handlePlayerSelect = async (player: DraftablePlayer) => {
    if (!draft) return;

    try {
      // Make the pick
      await DraftService.makePick(draft.id, player.player_id, draft.currentTeamId);
      
      toast({
        title: "Player Drafted!",
        description: `You drafted ${player.full_name}`,
        variant: "default",
      });

      // Update available players
      setAvailablePlayers(prev => 
        prev.map(p => 
          p.player_id === player.player_id 
            ? { ...p, isDrafted: true, draftedBy: draft.currentTeamId }
            : p
        )
      );

      // Move to next pick (simplified logic)
      if (draft.currentPick >= draft.settings.draftOrder.length * draft.settings.rounds) {
        // Draft complete
        onDraftComplete();
      } else {
        // Next pick logic would go here
        setTimeRemaining(draft.settings.pickTimeLimit);
      }

    } catch (error) {
      console.error('Failed to make pick:', error);
      toast({
        title: "Draft Error",
        description: "Failed to make pick. Please try again.",
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
        availablePlayers
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
                {filteredPlayers.slice(0, 50).map(player => (
                  <div
                    key={player.player_id}
                    className="flex items-center justify-between p-3 border border-sleeper-darker rounded-lg hover:border-sleeper-accent transition-colors cursor-pointer"
                    onClick={() => isUserTurn && handlePlayerSelect(player)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-12 justify-center">
                        {player.position}
                      </Badge>
                      <div>
                        <div className="font-semibold">{player.full_name}</div>
                        <div className="text-sm text-sleeper-gray">{player.team}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-sleeper-gray">ADP</div>
                      <div className="font-semibold">{Math.round(player.adp || 0)}</div>
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
                    No picks yet
                  </div>
                ) : (
                  draft.picks.slice(-10).reverse().map(pick => (
                    <div key={pick.id} className="flex justify-between items-center p-2 border border-sleeper-darker rounded">
                      <div>
                        <div className="font-semibold text-sm">{pick.playerName}</div>
                        <div className="text-xs text-sleeper-gray">{pick.teamName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-sleeper-gray">R{pick.round}.{pick.pick}</div>
                        <Badge variant="outline" className="text-xs">
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