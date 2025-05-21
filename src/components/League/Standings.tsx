
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LeagueService } from '@/services/LeagueService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

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

  useEffect(() => {
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
  }, [safeLeagueId, toast]);

  if (isLoading) {
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Standings</h2>

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
