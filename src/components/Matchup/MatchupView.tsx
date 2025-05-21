
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MatchupService } from '@/services/MatchupService';
import { Matchup } from '@/store/slices/matchupsSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface MatchupViewProps {
  leagueId: string;
  week: number;
  onChangeWeek: (week: number) => void;
}

const MatchupView: React.FC<MatchupViewProps> = ({ leagueId, week, onChangeWeek }) => {
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [maxWeek, setMaxWeek] = useState(17); // Default to 17 weeks
  const { toast } = useToast();

  useEffect(() => {
    const fetchMatchups = async () => {
      setIsLoading(true);
      try {
        // Get the current week from our service (based on real data)
        const currentWeek = await MatchupService.getCurrentWeek();
        setMaxWeek(currentWeek);
        
        // Get matchups for the specified week
        const data = await MatchupService.getMatchups(leagueId, week);
        setMatchups(data);
      } catch (error) {
        console.error("Failed to fetch matchups:", error);
        toast({
          title: "Error Loading Matchups",
          description: "Could not load matchups data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchups();
  }, [leagueId, week, toast]);

  const handlePreviousWeek = () => {
    if (week > 1) {
      onChangeWeek(week - 1);
    }
  };

  const handleNextWeek = () => {
    if (week < maxWeek) {
      onChangeWeek(week + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Matchups</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePreviousWeek} 
              disabled={week <= 1}
              className="p-1 rounded hover:bg-sleeper-dark disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-medium">
              Week {week}
            </span>
            <button 
              onClick={handleNextWeek} 
              disabled={week >= maxWeek}
              className="p-1 rounded hover:bg-sleeper-dark disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {Array(3).fill(0).map((_, index) => (
            <div key={index} className="fantasy-card">
              <div className="flex justify-between p-4">
                <Skeleton className="h-12 w-1/3" />
                <div className="flex items-center px-4">
                  <Skeleton className="h-6 w-8" />
                </div>
                <Skeleton className="h-12 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Matchups</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePreviousWeek} 
            disabled={week <= 1}
            className="p-1 rounded hover:bg-sleeper-dark disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-medium">
            Week {week}
          </span>
          <button 
            onClick={handleNextWeek} 
            disabled={week >= maxWeek}
            className="p-1 rounded hover:bg-sleeper-dark disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {matchups.length > 0 ? (
          matchups.map(matchup => (
            <div key={matchup.id} className="fantasy-card">
              <div className="flex justify-between">
                <div className="flex-1 p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="team-avatar mr-3">
                      {matchup.homeTeam?.name.charAt(0) || 'H'}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{matchup.homeTeam?.name}</div>
                      <div className="text-xs text-sleeper-gray">0-0</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold">
                    {matchup.homeScore !== null ? matchup.homeScore.toFixed(2) : '0.00'}
                  </div>
                </div>

                <div className="flex items-center px-4 text-sleeper-gray">VS</div>

                <div className="flex-1 p-4 flex items-center justify-between">
                  <div className="text-xl font-bold">
                    {matchup.awayScore !== null ? matchup.awayScore.toFixed(2) : '0.00'}
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-3">
                      <div className="font-semibold">{matchup.awayTeam?.name}</div>
                      <div className="text-xs text-sleeper-gray">0-0</div>
                    </div>
                    <div className="team-avatar">
                      {matchup.awayTeam?.name.charAt(0) || 'A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-sleeper-dark mt-2 pt-2 text-xs text-sleeper-gray px-4 pb-2">
                <div className="flex justify-between">
                  <span>Yet to play (2 QB, 2 RB, 3 WR, TE, K, DEF)</span>
                  <span>Yet to play (2 QB, 2 RB, 3 WR, TE, K, DEF)</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-sleeper-dark rounded-lg p-8 text-center">
            <p className="text-sleeper-gray">No matchups scheduled for this week</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchupView;
