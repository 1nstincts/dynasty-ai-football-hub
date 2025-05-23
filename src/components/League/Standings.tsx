
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LeagueService } from '@/services/LeagueService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { shouldDisplayStandings, getSeasonStatusMessage, formatSeasonDate, getNextSeasonStart, getCurrentSeasonInfo } from '@/lib/seasonUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

// Define StandingTeam interface matching the one in LeagueService
interface StandingTeam {
  id: string;
  name: string;
  userId: string;
  leagueId: string;
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  standings: number;
  avatar?: string;
  pointsFor: number;
  pointsAgainst: number;
}

const Standings: React.FC = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const [standings, setStandings] = useState<StandingTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Ensure leagueId is always a string
  const safeLeagueId = leagueId || '1';
  
  // Get season information
  const seasonInfo = getCurrentSeasonInfo();
  const showStandings = shouldDisplayStandings();
  const statusMessage = getSeasonStatusMessage();
  const nextSeasonStart = getNextSeasonStart();

  useEffect(() => {
    // Only fetch standings if the season has started
    if (!showStandings) {
      setIsLoading(false);
      return;
    }

    const fetchStandings = async () => {
      setIsLoading(true);
      try {
        const data = await LeagueService.getStandings(safeLeagueId);
        setStandings(data as StandingTeam[]);
      } catch (error) {
        console.error("Failed to fetch standings:", error);
        toast({
          title: "Error Loading Standings",
          description: "Could not load league standings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStandings();
  }, [safeLeagueId, toast, showStandings]);

  if (isLoading && showStandings) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Standings</h2>
        <div className="fantasy-card">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="player-row grid grid-cols-12">
              <Skeleton className="col-span-1 h-6 w-8" />
              <Skeleton className="col-span-6 h-6" />
              <Skeleton className="col-span-1 h-6 w-8" />
              <Skeleton className="col-span-1 h-6 w-8" />
              <Skeleton className="col-span-1 h-6 w-8" />
              <Skeleton className="col-span-1 h-6 w-8" />
              <Skeleton className="col-span-1 h-6 w-8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show season status message when standings shouldn't be displayed
  if (!showStandings) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Standings</h2>
        
        <Card className="bg-sleeper-dark border-sleeper-dark">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {seasonInfo.status === 'offseason' ? (
                <Calendar className="h-12 w-12 text-sleeper-accent" />
              ) : (
                <Clock className="h-12 w-12 text-sleeper-accent" />
              )}
            </div>
            <CardTitle className="text-lg text-sleeper-gray">
              Standings Not Available
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sleeper-gray">
              {statusMessage}
            </p>
            
            {!seasonInfo.hasStarted && (
              <div className="bg-sleeper-darker rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-sleeper-accent mr-2" />
                  <span className="font-semibold">Next Season Starts</span>
                </div>
                <p className="text-lg text-sleeper-accent font-bold">
                  {formatSeasonDate(nextSeasonStart)}
                </p>
              </div>
            )}
            
            <div className="text-sm text-sleeper-gray space-y-2">
              <p>• Dynasty leagues: Manage your roster year-round</p>
              <p>• Player values and trades remain active</p>
              <p>• Prepare for the upcoming season!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Standings</h2>
        <div className="text-sm text-sleeper-accent">
          {seasonInfo.year} Season • {seasonInfo.status.charAt(0).toUpperCase() + seasonInfo.status.slice(1)}
        </div>
      </div>

      <div className="fantasy-card">
        <div className="text-xs text-sleeper-gray px-4 py-2 border-b border-sleeper-dark grid grid-cols-12">
          <div className="col-span-1">Rank</div>
          <div className="col-span-6">Team</div>
          <div className="col-span-1 text-center">W</div>
          <div className="col-span-1 text-center">L</div>
          <div className="col-span-1 text-center">T</div>
          <div className="col-span-1 text-center">PF</div>
          <div className="col-span-1 text-center">PA</div>
        </div>

        {standings.map((team, index) => (
          <div key={team.id} className="player-row grid grid-cols-12">
            <div className="col-span-1 flex items-center">
              {index + 1}
            </div>
            <div className="col-span-6 flex items-center">
              <div className="team-avatar mr-3">
                {team.name.charAt(0)}
              </div>
              <span className="font-medium">{team.name}</span>
            </div>
            <div className="col-span-1 text-center">{team.record.wins}</div>
            <div className="col-span-1 text-center">{team.record.losses}</div>
            <div className="col-span-1 text-center">{team.record.ties}</div>
            <div className="col-span-1 text-center">{team.pointsFor}</div>
            <div className="col-span-1 text-center">{team.pointsAgainst}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Standings;
