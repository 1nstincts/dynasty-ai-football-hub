import { supabase } from '../integrations/supabase/client';

// Types for our schedule service
export interface Team {
  id: string;
  name: string;
  owner: string;
  logo?: string;
}

export interface Game {
  id: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: Team;
  awayTeam?: Team;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'in_progress' | 'final';
  startTime?: string;
  seasonYear: number;
  leagueId: string;
}

export interface Schedule {
  id: string;
  leagueId: string;
  seasonYear: number;
  regularSeasonWeeks: number;
  playoffWeeks: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleGeneratorOptions {
  leagueId: string;
  seasonYear: number;
  regularSeasonWeeks: number;
  playoffWeeks: number;
  balanceDivisions?: boolean;
  randomizeMatchups?: boolean;
  avoidBackToBack?: boolean;
}

class ScheduleService {
  /**
   * Get a list of all teams in a league
   * @param leagueId - The ID of the league
   * @returns Promise resolving to array of teams
   */
  async getTeamsByLeagueId(leagueId: string): Promise<Team[]> {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', leagueId);

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  }

  /**
   * Generate a new schedule for a league
   * @param options - Schedule generation options
   * @returns Promise resolving to the generated schedule
   */
  async generateSchedule(options: ScheduleGeneratorOptions): Promise<{ schedule: Schedule; games: Game[] } | null> {
    try {
      // First, create the schedule record
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .insert({
          league_id: options.leagueId,
          season_year: options.seasonYear,
          regular_season_weeks: options.regularSeasonWeeks,
          playoff_weeks: options.playoffWeeks,
        })
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      if (!scheduleData) {
        throw new Error('Failed to create schedule');
      }

      // Get all teams in the league
      const teams = await this.getTeamsByLeagueId(options.leagueId);
      
      if (teams.length === 0) {
        throw new Error('No teams found in this league');
      }

      // Generate game matchups
      const games: Omit<Game, 'id'>[] = [];
      
      // Simple algorithm to generate a round-robin schedule
      for (let week = 1; week <= options.regularSeasonWeeks; week++) {
        // Create a copy of teams array to work with
        let weekTeams = [...teams];
        
        // Shuffle teams if randomizeMatchups is enabled
        if (options.randomizeMatchups) {
          weekTeams = this.shuffleArray(weekTeams);
        }
        
        // Create matchups for this week
        for (let i = 0; i < weekTeams.length - 1; i += 2) {
          const homeTeam = weekTeams[i];
          const awayTeam = weekTeams[i + 1];
          
          if (homeTeam && awayTeam) {
            games.push({
              week,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              status: 'scheduled',
              leagueId: options.leagueId,
              seasonYear: options.seasonYear,
              startTime: this.getGameStartTime(week, options.seasonYear),
            });
          }
        }
      }
      
      // Insert all the generated games
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .insert(games)
        .select();

      if (gamesError) throw gamesError;
      
      return {
        schedule: {
          id: scheduleData.id,
          leagueId: scheduleData.league_id,
          seasonYear: scheduleData.season_year,
          regularSeasonWeeks: scheduleData.regular_season_weeks,
          playoffWeeks: scheduleData.playoff_weeks,
          createdAt: scheduleData.created_at,
          updatedAt: scheduleData.updated_at,
        },
        games: gamesData as Game[],
      };
    } catch (error) {
      console.error('Error generating schedule:', error);
      return null;
    }
  }

  /**
   * Get a league's schedule by ID
   * @param leagueId - The ID of the league
   * @param seasonYear - Optional season year filter
   * @returns Promise resolving to the schedule
   */
  async getScheduleByLeagueId(leagueId: string, seasonYear?: number): Promise<Schedule | null> {
    try {
      let query = supabase
        .from('schedules')
        .select('*')
        .eq('league_id', leagueId);
      
      if (seasonYear) {
        query = query.eq('season_year', seasonYear);
      }
      
      // Order by most recent
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query.limit(1).single();

      if (error) throw error;
      
      if (!data) return null;
      
      return {
        id: data.id,
        leagueId: data.league_id,
        seasonYear: data.season_year,
        regularSeasonWeeks: data.regular_season_weeks,
        playoffWeeks: data.playoff_weeks,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return null;
    }
  }

  /**
   * Get all games for a specific schedule
   * @param scheduleId - The ID of the schedule
   * @param week - Optional week number to filter by
   * @returns Promise resolving to array of games
   */
  async getGamesByScheduleId(scheduleId: string, week?: number): Promise<Game[]> {
    try {
      const schedule = await supabase
        .from('schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();
      
      if (schedule.error || !schedule.data) {
        throw new Error('Schedule not found');
      }
      
      let query = supabase
        .from('games')
        .select(`
          *,
          homeTeam:home_team_id(id, name, owner, logo),
          awayTeam:away_team_id(id, name, owner, logo)
        `)
        .eq('league_id', schedule.data.league_id)
        .eq('season_year', schedule.data.season_year);
      
      if (week) {
        query = query.eq('week', week);
      }
      
      const { data, error } = await query.order('week', { ascending: true });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  }

  /**
   * Update live scores for a game
   * @param gameId - The ID of the game to update
   * @param homeScore - The home team's score
   * @param awayScore - The away team's score
   * @param status - The game status
   * @returns Promise resolving to the updated game
   */
  async updateGameScores(
    gameId: string, 
    homeScore: number, 
    awayScore: number, 
    status: 'scheduled' | 'in_progress' | 'final' = 'in_progress'
  ): Promise<Game | null> {
    try {
      const { data, error } = await supabase
        .from('games')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gameId)
        .select()
        .single();

      if (error) throw error;
      
      return data as Game;
    } catch (error) {
      console.error('Error updating game scores:', error);
      return null;
    }
  }

  // Helper methods
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  private getGameStartTime(week: number, year: number): string {
    // NFL season typically starts in September (month 8, 0-indexed)
    // Week 1 is usually the first Sunday in September
    // This is a simplified calculation
    const firstSunday = new Date(year, 8, 1 + (7 - new Date(year, 8, 1).getDay()) % 7);
    const gameDate = new Date(firstSunday);
    gameDate.setDate(firstSunday.getDate() + (week - 1) * 7);
    return gameDate.toISOString();
  }
}

export default new ScheduleService();