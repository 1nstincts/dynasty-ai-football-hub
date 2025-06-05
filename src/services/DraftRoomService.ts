import { supabase } from '../integrations/supabase/client';
import { Player } from '../integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';

export interface DraftBoard {
  id: string;
  leagueId: string;
  name: string;
  year: number;
  rounds: number;
  currentPick: number;
  isActive: boolean;
  created_at: string;
}

export interface DraftPick {
  id: string;
  draftId: string;
  round: number;
  pick: number;
  teamId: string;
  playerId: string | null;
  originalTeamId: string; // For tracking traded picks
  timestamp: string | null;
}

export interface DraftProspect extends Player {
  rank: number;
  college: string;
  collegeStats: any;
  combine: any; // 40 time, vertical, etc.
  draftGrade: string; // A+, A, A-, etc.
  projection: string; // 1st round, 2nd round, etc.
  strengths: string[];
  weaknesses: string[];
  proComparison: string;
  notes: string;
}

export interface DraftBigBoard {
  id: string;
  userId: string;
  name: string;
  prospects: {
    playerId: string;
    tier: number;
    userRank: number;
  }[];
}

export type ProspectTier = {
  tier: number;
  name: string; // e.g., "Elite", "High Impact", etc.
  color: string; // for UI display
  players: DraftProspect[];
};

// Draft Room Service
export const DraftRoomService = {
  // Create a new draft board for a league
  async createDraftBoard(
    leagueId: string,
    name: string,
    year: number,
    rounds: number
  ): Promise<DraftBoard | null> {
    const draftId = uuidv4();
    
    const { data, error } = await supabase
      .from('draft_boards')
      .insert([
        {
          id: draftId,
          league_id: leagueId,
          name,
          year,
          rounds,
          current_pick: 0,
          is_active: false
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating draft board:', error);
      return null;
    }
    
    // Initialize draft picks
    await this.initializeDraftPicks(draftId, leagueId, rounds);
    
    return {
      id: data.id,
      leagueId: data.league_id,
      name: data.name,
      year: data.year,
      rounds: data.rounds,
      currentPick: data.current_pick,
      isActive: data.is_active,
      created_at: data.created_at
    };
  },
  
  // Initialize draft picks for a draft board
  async initializeDraftPicks(
    draftId: string,
    leagueId: string,
    rounds: number
  ): Promise<boolean> {
    // Get teams in the league
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, user_id')
      .eq('league_id', leagueId);
    
    if (teamsError || !teams) {
      console.error('Error fetching teams:', teamsError);
      return false;
    }
    
    // Create picks for each round and team
    const picks = [];
    
    for (let round = 1; round <= rounds; round++) {
      for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        
        // In snake drafts, reverse order in even rounds
        const pickNumber = round % 2 === 0 
          ? (round - 1) * teams.length + (teams.length - i)
          : (round - 1) * teams.length + (i + 1);
        
        picks.push({
          id: uuidv4(),
          draft_id: draftId,
          round,
          pick: pickNumber,
          team_id: team.id,
          player_id: null,
          original_team_id: team.id,
          timestamp: null
        });
      }
    }
    
    // Insert all picks
    const { error: picksError } = await supabase
      .from('draft_picks')
      .insert(picks);
    
    if (picksError) {
      console.error('Error initializing draft picks:', picksError);
      return false;
    }
    
    return true;
  },
  
  // Get all draft boards for a league
  async getDraftBoards(leagueId: string): Promise<DraftBoard[]> {
    const { data, error } = await supabase
      .from('draft_boards')
      .select('*')
      .eq('league_id', leagueId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching draft boards:', error);
      return [];
    }
    
    return data.map(board => ({
      id: board.id,
      leagueId: board.league_id,
      name: board.name,
      year: board.year,
      rounds: board.rounds,
      currentPick: board.current_pick,
      isActive: board.is_active,
      created_at: board.created_at
    }));
  },
  
  // Get a specific draft board with picks
  async getDraftBoardWithPicks(draftId: string): Promise<{board: DraftBoard, picks: DraftPick[]} | null> {
    // Get the board
    const { data: boardData, error: boardError } = await supabase
      .from('draft_boards')
      .select('*')
      .eq('id', draftId)
      .single();
    
    if (boardError || !boardData) {
      console.error('Error fetching draft board:', boardError);
      return null;
    }
    
    // Get the picks
    const { data: picksData, error: picksError } = await supabase
      .from('draft_picks')
      .select('*')
      .eq('draft_id', draftId)
      .order('pick', { ascending: true });
    
    if (picksError) {
      console.error('Error fetching draft picks:', picksError);
      return null;
    }
    
    const board: DraftBoard = {
      id: boardData.id,
      leagueId: boardData.league_id,
      name: boardData.name,
      year: boardData.year,
      rounds: boardData.rounds,
      currentPick: boardData.current_pick,
      isActive: boardData.is_active,
      created_at: boardData.created_at
    };
    
    const picks: DraftPick[] = picksData.map(pick => ({
      id: pick.id,
      draftId: pick.draft_id,
      round: pick.round,
      pick: pick.pick,
      teamId: pick.team_id,
      playerId: pick.player_id,
      originalTeamId: pick.original_team_id,
      timestamp: pick.timestamp
    }));
    
    return { board, picks };
  },
  
  // Make a pick
  async makePick(draftId: string, pickNumber: number, playerId: string): Promise<boolean> {
    // Find the pick
    const { data: pick, error: pickError } = await supabase
      .from('draft_picks')
      .select('*')
      .eq('draft_id', draftId)
      .eq('pick', pickNumber)
      .single();
    
    if (pickError || !pick) {
      console.error('Error finding draft pick:', pickError);
      return false;
    }
    
    // Update the pick with the player
    const { error: updateError } = await supabase
      .from('draft_picks')
      .update({
        player_id: playerId,
        timestamp: new Date().toISOString()
      })
      .eq('id', pick.id);
    
    if (updateError) {
      console.error('Error updating draft pick:', updateError);
      return false;
    }
    
    // Update the current pick on the draft board
    const { error: boardError } = await supabase
      .from('draft_boards')
      .update({
        current_pick: pickNumber + 1
      })
      .eq('id', draftId);
    
    if (boardError) {
      console.error('Error updating draft board:', boardError);
      return false;
    }
    
    return true;
  },
  
  // Fetch rookie prospects
  async getRookieProspects(year: number = new Date().getFullYear()): Promise<DraftProspect[]> {
    // In a real app, you would fetch this from an API or database
    // For now, we'll return mock data
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('rookie', true)
      .eq('draft_year', year)
      .order('rookie_rank', { ascending: true });
    
    if (error || !data) {
      console.error('Error fetching rookie prospects:', error);
      // Return mock data for demonstration
      return this.getMockProspects();
    }
    
    // Transform players to prospects with additional data
    return data.map((player, index) => {
      const prospect: DraftProspect = {
        ...player,
        rank: index + 1,
        college: player.college || 'Unknown',
        collegeStats: {},
        combine: {
          fortyYard: this.generateRandomFortyTime(player.position),
          vertical: Math.floor(Math.random() * 15) + 25, // 25-40 inches
          bench: Math.floor(Math.random() * 20) + 10, // 10-30 reps
          broad: Math.floor(Math.random() * 30) + 100, // 100-130 inches
          shuttle: (Math.random() * 1 + 3.9).toFixed(2), // 3.9-4.9 seconds
          cone: (Math.random() * 1.5 + 6.5).toFixed(2), // 6.5-8.0 seconds
        },
        draftGrade: this.generateDraftGrade(index),
        projection: this.generateDraftProjection(index),
        strengths: this.generateRandomStrengths(player.position),
        weaknesses: this.generateRandomWeaknesses(player.position),
        proComparison: '',
        notes: ''
      };
      return prospect;
    });
  },
  
  // Generate a random draft grade
  generateDraftGrade(rank: number): string {
    if (rank < 5) return 'A+';
    if (rank < 10) return 'A';
    if (rank < 20) return 'A-';
    if (rank < 30) return 'B+';
    if (rank < 40) return 'B';
    if (rank < 60) return 'B-';
    if (rank < 80) return 'C+';
    if (rank < 100) return 'C';
    return 'C-';
  },
  
  // Generate a draft projection
  generateDraftProjection(rank: number): string {
    if (rank < 12) return 'Early 1st Round';
    if (rank < 24) return 'Late 1st Round';
    if (rank < 40) return 'Early 2nd Round';
    if (rank < 56) return 'Late 2nd Round';
    if (rank < 72) return 'Early 3rd Round';
    if (rank < 88) return 'Late 3rd Round';
    if (rank < 104) return 'Early 4th Round';
    if (rank < 120) return 'Late 4th Round';
    return 'Undrafted';
  },
  
  // Generate a random 40-yard dash time by position
  generateRandomFortyTime(position: string): string {
    let base = 4.5;
    let variation = 0.3;
    
    if (['WR', 'CB', 'RB'].includes(position)) {
      base = 4.4; // Faster positions
    } else if (['QB', 'TE', 'S'].includes(position)) {
      base = 4.6; // Medium speed positions
    } else if (['OT', 'OG', 'C', 'DT', 'NT'].includes(position)) {
      base = 5.0; // Slower positions
    }
    
    const time = base + (Math.random() * variation - variation/2);
    return time.toFixed(2);
  },
  
  // Generate random strengths by position
  generateRandomStrengths(position: string): string[] {
    const commonStrengths = [
      'High football IQ',
      'Team leader',
      'Hard worker',
      'Consistent performer',
      'Versatile',
      'Good technique',
      'High motor'
    ];
    
    const positionStrengths: {[key: string]: string[]} = {
      'QB': [
        'Strong arm',
        'Accurate passer',
        'Good decision-making',
        'Pocket presence',
        'Ability to read defenses',
        'Mobility',
        'Throws well on the run'
      ],
      'RB': [
        'Explosive runner',
        'Good vision',
        'Breaks tackles',
        'Pass-catching ability',
        'Elusive in open space',
        'Pass protection',
        'Ball security'
      ],
      'WR': [
        'Route running',
        'Contested catch ability',
        'Separation speed',
        'Good hands',
        'YAC ability',
        'Red zone threat',
        'Release off the line'
      ],
      'TE': [
        'Blocking ability',
        'Receiving threat',
        'Size/speed combination',
        'Red zone target',
        'Reliable hands',
        'Yards after contact',
        'Seam threat'
      ]
      // Add more positions as needed
    };
    
    const specificStrengths = positionStrengths[position] || [];
    const allStrengths = [...commonStrengths, ...specificStrengths];
    
    // Select 3-5 random strengths
    const count = Math.floor(Math.random() * 3) + 3;
    const selectedStrengths = [];
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * allStrengths.length);
      selectedStrengths.push(allStrengths[randomIndex]);
      allStrengths.splice(randomIndex, 1);
    }
    
    return selectedStrengths;
  },
  
  // Generate random weaknesses by position
  generateRandomWeaknesses(position: string): string[] {
    const commonWeaknesses = [
      'Needs to improve consistency',
      'Injury history',
      'Limited experience',
      'Raw technique',
      'Needs to add strength',
      'Character concerns',
      'Age concerns'
    ];
    
    const positionWeaknesses: {[key: string]: string[]} = {
      'QB': [
        'Inconsistent accuracy',
        'Decision-making under pressure',
        'Arm strength limitations',
        'Footwork issues',
        'Trouble reading complex defenses',
        'Needs to improve mechanics',
        'One-read quarterback'
      ],
      'RB': [
        'Limited pass-catching experience',
        'Pass protection technique',
        'Vision between the tackles',
        'Ball security issues',
        'Limited burst',
        'Durability concerns',
        'Too upright running style'
      ],
      'WR': [
        'Route-running refinement',
        'Inconsistent hands',
        'Limited release package',
        'Struggles against physical coverage',
        'Body catcher',
        'Concentration drops',
        'Limited route tree'
      ],
      'TE': [
        'Blocking technique',
        'Limited inline experience',
        'Route running',
        'Separation ability',
        'Inconsistent hands',
        'Lacks top-end speed',
        'Red zone production'
      ]
      // Add more positions as needed
    };
    
    const specificWeaknesses = positionWeaknesses[position] || [];
    const allWeaknesses = [...commonWeaknesses, ...specificWeaknesses];
    
    // Select 2-4 random weaknesses
    const count = Math.floor(Math.random() * 3) + 2;
    const selectedWeaknesses = [];
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * allWeaknesses.length);
      selectedWeaknesses.push(allWeaknesses[randomIndex]);
      allWeaknesses.splice(randomIndex, 1);
    }
    
    return selectedWeaknesses;
  },
  
  // Create a big board
  async createBigBoard(userId: string, name: string): Promise<DraftBigBoard | null> {
    const boardId = uuidv4();
    
    const { data, error } = await supabase
      .from('draft_big_boards')
      .insert([
        {
          id: boardId,
          user_id: userId,
          name,
          prospects: []
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating big board:', error);
      return null;
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      prospects: data.prospects || []
    };
  },
  
  // Update a big board
  async updateBigBoard(boardId: string, prospects: {playerId: string, tier: number, userRank: number}[]): Promise<boolean> {
    const { error } = await supabase
      .from('draft_big_boards')
      .update({
        prospects
      })
      .eq('id', boardId);
    
    if (error) {
      console.error('Error updating big board:', error);
      return false;
    }
    
    return true;
  },
  
  // Get mock prospects for testing
  getMockProspects(): DraftProspect[] {
    return [
      {
        id: 'rook1',
        full_name: 'Caleb Williams',
        position: 'QB',
        team: 'FA',
        age: 22,
        height: 73, // 6'1"
        weight: 215,
        college: 'USC',
        experience: 0,
        injury_status: null,
        status: 'Active',
        jersey_number: '1',
        rookie: true,
        draft_year: 2024,
        draft_round: 1,
        draft_pick: 1,
        avatar_url: '',
        rank: 1,
        collegeStats: {
          '2023': {
            games: 12,
            passingYards: 3633,
            passingTDs: 30,
            interceptions: 5,
            rushingYards: 197,
            rushingTDs: 11
          }
        },
        combine: {
          fortyYard: '4.52',
          vertical: 38,
          bench: 15,
          broad: 123,
          shuttle: '4.21',
          cone: '6.78'
        },
        draftGrade: 'A+',
        projection: 'Early 1st Round',
        strengths: [
          'Elite arm talent',
          'Exceptional playmaking ability',
          'Incredible off-platform throws',
          'Advanced field vision',
          'Productive runner'
        ],
        weaknesses: [
          'Occasional inconsistency under pressure',
          'Sometimes holds the ball too long'
        ],
        proComparison: 'Patrick Mahomes',
        notes: 'Generational talent with all the physical tools'
      },
      {
        id: 'rook2',
        full_name: 'Marvin Harrison Jr.',
        position: 'WR',
        team: 'FA',
        age: 21,
        height: 76, // 6'4"
        weight: 205,
        college: 'Ohio State',
        experience: 0,
        injury_status: null,
        status: 'Active',
        jersey_number: '18',
        rookie: true,
        draft_year: 2024,
        draft_round: 1,
        draft_pick: 2,
        avatar_url: '',
        rank: 2,
        collegeStats: {
          '2023': {
            games: 12,
            receptions: 67,
            receivingYards: 1211,
            receivingTDs: 14
          }
        },
        combine: {
          fortyYard: '4.38',
          vertical: 37,
          bench: 18,
          broad: 128,
          shuttle: '4.05',
          cone: '6.71'
        },
        draftGrade: 'A+',
        projection: 'Early 1st Round',
        strengths: [
          'Elite route runner',
          'Excellent hands',
          'Great size/speed combination',
          'Outstanding body control',
          'Red zone threat'
        ],
        weaknesses: [
          'Could add more muscle to his frame',
          'Occasionally struggles against physical press coverage'
        ],
        proComparison: 'Justin Jefferson',
        notes: 'Complete receiver with Hall of Fame potential'
      },
      {
        id: 'rook3',
        full_name: 'Jayden Daniels',
        position: 'QB',
        team: 'FA',
        age: 23,
        height: 72, // 6'0"
        weight: 210,
        college: 'LSU',
        experience: 0,
        injury_status: null,
        status: 'Active',
        jersey_number: '5',
        rookie: true,
        draft_year: 2024,
        draft_round: 1,
        draft_pick: 3,
        avatar_url: '',
        rank: 3,
        collegeStats: {
          '2023': {
            games: 12,
            passingYards: 3812,
            passingTDs: 40,
            interceptions: 4,
            rushingYards: 1134,
            rushingTDs: 10
          }
        },
        combine: {
          fortyYard: '4.42',
          vertical: 35,
          bench: 12,
          broad: 118,
          shuttle: '4.30',
          cone: '6.95'
        },
        draftGrade: 'A',
        projection: 'Early 1st Round',
        strengths: [
          'Dual-threat ability',
          'Excellent decision-maker',
          'Accurate passer',
          'Elite athleticism',
          'Improved each season'
        ],
        weaknesses: [
          'Slight frame',
          'May need to add weight for durability',
          'Sometimes takes unnecessary hits'
        ],
        proComparison: 'Lamar Jackson',
        notes: 'Heisman Trophy winner with incredible development trajectory'
      }
    ];
  },
  
  // Group prospects by tiers
  groupProspectsByTier(prospects: DraftProspect[]): ProspectTier[] {
    // Define tiers based on ranking ranges
    const tierDefinitions = [
      { tier: 1, name: 'Elite', color: '#FF4136', maxRank: 5 },
      { tier: 2, name: 'Blue Chip', color: '#0074D9', maxRank: 15 },
      { tier: 3, name: 'High Value', color: '#2ECC40', maxRank: 30 },
      { tier: 4, name: 'Solid', color: '#FFDC00', maxRank: 50 },
      { tier: 5, name: 'Developmental', color: '#B10DC9', maxRank: 100 },
      { tier: 6, name: 'Lottery Ticket', color: '#AAAAAA', maxRank: 999 }
    ];
    
    // Initialize tiers
    const tiers: ProspectTier[] = tierDefinitions.map(def => ({
      tier: def.tier,
      name: def.name,
      color: def.color,
      players: []
    }));
    
    // Assign players to tiers
    prospects.forEach(prospect => {
      const tierDef = tierDefinitions.find(def => prospect.rank <= def.maxRank);
      if (tierDef) {
        const tier = tiers.find(t => t.tier === tierDef.tier);
        if (tier) {
          tier.players.push(prospect);
        }
      }
    });
    
    // Sort players within tiers
    tiers.forEach(tier => {
      tier.players.sort((a, b) => a.rank - b.rank);
    });
    
    return tiers;
  }
};

export default DraftRoomService;