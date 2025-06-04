
import { supabase } from '@/integrations/supabase/client';
import { Matchup } from '@/store/slices/matchupsSlice';

export class MatchupService {
  /**
   * Fetch matchups for a specific league and week
   */
  static async getMatchups(leagueId: string, week: number): Promise<Matchup[]> {
    try {
      // Fetch games from the database for the given week
      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .eq('week', week)
        .limit(4); // Limit to 4 games for demonstration

      if (error) {
        console.error('Error fetching games:', error);
        throw error;
      }

      // If no games found, return empty array
      if (!games || games.length === 0) {
        return [];
      }

      // Fetch some players to use for team names
      const { data: players } = await supabase
        .from('players')
        .select('*')
        .limit(8);

      // Create mock matchups from real game data
      const matchups: Matchup[] = games.map((game, index) => {
        // Use players from the database for team names
        const homePlayerIndex = index * 2;
        const awayPlayerIndex = (index * 2) + 1;
        
        const homePlayerName = players && players[homePlayerIndex] 
          ? players[homePlayerIndex].full_name 
          : 'Home Team';
          
        const awayPlayerName = players && players[awayPlayerIndex] 
          ? players[awayPlayerIndex].full_name 
          : 'Away Team';

        return {
          id: game.game_id || `matchup-${index}`,
          leagueId,
          week: game.week || week,
          homeTeamId: `home-${index}`,
          awayTeamId: `away-${index}`,
          homeScore: Math.floor(Math.random() * 150) + 50,
          awayScore: Math.floor(Math.random() * 150) + 50,
          homeTeam: {
            name: `${homePlayerName}'s Team`,
          },
          awayTeam: {
            name: `${awayPlayerName}'s Team`,
          }
        };
      });

      return matchups;
    } catch (error) {
      console.error('Failed to get matchups:', error);
      return [];
    }
  }

  /**
   * Get the current week based on NFL data
   */
  static async getCurrentWeek(): Promise<number> {
    try {
      // Query to find the maximum week in our games table
      const { data, error } = await supabase
        .from('games')
        .select('week')
        .order('week', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching current week:', error);
        return 1; // Default to week 1
      }

      return data && data.length > 0 && data[0].week ? data[0].week : 1;
    } catch (error) {
      console.error('Failed to get current week:', error);
      return 1;
    }
  }
}

export default MatchupService;
