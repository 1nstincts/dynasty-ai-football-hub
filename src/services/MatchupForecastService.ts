import { supabase } from '../integrations/supabase/client';
import SleeperService from './SleeperService';
import PlayerService from './PlayerService';
import MatchupService from './MatchupService';
import { Player } from '../integrations/supabase/types';

export interface MatchupProbability {
  matchupId: string;
  leagueId: string;
  week: number;
  season: number;
  teamId1: string;
  teamId2: string;
  winProbabilityTeam1: number;
  winProbabilityTeam2: number;
  projectedPointsTeam1: number;
  projectedPointsTeam2: number;
  team1PointRange: [number, number]; // [min, max]
  team2PointRange: [number, number]; // [min, max]
  confidenceLevel: 'low' | 'medium' | 'high';
  impactPlayers: ImpactPlayer[];
  keyMatchups: KeyMatchup[];
  analysisFactors: AnalysisFactor[];
  createdAt: string;
  updatedAt: string;
}

export interface ImpactPlayer {
  playerId: string;
  teamId: string;
  name: string;
  position: string;
  projectedPoints: number;
  projectedPointsRange: [number, number]; // [min, max]
  impactScore: number; // 0-100, how much this player impacts the matchup outcome
  riskLevel: 'low' | 'medium' | 'high';
  reasonForImpact: string;
}

export interface KeyMatchup {
  position: string;
  team1PlayerId: string;
  team1PlayerName: string;
  team1PlayerProjection: number;
  team2PlayerId: string;
  team2PlayerName: string;
  team2PlayerProjection: number;
  advantageTeam: 1 | 2 | 0; // 1 = team1, 2 = team2, 0 = even
  advantageAmount: number; // points difference
}

export interface AnalysisFactor {
  factorName: string;
  factorType: 'positive' | 'negative' | 'neutral';
  description: string;
  team1Impact: number; // -100 to 100
  team2Impact: number; // -100 to 100
}

export interface MatchupSimulationResult {
  iterations: number;
  team1Wins: number;
  team2Wins: number;
  ties: number;
  team1WinProbability: number;
  team2WinProbability: number;
  tieProbability: number;
  team1ScoreDistribution: PointDistribution[];
  team2ScoreDistribution: PointDistribution[];
  simulationInsights: string[];
}

export interface PointDistribution {
  scoreRange: string; // e.g. "90-100"
  frequency: number;
  percentage: number;
}

export interface TeamRoster {
  teamId: string;
  players: Player[];
  projections: {
    [playerId: string]: PlayerProjection;
  };
}

export interface PlayerProjection {
  mean: number;
  min: number;
  max: number;
  stdDev: number;
  consistency: number; // 0-100, higher = more consistent
  boom_bust_ratio: number; // higher = more boom/bust
  injury_risk: number; // 0-100, higher = riskier
}

const MatchupForecastService = {
  // Get matchup probability for a specific matchup
  async getMatchupProbability(leagueId: string, matchupId: string): Promise<MatchupProbability | null> {
    try {
      // First check if we have a saved forecast for this matchup
      const { data, error } = await supabase
        .from('matchup_forecasts')
        .select('*')
        .eq('league_id', leagueId)
        .eq('matchup_id', matchupId)
        .single();
      
      if (error || !data) {
        console.log('No saved forecast found, generating new one');
        // Generate a new forecast
        return this.generateMatchupProbability(leagueId, matchupId);
      }
      
      // Transform data to match our interface
      return {
        matchupId: data.matchup_id,
        leagueId: data.league_id,
        week: data.week,
        season: data.season,
        teamId1: data.team_id_1,
        teamId2: data.team_id_2,
        winProbabilityTeam1: data.win_probability_team_1,
        winProbabilityTeam2: data.win_probability_team_2,
        projectedPointsTeam1: data.projected_points_team_1,
        projectedPointsTeam2: data.projected_points_team_2,
        team1PointRange: data.team_1_point_range,
        team2PointRange: data.team_2_point_range,
        confidenceLevel: data.confidence_level,
        impactPlayers: data.impact_players,
        keyMatchups: data.key_matchups,
        analysisFactors: data.analysis_factors,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error getting matchup probability:', error);
      return null;
    }
  },
  
  // Generate a new matchup probability analysis
  async generateMatchupProbability(leagueId: string, matchupId: string): Promise<MatchupProbability | null> {
    try {
      // Get matchup details
      const matchup = await MatchupService.getMatchupById(leagueId, matchupId);
      if (!matchup) {
        console.error('Matchup not found');
        return null;
      }
      
      // Get team rosters and player projections
      const team1Roster = await this.getTeamRosterWithProjections(leagueId, matchup.team1Id);
      const team2Roster = await this.getTeamRosterWithProjections(leagueId, matchup.team2Id);
      
      if (!team1Roster || !team2Roster) {
        console.error('Could not get team rosters');
        return null;
      }
      
      // Simulate the matchup
      const simulationResults = this.simulateMatchup(team1Roster, team2Roster);
      
      // Analyze key matchups
      const keyMatchups = this.analyzeKeyMatchups(team1Roster, team2Roster);
      
      // Identify impact players
      const impactPlayers = this.identifyImpactPlayers(team1Roster, team2Roster, simulationResults);
      
      // Analyze factors affecting matchup
      const analysisFactors = this.analyzeMatchupFactors(team1Roster, team2Roster);
      
      // Calculate projected points
      const projectedPointsTeam1 = this.calculateTeamProjectedPoints(team1Roster);
      const projectedPointsTeam2 = this.calculateTeamProjectedPoints(team2Roster);
      
      // Determine confidence level
      const confidenceLevel = this.determineConfidenceLevel(simulationResults);
      
      // Calculate point ranges
      const team1PointRange = this.calculatePointRange(team1Roster);
      const team2PointRange = this.calculatePointRange(team2Roster);
      
      // Create the matchup probability object
      const matchupProbability: MatchupProbability = {
        matchupId,
        leagueId,
        week: matchup.week,
        season: matchup.season,
        teamId1: matchup.team1Id,
        teamId2: matchup.team2Id,
        winProbabilityTeam1: simulationResults.team1WinProbability,
        winProbabilityTeam2: simulationResults.team2WinProbability,
        projectedPointsTeam1,
        projectedPointsTeam2,
        team1PointRange,
        team2PointRange,
        confidenceLevel,
        impactPlayers,
        keyMatchups,
        analysisFactors,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save the forecast to the database
      this.saveMatchupProbability(matchupProbability);
      
      return matchupProbability;
    } catch (error) {
      console.error('Error generating matchup probability:', error);
      return null;
    }
  },
  
  // Get team roster with player projections
  async getTeamRosterWithProjections(leagueId: string, teamId: string): Promise<TeamRoster | null> {
    try {
      // Get team roster
      const teamData = await SleeperService.getTeamRoster(leagueId, teamId);
      if (!teamData || !teamData.players) {
        return null;
      }
      
      // Get player projections
      const playerIds = teamData.players.map(p => p.id);
      const projections: { [playerId: string]: PlayerProjection } = {};
      
      // For now, we'll just generate mock projections
      for (const playerId of playerIds) {
        projections[playerId] = this.generateMockPlayerProjection(
          teamData.players.find(p => p.id === playerId)?.position || 'UNKNOWN'
        );
      }
      
      return {
        teamId,
        players: teamData.players,
        projections
      };
    } catch (error) {
      console.error('Error getting team roster with projections:', error);
      return null;
    }
  },
  
  // Simulate matchup between two teams
  simulateMatchup(team1Roster: TeamRoster, team2Roster: TeamRoster, iterations: number = 10000): MatchupSimulationResult {
    // Initialize result object
    const result: MatchupSimulationResult = {
      iterations,
      team1Wins: 0,
      team2Wins: 0,
      ties: 0,
      team1WinProbability: 0,
      team2WinProbability: 0,
      tieProbability: 0,
      team1ScoreDistribution: [],
      team2ScoreDistribution: [],
      simulationInsights: []
    };
    
    // Prepare score distributions
    const team1Scores: number[] = [];
    const team2Scores: number[] = [];
    
    // Run simulation iterations
    for (let i = 0; i < iterations; i++) {
      // Calculate team scores for this iteration
      const team1Score = this.simulateTeamScore(team1Roster);
      const team2Score = this.simulateTeamScore(team2Roster);
      
      // Record scores
      team1Scores.push(team1Score);
      team2Scores.push(team2Score);
      
      // Determine winner
      if (team1Score > team2Score) {
        result.team1Wins++;
      } else if (team2Score > team1Score) {
        result.team2Wins++;
      } else {
        result.ties++;
      }
    }
    
    // Calculate probabilities
    result.team1WinProbability = result.team1Wins / iterations;
    result.team2WinProbability = result.team2Wins / iterations;
    result.tieProbability = result.ties / iterations;
    
    // Generate score distributions
    result.team1ScoreDistribution = this.generateScoreDistribution(team1Scores);
    result.team2ScoreDistribution = this.generateScoreDistribution(team2Scores);
    
    // Generate insights
    result.simulationInsights = this.generateSimulationInsights(result, team1Roster, team2Roster);
    
    return result;
  },
  
  // Simulate a team's score for a single iteration
  simulateTeamScore(teamRoster: TeamRoster): number {
    let totalScore = 0;
    
    // Get all starters
    const starters = teamRoster.players.filter(p => p.isStarter);
    
    // For each starter, simulate their score
    for (const player of starters) {
      const projection = teamRoster.projections[player.id];
      if (!projection) continue;
      
      // Use a normal distribution based on mean and stdDev
      const playerScore = this.generateNormalRandom(
        projection.mean,
        projection.stdDev
      );
      
      totalScore += playerScore;
    }
    
    return Math.max(0, totalScore); // Ensure score is not negative
  },
  
  // Generate a random number from a normal distribution
  generateNormalRandom(mean: number, stdDev: number): number {
    // Box-Muller transform
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + stdDev * z;
  },
  
  // Generate score distribution from an array of scores
  generateScoreDistribution(scores: number[]): PointDistribution[] {
    // Find min and max scores
    const minScore = Math.floor(Math.min(...scores) / 10) * 10;
    const maxScore = Math.ceil(Math.max(...scores) / 10) * 10;
    
    // Create bins (10-point ranges)
    const bins: { [range: string]: number } = {};
    for (let i = minScore; i < maxScore; i += 10) {
      bins[`${i}-${i + 10}`] = 0;
    }
    
    // Count scores in each bin
    for (const score of scores) {
      const bin = `${Math.floor(score / 10) * 10}-${Math.floor(score / 10) * 10 + 10}`;
      bins[bin] = (bins[bin] || 0) + 1;
    }
    
    // Convert to point distribution format
    const distribution: PointDistribution[] = Object.entries(bins).map(([scoreRange, frequency]) => ({
      scoreRange,
      frequency,
      percentage: frequency / scores.length
    }));
    
    return distribution.sort((a, b) => {
      const [aMin] = a.scoreRange.split('-').map(Number);
      const [bMin] = b.scoreRange.split('-').map(Number);
      return aMin - bMin;
    });
  },
  
  // Generate insights based on simulation results
  generateSimulationInsights(
    result: MatchupSimulationResult,
    team1Roster: TeamRoster,
    team2Roster: TeamRoster
  ): string[] {
    const insights: string[] = [];
    
    // Win probability insight
    const favoredTeam = result.team1WinProbability > result.team2WinProbability ? 1 : 2;
    const winProbability = favoredTeam === 1 ? result.team1WinProbability : result.team2WinProbability;
    
    if (winProbability > 0.7) {
      insights.push(`Team ${favoredTeam} is heavily favored with a ${(winProbability * 100).toFixed(1)}% chance of winning.`);
    } else if (winProbability > 0.55) {
      insights.push(`Team ${favoredTeam} is slightly favored with a ${(winProbability * 100).toFixed(1)}% chance of winning.`);
    } else {
      insights.push(`This matchup is nearly a toss-up with Team 1 at ${(result.team1WinProbability * 100).toFixed(1)}% and Team 2 at ${(result.team2WinProbability * 100).toFixed(1)}%.`);
    }
    
    // Score distribution insights
    const team1MostLikelyRange = [...result.team1ScoreDistribution].sort((a, b) => b.percentage - a.percentage)[0];
    const team2MostLikelyRange = [...result.team2ScoreDistribution].sort((a, b) => b.percentage - a.percentage)[0];
    
    insights.push(`Team 1 is most likely to score between ${team1MostLikelyRange.scoreRange} points (${(team1MostLikelyRange.percentage * 100).toFixed(1)}% chance).`);
    insights.push(`Team 2 is most likely to score between ${team2MostLikelyRange.scoreRange} points (${(team2MostLikelyRange.percentage * 100).toFixed(1)}% chance).`);
    
    // Variance insights
    const team1Variance = this.calculateVariance(result.team1ScoreDistribution);
    const team2Variance = this.calculateVariance(result.team2ScoreDistribution);
    
    if (team1Variance > team2Variance * 1.5) {
      insights.push(`Team 1 has significantly more scoring variance, making them more unpredictable.`);
    } else if (team2Variance > team1Variance * 1.5) {
      insights.push(`Team 2 has significantly more scoring variance, making them more unpredictable.`);
    }
    
    return insights;
  },
  
  // Calculate variance from point distribution
  calculateVariance(distribution: PointDistribution[]): number {
    // Calculate mean
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const bin of distribution) {
      const [min, max] = bin.scoreRange.split('-').map(Number);
      const midpoint = (min + max) / 2;
      totalScore += midpoint * bin.frequency;
      totalWeight += bin.frequency;
    }
    
    const mean = totalScore / totalWeight;
    
    // Calculate variance
    let variance = 0;
    for (const bin of distribution) {
      const [min, max] = bin.scoreRange.split('-').map(Number);
      const midpoint = (min + max) / 2;
      variance += ((midpoint - mean) ** 2) * bin.frequency;
    }
    
    return variance / totalWeight;
  },
  
  // Analyze key position matchups between teams
  analyzeKeyMatchups(team1Roster: TeamRoster, team2Roster: TeamRoster): KeyMatchup[] {
    const keyMatchups: KeyMatchup[] = [];
    const positions = ['QB', 'RB', 'WR', 'TE'];
    
    for (const position of positions) {
      // Get starters for each position
      const team1Starters = team1Roster.players.filter(p => p.position === position && p.isStarter);
      const team2Starters = team2Roster.players.filter(p => p.position === position && p.isStarter);
      
      // Create matchups for each position
      for (let i = 0; i < Math.max(team1Starters.length, team2Starters.length); i++) {
        const team1Player = team1Starters[i];
        const team2Player = team2Starters[i];
        
        if (!team1Player || !team2Player) continue; // Skip if either team doesn't have a player at this position slot
        
        const team1Projection = team1Roster.projections[team1Player.id]?.mean || 0;
        const team2Projection = team2Roster.projections[team2Player.id]?.mean || 0;
        
        // Determine advantage
        let advantageTeam: 1 | 2 | 0 = 0;
        let advantageAmount = 0;
        
        if (team1Projection > team2Projection) {
          advantageTeam = 1;
          advantageAmount = team1Projection - team2Projection;
        } else if (team2Projection > team1Projection) {
          advantageTeam = 2;
          advantageAmount = team2Projection - team1Projection;
        }
        
        // Only add significant matchups (advantage > 1 point)
        if (advantageAmount > 1) {
          keyMatchups.push({
            position,
            team1PlayerId: team1Player.id,
            team1PlayerName: team1Player.full_name,
            team1PlayerProjection: team1Projection,
            team2PlayerId: team2Player.id,
            team2PlayerName: team2Player.full_name,
            team2PlayerProjection: team2Projection,
            advantageTeam,
            advantageAmount
          });
        }
      }
    }
    
    // Sort by advantage amount (largest first)
    return keyMatchups.sort((a, b) => b.advantageAmount - a.advantageAmount);
  },
  
  // Identify players with the biggest impact on matchup outcome
  identifyImpactPlayers(
    team1Roster: TeamRoster,
    team2Roster: TeamRoster,
    simulation: MatchupSimulationResult
  ): ImpactPlayer[] {
    const impactPlayers: ImpactPlayer[] = [];
    
    // Get all starters from both teams
    const allPlayers = [
      ...team1Roster.players.filter(p => p.isStarter).map(p => ({ player: p, teamId: team1Roster.teamId })),
      ...team2Roster.players.filter(p => p.isStarter).map(p => ({ player: p, teamId: team2Roster.teamId }))
    ];
    
    for (const { player, teamId } of allPlayers) {
      // Get player projection
      const projection = teamId === team1Roster.teamId 
        ? team1Roster.projections[player.id] 
        : team2Roster.projections[player.id];
      
      if (!projection) continue;
      
      // Calculate impact score based on projection and consistency
      const impactScore = Math.min(100, (projection.mean / 25) * 100 + (100 - projection.consistency) * 0.3);
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (projection.injury_risk > 30) {
        riskLevel = projection.injury_risk > 60 ? 'high' : 'medium';
      } else if (projection.boom_bust_ratio > 1.5) {
        riskLevel = projection.boom_bust_ratio > 2.5 ? 'high' : 'medium';
      }
      
      // Generate reason for impact
      let reasonForImpact = '';
      if (projection.mean > 20) {
        reasonForImpact = 'High projected scoring output';
      } else if (projection.consistency < 60) {
        reasonForImpact = 'Highly variable performance';
      } else if (projection.injury_risk > 50) {
        reasonForImpact = 'Significant injury risk';
      } else if (projection.boom_bust_ratio > 2) {
        reasonForImpact = 'Boom-bust player with game-changing potential';
      } else {
        reasonForImpact = 'Consistent contributor';
      }
      
      // Only include players with significant impact
      if (impactScore > 30) {
        impactPlayers.push({
          playerId: player.id,
          teamId,
          name: player.full_name,
          position: player.position,
          projectedPoints: projection.mean,
          projectedPointsRange: [projection.min, projection.max],
          impactScore,
          riskLevel,
          reasonForImpact
        });
      }
    }
    
    // Sort by impact score (highest first)
    return impactPlayers.sort((a, b) => b.impactScore - a.impactScore).slice(0, 6);
  },
  
  // Analyze factors affecting the matchup
  analyzeMatchupFactors(team1Roster: TeamRoster, team2Roster: TeamRoster): AnalysisFactor[] {
    const factors: AnalysisFactor[] = [];
    
    // Analyze positional strength
    const positions = ['QB', 'RB', 'WR', 'TE'];
    for (const position of positions) {
      const team1Starters = team1Roster.players.filter(p => p.position === position && p.isStarter);
      const team2Starters = team2Roster.players.filter(p => p.position === position && p.isStarter);
      
      const team1Strength = team1Starters.reduce((sum, p) => sum + (team1Roster.projections[p.id]?.mean || 0), 0);
      const team2Strength = team2Starters.reduce((sum, p) => sum + (team2Roster.projections[p.id]?.mean || 0), 0);
      
      const difference = team1Strength - team2Strength;
      const absDifference = Math.abs(difference);
      
      if (absDifference > 3) {
        const factorType: 'positive' | 'negative' | 'neutral' = difference > 0 ? 'positive' : 'negative';
        const team1Impact = difference > 0 ? 50 : -50;
        const team2Impact = difference > 0 ? -50 : 50;
        
        factors.push({
          factorName: `${position} Advantage`,
          factorType,
          description: `${difference > 0 ? 'Team 1' : 'Team 2'} has a significant advantage at the ${position} position.`,
          team1Impact,
          team2Impact
        });
      }
    }
    
    // Analyze team variance
    const team1Variance = this.calculateTeamVariance(team1Roster);
    const team2Variance = this.calculateTeamVariance(team2Roster);
    
    if (team1Variance > team2Variance * 1.5) {
      factors.push({
        factorName: 'Team 1 Variance',
        factorType: 'neutral',
        description: 'Team 1 has high scoring variance, making their performance less predictable.',
        team1Impact: 0,
        team2Impact: 0
      });
    } else if (team2Variance > team1Variance * 1.5) {
      factors.push({
        factorName: 'Team 2 Variance',
        factorType: 'neutral',
        description: 'Team 2 has high scoring variance, making their performance less predictable.',
        team1Impact: 0,
        team2Impact: 0
      });
    }
    
    // Analyze injury risk
    const team1InjuryRisk = this.calculateTeamInjuryRisk(team1Roster);
    const team2InjuryRisk = this.calculateTeamInjuryRisk(team2Roster);
    
    if (team1InjuryRisk > 50) {
      factors.push({
        factorName: 'Team 1 Injury Risk',
        factorType: 'negative',
        description: 'Team 1 has significant injury risk among key players.',
        team1Impact: -60,
        team2Impact: 30
      });
    }
    
    if (team2InjuryRisk > 50) {
      factors.push({
        factorName: 'Team 2 Injury Risk',
        factorType: 'negative',
        description: 'Team 2 has significant injury risk among key players.',
        team1Impact: 30,
        team2Impact: -60
      });
    }
    
    return factors;
  },
  
  // Calculate team variance
  calculateTeamVariance(teamRoster: TeamRoster): number {
    const starters = teamRoster.players.filter(p => p.isStarter);
    let totalVariance = 0;
    
    for (const player of starters) {
      const projection = teamRoster.projections[player.id];
      if (!projection) continue;
      
      totalVariance += projection.stdDev ** 2;
    }
    
    return totalVariance;
  },
  
  // Calculate team injury risk
  calculateTeamInjuryRisk(teamRoster: TeamRoster): number {
    const starters = teamRoster.players.filter(p => p.isStarter);
    let totalRisk = 0;
    let totalPlayers = 0;
    
    for (const player of starters) {
      const projection = teamRoster.projections[player.id];
      if (!projection) continue;
      
      totalRisk += projection.injury_risk;
      totalPlayers++;
    }
    
    return totalPlayers > 0 ? totalRisk / totalPlayers : 0;
  },
  
  // Calculate projected points for a team
  calculateTeamProjectedPoints(teamRoster: TeamRoster): number {
    const starters = teamRoster.players.filter(p => p.isStarter);
    let totalPoints = 0;
    
    for (const player of starters) {
      const projection = teamRoster.projections[player.id];
      if (!projection) continue;
      
      totalPoints += projection.mean;
    }
    
    return totalPoints;
  },
  
  // Calculate point range for a team
  calculatePointRange(teamRoster: TeamRoster): [number, number] {
    const starters = teamRoster.players.filter(p => p.isStarter);
    let minPoints = 0;
    let maxPoints = 0;
    
    for (const player of starters) {
      const projection = teamRoster.projections[player.id];
      if (!projection) continue;
      
      minPoints += projection.min;
      maxPoints += projection.max;
    }
    
    return [Math.max(0, Math.floor(minPoints)), Math.ceil(maxPoints)];
  },
  
  // Determine confidence level for matchup prediction
  determineConfidenceLevel(simulation: MatchupSimulationResult): 'low' | 'medium' | 'high' {
    const winProbability = Math.max(simulation.team1WinProbability, simulation.team2WinProbability);
    
    if (winProbability > 0.75) {
      return 'high';
    } else if (winProbability > 0.6) {
      return 'medium';
    } else {
      return 'low';
    }
  },
  
  // Save matchup probability to database
  async saveMatchupProbability(probability: MatchupProbability): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('matchup_forecasts')
        .upsert([
          {
            matchup_id: probability.matchupId,
            league_id: probability.leagueId,
            week: probability.week,
            season: probability.season,
            team_id_1: probability.teamId1,
            team_id_2: probability.teamId2,
            win_probability_team_1: probability.winProbabilityTeam1,
            win_probability_team_2: probability.winProbabilityTeam2,
            projected_points_team_1: probability.projectedPointsTeam1,
            projected_points_team_2: probability.projectedPointsTeam2,
            team_1_point_range: probability.team1PointRange,
            team_2_point_range: probability.team2PointRange,
            confidence_level: probability.confidenceLevel,
            impact_players: probability.impactPlayers,
            key_matchups: probability.keyMatchups,
            analysis_factors: probability.analysisFactors,
            created_at: probability.createdAt,
            updated_at: probability.updatedAt
          }
        ]);
      
      if (error) {
        console.error('Error saving matchup probability:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving matchup probability:', error);
      return false;
    }
  },
  
  // Simulate a season of matchups
  async simulateSeasonMatchups(leagueId: string, season: number): Promise<boolean> {
    try {
      // Get league schedule
      const schedule = await MatchupService.getLeagueSchedule(leagueId, season);
      if (!schedule) {
        console.error('Could not get league schedule');
        return false;
      }
      
      // For each week, simulate matchups
      for (const week of Object.keys(schedule)) {
        const weekNum = parseInt(week);
        const matchups = schedule[weekNum];
        
        for (const matchup of matchups) {
          await this.generateMatchupProbability(leagueId, matchup.id);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error simulating season matchups:', error);
      return false;
    }
  },
  
  // Generate a mock player projection
  generateMockPlayerProjection(position: string): PlayerProjection {
    let mean = 0;
    let stdDev = 0;
    let consistency = 0;
    let boomBustRatio = 0;
    let injuryRisk = 0;
    
    // Base values by position
    switch (position) {
      case 'QB':
        mean = 15 + Math.random() * 10;
        stdDev = 3 + Math.random() * 3;
        consistency = 60 + Math.random() * 30;
        boomBustRatio = 0.8 + Math.random() * 1.2;
        injuryRisk = 10 + Math.random() * 20;
        break;
      case 'RB':
        mean = 10 + Math.random() * 10;
        stdDev = 4 + Math.random() * 4;
        consistency = 50 + Math.random() * 30;
        boomBustRatio = 1.0 + Math.random() * 1.5;
        injuryRisk = 20 + Math.random() * 40;
        break;
      case 'WR':
        mean = 8 + Math.random() * 10;
        stdDev = 4 + Math.random() * 5;
        consistency = 40 + Math.random() * 40;
        boomBustRatio = 1.2 + Math.random() * 1.8;
        injuryRisk = 15 + Math.random() * 30;
        break;
      case 'TE':
        mean = 6 + Math.random() * 8;
        stdDev = 3 + Math.random() * 4;
        consistency = 40 + Math.random() * 40;
        boomBustRatio = 1.0 + Math.random() * 2.0;
        injuryRisk = 15 + Math.random() * 25;
        break;
      case 'K':
        mean = 6 + Math.random() * 4;
        stdDev = 2 + Math.random() * 2;
        consistency = 60 + Math.random() * 20;
        boomBustRatio = 0.6 + Math.random() * 0.8;
        injuryRisk = 5 + Math.random() * 10;
        break;
      case 'DEF':
        mean = 6 + Math.random() * 5;
        stdDev = 3 + Math.random() * 3;
        consistency = 30 + Math.random() * 40;
        boomBustRatio = 1.5 + Math.random() * 1.5;
        injuryRisk = 5 + Math.random() * 10;
        break;
      default:
        mean = 5 + Math.random() * 5;
        stdDev = 2 + Math.random() * 3;
        consistency = 50 + Math.random() * 30;
        boomBustRatio = 1.0 + Math.random() * 1.0;
        injuryRisk = 10 + Math.random() * 20;
    }
    
    // Calculate min and max based on mean and stdDev
    const min = Math.max(0, mean - 2 * stdDev);
    const max = mean + 2 * stdDev;
    
    return {
      mean,
      min,
      max,
      stdDev,
      consistency,
      boom_bust_ratio: boomBustRatio,
      injury_risk: injuryRisk
    };
  },
  
  // Get mock matchup probability for demo purposes
  getMockMatchupProbability(leagueId: string, matchupId: string): MatchupProbability {
    const now = new Date().toISOString();
    
    // Generate random team IDs
    const teamId1 = `team-${Math.floor(Math.random() * 1000)}`;
    const teamId2 = `team-${Math.floor(Math.random() * 1000)}`;
    
    // Generate random probabilities
    const winProbabilityTeam1 = 0.3 + Math.random() * 0.4; // between 30% and 70%
    const winProbabilityTeam2 = 1 - winProbabilityTeam1;
    
    // Generate projected points
    const projectedPointsTeam1 = 90 + Math.random() * 40; // between 90 and 130
    const projectedPointsTeam2 = 90 + Math.random() * 40; // between 90 and 130
    
    // Generate point ranges
    const team1PointRange: [number, number] = [
      Math.floor(projectedPointsTeam1 * 0.8),
      Math.ceil(projectedPointsTeam1 * 1.2)
    ];
    
    const team2PointRange: [number, number] = [
      Math.floor(projectedPointsTeam2 * 0.8),
      Math.ceil(projectedPointsTeam2 * 1.2)
    ];
    
    // Determine confidence level
    const confidenceLevel: 'low' | 'medium' | 'high' = 
      Math.abs(winProbabilityTeam1 - winProbabilityTeam2) > 0.3 ? 'high' :
      Math.abs(winProbabilityTeam1 - winProbabilityTeam2) > 0.15 ? 'medium' : 'low';
    
    // Generate impact players
    const impactPlayers: ImpactPlayer[] = [
      {
        playerId: `player-${Math.floor(Math.random() * 1000)}`,
        teamId: teamId1,
        name: 'Patrick Mahomes',
        position: 'QB',
        projectedPoints: 24.5,
        projectedPointsRange: [18, 32],
        impactScore: 85,
        riskLevel: 'low',
        reasonForImpact: 'High projected scoring output'
      },
      {
        playerId: `player-${Math.floor(Math.random() * 1000)}`,
        teamId: teamId2,
        name: 'Christian McCaffrey',
        position: 'RB',
        projectedPoints: 22.8,
        projectedPointsRange: [16, 30],
        impactScore: 82,
        riskLevel: 'medium',
        reasonForImpact: 'High projected scoring output with some injury risk'
      },
      {
        playerId: `player-${Math.floor(Math.random() * 1000)}`,
        teamId: teamId1,
        name: 'Tyreek Hill',
        position: 'WR',
        projectedPoints: 18.2,
        projectedPointsRange: [8, 28],
        impactScore: 75,
        riskLevel: 'high',
        reasonForImpact: 'Boom-bust player with game-changing potential'
      },
      {
        playerId: `player-${Math.floor(Math.random() * 1000)}`,
        teamId: teamId2,
        name: 'Travis Kelce',
        position: 'TE',
        projectedPoints: 16.4,
        projectedPointsRange: [12, 22],
        impactScore: 70,
        riskLevel: 'low',
        reasonForImpact: 'Consistent contributor at premium position'
      }
    ];
    
    // Generate key matchups
    const keyMatchups: KeyMatchup[] = [
      {
        position: 'QB',
        team1PlayerId: `player-${Math.floor(Math.random() * 1000)}`,
        team1PlayerName: 'Patrick Mahomes',
        team1PlayerProjection: 24.5,
        team2PlayerId: `player-${Math.floor(Math.random() * 1000)}`,
        team2PlayerName: 'Josh Allen',
        team2PlayerProjection: 23.8,
        advantageTeam: 1,
        advantageAmount: 0.7
      },
      {
        position: 'RB',
        team1PlayerId: `player-${Math.floor(Math.random() * 1000)}`,
        team1PlayerName: 'Austin Ekeler',
        team1PlayerProjection: 16.2,
        team2PlayerId: `player-${Math.floor(Math.random() * 1000)}`,
        team2PlayerName: 'Christian McCaffrey',
        team2PlayerProjection: 22.8,
        advantageTeam: 2,
        advantageAmount: 6.6
      },
      {
        position: 'WR',
        team1PlayerId: `player-${Math.floor(Math.random() * 1000)}`,
        team1PlayerName: 'Tyreek Hill',
        team1PlayerProjection: 18.2,
        team2PlayerId: `player-${Math.floor(Math.random() * 1000)}`,
        team2PlayerName: 'Justin Jefferson',
        team2PlayerProjection: 17.9,
        advantageTeam: 1,
        advantageAmount: 0.3
      }
    ];
    
    // Generate analysis factors
    const analysisFactors: AnalysisFactor[] = [
      {
        factorName: 'QB Advantage',
        factorType: 'positive',
        description: 'Team 1 has a slight advantage at the QB position.',
        team1Impact: 30,
        team2Impact: -30
      },
      {
        factorName: 'RB Advantage',
        factorType: 'negative',
        description: 'Team 2 has a significant advantage at the RB position.',
        team1Impact: -70,
        team2Impact: 70
      },
      {
        factorName: 'Team 1 Variance',
        factorType: 'neutral',
        description: 'Team 1 has high scoring variance, making their performance less predictable.',
        team1Impact: 0,
        team2Impact: 0
      }
    ];
    
    return {
      matchupId,
      leagueId,
      week: Math.floor(Math.random() * 17) + 1,
      season: 2023,
      teamId1,
      teamId2,
      winProbabilityTeam1,
      winProbabilityTeam2,
      projectedPointsTeam1,
      projectedPointsTeam2,
      team1PointRange,
      team2PointRange,
      confidenceLevel,
      impactPlayers,
      keyMatchups,
      analysisFactors,
      createdAt: now,
      updatedAt: now
    };
  }
};

export default MatchupForecastService;