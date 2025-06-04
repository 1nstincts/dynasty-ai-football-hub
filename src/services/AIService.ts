
interface AIStrategy {
  name: string;
  description: string;
  tradeFrequency: number; // 0-1 scale
  rosterMoveFrequency: number; // 0-1 scale
  draftStrategy: 'best-player-available' | 'need-based' | 'balanced';
  tradePriority: string[];
  riskTolerance: number; // 0-1 scale
}

export class AIService {
  private strategies: Record<string, AIStrategy> = {
    aggressive: {
      name: "Aggressive",
      description: "Takes high-risk, high-reward approach with frequent trades for young talent",
      tradeFrequency: 0.8,
      rosterMoveFrequency: 0.9,
      draftStrategy: 'best-player-available',
      tradePriority: ['young-talent', 'picks'],
      riskTolerance: 0.9
    },
    balanced: {
      name: "Balanced",
      description: "Balances win-now moves with future considerations",
      tradeFrequency: 0.5,
      rosterMoveFrequency: 0.6,
      draftStrategy: 'balanced',
      tradePriority: ['value', 'need'],
      riskTolerance: 0.5
    },
    conservative: {
      name: "Conservative",
      description: "Focuses on proven talent and minimal risks",
      tradeFrequency: 0.3,
      rosterMoveFrequency: 0.4,
      draftStrategy: 'need-based',
      tradePriority: ['proven-talent', 'depth'],
      riskTolerance: 0.2
    },
    rebuilding: {
      name: "Rebuilding",
      description: "Prioritizes draft picks and young prospects over win-now assets",
      tradeFrequency: 0.7,
      rosterMoveFrequency: 0.8,
      draftStrategy: 'best-player-available',
      tradePriority: ['picks', 'young-talent'],
      riskTolerance: 0.6
    },
    win_now: {
      name: "Win Now",
      description: "Sacrifices future assets for immediate championship contention",
      tradeFrequency: 0.6,
      rosterMoveFrequency: 0.7,
      draftStrategy: 'need-based',
      tradePriority: ['proven-talent', 'win-now'],
      riskTolerance: 0.7
    }
  };

  getAvailableStrategies(): string[] {
    return Object.keys(this.strategies);
  }

  getStrategyDetails(strategyName: string): AIStrategy | null {
    return this.strategies[strategyName] || null;
  }

  createAITeams(leagueSize: number, humanTeamCount: number): {name: string, strategy: string}[] {
    const aiTeamsCount = leagueSize - humanTeamCount;
    if (aiTeamsCount <= 0) return [];
    
    const aiTeams = [];
    const strategies = Object.keys(this.strategies);
    
    const teamNames = [
      "Dynasty Dominators", "Grid Iron Giants", "Touchdown Titans", 
      "Fantasy Phenoms", "Pigskin Prodigies", "Field Generals",
      "Stat Stuffers", "Comeback Kings", "Red Zone Raiders",
      "Blitz Brigade", "Draft Day Demons", "End Zone Eagles",
      "Hail Mary Heroes", "Gridiron Gladiators", "Touchdown Troopers"
    ];
    
    for (let i = 0; i < aiTeamsCount; i++) {
      const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
      const randomName = teamNames[Math.floor(Math.random() * teamNames.length)];
      
      aiTeams.push({
        name: `${randomName} AI`,
        strategy: randomStrategy
      });
      
      // Remove used name to avoid duplicates
      teamNames.splice(teamNames.indexOf(randomName), 1);
    }
    
    return aiTeams;
  }
}

export const aiService = new AIService();
export default aiService;
