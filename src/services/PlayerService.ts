
import { Player } from '@/store/slices/playersSlice';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for fetching and managing player data
 */
export class PlayerService {
  /**
   * Fetch all players
   */
  static async getAllPlayers(): Promise<Player[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*');

      if (error) {
        console.error('Error fetching players:', error);
        return mockPlayers; // Fallback to mock data if API fails
      }

      // Transform Supabase data to match our Player interface
      return data.map(player => ({
        id: player.player_id,
        name: player.full_name || 'Unknown',
        position: player.position || 'N/A',
        team: player.team || 'N/A',
        age: player.birth_date ? calculateAge(player.birth_date) : 0,
        experience: player.draft_year ? (new Date().getFullYear() - player.draft_year) : 0,
        stats: createDefaultStats(),
        projections: createDefaultProjections()
      }));
    } catch (error) {
      console.error('Failed to get players:', error);
      return mockPlayers; // Fallback to mock data
    }
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

// Helper function to calculate age from birth date
function calculateAge(birthDateString: string): number {
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Helper function to create default stats
function createDefaultStats() {
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

// Helper function to create default projections
function createDefaultProjections() {
  return createDefaultStats();
}

// Mock data for development and fallback
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
