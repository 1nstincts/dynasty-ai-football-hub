import { supabase } from '@/integrations/supabase/client';
import { Draft, DraftPick, DraftSettings, DraftablePlayer, LeagueStatus } from '@/types/draft';

export class DraftService {
  /**
   * Get the league status to determine if draft is needed
   */
  static async getLeagueStatus(leagueId: string): Promise<LeagueStatus> {
    try {
      // For now, return mock data. In real implementation, this would check database
      return {
        id: `status-${leagueId}`,
        leagueId,
        hasDrafted: false, // Always false for new leagues
        currentPhase: 'setup',
      };
    } catch (error) {
      console.error('Failed to get league status:', error);
      throw error;
    }
  }

  /**
   * Get all draftable players from the database
   */
  static async getDraftablePlayers(draftId?: string): Promise<DraftablePlayer[]> {
    try {
      // Get all active players
      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .eq('is_active', true)
        .order('dynasty_adp', { ascending: true, nullsLast: true });

      // Get already drafted players for this draft if draftId provided
      let draftedPlayerIds: string[] = [];
      if (draftId) {
        const { data: draftPicks, error: draftError } = await supabase
          .from('draft_picks')
          .select('player_id')
          .eq('draft_id', draftId);
        
        if (!draftError && draftPicks) {
          draftedPlayerIds = draftPicks.map(pick => pick.player_id);
        }
      }

      // Convert to DraftablePlayer format
      return players.map(player => ({
        player_id: player.player_id,
        full_name: player.full_name || 'Unknown Player',
        position: player.position || 'N/A',
        team: player.team || 'FA',
        isDrafted: draftedPlayerIds.includes(player.player_id),
        adp: player.dynasty_adp || this.calculateMockADP(player.position, player.full_name),
      }));
    } catch (error) {
      console.error('Failed to get draftable players:', error);
      return [];
    }
  }

  /**
   * Calculate mock Average Draft Position for AI logic
   */
  private static calculateMockADP(position: string, name: string): number {
    const positionRanks = {
      'QB': { base: 150, variance: 50 },
      'RB': { base: 80, variance: 60 },
      'WR': { base: 100, variance: 80 },
      'TE': { base: 180, variance: 40 },
      'K': { base: 250, variance: 20 },
      'DEF': { base: 240, variance: 20 },
    };

    const posRank = positionRanks[position as keyof typeof positionRanks] || positionRanks['WR'];
    
    // Add some randomness based on name hash for consistency
    const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomFactor = (nameHash % 100) / 100; // 0-1
    
    return posRank.base + (randomFactor * posRank.variance);
  }

  /**
   * Create a new draft for a league
   */
  static async createDraft(leagueId: string, teamIds: string[], settings: Partial<DraftSettings> = {}): Promise<Draft> {
    try {
      const defaultSettings: DraftSettings = {
        rounds: 16, // Standard dynasty draft
        pickTimeLimit: 90, // 90 seconds per pick
        draftOrder: settings.randomizeDraftOrder !== false ? this.randomizeDraftOrder(teamIds) : teamIds,
        randomizeDraftOrder: true,
        snakeDraft: true,
        ...settings,
      };

      const totalPicks = teamIds.length * defaultSettings.rounds;
      const picks: DraftPick[] = [];

      // Generate all draft picks
      for (let round = 1; round <= defaultSettings.rounds; round++) {
        const roundOrder = defaultSettings.snakeDraft && round % 2 === 0 
          ? [...defaultSettings.draftOrder].reverse() 
          : defaultSettings.draftOrder;

        roundOrder.forEach((teamId, pickIndex) => {
          const overallPick = (round - 1) * teamIds.length + pickIndex + 1;
          picks.push({
            id: `pick-${overallPick}`,
            round,
            pick: pickIndex + 1,
            overallPick,
            teamId,
            teamName: `Team ${teamId}`,
            isUserPick: teamId === 'user-team', // Assume user is 'user-team'
          });
        });
      }

      const draft: Draft = {
        id: `draft-${leagueId}-${Date.now()}`,
        leagueId,
        status: 'not_started',
        currentPick: 1,
        currentRound: 1,
        currentTeamId: defaultSettings.draftOrder[0],
        settings: defaultSettings,
        picks,
      };

      return draft;
    } catch (error) {
      console.error('Failed to create draft:', error);
      throw error;
    }
  }

  /**
   * Randomize draft order
   */
  private static randomizeDraftOrder(teamIds: string[]): string[] {
    const shuffled = [...teamIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Start a draft
   */
  static async startDraft(draftId: string): Promise<Draft> {
    try {
      // In real implementation, this would update the database
      // For now, just return a mock started draft
      const draft = await this.getDraft(draftId);
      return {
        ...draft,
        status: 'in_progress',
        startTime: new Date(),
      };
    } catch (error) {
      console.error('Failed to start draft:', error);
      throw error;
    }
  }

  /**
   * Get draft picks for a draft
   */
  static async getDraftPicks(draftId: string): Promise<DraftPick[]> {
    try {
      const { data: picks, error } = await supabase
        .from('draft_picks')
        .select(`
          *,
          players!inner(full_name, position, team)
        `)
        .eq('draft_id', draftId)
        .order('overall_pick');

      if (error) {
        console.error('Error fetching draft picks:', error);
        throw error;
      }

      return picks.map(pick => ({
        id: pick.id,
        round: pick.round,
        pick: pick.pick,
        overallPick: pick.overall_pick,
        teamId: pick.team_id,
        teamName: `Team ${pick.team_id}`,
        playerId: pick.player_id,
        playerName: pick.players.full_name,
        position: pick.players.position,
        nflTeam: pick.players.team,
        pickTime: pick.pick_time ? new Date(pick.pick_time) : undefined,
        isUserPick: pick.team_id === 'user-team',
      }));
    } catch (error) {
      console.error('Failed to get draft picks:', error);
      return [];
    }
  }

  /**
   * Make a draft pick
   */
  static async makePick(draftId: string, playerId: string, teamId: string, pickInfo: { round: number, pick: number, overallPick: number }): Promise<boolean> {
    try {
      // Check if player is already drafted
      const { data: existingPick, error: checkError } = await supabase
        .from('draft_picks')
        .select('id')
        .eq('draft_id', draftId)
        .eq('player_id', playerId)
        .single();

      if (existingPick) {
        throw new Error('Player already drafted');
      }

      // Make the pick
      const { error: insertError } = await supabase
        .from('draft_picks')
        .insert({
          draft_id: draftId,
          team_id: teamId,
          player_id: playerId,
          round: pickInfo.round,
          pick: pickInfo.pick,
          overall_pick: pickInfo.overallPick,
          pick_time: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error inserting draft pick:', insertError);
        throw insertError;
      }

      console.log(`Team ${teamId} successfully drafted player ${playerId} (Overall pick ${pickInfo.overallPick})`);
      return true;
    } catch (error) {
      console.error('Failed to make pick:', error);
      throw error;
    }
  }

  /**
   * Get AI recommendation for current pick
   */
  static async getAIRecommendation(draftId: string, teamId: string, availablePlayers: DraftablePlayer[], currentRound: number): Promise<DraftablePlayer | null> {
    try {
      const available = availablePlayers.filter(p => !p.isDrafted);
      if (available.length === 0) return null;

      // Get current team's roster to determine positional needs
      const teamPicks = await this.getDraftPicks(draftId);
      const teamPlayers = teamPicks.filter(pick => pick.teamId === teamId);
      
      // Count positions already drafted
      const positionCounts = teamPlayers.reduce((acc, pick) => {
        acc[pick.position || 'UNKNOWN'] = (acc[pick.position || 'UNKNOWN'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Positional priority based on round
      let positionPriority: string[];
      if (currentRound <= 3) {
        positionPriority = ['RB', 'WR', 'QB', 'TE'];
      } else if (currentRound <= 8) {
        positionPriority = ['WR', 'RB', 'TE', 'QB'];
      } else {
        positionPriority = ['WR', 'RB', 'TE', 'QB', 'K', 'DEF'];
      }

      // Find best available player considering positional needs
      for (const position of positionPriority) {
        const positionPlayers = available
          .filter(p => p.position === position)
          .sort((a, b) => (a.adp || 999) - (b.adp || 999));
        
        if (positionPlayers.length > 0) {
          // Consider if we already have enough at this position
          const currentAtPosition = positionCounts[position] || 0;
          const maxAtPosition = position === 'QB' ? 3 : position === 'TE' ? 2 : position === 'K' ? 1 : position === 'DEF' ? 1 : 6;
          
          if (currentAtPosition < maxAtPosition) {
            return positionPlayers[0];
          }
        }
      }
      
      // Fallback: best available by ADP
      available.sort((a, b) => (a.adp || 999) - (b.adp || 999));
      return available[0];
    } catch (error) {
      console.error('Failed to get AI recommendation:', error);
      return null;
    }
  }

  /**
   * Update league status after draft completion
   */
  static async completeDraft(leagueId: string, draftId: string): Promise<void> {
    try {
      // Get all draft picks
      const picks = await this.getDraftPicks(draftId);
      
      // Create team rosters from draft picks
      const rosterInserts = picks.map(pick => ({
        league_id: leagueId,
        team_id: pick.teamId,
        player_id: pick.playerId!,
        position_type: pick.position,
      }));

      if (rosterInserts.length > 0) {
        const { error: rosterError } = await supabase
          .from('team_rosters')
          .insert(rosterInserts);

        if (rosterError) {
          console.error('Error creating team rosters:', rosterError);
          throw rosterError;
        }
      }
      
      console.log(`Draft ${draftId} completed for league ${leagueId}. Created ${rosterInserts.length} roster entries.`);
    } catch (error) {
      console.error('Failed to complete draft:', error);
      throw error;
    }
  }
}