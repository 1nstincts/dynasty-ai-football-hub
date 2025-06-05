import { supabase } from '../integrations/supabase/client';
import { Player } from '../integrations/supabase/types';

export interface ScoringRule {
  id: string;
  category: string; // e.g., 'passing', 'rushing', 'receiving'
  action: string; // e.g., 'yard', 'touchdown', 'reception'
  points: number; // points per action
  threshold?: number; // optional threshold for bonus points
}

export interface LeagueRules {
  id: string;
  leagueId: string;
  name: string;
  description?: string;
  rosterSize: number;
  startingPositions: { [key: string]: number }; // e.g., { 'QB': 1, 'RB': 2, ... }
  benchPositions: number;
  scoringRules: ScoringRule[];
  ppr: number; // 0, 0.5, 1, etc.
  isDefault: boolean;
}

export interface PlayerImpact {
  playerId: string;
  fullName: string;
  position: string;
  team: string;
  baselinePoints: number; // Points in standard league settings
  customPoints: number; // Points with custom rules
  difference: number; // Difference between custom and baseline
  percentageChange: number; // Percentage change
}

export interface PositionImpact {
  position: string;
  averageBaselinePoints: number;
  averageCustomPoints: number;
  difference: number;
  percentageChange: number;
  topRisers: PlayerImpact[]; // Players that benefit most
  topFallers: PlayerImpact[]; // Players that are hurt most
}

export interface LeagueRulesImpactAnalysis {
  overallImpact: {
    description: string;
    favoredStyles: string[];
    favoredPositions: string[];
  };
  positionImpacts: { [position: string]: PositionImpact };
  playerImpacts: PlayerImpact[];
  recommendations: {
    draftStrategy: string[];
    rosterConstruction: string[];
    tradeTargets: { playerId: string; fullName: string; reason: string }[];
    playersToAvoid: { playerId: string; fullName: string; reason: string }[];
  };
}

// Standard scoring rules for baseline comparison
const STANDARD_SCORING_RULES: ScoringRule[] = [
  { id: 'pass-yard', category: 'passing', action: 'yard', points: 0.04 },
  { id: 'pass-td', category: 'passing', action: 'touchdown', points: 4 },
  { id: 'pass-int', category: 'passing', action: 'interception', points: -2 },
  { id: 'rush-yard', category: 'rushing', action: 'yard', points: 0.1 },
  { id: 'rush-td', category: 'rushing', action: 'touchdown', points: 6 },
  { id: 'rec-yard', category: 'receiving', action: 'yard', points: 0.1 },
  { id: 'rec', category: 'receiving', action: 'reception', points: 0 }, // 0 PPR for standard
  { id: 'rec-td', category: 'receiving', action: 'touchdown', points: 6 },
  { id: 'fumble', category: 'other', action: 'fumble-lost', points: -2 },
  { id: '2pt', category: 'other', action: '2pt-conversion', points: 2 }
];

const STANDARD_ROSTER = {
  'QB': 1,
  'RB': 2,
  'WR': 2,
  'TE': 1,
  'FLEX': 1,
  'DEF': 1,
  'K': 1
};

const LeagueRulesService = {
  // Get league rules for a league
  async getLeagueRules(leagueId: string): Promise<LeagueRules[]> {
    const { data, error } = await supabase
      .from('league_rules')
      .select('*')
      .eq('league_id', leagueId);
    
    if (error) {
      console.error('Error fetching league rules:', error);
      return [];
    }
    
    return data.map(rule => ({
      id: rule.id,
      leagueId: rule.league_id,
      name: rule.name,
      description: rule.description,
      rosterSize: rule.roster_size,
      startingPositions: rule.starting_positions,
      benchPositions: rule.bench_positions,
      scoringRules: rule.scoring_rules,
      ppr: rule.ppr,
      isDefault: rule.is_default
    }));
  },
  
  // Create new league rules
  async createLeagueRules(rules: Omit<LeagueRules, 'id'>): Promise<LeagueRules | null> {
    const { data, error } = await supabase
      .from('league_rules')
      .insert([{
        league_id: rules.leagueId,
        name: rules.name,
        description: rules.description,
        roster_size: rules.rosterSize,
        starting_positions: rules.startingPositions,
        bench_positions: rules.benchPositions,
        scoring_rules: rules.scoringRules,
        ppr: rules.ppr,
        is_default: rules.isDefault
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating league rules:', error);
      return null;
    }
    
    return {
      id: data.id,
      leagueId: data.league_id,
      name: data.name,
      description: data.description,
      rosterSize: data.roster_size,
      startingPositions: data.starting_positions,
      benchPositions: data.bench_positions,
      scoringRules: data.scoring_rules,
      ppr: data.ppr,
      isDefault: data.is_default
    };
  },
  
  // Update league rules
  async updateLeagueRules(rules: LeagueRules): Promise<boolean> {
    const { error } = await supabase
      .from('league_rules')
      .update({
        name: rules.name,
        description: rules.description,
        roster_size: rules.rosterSize,
        starting_positions: rules.startingPositions,
        bench_positions: rules.benchPositions,
        scoring_rules: rules.scoringRules,
        ppr: rules.ppr,
        is_default: rules.isDefault
      })
      .eq('id', rules.id);
    
    if (error) {
      console.error('Error updating league rules:', error);
      return false;
    }
    
    return true;
  },
  
  // Delete league rules
  async deleteLeagueRules(ruleId: string): Promise<boolean> {
    const { error } = await supabase
      .from('league_rules')
      .delete()
      .eq('id', ruleId);
    
    if (error) {
      console.error('Error deleting league rules:', error);
      return false;
    }
    
    return true;
  },
  
  // Set default league rules
  async setDefaultLeagueRules(leagueId: string, ruleId: string): Promise<boolean> {
    // First, unset all existing defaults
    const { error: updateError } = await supabase
      .from('league_rules')
      .update({ is_default: false })
      .eq('league_id', leagueId);
    
    if (updateError) {
      console.error('Error updating league rules:', updateError);
      return false;
    }
    
    // Then set the new default
    const { error } = await supabase
      .from('league_rules')
      .update({ is_default: true })
      .eq('id', ruleId);
    
    if (error) {
      console.error('Error setting default league rules:', error);
      return false;
    }
    
    return true;
  },
  
  // Get default league rules for a league
  async getDefaultLeagueRules(leagueId: string): Promise<LeagueRules | null> {
    const { data, error } = await supabase
      .from('league_rules')
      .select('*')
      .eq('league_id', leagueId)
      .eq('is_default', true)
      .single();
    
    if (error) {
      console.error('Error fetching default league rules:', error);
      return null;
    }
    
    return {
      id: data.id,
      leagueId: data.league_id,
      name: data.name,
      description: data.description,
      rosterSize: data.roster_size,
      startingPositions: data.starting_positions,
      benchPositions: data.bench_positions,
      scoringRules: data.scoring_rules,
      ppr: data.ppr,
      isDefault: data.is_default
    };
  },
  
  // Create standard league rules (for a new league)
  async createStandardLeagueRules(leagueId: string): Promise<LeagueRules | null> {
    return this.createLeagueRules({
      leagueId,
      name: 'Standard Scoring',
      description: 'Standard fantasy football scoring settings',
      rosterSize: 16,
      startingPositions: STANDARD_ROSTER,
      benchPositions: 7,
      scoringRules: STANDARD_SCORING_RULES,
      ppr: 0,
      isDefault: true
    });
  },
  
  // Get a list of pre-defined rule templates
  getRuleTemplates(): Omit<LeagueRules, 'id' | 'leagueId' | 'isDefault'>[] {
    return [
      {
        name: 'Standard Scoring',
        description: 'Traditional fantasy football scoring with no PPR',
        rosterSize: 16,
        startingPositions: STANDARD_ROSTER,
        benchPositions: 7,
        scoringRules: STANDARD_SCORING_RULES,
        ppr: 0
      },
      {
        name: 'Half PPR',
        description: 'Half-point per reception scoring',
        rosterSize: 16,
        startingPositions: STANDARD_ROSTER,
        benchPositions: 7,
        scoringRules: [
          ...STANDARD_SCORING_RULES.filter(rule => rule.id !== 'rec'),
          { id: 'rec', category: 'receiving', action: 'reception', points: 0.5 }
        ],
        ppr: 0.5
      },
      {
        name: 'Full PPR',
        description: 'One point per reception scoring',
        rosterSize: 16,
        startingPositions: STANDARD_ROSTER,
        benchPositions: 7,
        scoringRules: [
          ...STANDARD_SCORING_RULES.filter(rule => rule.id !== 'rec'),
          { id: 'rec', category: 'receiving', action: 'reception', points: 1 }
        ],
        ppr: 1
      },
      {
        name: 'Superflex',
        description: 'Standard scoring with an additional QB/RB/WR/TE flex spot',
        rosterSize: 16,
        startingPositions: {
          ...STANDARD_ROSTER,
          'SUPERFLEX': 1
        },
        benchPositions: 6,
        scoringRules: STANDARD_SCORING_RULES,
        ppr: 0
      },
      {
        name: 'TE Premium',
        description: 'Full PPR with bonus points for TE receptions',
        rosterSize: 16,
        startingPositions: STANDARD_ROSTER,
        benchPositions: 7,
        scoringRules: [
          ...STANDARD_SCORING_RULES.filter(rule => rule.id !== 'rec'),
          { id: 'rec-rb-wr', category: 'receiving', action: 'reception', points: 1 },
          { id: 'rec-te', category: 'receiving', action: 'reception-te', points: 1.5 }
        ],
        ppr: 1
      },
      {
        name: '2QB League',
        description: 'Start two quarterbacks with standard scoring',
        rosterSize: 16,
        startingPositions: {
          ...STANDARD_ROSTER,
          'QB': 2
        },
        benchPositions: 7,
        scoringRules: STANDARD_SCORING_RULES,
        ppr: 0
      },
      {
        name: 'Big Play Bonus',
        description: 'Standard scoring with bonuses for long TDs and high yardage',
        rosterSize: 16,
        startingPositions: STANDARD_ROSTER,
        benchPositions: 7,
        scoringRules: [
          ...STANDARD_SCORING_RULES,
          { id: 'pass-300', category: 'passing', action: 'yard-threshold', points: 3, threshold: 300 },
          { id: 'rush-100', category: 'rushing', action: 'yard-threshold', points: 3, threshold: 100 },
          { id: 'rec-100', category: 'receiving', action: 'yard-threshold', points: 3, threshold: 100 },
          { id: 'td-40', category: 'other', action: 'long-td', points: 2, threshold: 40 }
        ],
        ppr: 0
      }
    ];
  },
  
  // Analyze the impact of custom league rules
  async analyzeRulesImpact(
    customRules: LeagueRules,
    playerSample: Player[] = []
  ): Promise<LeagueRulesImpactAnalysis> {
    // Fetch players if not provided
    let players = playerSample;
    if (players.length === 0) {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('dynasty_value', { ascending: false })
        .limit(200);
      
      if (error) {
        console.error('Error fetching players:', error);
        players = this.getMockPlayers();
      } else {
        players = data;
      }
    }
    
    // Generate player impacts
    const playerImpacts = this.calculatePlayerImpacts(players, customRules);
    
    // Group by position
    const positionImpacts = this.calculatePositionImpacts(playerImpacts);
    
    // Generate overall analysis
    const overallImpact = this.generateOverallImpact(customRules, positionImpacts);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      customRules,
      positionImpacts,
      playerImpacts
    );
    
    return {
      overallImpact,
      positionImpacts,
      playerImpacts,
      recommendations
    };
  },
  
  // Calculate impact on individual players
  calculatePlayerImpacts(
    players: Player[],
    customRules: LeagueRules
  ): PlayerImpact[] {
    // Create a standard rules object for baseline comparison
    const standardRules: LeagueRules = {
      id: 'standard',
      leagueId: 'standard',
      name: 'Standard Scoring',
      rosterSize: 16,
      startingPositions: STANDARD_ROSTER,
      benchPositions: 7,
      scoringRules: STANDARD_SCORING_RULES,
      ppr: 0,
      isDefault: false
    };
    
    // Calculate points for each player under both rule sets
    return players.map(player => {
      // Calculate baseline points (using mock stats for demo)
      const stats = this.getMockPlayerStats(player);
      const baselinePoints = this.calculateProjectedPoints(stats, standardRules);
      const customPoints = this.calculateProjectedPoints(stats, customRules);
      
      const difference = customPoints - baselinePoints;
      const percentageChange = baselinePoints > 0 
        ? (difference / baselinePoints) * 100 
        : 0;
      
      return {
        playerId: player.id,
        fullName: player.full_name,
        position: player.position,
        team: player.team,
        baselinePoints,
        customPoints,
        difference,
        percentageChange
      };
    });
  },
  
  // Calculate impacts by position
  calculatePositionImpacts(
    playerImpacts: PlayerImpact[]
  ): { [position: string]: PositionImpact } {
    const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
    const result: { [position: string]: PositionImpact } = {};
    
    for (const position of positions) {
      const positionPlayers = playerImpacts.filter(
        player => player.position === position
      );
      
      if (positionPlayers.length === 0) {
        continue;
      }
      
      // Calculate averages
      const avgBaseline = positionPlayers.reduce(
        (sum, player) => sum + player.baselinePoints, 0
      ) / positionPlayers.length;
      
      const avgCustom = positionPlayers.reduce(
        (sum, player) => sum + player.customPoints, 0
      ) / positionPlayers.length;
      
      const difference = avgCustom - avgBaseline;
      const percentageChange = avgBaseline > 0 
        ? (difference / avgBaseline) * 100 
        : 0;
      
      // Sort by percentage change to find risers and fallers
      const sortedByImpact = [...positionPlayers].sort(
        (a, b) => b.percentageChange - a.percentageChange
      );
      
      const topRisers = sortedByImpact.slice(0, 5);
      const topFallers = sortedByImpact.reverse().slice(0, 5);
      
      result[position] = {
        position,
        averageBaselinePoints: avgBaseline,
        averageCustomPoints: avgCustom,
        difference,
        percentageChange,
        topRisers,
        topFallers
      };
    }
    
    return result;
  },
  
  // Generate overall impact analysis
  generateOverallImpact(
    rules: LeagueRules,
    positionImpacts: { [position: string]: PositionImpact }
  ): LeagueRulesImpactAnalysis['overallImpact'] {
    // Determine which positions are favored
    const positionChanges = Object.values(positionImpacts)
      .sort((a, b) => b.percentageChange - a.percentageChange);
    
    const favoredPositions = positionChanges
      .filter(pos => pos.percentageChange > 3) // Threshold for "favored"
      .map(pos => pos.position);
    
    // Determine which play styles are favored
    const favoredStyles: string[] = [];
    
    // Check PPR
    if (rules.ppr > 0.5) {
      favoredStyles.push('Reception-heavy offenses');
    }
    
    // Check for big play bonuses
    const hasBigPlayBonuses = rules.scoringRules.some(
      rule => rule.action.includes('threshold') || rule.action.includes('long')
    );
    
    if (hasBigPlayBonuses) {
      favoredStyles.push('Explosive offenses with big-play potential');
    }
    
    // Check for TE premium
    const tePremium = rules.scoringRules.some(
      rule => rule.action.includes('reception-te') && rule.points > rules.ppr
    );
    
    if (tePremium) {
      favoredStyles.push('Teams with elite tight ends');
    }
    
    // Check roster construction
    const qbCount = rules.startingPositions['QB'] || 1;
    const hasSuperflex = rules.startingPositions['SUPERFLEX'] > 0;
    
    if (qbCount > 1 || hasSuperflex) {
      favoredStyles.push('Teams with multiple quality quarterbacks');
    }
    
    // Generate description
    let description = 'This scoring system ';
    
    if (favoredPositions.length > 0) {
      description += `emphasizes the ${favoredPositions.join(', ')} position${
        favoredPositions.length > 1 ? 's' : ''
      } `;
    }
    
    if (rules.ppr === 0) {
      description += 'with standard scoring that values touchdowns and yardage over receptions. ';
    } else if (rules.ppr === 0.5) {
      description += 'with half-PPR scoring that balances traditional scoring with reception value. ';
    } else if (rules.ppr === 1) {
      description += 'with full-PPR scoring that rewards high-volume pass catchers. ';
    } else if (rules.ppr > 1) {
      description += 'with premium PPR scoring that heavily rewards reception volume. ';
    }
    
    if (hasBigPlayBonuses) {
      description += 'The scoring includes bonuses for big plays and yardage thresholds, increasing the value of explosive players. ';
    }
    
    if (tePremium) {
      description += 'The TE premium scoring increases the importance of having an elite tight end. ';
    }
    
    if (qbCount > 1 || hasSuperflex) {
      description += `The requirement to start ${qbCount > 1 ? 'multiple QBs' : 'a superflex position'} increases quarterback value significantly. `;
    }
    
    return {
      description,
      favoredStyles,
      favoredPositions
    };
  },
  
  // Generate strategy recommendations based on the analysis
  generateRecommendations(
    rules: LeagueRules,
    positionImpacts: { [position: string]: PositionImpact },
    playerImpacts: PlayerImpact[]
  ): LeagueRulesImpactAnalysis['recommendations'] {
    // Draft strategy recommendations
    const draftStrategy: string[] = [];
    
    // Sort positions by percentage impact
    const sortedPositions = Object.values(positionImpacts)
      .sort((a, b) => b.percentageChange - a.percentageChange);
    
    const topPositions = sortedPositions
      .filter(pos => pos.percentageChange > 0)
      .map(pos => pos.position);
    
    if (topPositions.length > 0) {
      draftStrategy.push(`Prioritize ${topPositions.join(', ')} early in drafts as these positions gain the most value in this scoring system.`);
    }
    
    // QB strategy
    const qbCount = rules.startingPositions['QB'] || 1;
    const hasSuperflex = rules.startingPositions['SUPERFLEX'] > 0;
    
    if (qbCount > 1 || hasSuperflex) {
      draftStrategy.push(`Draft quarterbacks earlier than usual - aim to secure at least ${qbCount + (hasSuperflex ? 1 : 0)} quality starting QBs.`);
    }
    
    // PPR strategy
    if (rules.ppr >= 1) {
      draftStrategy.push('Target high-volume pass catchers, especially those with high catch rates and target share.');
    } else if (rules.ppr === 0) {
      draftStrategy.push('Focus on touchdown scorers and yardage producers rather than high-volume, low-yardage receivers.');
    }
    
    // Big play strategy
    const hasBigPlayBonuses = rules.scoringRules.some(
      rule => rule.action.includes('threshold') || rule.action.includes('long')
    );
    
    if (hasBigPlayBonuses) {
      draftStrategy.push('Target players with big play potential and the ability to hit yardage thresholds regularly.');
    }
    
    // TE strategy
    const tePremium = rules.scoringRules.some(
      rule => rule.action.includes('reception-te') && rule.points > rules.ppr
    );
    
    if (tePremium) {
      draftStrategy.push('Consider drafting an elite tight end earlier than usual due to TE premium scoring.');
    } else {
      const teImpact = positionImpacts['TE'];
      if (teImpact && teImpact.percentageChange < 0) {
        draftStrategy.push('Wait on tight ends and stream the position unless you can secure a top-3 option.');
      }
    }
    
    // Roster construction recommendations
    const rosterConstruction: string[] = [];
    
    // Analyze position scarcity
    const startingPositions = rules.startingPositions;
    
    if (startingPositions['RB'] > 2 || (startingPositions['RB'] === 2 && startingPositions['FLEX'] > 0)) {
      rosterConstruction.push('Build running back depth early - the requirement to start multiple RBs creates position scarcity.');
    }
    
    if (startingPositions['WR'] > 3) {
      rosterConstruction.push('Invest in wide receiver depth, as you need to start multiple WRs each week.');
    }
    
    if (qbCount > 1 || hasSuperflex) {
      rosterConstruction.push('Carry 3-4 quarterbacks on your roster to handle bye weeks and injuries.');
    } else {
      rosterConstruction.push('In single-QB leagues, don\'t roster more than 2 quarterbacks unless highly valuable.');
    }
    
    if (tePremium) {
      rosterConstruction.push('If you secure an elite TE, consider rostering their backup as insurance.');
    } else {
      rosterConstruction.push('Don\'t roster multiple tight ends unless they have significant upside or trade value.');
    }
    
    // Bench strategy based on scoring
    if (rules.ppr >= 1) {
      rosterConstruction.push('Use bench spots for high-upside pass catchers who could see increased targets due to injuries.');
    }
    
    if (hasBigPlayBonuses) {
      rosterConstruction.push('Reserve at least one bench spot for boom-or-bust players with big play ability.');
    }
    
    // Trade targets and players to avoid
    const topRisers = [...playerImpacts]
      .sort((a, b) => b.percentageChange - a.percentageChange)
      .slice(0, 10);
    
    const topFallers = [...playerImpacts]
      .sort((a, b) => a.percentageChange - b.percentageChange)
      .slice(0, 10);
    
    const tradeTargets = topRisers.map(player => ({
      playerId: player.playerId,
      fullName: player.fullName,
      reason: `Gains ${player.percentageChange.toFixed(1)}% value in this scoring system compared to standard scoring.`
    }));
    
    const playersToAvoid = topFallers.map(player => ({
      playerId: player.playerId,
      fullName: player.fullName,
      reason: `Loses ${Math.abs(player.percentageChange).toFixed(1)}% value in this scoring system compared to standard scoring.`
    }));
    
    return {
      draftStrategy,
      rosterConstruction,
      tradeTargets,
      playersToAvoid
    };
  },
  
  // Calculate projected fantasy points for a player based on rules
  calculateProjectedPoints(
    stats: any,
    rules: LeagueRules
  ): number {
    let points = 0;
    
    // Process each stat based on scoring rules
    // Passing
    if (stats.passingYards) {
      const passingYardRule = rules.scoringRules.find(r => 
        r.category === 'passing' && r.action === 'yard'
      );
      if (passingYardRule) {
        points += stats.passingYards * passingYardRule.points;
      }
    }
    
    if (stats.passingTDs) {
      const passingTDRule = rules.scoringRules.find(r => 
        r.category === 'passing' && r.action === 'touchdown'
      );
      if (passingTDRule) {
        points += stats.passingTDs * passingTDRule.points;
      }
    }
    
    if (stats.interceptions) {
      const intRule = rules.scoringRules.find(r => 
        r.category === 'passing' && r.action === 'interception'
      );
      if (intRule) {
        points += stats.interceptions * intRule.points;
      }
    }
    
    // Rushing
    if (stats.rushingYards) {
      const rushingYardRule = rules.scoringRules.find(r => 
        r.category === 'rushing' && r.action === 'yard'
      );
      if (rushingYardRule) {
        points += stats.rushingYards * rushingYardRule.points;
      }
    }
    
    if (stats.rushingTDs) {
      const rushingTDRule = rules.scoringRules.find(r => 
        r.category === 'rushing' && r.action === 'touchdown'
      );
      if (rushingTDRule) {
        points += stats.rushingTDs * rushingTDRule.points;
      }
    }
    
    // Receiving
    if (stats.receivingYards) {
      const receivingYardRule = rules.scoringRules.find(r => 
        r.category === 'receiving' && r.action === 'yard'
      );
      if (receivingYardRule) {
        points += stats.receivingYards * receivingYardRule.points;
      }
    }
    
    if (stats.receptions) {
      // Check for position-specific PPR (like TE premium)
      const position = stats.position;
      let receptionRule;
      
      if (position === 'TE') {
        receptionRule = rules.scoringRules.find(r => 
          r.category === 'receiving' && r.action === 'reception-te'
        );
      }
      
      // If no position-specific rule, use the standard reception rule
      if (!receptionRule) {
        receptionRule = rules.scoringRules.find(r => 
          r.category === 'receiving' && r.action === 'reception'
        );
      }
      
      if (receptionRule) {
        points += stats.receptions * receptionRule.points;
      }
    }
    
    if (stats.receivingTDs) {
      const receivingTDRule = rules.scoringRules.find(r => 
        r.category === 'receiving' && r.action === 'touchdown'
      );
      if (receivingTDRule) {
        points += stats.receivingTDs * receivingTDRule.points;
      }
    }
    
    // Other
    if (stats.fumbles) {
      const fumbleRule = rules.scoringRules.find(r => 
        r.category === 'other' && r.action === 'fumble-lost'
      );
      if (fumbleRule) {
        points += stats.fumbles * fumbleRule.points;
      }
    }
    
    if (stats.twoPointConversions) {
      const twoPointRule = rules.scoringRules.find(r => 
        r.category === 'other' && r.action === '2pt-conversion'
      );
      if (twoPointRule) {
        points += stats.twoPointConversions * twoPointRule.points;
      }
    }
    
    // Bonuses for yardage thresholds
    rules.scoringRules
      .filter(rule => rule.action.includes('threshold') && rule.threshold)
      .forEach(rule => {
        if (rule.category === 'passing' && stats.passingYards >= rule.threshold!) {
          points += rule.points;
        } else if (rule.category === 'rushing' && stats.rushingYards >= rule.threshold!) {
          points += rule.points;
        } else if (rule.category === 'receiving' && stats.receivingYards >= rule.threshold!) {
          points += rule.points;
        }
      });
    
    // Bonuses for long TDs
    const longTDRule = rules.scoringRules.find(r => 
      r.category === 'other' && r.action === 'long-td'
    );
    
    if (longTDRule && longTDRule.threshold) {
      // Assuming stats includes counts of long TDs
      if (stats.longPassingTDs) {
        points += stats.longPassingTDs * longTDRule.points;
      }
      if (stats.longRushingTDs) {
        points += stats.longRushingTDs * longTDRule.points;
      }
      if (stats.longReceivingTDs) {
        points += stats.longReceivingTDs * longTDRule.points;
      }
    }
    
    return Math.round(points * 10) / 10; // Round to 1 decimal place
  },
  
  // Generate mock player stats for testing
  getMockPlayerStats(player: Player): any {
    const position = player.position;
    const playerValue = player.dynasty_value || 50; // Higher value = better player
    const valueMultiplier = playerValue / 50; // 1.0 for average players, higher for stars
    
    // Base stats by position with randomization
    switch (position) {
      case 'QB':
        return {
          position,
          passingYards: Math.round((3500 + Math.random() * 1500) * valueMultiplier),
          passingTDs: Math.round((22 + Math.random() * 18) * valueMultiplier),
          interceptions: Math.round((8 + Math.random() * 7) * (1 / valueMultiplier)), // Better players throw fewer INTs
          rushingYards: Math.round((200 + Math.random() * 300) * valueMultiplier),
          rushingTDs: Math.round((2 + Math.random() * 4) * valueMultiplier),
          fumbles: Math.round((1 + Math.random() * 3) * (1 / valueMultiplier)),
          twoPointConversions: Math.round(Math.random() * 3),
          longPassingTDs: Math.round((2 + Math.random() * 3) * valueMultiplier),
          longRushingTDs: Math.round(Math.random() * 1)
        };
      
      case 'RB':
        return {
          position,
          rushingYards: Math.round((800 + Math.random() * 700) * valueMultiplier),
          rushingTDs: Math.round((5 + Math.random() * 7) * valueMultiplier),
          receptions: Math.round((25 + Math.random() * 35) * valueMultiplier),
          receivingYards: Math.round((200 + Math.random() * 300) * valueMultiplier),
          receivingTDs: Math.round((1 + Math.random() * 3) * valueMultiplier),
          fumbles: Math.round((1 + Math.random() * 2) * (1 / valueMultiplier)),
          twoPointConversions: Math.round(Math.random() * 1),
          longRushingTDs: Math.round((1 + Math.random() * 2) * valueMultiplier),
          longReceivingTDs: Math.round(Math.random() * 1)
        };
      
      case 'WR':
        return {
          position,
          receptions: Math.round((60 + Math.random() * 40) * valueMultiplier),
          receivingYards: Math.round((800 + Math.random() * 600) * valueMultiplier),
          receivingTDs: Math.round((5 + Math.random() * 7) * valueMultiplier),
          rushingYards: Math.round((0 + Math.random() * 100) * valueMultiplier),
          rushingTDs: Math.round(Math.random() * 1),
          fumbles: Math.round(Math.random() * 1),
          twoPointConversions: Math.round(Math.random() * 1),
          longReceivingTDs: Math.round((1 + Math.random() * 3) * valueMultiplier)
        };
      
      case 'TE':
        return {
          position,
          receptions: Math.round((40 + Math.random() * 30) * valueMultiplier),
          receivingYards: Math.round((500 + Math.random() * 300) * valueMultiplier),
          receivingTDs: Math.round((3 + Math.random() * 5) * valueMultiplier),
          fumbles: Math.round(Math.random() * 1),
          twoPointConversions: Math.round(Math.random() * 1),
          longReceivingTDs: Math.round(Math.random() * 2)
        };
      
      case 'K':
        return {
          position,
          fieldGoals: Math.round((20 + Math.random() * 10) * valueMultiplier),
          extraPoints: Math.round((30 + Math.random() * 15) * valueMultiplier)
        };
      
      case 'DEF':
        return {
          position,
          sacks: Math.round((30 + Math.random() * 20) * valueMultiplier),
          interceptions: Math.round((10 + Math.random() * 8) * valueMultiplier),
          fumbleRecoveries: Math.round((5 + Math.random() * 5) * valueMultiplier),
          defensiveTDs: Math.round((1 + Math.random() * 2) * valueMultiplier),
          safeties: Math.round(Math.random() * 1),
          pointsAllowed: Math.round((350 - Math.random() * 100) * (1 / valueMultiplier))
        };
      
      default:
        return {};
    }
  },
  
  // Get mock players for testing
  getMockPlayers(): Player[] {
    return [
      {
        id: 'p1',
        full_name: 'Patrick Mahomes',
        position: 'QB',
        team: 'KC',
        age: 28,
        height: 75,
        weight: 225,
        college: 'Texas Tech',
        experience: 6,
        injury_status: null,
        status: 'Active',
        jersey_number: '15',
        rookie: false,
        draft_year: 2017,
        draft_round: 1,
        draft_pick: 10,
        avatar_url: '',
        dynasty_value: 95
      },
      {
        id: 'p2',
        full_name: 'Josh Allen',
        position: 'QB',
        team: 'BUF',
        age: 27,
        height: 77,
        weight: 237,
        college: 'Wyoming',
        experience: 5,
        injury_status: null,
        status: 'Active',
        jersey_number: '17',
        rookie: false,
        draft_year: 2018,
        draft_round: 1,
        draft_pick: 7,
        avatar_url: '',
        dynasty_value: 93
      },
      {
        id: 'p3',
        full_name: 'Christian McCaffrey',
        position: 'RB',
        team: 'SF',
        age: 27,
        height: 71,
        weight: 205,
        college: 'Stanford',
        experience: 6,
        injury_status: null,
        status: 'Active',
        jersey_number: '23',
        rookie: false,
        draft_year: 2017,
        draft_round: 1,
        draft_pick: 8,
        avatar_url: '',
        dynasty_value: 96
      },
      {
        id: 'p4',
        full_name: 'Justin Jefferson',
        position: 'WR',
        team: 'MIN',
        age: 24,
        height: 73,
        weight: 195,
        college: 'LSU',
        experience: 3,
        injury_status: null,
        status: 'Active',
        jersey_number: '18',
        rookie: false,
        draft_year: 2020,
        draft_round: 1,
        draft_pick: 22,
        avatar_url: '',
        dynasty_value: 98
      },
      {
        id: 'p5',
        full_name: 'Travis Kelce',
        position: 'TE',
        team: 'KC',
        age: 33,
        height: 77,
        weight: 250,
        college: 'Cincinnati',
        experience: 10,
        injury_status: null,
        status: 'Active',
        jersey_number: '87',
        rookie: false,
        draft_year: 2013,
        draft_round: 3,
        draft_pick: 63,
        avatar_url: '',
        dynasty_value: 85
      }
    ];
  }
};

export default LeagueRulesService;