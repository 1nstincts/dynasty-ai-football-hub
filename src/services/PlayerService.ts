
import { Player } from '../store/slices/playersSlice';

// Mock NFL player data
const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Justin Jefferson',
    position: 'WR',
    team: 'MIN',
    age: 25,
    experience: 4,
    stats: { receiving: { yards: 1074, touchdowns: 5, receptions: 68, targets: 100 } },
    projections: { receiving: { yards: 1500, touchdowns: 10, receptions: 100, targets: 150 } },
    dynasty_value: 10000,
    trending: { value: 15570, direction: 'up', percentage: 34 }
  },
  {
    id: '2',
    name: 'Jayden Daniels',
    position: 'QB',
    team: 'WAS',
    age: 23,
    experience: 1,
    stats: { 
      passing: { yards: 2800, touchdowns: 18, interceptions: 2, completions: 250, attempts: 350 },
      rushing: { yards: 500, touchdowns: 5, attempts: 75 }
    },
    projections: { 
      passing: { yards: 4000, touchdowns: 25, interceptions: 8, completions: 350, attempts: 500 },
      rushing: { yards: 750, touchdowns: 8, attempts: 100 }
    },
    dynasty_value: 8000,
    trending: { value: 12000, direction: 'up', percentage: 50 }
  },
  {
    id: '3',
    name: 'Bijan Robinson',
    position: 'RB',
    team: 'ATL',
    age: 22,
    experience: 1,
    stats: { rushing: { yards: 1200, touchdowns: 8, attempts: 220 } },
    projections: { rushing: { yards: 1500, touchdowns: 12, attempts: 280 } },
    dynasty_value: 9000,
    trending: { value: 10000, direction: 'up', percentage: 15 }
  },
  {
    id: '4',
    name: 'CeeDee Lamb',
    position: 'WR',
    team: 'DAL',
    age: 25,
    experience: 4,
    stats: { receiving: { yards: 1749, touchdowns: 12, receptions: 135, targets: 181 } },
    projections: { receiving: { yards: 1800, touchdowns: 14, receptions: 140, targets: 190 } },
    dynasty_value: 9500,
    trending: { value: 10500, direction: 'up', percentage: 10 }
  },
  {
    id: '5',
    name: 'Ja'Marr Chase',
    position: 'WR',
    team: 'CIN',
    age: 24,
    experience: 3,
    stats: { receiving: { yards: 1216, touchdowns: 7, receptions: 100, targets: 145 } },
    projections: { receiving: { yards: 1400, touchdowns: 12, receptions: 110, targets: 160 } },
    dynasty_value: 9500,
    trending: { value: 9700, direction: 'up', percentage: 5 }
  },
  {
    id: '6',
    name: 'Christian McCaffrey',
    position: 'RB',
    team: 'SF',
    age: 28,
    experience: 7,
    stats: { 
      rushing: { yards: 1459, touchdowns: 14, attempts: 272 },
      receiving: { yards: 564, touchdowns: 7, receptions: 67, targets: 83 }
    },
    projections: { 
      rushing: { yards: 1350, touchdowns: 12, attempts: 250 },
      receiving: { yards: 550, touchdowns: 5, receptions: 65, targets: 80 }
    },
    dynasty_value: 8500,
    trending: { value: 8000, direction: 'down', percentage: 10 }
  },
  {
    id: '7',
    name: 'Marvin Harrison Jr.',
    position: 'WR',
    team: 'ARI',
    age: 22,
    experience: 1,
    stats: { receiving: { yards: 750, touchdowns: 6, receptions: 50, targets: 80 } },
    projections: { receiving: { yards: 1100, touchdowns: 9, receptions: 75, targets: 110 } },
    dynasty_value: 8000,
    trending: { value: 9000, direction: 'up', percentage: 12 }
  },
  {
    id: '8',
    name: 'Malik Nabers',
    position: 'WR',
    team: 'NYG',
    age: 21,
    experience: 1,
    stats: { receiving: { yards: 800, touchdowns: 5, receptions: 60, targets: 90 } },
    projections: { receiving: { yards: 1200, touchdowns: 8, receptions: 85, targets: 120 } },
    dynasty_value: 7500,
    trending: { value: 9500, direction: 'up', percentage: 20 }
  },
  {
    id: '9',
    name: 'Travis Kelce',
    position: 'TE',
    team: 'KC',
    age: 35,
    experience: 11,
    stats: { receiving: { yards: 984, touchdowns: 5, receptions: 93, targets: 121 } },
    projections: { receiving: { yards: 950, touchdowns: 8, receptions: 90, targets: 120 } },
    dynasty_value: 5500,
    trending: { value: 5000, direction: 'down', percentage: 15 }
  },
  {
    id: '10',
    name: 'Josh Allen',
    position: 'QB',
    team: 'BUF',
    age: 28,
    experience: 6,
    stats: { 
      passing: { yards: 4306, touchdowns: 29, interceptions: 18, completions: 367, attempts: 579 },
      rushing: { yards: 524, touchdowns: 15, attempts: 111 }
    },
    projections: { 
      passing: { yards: 4300, touchdowns: 32, interceptions: 12, completions: 370, attempts: 580 },
      rushing: { yards: 500, touchdowns: 10, attempts: 100 }
    },
    dynasty_value: 8200,
    trending: { value: 8000, direction: 'down', percentage: 5 }
  }
];

class PlayerService {
  getAllPlayers(): Promise<Player[]> {
    // In a real app, this would fetch from an API
    return Promise.resolve(mockPlayers);
  }

  getPlayerById(id: string): Promise<Player | undefined> {
    const player = mockPlayers.find(p => p.id === id);
    return Promise.resolve(player);
  }

  getPlayersByPosition(position: string): Promise<Player[]> {
    const players = mockPlayers.filter(p => p.position === position);
    return Promise.resolve(players);
  }

  searchPlayers(query: string): Promise<Player[]> {
    const players = mockPlayers.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.team.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.resolve(players);
  }

  getTrendingPlayers(): Promise<{trending_up: Player[], trending_down: Player[]}> {
    const trending_up = mockPlayers
      .filter(p => p.trending?.direction === 'up')
      .sort((a, b) => (b.trending?.percentage || 0) - (a.trending?.percentage || 0));
    
    const trending_down = mockPlayers
      .filter(p => p.trending?.direction === 'down')
      .sort((a, b) => (b.trending?.percentage || 0) - (a.trending?.percentage || 0));

    return Promise.resolve({ trending_up, trending_down });
  }
}

export const playerService = new PlayerService();
export default playerService;
