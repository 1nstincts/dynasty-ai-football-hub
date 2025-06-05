
export interface Matchup {
  id: string;
  league_id: string;
  week: number;
  team1_id: string;
  team2_id: string;
  team1_score: number;
  team2_score: number;
  status: 'pending' | 'active' | 'completed';
}
