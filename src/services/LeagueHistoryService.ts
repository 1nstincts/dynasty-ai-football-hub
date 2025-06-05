import { supabase } from '@/integrations/supabase/client';

// Types for League History
export interface SeasonRecord {
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  standing: number;
  playoffRound?: number;
}

export interface TeamHistory {
  teamId: string;
  teamName: string;
  ownerName: string;
  avatarUrl?: string;
  seasons: Record<string, SeasonRecord>;
  championships: number;
  runnerUps: number;
  playoffAppearances: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  totalPointsFor: number;
  totalPointsAgainst: number;
  bestFinish: number;
  worstFinish: number;
  longestWinStreak: number;
  longestLoseStreak: number;
}

export interface HistoricalMatchup {
  id: string;
  season: number;
  week: number;
  matchupType: 'regular' | 'playoff' | 'championship';
  team1Id: string;
  team1Score: number;
  team2Id: string;
  team2Score: number;
  winningTeamId: string;
  isTie: boolean;
}

export interface HistoricalDraft {
  id: string;
  season: number;
  draftType: 'startup' | 'rookie';
  rounds: number;
  picks: HistoricalDraftPick[];
}

export interface HistoricalDraftPick {
  id: string;
  draftId: string;
  round: number;
  pick: number;
  teamId: string;
  playerId: string;
  playerName: string;
  position: string;
  timestamp: string;
}

export interface HistoricalTrade {
  id: string;
  timestamp: string;
  season: number;
  week: number;
  teams: {
    teamId: string;
    teamName: string;
    gives: {
      players: { id: string; name: string; position: string }[];
      picks: { season: number; round: number; originalTeam?: string }[];
    };
  }[];
}

export interface LeagueHistorySummary {
  seasons: number[];
  currentChampion?: {
    teamId: string;
    teamName: string;
    ownerName: string;
  };
  mostChampionships: {
    teamId: string;
    teamName: string;
    count: number;
  };
  highestScoringGame: {
    teamId: string;
    teamName: string;
    score: number;
    season: number;
    week: number;
  };
  longestWinStreak: {
    teamId: string;
    teamName: string;
    count: number;
    startDate: string;
    endDate: string;
  };
}

export interface RivalryData {
  team1Id: string;
  team1Name: string;
  team2Id: string;
  team2Name: string;
  team1Wins: number;
  team2Wins: number;
  ties: number;
  totalGames: number;
  team1TotalPoints: number;
  team2TotalPoints: number;
  lastMatchup?: {
    date: string;
    winner: string;
    team1Score: number;
    team2Score: number;
  };
  largestVictoryMargin: {
    date: string;
    winningTeam: string;
    margin: number;
  };
  closestMatchup: {
    date: string;
    winner: string | 'tie';
    margin: number;
  };
  playoffMatchups: number;
  championshipMatchups: number;
}

class LeagueHistoryService {
  /**
   * Get team history for all teams in a league
   */
  async getTeamHistories(leagueId: string): Promise<TeamHistory[]> {
    try {
      // In a real implementation, this would fetch from the database
      // For now, return mock data
      return this.getMockTeamHistories();
    } catch (error) {
      console.error('Error fetching team histories:', error);
      throw error;
    }
  }

  /**
   * Get historical matchups for a league, with optional filters
   */
  async getHistoricalMatchups(
    leagueId: string, 
    filters?: { 
      season?: number; 
      team1Id?: string; 
      team2Id?: string;
      matchupType?: 'regular' | 'playoff' | 'championship';
    }
  ): Promise<HistoricalMatchup[]> {
    try {
      // In a real implementation, this would fetch from the database
      // For now, return mock data
      return this.getMockHistoricalMatchups();
    } catch (error) {
      console.error('Error fetching historical matchups:', error);
      throw error;
    }
  }

  /**
   * Get historical drafts for a league
   */
  async getHistoricalDrafts(leagueId: string): Promise<HistoricalDraft[]> {
    try {
      // In a real implementation, this would fetch from the database
      // For now, return mock data
      return this.getMockHistoricalDrafts();
    } catch (error) {
      console.error('Error fetching historical drafts:', error);
      throw error;
    }
  }

  /**
   * Get historical trades for a league
   */
  async getHistoricalTrades(
    leagueId: string,
    filters?: {
      season?: number;
      teamId?: string;
    }
  ): Promise<HistoricalTrade[]> {
    try {
      // In a real implementation, this would fetch from the database
      // For now, return mock data
      return this.getMockHistoricalTrades();
    } catch (error) {
      console.error('Error fetching historical trades:', error);
      throw error;
    }
  }

  /**
   * Get league history summary
   */
  async getLeagueHistorySummary(leagueId: string): Promise<LeagueHistorySummary> {
    try {
      // In a real implementation, this would fetch from the database
      // For now, return mock data
      return this.getMockLeagueHistorySummary();
    } catch (error) {
      console.error('Error fetching league history summary:', error);
      throw error;
    }
  }

  /**
   * Get rivalry data between two teams
   */
  async getRivalryData(leagueId: string, team1Id: string, team2Id: string): Promise<RivalryData> {
    try {
      // In a real implementation, this would fetch from the database
      // For now, return mock data
      return this.getMockRivalryData(team1Id, team2Id);
    } catch (error) {
      console.error('Error fetching rivalry data:', error);
      throw error;
    }
  }

  /**
   * Generate mock team histories
   */
  private getMockTeamHistories(): TeamHistory[] {
    const teamNames = [
      "Dynasty Destroyers", "Touchdown Titans", "Gridiron Giants", 
      "Fantasy Phoenixes", "Pigskin Predators", "Field Generals",
      "Redzone Raiders", "Blitz Brigade", "Turf Terminators", "Champion Chiefs"
    ];

    const owners = [
      "Mike Johnson", "Sarah Williams", "David Chen", "Emma Rodriguez", 
      "James Smith", "Olivia Brown", "Daniel Wilson", "Sophia Martinez",
      "Matthew Taylor", "Ava Anderson"
    ];

    const teams: TeamHistory[] = [];

    for (let i = 0; i < 10; i++) {
      const championships = Math.floor(Math.random() * 3);
      const runnerUps = Math.floor(Math.random() * 3);
      const playoffAppearances = championships + runnerUps + Math.floor(Math.random() * 3);
      
      const seasons: Record<string, SeasonRecord> = {};
      let totalWins = 0;
      let totalLosses = 0;
      let totalTies = 0;
      let totalPointsFor = 0;
      let totalPointsAgainst = 0;
      let bestFinish = 10;
      let worstFinish = 1;
      
      // Generate 5 seasons of history
      for (let year = 2019; year <= 2023; year++) {
        const wins = Math.floor(Math.random() * 11) + 2; // 2-12 wins
        const losses = Math.floor(Math.random() * 11) + 2; // 2-12 losses
        const ties = Math.floor(Math.random() * 2); // 0-1 ties
        const pointsFor = Math.floor(Math.random() * 500) + 1200; // 1200-1700 points
        const pointsAgainst = Math.floor(Math.random() * 500) + 1200; // 1200-1700 points
        const standing = Math.floor(Math.random() * 10) + 1; // 1-10 place
        
        totalWins += wins;
        totalLosses += losses;
        totalTies += ties;
        totalPointsFor += pointsFor;
        totalPointsAgainst += pointsAgainst;
        
        if (standing < bestFinish) bestFinish = standing;
        if (standing > worstFinish) worstFinish = standing;
        
        seasons[year.toString()] = {
          wins,
          losses,
          ties,
          pointsFor,
          pointsAgainst,
          standing,
          playoffRound: standing <= 6 ? Math.min(4, 6 - standing + 1) : undefined
        };
      }
      
      teams.push({
        teamId: `team-${i + 1}`,
        teamName: teamNames[i],
        ownerName: owners[i],
        avatarUrl: `https://via.placeholder.com/50?text=${teamNames[i].charAt(0)}`,
        seasons,
        championships,
        runnerUps,
        playoffAppearances,
        totalWins,
        totalLosses,
        totalTies,
        totalPointsFor,
        totalPointsAgainst,
        bestFinish,
        worstFinish,
        longestWinStreak: Math.floor(Math.random() * 6) + 3, // 3-8 games
        longestLoseStreak: Math.floor(Math.random() * 6) + 2 // 2-7 games
      });
    }
    
    return teams;
  }

  /**
   * Generate mock historical matchups
   */
  private getMockHistoricalMatchups(): HistoricalMatchup[] {
    const matchups: HistoricalMatchup[] = [];
    
    // Generate 5 seasons of matchups (2019-2023)
    for (let season = 2019; season <= 2023; season++) {
      // Generate regular season matchups (13 weeks)
      for (let week = 1; week <= 13; week++) {
        // 5 matchups per week (10 teams)
        for (let match = 0; match < 5; match++) {
          const team1Id = `team-${match * 2 + 1}`;
          const team2Id = `team-${match * 2 + 2}`;
          const team1Score = Math.floor(Math.random() * 50) + 80; // 80-130 points
          const team2Score = Math.floor(Math.random() * 50) + 80; // 80-130 points
          const isTie = team1Score === team2Score;
          const winningTeamId = isTie ? '' : (team1Score > team2Score ? team1Id : team2Id);
          
          matchups.push({
            id: `matchup-${season}-${week}-${match}`,
            season,
            week,
            matchupType: 'regular',
            team1Id,
            team1Score,
            team2Id,
            team2Score,
            winningTeamId,
            isTie
          });
        }
      }
      
      // Generate playoff matchups (weeks 14-16)
      for (let week = 14; week <= 16; week++) {
        let numMatches = week === 14 ? 3 : (week === 15 ? 2 : 1); // 6 teams in playoffs, 3 matches in first round, 2 in second, 1 in championship
        
        for (let match = 0; match < numMatches; match++) {
          const team1Id = `team-${Math.floor(Math.random() * 10) + 1}`;
          let team2Id = `team-${Math.floor(Math.random() * 10) + 1}`;
          
          // Ensure teams are different
          while (team2Id === team1Id) {
            team2Id = `team-${Math.floor(Math.random() * 10) + 1}`;
          }
          
          const team1Score = Math.floor(Math.random() * 50) + 90; // 90-140 points (higher scoring in playoffs)
          const team2Score = Math.floor(Math.random() * 50) + 90; // 90-140 points
          const isTie = false; // No ties in playoffs
          const winningTeamId = team1Score > team2Score ? team1Id : team2Id;
          
          matchups.push({
            id: `matchup-${season}-${week}-${match}`,
            season,
            week,
            matchupType: week === 16 ? 'championship' : 'playoff',
            team1Id,
            team1Score,
            team2Id,
            team2Score,
            winningTeamId,
            isTie
          });
        }
      }
    }
    
    return matchups;
  }

  /**
   * Generate mock historical drafts
   */
  private getMockHistoricalDrafts(): HistoricalDraft[] {
    const drafts: HistoricalDraft[] = [];
    const playerNames = [
      "Justin Jefferson", "Christian McCaffrey", "Ja'Marr Chase", "Bijan Robinson", 
      "CeeDee Lamb", "Breece Hall", "Saquon Barkley", "Garrett Wilson", 
      "Amon-Ra St. Brown", "Drake London", "Josh Allen", "Patrick Mahomes",
      "Jonathan Taylor", "Travis Kelce", "Davante Adams", "Cooper Kupp",
      "Mark Andrews", "Tyreek Hill", "A.J. Brown", "Tee Higgins",
      "Stefon Diggs", "DK Metcalf", "DeVonta Smith", "Chris Olave",
      "Jaylen Waddle", "Kyle Pitts", "Najee Harris", "Derrick Henry",
      "T.J. Hockenson", "George Kittle", "Travis Etienne", "Kenneth Walker",
      "Rhamondre Stevenson", "Deebo Samuel", "D'Andre Swift", "Jameson Williams",
      "Jahan Dotson", "Treylon Burks", "Christian Watson", "George Pickens",
      "Skyy Moore", "Alec Pierce", "David Bell", "John Metchie",
      "Trey McBride", "Isaiah Spiller", "Rachaad White", "Dameon Pierce"
    ];
    
    const positions = ["QB", "RB", "WR", "TE"];
    
    // Generate 5 seasons of drafts (2019-2023)
    for (let season = 2019; season <= 2023; season++) {
      // Startup draft for first season
      if (season === 2019) {
        const startupPicks: HistoricalDraftPick[] = [];
        
        // 10 teams, 20 rounds
        for (let round = 1; round <= 20; round++) {
          for (let pick = 1; pick <= 10; pick++) {
            const teamId = `team-${pick}`;
            const playerIndex = (round - 1) * 10 + (pick - 1);
            const playerName = playerNames[playerIndex % playerNames.length];
            const position = positions[Math.floor(Math.random() * positions.length)];
            
            startupPicks.push({
              id: `pick-2019-startup-${round}-${pick}`,
              draftId: `draft-2019-startup`,
              round,
              pick,
              teamId,
              playerId: `player-${playerIndex + 1}`,
              playerName,
              position,
              timestamp: new Date(2019, 7, 15, 12, round, pick).toISOString()
            });
          }
        }
        
        drafts.push({
          id: `draft-2019-startup`,
          season: 2019,
          draftType: 'startup',
          rounds: 20,
          picks: startupPicks
        });
      }
      
      // Rookie draft for each season
      const rookiePicks: HistoricalDraftPick[] = [];
      
      // 10 teams, 4 rounds
      for (let round = 1; round <= 4; round++) {
        for (let pick = 1; pick <= 10; pick++) {
          const teamId = `team-${pick}`;
          const playerIndex = (round - 1) * 10 + (pick - 1);
          const playerName = `Rookie ${season} - ${playerIndex + 1}`;
          const position = positions[Math.floor(Math.random() * positions.length)];
          
          rookiePicks.push({
            id: `pick-${season}-rookie-${round}-${pick}`,
            draftId: `draft-${season}-rookie`,
            round,
            pick,
            teamId,
            playerId: `player-${season}-rookie-${playerIndex + 1}`,
            playerName,
            position,
            timestamp: new Date(season, 7, 1, 12, round, pick).toISOString()
          });
        }
      }
      
      drafts.push({
        id: `draft-${season}-rookie`,
        season,
        draftType: 'rookie',
        rounds: 4,
        picks: rookiePicks
      });
    }
    
    return drafts;
  }

  /**
   * Generate mock historical trades
   */
  private getMockHistoricalTrades(): HistoricalTrade[] {
    const trades: HistoricalTrade[] = [];
    const playerNames = [
      "Justin Jefferson", "Christian McCaffrey", "Ja'Marr Chase", "Bijan Robinson", 
      "CeeDee Lamb", "Breece Hall", "Saquon Barkley", "Garrett Wilson", 
      "Amon-Ra St. Brown", "Drake London", "Josh Allen", "Patrick Mahomes"
    ];
    const positions = ["QB", "RB", "WR", "TE"];
    
    // Generate 20 random trades across 5 seasons
    for (let i = 0; i < 20; i++) {
      const season = Math.floor(Math.random() * 5) + 2019; // 2019-2023
      const week = Math.floor(Math.random() * 16) + 1; // Weeks 1-16
      
      // Get two random teams
      const team1Id = Math.floor(Math.random() * 10) + 1;
      let team2Id = Math.floor(Math.random() * 10) + 1;
      
      // Ensure teams are different
      while (team2Id === team1Id) {
        team2Id = Math.floor(Math.random() * 10) + 1;
      }
      
      // Generate 1-3 players for team 1
      const team1Players = [];
      const numTeam1Players = Math.floor(Math.random() * 3) + 1;
      for (let p = 0; p < numTeam1Players; p++) {
        const playerIndex = Math.floor(Math.random() * playerNames.length);
        team1Players.push({
          id: `player-${playerIndex + 1}`,
          name: playerNames[playerIndex],
          position: positions[Math.floor(Math.random() * positions.length)]
        });
      }
      
      // Generate 0-2 picks for team 1
      const team1Picks = [];
      const numTeam1Picks = Math.floor(Math.random() * 3);
      for (let p = 0; p < numTeam1Picks; p++) {
        team1Picks.push({
          season: Math.floor(Math.random() * 3) + season,
          round: Math.floor(Math.random() * 4) + 1,
          originalTeam: Math.random() > 0.5 ? `team-${Math.floor(Math.random() * 10) + 1}` : undefined
        });
      }
      
      // Generate 1-3 players for team 2
      const team2Players = [];
      const numTeam2Players = Math.floor(Math.random() * 3) + 1;
      for (let p = 0; p < numTeam2Players; p++) {
        const playerIndex = Math.floor(Math.random() * playerNames.length);
        team2Players.push({
          id: `player-${playerIndex + 100}`, // Offset to avoid duplicates
          name: playerNames[playerIndex],
          position: positions[Math.floor(Math.random() * positions.length)]
        });
      }
      
      // Generate 0-2 picks for team 2
      const team2Picks = [];
      const numTeam2Picks = Math.floor(Math.random() * 3);
      for (let p = 0; p < numTeam2Picks; p++) {
        team2Picks.push({
          season: Math.floor(Math.random() * 3) + season,
          round: Math.floor(Math.random() * 4) + 1,
          originalTeam: Math.random() > 0.5 ? `team-${Math.floor(Math.random() * 10) + 1}` : undefined
        });
      }
      
      trades.push({
        id: `trade-${i + 1}`,
        timestamp: new Date(season, 0, week * 7).toISOString(),
        season,
        week,
        teams: [
          {
            teamId: `team-${team1Id}`,
            teamName: `Dynasty Team ${team1Id}`,
            gives: {
              players: team1Players,
              picks: team1Picks
            }
          },
          {
            teamId: `team-${team2Id}`,
            teamName: `Dynasty Team ${team2Id}`,
            gives: {
              players: team2Players,
              picks: team2Picks
            }
          }
        ]
      });
    }
    
    return trades;
  }

  /**
   * Generate mock league history summary
   */
  private getMockLeagueHistorySummary(): LeagueHistorySummary {
    return {
      seasons: [2019, 2020, 2021, 2022, 2023],
      currentChampion: {
        teamId: 'team-3',
        teamName: 'Gridiron Giants',
        ownerName: 'David Chen'
      },
      mostChampionships: {
        teamId: 'team-1',
        teamName: 'Dynasty Destroyers',
        count: 2
      },
      highestScoringGame: {
        teamId: 'team-4',
        teamName: 'Fantasy Phoenixes',
        score: 198.7,
        season: 2022,
        week: 12
      },
      longestWinStreak: {
        teamId: 'team-2',
        teamName: 'Touchdown Titans',
        count: 11,
        startDate: '2021-09-12',
        endDate: '2021-11-28'
      }
    };
  }

  /**
   * Generate mock rivalry data
   */
  private getMockRivalryData(team1Id: string, team2Id: string): RivalryData {
    // Extract the team numbers from the IDs
    const team1Num = parseInt(team1Id.split('-')[1]);
    const team2Num = parseInt(team2Id.split('-')[1]);
    
    // Generate win/loss data
    const team1Wins = Math.floor(Math.random() * 8) + 3; // 3-10 wins
    const team2Wins = Math.floor(Math.random() * 8) + 3; // 3-10 wins
    const ties = Math.floor(Math.random() * 2); // 0-1 ties
    const totalGames = team1Wins + team2Wins + ties;
    
    // Generate point data
    const team1TotalPoints = Math.floor(Math.random() * 1500) + 1000; // 1000-2500 total points
    const team2TotalPoints = Math.floor(Math.random() * 1500) + 1000; // 1000-2500 total points
    
    return {
      team1Id,
      team1Name: `Dynasty Team ${team1Num}`,
      team2Id,
      team2Name: `Dynasty Team ${team2Num}`,
      team1Wins,
      team2Wins,
      ties,
      totalGames,
      team1TotalPoints,
      team2TotalPoints,
      lastMatchup: {
        date: '2023-11-12',
        winner: Math.random() > 0.5 ? `Dynasty Team ${team1Num}` : `Dynasty Team ${team2Num}`,
        team1Score: Math.floor(Math.random() * 50) + 80,
        team2Score: Math.floor(Math.random() * 50) + 80
      },
      largestVictoryMargin: {
        date: '2022-09-18',
        winningTeam: Math.random() > 0.5 ? `Dynasty Team ${team1Num}` : `Dynasty Team ${team2Num}`,
        margin: Math.floor(Math.random() * 50) + 30 // 30-80 point margin
      },
      closestMatchup: {
        date: '2021-10-24',
        winner: Math.random() > 0.9 ? 'tie' : (Math.random() > 0.5 ? `Dynasty Team ${team1Num}` : `Dynasty Team ${team2Num}`),
        margin: Math.floor(Math.random() * 5) + 1 // 1-5 point margin
      },
      playoffMatchups: Math.floor(Math.random() * 4), // 0-3 playoff matchups
      championshipMatchups: Math.floor(Math.random() * 2) // 0-1 championship matchups
    };
  }
}

export const leagueHistoryService = new LeagueHistoryService();
export default leagueHistoryService;