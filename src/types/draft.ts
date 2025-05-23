export interface DraftPick {
  id: string;
  round: number;
  pick: number;
  overallPick: number;
  teamId: string;
  teamName: string;
  playerId?: string;
  playerName?: string;
  position?: string;
  nflTeam?: string;
  pickTime?: Date;
  isUserPick: boolean;
}

export interface DraftSettings {
  rounds: number;
  pickTimeLimit: number; // seconds
  draftOrder: string[]; // array of team IDs
  randomizeDraftOrder: boolean;
  snakeDraft: boolean; // true for snake, false for linear
}

export interface Draft {
  id: string;
  leagueId: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  currentPick: number; // overall pick number (1-based)
  currentRound: number;
  currentTeamId: string;
  settings: DraftSettings;
  picks: DraftPick[];
  startTime?: Date;
  endTime?: Date;
}

export interface DraftablePlayer {
  player_id: string;
  full_name: string;
  position: string;
  team: string;
  isDrafted: boolean;
  draftedBy?: string;
  adp?: number; // Average Draft Position for AI logic
}

export interface LeagueStatus {
  id: string;
  leagueId: string;
  hasDrafted: boolean;
  currentPhase: 'setup' | 'draft' | 'active' | 'completed';
  draftId?: string;
}