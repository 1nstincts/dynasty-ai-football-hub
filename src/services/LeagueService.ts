
import { supabase } from '@/integrations/supabase/client';

// Define the Team interface since it's not exported from teamsSlice
interface Team {
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
}

interface StandingTeam extends Team {
  pointsFor: number;
  pointsAgainst: number;
}

export class LeagueService {
  /**
   * Fetch standings for a specific league
   */
  static async getStandings(leagueId: string): Promise<StandingTeam[]> {
    try {
      // In a real implementation, we would fetch this from Supabase
      // For now, we'll fetch players from the database to confirm it's working
      // And construct mock standings using actual player data
      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .limit(10);

      if (error) {
        console.error('Error fetching data for standings:', error);
        throw error;
      }
      
      // Create mock standings data with real player names from the database
      // In a real app, this would be real standings data
      const standingsData: StandingTeam[] = Array(8).fill(0).map((_, index) => {
        const player = players[index % players.length];
        
        return {
          id: `team-${index + 1}`,
          name: player ? `${player.full_name}'s Team` : `Team ${index + 1}`,
          userId: `user-${index + 1}`,
          leagueId,
          record: {
            wins: Math.floor(Math.random() * 10),
            losses: Math.floor(Math.random() * 10),
            ties: Math.floor(Math.random() * 3),
          },
          standings: index + 1,
          pointsFor: Math.floor(Math.random() * 1000) + 500,
          pointsAgainst: Math.floor(Math.random() * 1000) + 500,
        };
      });

      // Sort by wins (for demonstration)
      return standingsData.sort((a, b) => b.record.wins - a.record.wins);
    } catch (error) {
      console.error('Failed to get standings:', error);
      return [];
    }
  }

  /**
   * Fetch details for a specific league
   */
  static async getLeagueDetails(leagueId: string) {
    try {
      // This would fetch league details from Supabase in a real implementation
      // For now, we'll return mock data based on real player data
      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Error fetching league details:', error);
        throw error;
      }

      return {
        id: leagueId,
        name: players[0] ? `${players[0].full_name}'s Dynasty League` : `League ${leagueId}`,
        type: 'dynasty',
        size: 8,
        teams: Array(8).fill(0).map((_, i) => `team-${i + 1}`),
      };
    } catch (error) {
      console.error('Failed to get league details:', error);
      return null;
    }
  }
}

export default LeagueService;
