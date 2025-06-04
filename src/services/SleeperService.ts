import { Player } from '@/store/slices/playersSlice';

interface SleeperPlayer {
  player_id: string;
  full_name: string;
  position: string;
  team: string;
  age?: number;
  years_exp?: number;
  college?: string;
  injury_status?: string;
  weight?: string;
  height?: string;
  birth_date?: string;
  active?: boolean;
  number?: number;
}

interface SleeperStats {
  pts_ppr?: number;
  rush_att?: number;
  rush_yd?: number;
  rush_td?: number;
  rec?: number;
  rec_tgt?: number;
  rec_yd?: number;
  rec_td?: number;
  pass_att?: number;
  pass_cmp?: number;
  pass_yd?: number;
  pass_td?: number;
  pass_int?: number;
  [key: string]: number | undefined;
}

interface SleeperTrendingPlayer {
  player_id: string;
  count: number;
}

/**
 * Service for interacting with the Sleeper API to get NFL player data
 */
interface SleeperNewsItem {
  player_id: string;
  source: string;
  title: string;
  description: string;
  timestamp: number;
  source_id: string;
  source_url: string;
  news_id: string;
  injury_status?: string;
}

export interface PlayerNews {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  source: string;
  sourceUrl: string;
  injuryStatus?: string;
}

export class SleeperService {
  private static readonly BASE_URL = 'https://api.sleeper.app/v1';
  
  /**
   * Fetch all NFL players from Sleeper API
   */
  static async getAllPlayers(): Promise<Player[]> {
    try {
      // Get players data
      const response = await fetch(`${this.BASE_URL}/players/nfl`);
      if (!response.ok) throw new Error('Failed to fetch players from Sleeper');
      
      const data: Record<string, SleeperPlayer> = await response.json();
      
      // Transform data to match our Player interface
      const players: Player[] = Object.values(data)
        .filter(player => player.active && player.position) // Only active players with valid positions
        .map(player => this.convertToPlayerFormat(player));
      
      return players;
    } catch (error) {
      console.error('Error fetching players from Sleeper:', error);
      return [];
    }
  }
  
  /**
   * Get trending/most added players
   */
  static async getTrendingPlayers(limit: number = 25): Promise<Player[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/players/nfl/trending/add?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch trending players');
      
      const trendingData: SleeperTrendingPlayer[] = await response.json();
      
      // First get all players to have the complete data
      const allPlayersResponse = await fetch(`${this.BASE_URL}/players/nfl`);
      if (!allPlayersResponse.ok) throw new Error('Failed to fetch all players');
      
      const allPlayersData: Record<string, SleeperPlayer> = await allPlayersResponse.json();
      
      // Map trending player IDs to full player data
      const trendingPlayers: Player[] = trendingData
        .filter(item => allPlayersData[item.player_id]) // Ensure player exists in all players
        .map(item => {
          const player = this.convertToPlayerFormat(allPlayersData[item.player_id]);
          // Add trending information
          return {
            ...player,
            trending: {
              value: item.count,
              direction: 'up',
              percentage: Math.min(item.count / 10, 100) // Normalize to percentage
            }
          };
        });
      
      return trendingPlayers;
    } catch (error) {
      console.error('Error fetching trending players:', error);
      return [];
    }
  }
  
  /**
   * Get player stats for a specific week and season
   */
  static async getPlayerStats(season: number = 2023, week: number = 1): Promise<Record<string, PlayerStats>> {
    try {
      const response = await fetch(`${this.BASE_URL}/stats/nfl/regular/${season}/${week}`);
      if (!response.ok) throw new Error(`Failed to fetch stats for season ${season} week ${week}`);
      
      const statsData: Record<string, SleeperStats> = await response.json();
      
      // Transform stats to match our format
      const playerStats: Record<string, PlayerStats> = {};
      
      for (const [playerId, stats] of Object.entries(statsData)) {
        playerStats[playerId] = this.convertToPlayerStatsFormat(stats);
      }
      
      return playerStats;
    } catch (error) {
      console.error(`Error fetching player stats for season ${season} week ${week}:`, error);
      return {};
    }
  }
  
  /**
   * Get player projections for a specific week and season
   */
  static async getPlayerProjections(season: number = 2023, week: number = 1): Promise<Record<string, PlayerStats>> {
    try {
      const response = await fetch(`${this.BASE_URL}/projections/nfl/regular/${season}/${week}`);
      if (!response.ok) throw new Error(`Failed to fetch projections for season ${season} week ${week}`);
      
      const projData: Record<string, SleeperStats> = await response.json();
      
      // Transform projections to match our format
      const playerProjections: Record<string, PlayerStats> = {};
      
      for (const [playerId, stats] of Object.entries(projData)) {
        playerProjections[playerId] = this.convertToPlayerStatsFormat(stats);
      }
      
      return playerProjections;
    } catch (error) {
      console.error(`Error fetching player projections for season ${season} week ${week}:`, error);
      return {};
    }
  }
  
  /**
   * Update players with latest stats and projections
   */
  static async getPlayersWithLiveData(season: number = 2023, week: number = 1): Promise<Player[]> {
    try {
      // Get all players, stats, and projections concurrently
      const [players, stats, projections] = await Promise.all([
        this.getAllPlayers(),
        this.getPlayerStats(season, week),
        this.getPlayerProjections(season, week)
      ]);
      
      // Merge stats and projections into player data
      return players.map(player => {
        const playerStats = stats[player.id] || player.stats;
        const playerProj = projections[player.id] || player.projections;
        
        return {
          ...player,
          stats: playerStats,
          projections: playerProj
        };
      });
    } catch (error) {
      console.error('Error getting players with live data:', error);
      return [];
    }
  }
  
  /**
   * Convert Sleeper player format to our application's Player format
   */
  private static convertToPlayerFormat(player: SleeperPlayer): Player {
    return {
      id: player.player_id,
      name: player.full_name || 'Unknown',
      position: player.position || 'N/A',
      team: player.team || 'N/A',
      age: player.age || (player.birth_date ? this.calculateAge(player.birth_date) : 0),
      experience: player.years_exp || 0,
      stats: this.createDefaultStats(),
      projections: this.createDefaultStats()
    };
  }
  
  /**
   * Convert Sleeper stats format to our application's PlayerStats format
   */
  private static convertToPlayerStatsFormat(stats: SleeperStats): PlayerStats {
    const defaultStats = this.createDefaultStats();
    
    // Only add values that exist in the source data
    if (stats) {
      if (stats.rush_att || stats.rush_yd || stats.rush_td) {
        defaultStats.rushing = {
          attempts: stats.rush_att || 0,
          yards: stats.rush_yd || 0,
          touchdowns: stats.rush_td || 0
        };
      }
      
      if (stats.rec || stats.rec_tgt || stats.rec_yd || stats.rec_td) {
        defaultStats.receiving = {
          receptions: stats.rec || 0,
          targets: stats.rec_tgt || 0,
          yards: stats.rec_yd || 0,
          touchdowns: stats.rec_td || 0
        };
      }
      
      if (stats.pass_att || stats.pass_cmp || stats.pass_yd || stats.pass_td || stats.pass_int) {
        defaultStats.passing = {
          attempts: stats.pass_att || 0,
          completions: stats.pass_cmp || 0,
          yards: stats.pass_yd || 0,
          touchdowns: stats.pass_td || 0,
          interceptions: stats.pass_int || 0
        };
      }
    }
    
    return defaultStats;
  }
  
  /**
   * Helper function to calculate age from birth date
   */
  private static calculateAge(birthDateString: string): number {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  
  /**
   * Helper function to create default stats object
   */
  private static createDefaultStats(): PlayerStats {
    return {
      rushing: {
        yards: 0,
        touchdowns: 0,
        attempts: 0
      },
      receiving: {
        yards: 0,
        touchdowns: 0,
        receptions: 0,
        targets: 0
      },
      passing: {
        yards: 0,
        touchdowns: 0,
        interceptions: 0,
        completions: 0,
        attempts: 0
      }
    };
  }
  
  /**
   * Get the latest news for a specific player
   */
  static async getPlayerNews(playerId: string): Promise<PlayerNews[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/players/nfl/${playerId}/news`);
      if (!response.ok) throw new Error(`Failed to fetch news for player ${playerId}`);
      
      const newsData: SleeperNewsItem[] = await response.json();
      
      // Transform the news data to our format
      return newsData.map(item => ({
        id: item.news_id,
        title: item.title,
        description: item.description,
        timestamp: item.timestamp,
        source: item.source,
        sourceUrl: item.source_url,
        injuryStatus: item.injury_status
      }));
    } catch (error) {
      console.error(`Error fetching news for player ${playerId}:`, error);
      return [];
    }
  }
  
  /**
   * Get the latest NFL news (all players)
   */
  static async getLatestNews(limit: number = 10): Promise<PlayerNews[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/news/nfl?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch latest NFL news');
      
      const newsData: SleeperNewsItem[] = await response.json();
      
      // Transform the news data to our format
      return newsData.map(item => ({
        id: item.news_id,
        title: item.title,
        description: item.description,
        timestamp: item.timestamp,
        source: item.source,
        sourceUrl: item.source_url,
        injuryStatus: item.injury_status
      }));
    } catch (error) {
      console.error('Error fetching latest NFL news:', error);
      return [];
    }
  }
}

// Use the same interface as in PlayerService
type PlayerStats = {
  rushing?: {
    yards: number;
    touchdowns: number;
    attempts: number;
  };
  receiving?: {
    yards: number;
    touchdowns: number;
    receptions: number;
    targets: number;
  };
  passing?: {
    yards: number;
    touchdowns: number;
    interceptions: number;
    completions: number;
    attempts: number;
  };
};

export default SleeperService;