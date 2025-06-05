
export interface DraftProspect {
  id: string;
  full_name: string;
  position: string;
  age: number;
  height: string;
  weight: number;
  avatar_url?: string;
  college?: string;
  draft_grade?: number;
  projected_round?: number;
  stats?: any;
}

export interface DraftPick {
  id: string;
  round: number;
  pick: number;
  overall_pick: number;
  team_id: string;
  player_id?: string;
  pick_time?: Date;
}
