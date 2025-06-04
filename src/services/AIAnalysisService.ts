import { supabase } from '../integrations/supabase/client';

// Types for our AI Analysis service
export interface Player {
  id: string;
  name: string;
  full_name?: string;
  position: string;
  team: string;
  age: number;
  experience: number;
  dynasty_value: number;
  redraft_value: number;
  injury_status?: 'Healthy' | 'Questionable' | 'Doubtful' | 'Out' | 'IR';
  last_season_points?: number;
  projected_points?: number;
  stats?: PlayerStats;
  trends?: PlayerTrend[];
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  owner_name: string;
  league_id: string;
  roster: Player[];
  record?: {
    wins: number;
    losses: number;
    ties: number;
    pointsFor: number;
    pointsAgainst: number;
  };
}

export interface PlayerStats {
  passing?: {
    yards: number;
    touchdowns: number;
    interceptions: number;
    completions: number;
    attempts: number;
  };
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
  kicking?: {
    fieldGoals: number;
    fieldGoalAttempts: number;
    extraPoints: number;
    extraPointAttempts: number;
  };
}

export interface PlayerTrend {
  week: number;
  points: number;
  targets?: number;
  touches?: number;
  snaps?: number;
  snapPercentage?: number;
}

export interface TeamAnalysis {
  overallRating: number;
  strengthsAndWeaknesses: {
    strengths: string[];
    weaknesses: string[];
  };
  rosterBalance: {
    qbRating: number;
    rbRating: number;
    wrRating: number;
    teRating: number;
  };
  competitiveWindow: {
    currentWindow: 'win-now' | 'contender' | 'retooling' | 'rebuilding';
    windowLength: number;
    corePlayersAverageAge: number;
  };
  recommendations: Recommendation[];
}

export interface Recommendation {
  type: 'trade' | 'waiver' | 'start-sit' | 'draft' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  players?: {
    add?: Player[];
    drop?: Player[];
    trade?: {
      give: Player[];
      receive: Player[];
    };
  };
  impact?: {
    short_term: number; // -10 to 10 scale
    long_term: number; // -10 to 10 scale
  };
}

class AIAnalysisService {
  /**
   * Get a team's roster by team ID
   * @param teamId - The ID of the team
   * @returns Promise resolving to team with roster
   */
  async getTeamWithRoster(teamId: string): Promise<Team | null> {
    try {
      // Get the team data
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*, owner:owner_id(id, name)')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      
      if (!teamData) return null;
      
      // Get the roster players for this team
      const { data: rosterData, error: rosterError } = await supabase
        .from('team_players')
        .select('*, player:player_id(*)')
        .eq('team_id', teamId);
        
      if (rosterError) throw rosterError;
      
      // Map the roster data to our Player type
      const roster = rosterData.map(item => ({
        id: item.player.id,
        name: item.player.full_name || item.player.name,
        full_name: item.player.full_name,
        position: item.player.position,
        team: item.player.team,
        age: item.player.age,
        experience: item.player.experience,
        dynasty_value: item.player.dynasty_value || 0,
        redraft_value: item.player.redraft_value || 0,
        injury_status: item.player.injury_status || 'Healthy',
        last_season_points: item.player.last_season_points,
        projected_points: item.player.projected_points
      }));
      
      // Get the team's record
      const { data: recordData, error: recordError } = await supabase
        .from('team_records')
        .select('*')
        .eq('team_id', teamId)
        .order('season', { ascending: false })
        .limit(1);
        
      const record = recordData && recordData[0] ? {
        wins: recordData[0].wins,
        losses: recordData[0].losses,
        ties: recordData[0].ties,
        pointsFor: recordData[0].points_for,
        pointsAgainst: recordData[0].points_against
      } : undefined;
      
      return {
        id: teamData.id,
        name: teamData.name,
        owner_id: teamData.owner_id,
        owner_name: teamData.owner.name,
        league_id: teamData.league_id,
        roster,
        record
      };
    } catch (error) {
      console.error('Error fetching team with roster:', error);
      return null;
    }
  }

  /**
   * Get player statistics
   * @param playerId - The ID of the player
   * @returns Promise resolving to player statistics
   */
  async getPlayerStats(playerId: string): Promise<PlayerStats | null> {
    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_id', playerId)
        .order('season', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (!data || data.length === 0) return null;
      
      const stats = data[0];
      return {
        passing: stats.passing_yards !== null ? {
          yards: stats.passing_yards,
          touchdowns: stats.passing_tds,
          interceptions: stats.interceptions,
          completions: stats.completions,
          attempts: stats.passing_attempts
        } : undefined,
        rushing: stats.rushing_yards !== null ? {
          yards: stats.rushing_yards,
          touchdowns: stats.rushing_tds,
          attempts: stats.rushing_attempts
        } : undefined,
        receiving: stats.receiving_yards !== null ? {
          yards: stats.receiving_yards,
          touchdowns: stats.receiving_tds,
          receptions: stats.receptions,
          targets: stats.targets
        } : undefined,
        kicking: stats.field_goals !== null ? {
          fieldGoals: stats.field_goals,
          fieldGoalAttempts: stats.field_goal_attempts,
          extraPoints: stats.extra_points,
          extraPointAttempts: stats.extra_point_attempts
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  }

  /**
   * Get player trends over recent weeks
   * @param playerId - The ID of the player
   * @param weeks - Number of weeks to retrieve (default: 5)
   * @returns Promise resolving to player trends
   */
  async getPlayerTrends(playerId: string, weeks: number = 5): Promise<PlayerTrend[]> {
    try {
      const { data, error } = await supabase
        .from('player_weekly_stats')
        .select('*')
        .eq('player_id', playerId)
        .order('week', { ascending: false })
        .limit(weeks);
        
      if (error) throw error;
      
      if (!data) return [];
      
      return data.map(week => ({
        week: week.week,
        points: week.fantasy_points,
        targets: week.targets,
        touches: (week.rushing_attempts || 0) + (week.receptions || 0),
        snaps: week.snaps,
        snapPercentage: week.snap_percentage
      })).reverse(); // Return in ascending week order
    } catch (error) {
      console.error('Error fetching player trends:', error);
      return [];
    }
  }

  /**
   * Get trade recommendations for a team
   * @param teamId - The ID of the team
   * @param leagueId - The ID of the league
   * @returns Promise resolving to trade recommendations
   */
  async getTradeRecommendations(teamId: string, leagueId: string): Promise<Recommendation[]> {
    try {
      // Normally, this would call an AI service to generate personalized trade recommendations
      // For now, we'll return mock data
      
      const team = await this.getTeamWithRoster(teamId);
      if (!team) throw new Error('Team not found');
      
      // Get other teams in the league
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', leagueId)
        .neq('id', teamId);
        
      if (teamsError) throw teamsError;
      
      // Get all players for trade calculations
      const { data: allPlayers, error: playersError } = await supabase
        .from('players')
        .select('*')
        .in('position', ['QB', 'RB', 'WR', 'TE'])
        .order('dynasty_value', { ascending: false });
        
      if (playersError) throw playersError;
      
      // For this mock implementation, we'll generate some example recommendations
      // In a real implementation, this would use the AI service to analyze the team's needs
      const teamNeeds = this.analyzeTeamNeeds(team);
      const recommendations: Recommendation[] = [];
      
      // Generate a mock recommendation based on team needs
      if (teamNeeds.includes('QB') && allPlayers) {
        const targetQb = allPlayers.find(p => p.position === 'QB' && p.dynasty_value > 80 && !team.roster.some(rp => rp.id === p.id));
        const tradeableAsset = team.roster.find(p => p.position === 'RB' && p.dynasty_value > 70);
        
        if (targetQb && tradeableAsset) {
          recommendations.push({
            type: 'trade',
            priority: 'high',
            title: `Upgrade at QB by acquiring ${targetQb.full_name || targetQb.name}`,
            description: `Your QB situation needs improvement, and ${targetQb.full_name || targetQb.name} would be a significant upgrade. Consider offering ${tradeableAsset.name} who has similar dynasty value.`,
            players: {
              trade: {
                give: [tradeableAsset],
                receive: [{
                  id: targetQb.id,
                  name: targetQb.full_name || targetQb.name,
                  position: targetQb.position,
                  team: targetQb.team,
                  age: targetQb.age,
                  experience: targetQb.experience,
                  dynasty_value: targetQb.dynasty_value,
                  redraft_value: targetQb.redraft_value
                }]
              }
            },
            impact: {
              short_term: 7,
              long_term: 8
            }
          });
        }
      }
      
      // Add a general recommendation for team building
      if (this.isRebuildCandidate(team)) {
        recommendations.push({
          type: 'general',
          priority: 'high',
          title: 'Consider entering rebuild mode',
          description: 'Your team has several aging veterans but lacks the overall talent to compete this year. Consider trading veterans for younger players and draft picks to set up future success.',
          impact: {
            short_term: -3,
            long_term: 9
          }
        });
      } else if (this.isContender(team)) {
        recommendations.push({
          type: 'general',
          priority: 'medium',
          title: 'Go all-in this season',
          description: 'Your team is in a strong position to compete for a championship. Consider trading future assets for win-now players to maximize your chances this year.',
          impact: {
            short_term: 8,
            long_term: -2
          }
        });
      }
      
      // Add waiver wire recommendations
      const availablePlayerSuggestion = allPlayers?.find(p => 
        p.position === 'WR' && 
        p.dynasty_value > 40 && 
        p.dynasty_value < 60 && 
        !team.roster.some(rp => rp.id === p.id)
      );
      
      if (availablePlayerSuggestion) {
        recommendations.push({
          type: 'waiver',
          priority: 'medium',
          title: `Add ${availablePlayerSuggestion.full_name || availablePlayerSuggestion.name} from waivers`,
          description: `${availablePlayerSuggestion.full_name || availablePlayerSuggestion.name} has shown promise and could be a valuable depth piece with upside. Consider adding them to your roster.`,
          players: {
            add: [{
              id: availablePlayerSuggestion.id,
              name: availablePlayerSuggestion.full_name || availablePlayerSuggestion.name,
              position: availablePlayerSuggestion.position,
              team: availablePlayerSuggestion.team,
              age: availablePlayerSuggestion.age,
              experience: availablePlayerSuggestion.experience,
              dynasty_value: availablePlayerSuggestion.dynasty_value,
              redraft_value: availablePlayerSuggestion.redraft_value
            }]
          },
          impact: {
            short_term: 3,
            long_term: 5
          }
        });
      }
      
      // Generate a start/sit recommendation if we have relevant player data
      const potentialBenchPlayer = team.roster.find(p => 
        p.position === 'RB' && 
        p.projected_points && 
        p.projected_points > 10
      );
      
      const potentialStartPlayer = team.roster.find(p => 
        p.position === 'RB' && 
        p !== potentialBenchPlayer && 
        p.projected_points && 
        p.projected_points < potentialBenchPlayer?.projected_points!
      );
      
      if (potentialBenchPlayer && potentialStartPlayer) {
        recommendations.push({
          type: 'start-sit',
          priority: 'high',
          title: `Start ${potentialBenchPlayer.name} over ${potentialStartPlayer.name}`,
          description: `${potentialBenchPlayer.name} is projected for ${potentialBenchPlayer.projected_points} points this week, which is higher than ${potentialStartPlayer.name}'s ${potentialStartPlayer.projected_points} points. Consider adjusting your lineup.`,
          impact: {
            short_term: 6,
            long_term: 0
          }
        });
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating trade recommendations:', error);
      return [];
    }
  }

  /**
   * Generate a comprehensive team analysis
   * @param teamId - The ID of the team to analyze
   * @returns Promise resolving to team analysis
   */
  async analyzeTeam(teamId: string): Promise<TeamAnalysis | null> {
    try {
      const team = await this.getTeamWithRoster(teamId);
      if (!team) return null;
      
      // In a real implementation, this would use an AI model to generate personalized analysis
      // For now, we'll implement a simplified analysis algorithm
      
      // Calculate position groups strength
      const qbs = team.roster.filter(p => p.position === 'QB');
      const rbs = team.roster.filter(p => p.position === 'RB');
      const wrs = team.roster.filter(p => p.position === 'WR');
      const tes = team.roster.filter(p => p.position === 'TE');
      
      const qbRating = this.calculatePositionGroupRating(qbs);
      const rbRating = this.calculatePositionGroupRating(rbs);
      const wrRating = this.calculatePositionGroupRating(wrs);
      const teRating = this.calculatePositionGroupRating(tes);
      
      // Calculate overall team rating
      const overallRating = Math.round((qbRating * 1.5 + rbRating * 1.8 + wrRating * 1.8 + teRating * 1) / 6.1 * 10) / 10;
      
      // Identify strengths and weaknesses
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      
      if (qbRating > 7) strengths.push('Strong quarterback room');
      if (qbRating < 5) weaknesses.push('Quarterback position needs improvement');
      
      if (rbRating > 7) strengths.push('Deep and talented running back group');
      if (rbRating < 5) weaknesses.push('Running back depth is concerning');
      
      if (wrRating > 7) strengths.push('Elite wide receiver corps');
      if (wrRating < 5) weaknesses.push('Wide receiver group lacks top-end talent');
      
      if (teRating > 7) strengths.push('Premium tight end talent');
      if (teRating < 5) weaknesses.push('Tight end position could use an upgrade');
      
      // Check age profile
      const youngCore = team.roster.filter(p => p.age < 25 && p.dynasty_value > 70).length;
      const agingVets = team.roster.filter(p => p.age > 28 && p.dynasty_value > 70).length;
      
      if (youngCore > 3) strengths.push('Young core of talented players');
      if (agingVets > 3) weaknesses.push('Several key players approaching age cliff');
      
      // Calculate competitive window
      const corePlayersAverageAge = this.calculateCorePlayersAverageAge(team.roster);
      let currentWindow: 'win-now' | 'contender' | 'retooling' | 'rebuilding' = 'contender';
      let windowLength = 2;
      
      if (overallRating > 7.5 && corePlayersAverageAge < 27) {
        currentWindow = 'contender';
        windowLength = 3;
      } else if (overallRating > 7.5 && corePlayersAverageAge >= 27) {
        currentWindow = 'win-now';
        windowLength = 1;
      } else if (overallRating < 6 && corePlayersAverageAge < 25) {
        currentWindow = 'rebuilding';
        windowLength = 3;
      } else if (overallRating < 6.5) {
        currentWindow = 'retooling';
        windowLength = 2;
      }
      
      // Get recommendations
      const recommendations = await this.getTradeRecommendations(teamId, team.league_id);
      
      return {
        overallRating,
        strengthsAndWeaknesses: {
          strengths,
          weaknesses
        },
        rosterBalance: {
          qbRating,
          rbRating,
          wrRating,
          teRating
        },
        competitiveWindow: {
          currentWindow,
          windowLength,
          corePlayersAverageAge
        },
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing team:', error);
      return null;
    }
  }

  /**
   * Generate weekly lineup recommendations
   * @param teamId - The ID of the team
   * @param week - The week number
   * @returns Promise resolving to lineup recommendations
   */
  async getLineupRecommendations(teamId: string, week: number): Promise<Recommendation[]> {
    try {
      const team = await this.getTeamWithRoster(teamId);
      if (!team) throw new Error('Team not found');
      
      // Get projected points for the current week
      const { data: projections, error: projectionsError } = await supabase
        .from('player_weekly_projections')
        .select('player_id, projected_points')
        .eq('week', week);
        
      if (projectionsError) throw projectionsError;
      
      // Map projections to players
      const playerProjections = new Map<string, number>();
      projections?.forEach(proj => {
        playerProjections.set(proj.player_id, proj.projected_points);
      });
      
      // Enhance roster with projections
      const enhancedRoster = team.roster.map(player => ({
        ...player,
        projected_points: playerProjections.get(player.id) || 0
      }));
      
      // Group by position
      const qbs = enhancedRoster.filter(p => p.position === 'QB').sort((a, b) => (b.projected_points || 0) - (a.projected_points || 0));
      const rbs = enhancedRoster.filter(p => p.position === 'RB').sort((a, b) => (b.projected_points || 0) - (a.projected_points || 0));
      const wrs = enhancedRoster.filter(p => p.position === 'WR').sort((a, b) => (b.projected_points || 0) - (a.projected_points || 0));
      const tes = enhancedRoster.filter(p => p.position === 'TE').sort((a, b) => (b.projected_points || 0) - (a.projected_points || 0));
      
      const recommendations: Recommendation[] = [];
      
      // QB recommendations
      if (qbs.length >= 2 && qbs[1].projected_points > qbs[0].projected_points) {
        recommendations.push({
          type: 'start-sit',
          priority: 'high',
          title: `Start ${qbs[1].name} (${qbs[1].projected_points} pts) over ${qbs[0].name} (${qbs[0].projected_points} pts)`,
          description: `${qbs[1].name} has a favorable matchup this week and is projected to outscore your current starter.`
        });
      }
      
      // RB recommendations (assuming 2 RB slots + flex)
      if (rbs.length >= 3 && rbs[2].projected_points > rbs[1].projected_points) {
        recommendations.push({
          type: 'start-sit',
          priority: 'high',
          title: `Start ${rbs[2].name} (${rbs[2].projected_points} pts) over ${rbs[1].name} (${rbs[1].projected_points} pts)`,
          description: `${rbs[2].name} has a better matchup this week and is projected to score more points.`
        });
      }
      
      // WR recommendations (assuming 3 WR slots)
      if (wrs.length >= 4 && wrs[3].projected_points > wrs[2].projected_points) {
        recommendations.push({
          type: 'start-sit',
          priority: 'medium',
          title: `Consider starting ${wrs[3].name} (${wrs[3].projected_points} pts) over ${wrs[2].name} (${wrs[2].projected_points} pts)`,
          description: `${wrs[3].name} has been seeing increased targets and has a favorable matchup this week.`
        });
      }
      
      // TE recommendations
      if (tes.length >= 2 && tes[1].projected_points > tes[0].projected_points * 1.2) {
        recommendations.push({
          type: 'start-sit',
          priority: 'high',
          title: `Start ${tes[1].name} (${tes[1].projected_points} pts) over ${tes[0].name} (${tes[0].projected_points} pts)`,
          description: `${tes[1].name} has a much better projection this week and faces a defense that struggles against tight ends.`
        });
      }
      
      // Flex considerations (find the best non-starting skill position player)
      const potentialFlexOptions = [
        ...rbs.slice(2, 3),
        ...wrs.slice(3, 4),
        ...tes.slice(1, 2)
      ].filter(p => p && p.projected_points);
      
      if (potentialFlexOptions.length > 0) {
        const bestFlexOption = potentialFlexOptions.sort((a, b) => (b.projected_points || 0) - (a.projected_points || 0))[0];
        if (bestFlexOption.projected_points > 10) {
          recommendations.push({
            type: 'start-sit',
            priority: 'medium',
            title: `Consider ${bestFlexOption.name} (${bestFlexOption.projected_points} pts) for your flex spot`,
            description: `${bestFlexOption.name} has a high projection this week and should be considered for your flex position.`
          });
        }
      }
      
      // Add a waiver recommendation if we found a good free agent
      const { data: freeAgents, error: freeAgentsError } = await supabase
        .from('players')
        .select('*')
        .in('position', ['QB', 'RB', 'WR', 'TE'])
        .order('projected_points', { ascending: false })
        .limit(10);
        
      if (!freeAgentsError && freeAgents) {
        const relevantFreeAgents = freeAgents.filter(player => 
          !team.roster.some(p => p.id === player.id) &&
          player.projected_points > 10
        );
        
        if (relevantFreeAgents.length > 0) {
          const bestFreeAgent = relevantFreeAgents[0];
          recommendations.push({
            type: 'waiver',
            priority: 'medium',
            title: `Add ${bestFreeAgent.full_name || bestFreeAgent.name} from waivers`,
            description: `${bestFreeAgent.full_name || bestFreeAgent.name} is projected for ${bestFreeAgent.projected_points} points this week and is currently available. Consider adding them to your roster.`,
            players: {
              add: [{
                id: bestFreeAgent.id,
                name: bestFreeAgent.full_name || bestFreeAgent.name,
                position: bestFreeAgent.position,
                team: bestFreeAgent.team,
                age: bestFreeAgent.age,
                experience: bestFreeAgent.experience,
                dynasty_value: bestFreeAgent.dynasty_value,
                redraft_value: bestFreeAgent.redraft_value,
                projected_points: bestFreeAgent.projected_points
              }]
            }
          });
        }
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating lineup recommendations:', error);
      return [];
    }
  }

  // Helper methods

  /**
   * Calculate the strength rating of a position group
   * @param players - Array of players at the position
   * @returns Position group rating (0-10 scale)
   */
  private calculatePositionGroupRating(players: Player[]): number {
    if (players.length === 0) return 0;
    
    // Sort by dynasty value
    const sortedPlayers = [...players].sort((a, b) => b.dynasty_value - a.dynasty_value);
    
    // Different positions have different depth requirements
    const positionWeights = {
      QB: [0.7, 0.3],
      RB: [0.5, 0.3, 0.15, 0.05],
      WR: [0.4, 0.3, 0.2, 0.1],
      TE: [0.8, 0.2]
    };
    
    const position = sortedPlayers[0].position;
    const weights = positionWeights[position as keyof typeof positionWeights] || [1];
    
    // Calculate weighted average of top N players (where N is the length of the weights array)
    let totalValue = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < Math.min(sortedPlayers.length, weights.length); i++) {
      totalValue += sortedPlayers[i].dynasty_value * weights[i];
      totalWeight += weights[i];
    }
    
    // Convert 0-100 scale to 0-10 scale
    return Math.round((totalValue / totalWeight / 10) * 10) / 10;
  }

  /**
   * Calculate the average age of core players
   * @param roster - Array of players on the roster
   * @returns Average age of core players
   */
  private calculateCorePlayersAverageAge(roster: Player[]): number {
    const corePlayers = roster.filter(p => p.dynasty_value >= 70);
    
    if (corePlayers.length === 0) {
      return roster.reduce((sum, p) => sum + p.age, 0) / roster.length;
    }
    
    return corePlayers.reduce((sum, p) => sum + p.age, 0) / corePlayers.length;
  }

  /**
   * Determine if a team is in rebuild mode
   * @param team - Team to analyze
   * @returns Boolean indicating if team is a rebuild candidate
   */
  private isRebuildCandidate(team: Team): boolean {
    // Count young assets (high value, young age)
    const youngAssets = team.roster.filter(p => p.age <= 24 && p.dynasty_value >= 75).length;
    
    // Count aging veterans (high value, older age)
    const agingVeterans = team.roster.filter(p => p.age >= 28 && p.dynasty_value >= 75).length;
    
    // Check record if available
    const hasLosingRecord = team.record ? (team.record.wins < team.record.losses) : false;
    
    // Team is a rebuild candidate if they have few young assets, several aging veterans, and a losing record
    return youngAssets <= 2 && agingVeterans >= 3 && hasLosingRecord;
  }

  /**
   * Determine if a team is a contender
   * @param team - Team to analyze
   * @returns Boolean indicating if team is a contender
   */
  private isContender(team: Team): boolean {
    // Count elite assets (very high value)
    const eliteAssets = team.roster.filter(p => p.dynasty_value >= 85).length;
    
    // Check for strong positional balance
    const hasQB = team.roster.some(p => p.position === 'QB' && p.dynasty_value >= 80);
    const hasRB = team.roster.some(p => p.position === 'RB' && p.dynasty_value >= 80);
    const hasWR = team.roster.some(p => p.position === 'WR' && p.dynasty_value >= 80);
    
    // Check record if available
    const hasWinningRecord = team.record ? (team.record.wins > team.record.losses) : false;
    
    // Team is a contender if they have several elite assets, good positional balance, and a winning record
    return eliteAssets >= 3 && hasQB && (hasRB || hasWR) && hasWinningRecord;
  }

  /**
   * Analyze team needs based on roster composition
   * @param team - Team to analyze
   * @returns Array of positions of need
   */
  private analyzeTeamNeeds(team: Team): string[] {
    const needs: string[] = [];
    
    // Check QB situation
    const qbs = team.roster.filter(p => p.position === 'QB');
    if (qbs.length < 2 || !qbs.some(qb => qb.dynasty_value >= 70)) {
      needs.push('QB');
    }
    
    // Check RB situation
    const rbs = team.roster.filter(p => p.position === 'RB');
    if (rbs.length < 4 || rbs.filter(rb => rb.dynasty_value >= 70).length < 2) {
      needs.push('RB');
    }
    
    // Check WR situation
    const wrs = team.roster.filter(p => p.position === 'WR');
    if (wrs.length < 5 || wrs.filter(wr => wr.dynasty_value >= 70).length < 3) {
      needs.push('WR');
    }
    
    // Check TE situation
    const tes = team.roster.filter(p => p.position === 'TE');
    if (tes.length < 2 || !tes.some(te => te.dynasty_value >= 70)) {
      needs.push('TE');
    }
    
    return needs;
  }
}

export default new AIAnalysisService();