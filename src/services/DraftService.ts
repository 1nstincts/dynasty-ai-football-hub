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
  static async getDraftablePlayers(): Promise<DraftablePlayer[]> {
    try {
      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .order('full_name');

      if (error) {
        console.error('Error fetching draftable players:', error);
        throw error;
      }

      // Convert to DraftablePlayer format and add draft status
      return players.map(player => ({
        player_id: player.player_id,
        full_name: player.full_name || 'Unknown Player',
        position: player.position || 'N/A',
        team: player.team || 'FA',
        isDrafted: false,
        adp: this.calculateMockADP(player.position, player.full_name),
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
   * Get draft by ID
   */
  static async getDraft(draftId: string): Promise<Draft> {
    try {
      // Mock implementation - in real app, fetch from database
      throw new Error('Draft not found - this is a mock implementation');
    } catch (error) {
      console.error('Failed to get draft:', error);
      throw error;
    }
  }

  /**
   * Make a draft pick
   */
  static async makePick(draftId: string, playerId: string, teamId: string): Promise<Draft> {
    try {
      // In real implementation, this would:
      // 1. Validate it's the correct team's turn
      // 2. Validate player is available
      // 3. Update the draft with the pick
      // 4. Move to next pick
      // 5. Trigger AI picks if needed
      
      console.log(`Team ${teamId} drafts player ${playerId} in draft ${draftId}`);
      
      // For now, return mock updated draft
      throw new Error('Pick making not implemented yet - this is a mock');
    } catch (error) {
      console.error('Failed to make pick:', error);
      throw error;
    }
  }

  /**
   * Get AI recommendation for current pick
   */
  static async getAIRecommendation(draftId: string, teamId: string, availablePlayers: DraftablePlayer[]): Promise<DraftablePlayer | null> {
    try {
      // Simple AI logic: pick best available player by ADP
      const available = availablePlayers.filter(p => !p.isDrafted);
      if (available.length === 0) return null;

      // Sort by ADP (lower is better)
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
      // In real implementation, this would:
      // 1. Mark draft as completed
      // 2. Update league status to 'active'
      // 3. Generate initial rosters from draft results
      
      console.log(`Draft ${draftId} completed for league ${leagueId}`);
    } catch (error) {
      console.error('Failed to complete draft:', error);
      throw error;
    }
  }
}