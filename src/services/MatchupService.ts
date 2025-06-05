
import { Matchup } from '@/types/matchup';

class MatchupService {
  async getMatchups(leagueId: string, week?: number): Promise<Matchup[]> {
    // Mock implementation
    return [];
  }

  async getMatchupById(matchupId: string): Promise<Matchup | null> {
    // Mock implementation
    return {
      id: matchupId,
      league_id: 'mock-league',
      week: 1,
      team1_id: 'team1',
      team2_id: 'team2',
      team1_score: 0,
      team2_score: 0,
      status: 'pending'
    };
  }
}

export default new MatchupService();
