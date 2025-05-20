import { Player } from '@/store/slices/playersSlice';

/**
 * Service for fetching and managing player data
 */
export class PlayerService {
  /**
   * Fetch all players
   */
  static async getAllPlayers(): Promise<Player[]> {
    // Mock implementation - in a real app, this would call an API
    return mockPlayers;
  }

  /**
   * Filter players by position
   */
  static filterByPosition(players: Player[], position: string): Player[] {
    if (position === 'ALL') return players;
    return players.filter(player => player.position === position);
  }

  /**
   * Search players by name
   */
  static searchByName(players: Player[], query: string): Player[] {
    if (!query) return players;
    const lowercaseQuery = query.toLowerCase();
    return players.filter(player => 
      player.name.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Mock data for development
const mockPlayers: Player[] = [
  {
    id: "p1",
    name: "Patrick Mahomes",
    position: "QB",
    team: "KC",
    age: 28,
    experience: 7,
    stats: {
      passing: {
        yards: 5250,
        touchdowns: 41,
        interceptions: 12,
        completions: 401,
        attempts: 584
      }
    },
    projections: {
      passing: {
        yards: 5000,
        touchdowns: 38,
        interceptions: 10,
        completions: 380,
        attempts: 550
      }
    },
    dynasty_value: 10000
  },
  {
    id: "p2",
    name: "Justin Jefferson",
    position: "WR",
    team: "MIN",
    age: 25,
    experience: 4,
    stats: {
      receiving: {
        yards: 1600,
        touchdowns: 8,
        receptions: 108,
        targets: 154
      }
    },
    projections: {
      receiving: {
        yards: 1700,
        touchdowns: 10,
        receptions: 115,
        targets: 160
      }
    },
    dynasty_value: 9800
  },
  {
    id: "p3",
    name: "Christian McCaffrey",
    position: "RB",
    team: "SF",
    age: 28,
    experience: 7,
    stats: {
      rushing: {
        yards: 1300,
        touchdowns: 15,
        attempts: 280
      },
      receiving: {
        yards: 650,
        touchdowns: 5,
        receptions: 75,
        targets: 90
      }
    },
    projections: {
      rushing: {
        yards: 1250,
        touchdowns: 14,
        attempts: 270
      },
      receiving: {
        yards: 600,
        touchdowns: 4,
        receptions: 70,
        targets: 85
      }
    },
    dynasty_value: 9200
  }
];

export default PlayerService;
