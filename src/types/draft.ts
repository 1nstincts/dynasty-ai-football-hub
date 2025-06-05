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
  image_url?: string; // Player image URL
  team_primary_color?: string; // Primary team color
  team_secondary_color?: string; // Secondary team color
  fantasy_position_rank?: number; // Position rank for fantasy
  last_season_points?: number; // Fantasy points from last season
}

export interface LeagueStatus {
  id: string;
  leagueId: string;
  hasDrafted: boolean;
  currentPhase: 'setup' | 'draft' | 'active' | 'completed';
  draftId?: string;
}