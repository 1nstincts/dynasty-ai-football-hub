import { supabase } from '../integrations/supabase/client';

// Types
export interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  age: number;
  experience: number;
  dynasty_value: number;
  redraft_value: number;
  rookie_value?: number;
  avatarUrl?: string;
}

export interface DraftPick {
  id: string;
  year: number;
  round: number;
  original_owner: string;
  current_owner: string;
  value: number;
  description: string;
}

export interface ValueSettings {
  leagueType: 'dynasty' | 'keeper' | 'redraft';
  teamCount: number;
  qbPremium: boolean;
  tePremium: boolean;
  valueFactors: {
    age: number;
    experience: number;
    position: {
      QB: number;
      RB: number;
      WR: number;
      TE: number;
    };
    talent: number;
  };
}

export interface ValueTier {
  name: string;
  min: number;
  max: number;
  color: string;
}

class DynastyValueService {
  // Default value tiers
  valueTiers: ValueTier[] = [
    { name: 'Elite', min: 90, max: 100, color: 'bg-red-500' },
    { name: 'Premium', min: 80, max: 89, color: 'bg-orange-500' },
    { name: 'High', min: 70, max: 79, color: 'bg-yellow-500' },
    { name: 'Strong', min: 60, max: 69, color: 'bg-green-500' },
    { name: 'Solid', min: 50, max: 59, color: 'bg-teal-500' },
    { name: 'Average', min: 40, max: 49, color: 'bg-blue-500' },
    { name: 'Depth', min: 30, max: 39, color: 'bg-indigo-500' },
    { name: 'Flier', min: 20, max: 29, color: 'bg-purple-500' },
    { name: 'Marginal', min: 10, max: 19, color: 'bg-pink-500' },
    { name: 'Minimal', min: 0, max: 9, color: 'bg-gray-500' }
  ];

  // Default settings
  defaultSettings: ValueSettings = {
    leagueType: 'dynasty',
    teamCount: 12,
    qbPremium: false,
    tePremium: false,
    valueFactors: {
      age: 1,
      experience: 0.8,
      position: {
        QB: 1,
        RB: 1,
        WR: 1,
        TE: 1
      },
      talent: 1
    }
  };

  /**
   * Get all players with dynasty values
   * @param position - Optional position filter
   * @returns Promise resolving to array of players with values
   */
  async getPlayersWithValues(position?: string): Promise<Player[]> {
    try {
      let query = supabase
        .from('players')
        .select('*');
      
      if (position && position !== 'all') {
        query = query.eq('position', position);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching players with values:', error);
      return [];
    }
  }

  /**
   * Search for players by name, position, or team
   * @param query - Search query string
   * @returns Promise resolving to array of matching players
   */
  async searchPlayers(query: string): Promise<Player[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .or(`name.ilike.%${query}%,position.ilike.%${query}%,team.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error searching players:', error);
      return [];
    }
  }

  /**
   * Get draft picks for a specific season
   * @param year - The draft year
   * @returns Promise resolving to array of draft picks
   */
  async getDraftPicksByYear(year: number): Promise<DraftPick[]> {
    try {
      const { data, error } = await supabase
        .from('draft_picks')
        .select('*')
        .eq('year', year);

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching draft picks:', error);
      return [];
    }
  }

  /**
   * Calculate adjusted player value based on settings
   * @param player - Player to calculate value for
   * @param settings - Value calculation settings
   * @param valueType - Type of value to calculate
   * @returns Adjusted player value (0-100)
   */
  calculateAdjustedValue(
    player: Player, 
    settings: ValueSettings = this.defaultSettings,
    valueType: 'dynasty' | 'redraft' | 'rookie' = 'dynasty'
  ): number {
    if (!player) return 0;
    
    let baseValue = valueType === 'dynasty' 
      ? player.dynasty_value 
      : valueType === 'redraft'
        ? player.redraft_value
        : player.rookie_value || player.dynasty_value;
    
    // Apply league type adjustments
    if (settings.leagueType === 'keeper' && valueType === 'dynasty') {
      // Keepers value players slightly less long term than dynasty
      baseValue = baseValue * 0.9 + player.redraft_value * 0.1;
    } else if (settings.leagueType === 'redraft' && valueType === 'dynasty') {
      // Redraft only cares about current year value
      baseValue = player.redraft_value;
    }
    
    // Apply position premium adjustments
    if (settings.qbPremium && player.position === 'QB') {
      baseValue = Math.min(100, baseValue * 1.15);
    }
    
    if (settings.tePremium && player.position === 'TE') {
      baseValue = Math.min(100, baseValue * 1.1);
    }
    
    // Apply team size adjustment
    if (settings.teamCount !== 12) {
      // Smaller leagues value top players more, larger leagues value depth more
      const teamSizeFactor = settings.teamCount < 12 
        ? 1 + ((12 - settings.teamCount) * 0.02) // Top players worth more in smaller leagues
        : 1 - ((settings.teamCount - 12) * 0.01); // Top players worth slightly less in bigger leagues
      
      if (baseValue > 70) {
        baseValue = Math.min(100, baseValue * teamSizeFactor);
      } else if (settings.teamCount > 12 && baseValue < 40) {
        // Depth players are worth more in bigger leagues
        baseValue = baseValue * (1 + ((settings.teamCount - 12) * 0.02));
      }
    }
    
    // Apply custom factors
    let adjustedValue = baseValue;
    
    // Age factor (younger players get value boost in dynasty)
    if (valueType === 'dynasty') {
      const ageAdjustment = player.position === 'RB' 
        ? Math.max(0, 1 - Math.max(0, player.age - 25) * 0.1) 
        : player.position === 'WR'
          ? Math.max(0, 1 - Math.max(0, player.age - 28) * 0.1)
          : player.position === 'TE'
            ? Math.max(0, 1 - Math.max(0, player.age - 27) * 0.1)
            : Math.max(0, 1 - Math.max(0, player.age - 30) * 0.1);
      
      adjustedValue *= (1 + (ageAdjustment - 1) * settings.valueFactors.age);
    }
    
    // Position value adjustment
    adjustedValue *= settings.valueFactors.position[player.position as keyof typeof settings.valueFactors.position];
    
    // Experience adjustment for dynasty (rookies and young players with upside)
    if (valueType === 'dynasty' && player.experience <= 3) {
      adjustedValue *= (1 + (0.1 * (3 - player.experience) * settings.valueFactors.experience));
    }
    
    // Ensure value is within 0-100 range
    return Math.max(0, Math.min(100, Math.round(adjustedValue)));
  }

  /**
   * Get the value tier for a specific value
   * @param value - Numeric value (0-100)
   * @returns Corresponding value tier
   */
  getValueTier(value: number): ValueTier {
    return this.valueTiers.find(tier => value >= tier.min && value <= tier.max) 
      || this.valueTiers[this.valueTiers.length - 1];
  }

  /**
   * Calculate pick value based on year, round, and pick position
   * @param year - Draft year
   * @param round - Round number
   * @param pickPosition - Pick position within round (early, mid, late)
   * @returns Draft pick value (0-100)
   */
  calculatePickValue(year: number, round: number, pickPosition: 'early' | 'mid' | 'late' = 'mid'): number {
    const currentYear = new Date().getFullYear();
    const yearFactor = year === currentYear ? 1 : year === currentYear + 1 ? 0.9 : 0.8;
    
    let baseValue: number;
    
    // Base values by round
    switch (round) {
      case 1: baseValue = 85; break;
      case 2: baseValue = 60; break;
      case 3: baseValue = 35; break;
      case 4: baseValue = 20; break;
      default: baseValue = 10; break;
    }
    
    // Adjust for position within round
    const positionFactor = pickPosition === 'early' ? 1.1 : pickPosition === 'late' ? 0.9 : 1;
    
    // Calculate final value
    return Math.round(baseValue * yearFactor * positionFactor);
  }
}

export default new DynastyValueService();