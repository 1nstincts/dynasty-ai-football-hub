export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      draft_picks: {
        Row: {
          created_at: string | null
          draft_id: string
          id: string
          overall_pick: number
          pick: number
          pick_time: string | null
          player_id: string
          round: number
          team_id: string
        }
        Insert: {
          created_at?: string | null
          draft_id: string
          id?: string
          overall_pick: number
          pick: number
          pick_time?: string | null
          player_id: string
          round: number
          team_id: string
        }
        Update: {
          created_at?: string | null
          draft_id?: string
          id?: string
          overall_pick?: number
          pick?: number
          pick_time?: string | null
          player_id?: string
          round?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_picks_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      games: {
        Row: {
          away_team: string | null
          created_at: string | null
          game_id: string
          gameday: string | null
          home_team: string | null
          season: number | null
          week: number | null
        }
        Insert: {
          away_team?: string | null
          created_at?: string | null
          game_id: string
          gameday?: string | null
          home_team?: string | null
          season?: number | null
          week?: number | null
        }
        Update: {
          away_team?: string | null
          created_at?: string | null
          game_id?: string
          gameday?: string | null
          home_team?: string | null
          season?: number | null
          week?: number | null
        }
        Relationships: []
      }
      leagues: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string | null
          settings: Json | null
          size: number
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id?: string | null
          settings?: Json | null
          size: number
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          settings?: Json | null
          size?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          adp: number | null
          birth_date: string | null
          bye_week: number | null
          college: string | null
          created_at: string | null
          draft_pick: number | null
          draft_round: number | null
          draft_year: number | null
          dynasty_adp: number | null
          experience: number | null
          fantasy_position_rank: number | null
          full_name: string | null
          height: string | null
          image_url: string | null
          is_active: boolean | null
          jersey_number: number | null
          last_season_points: number | null
          player_id: string
          position: string | null
          team: string | null
          team_primary_color: string | null
          team_secondary_color: string | null
          weight: number | null
        }
        Insert: {
          adp?: number | null
          birth_date?: string | null
          bye_week?: number | null
          college?: string | null
          created_at?: string | null
          draft_pick?: number | null
          draft_round?: number | null
          draft_year?: number | null
          dynasty_adp?: number | null
          experience?: number | null
          fantasy_position_rank?: number | null
          full_name?: string | null
          height?: string | null
          image_url?: string | null
          is_active?: boolean | null
          jersey_number?: number | null
          last_season_points?: number | null
          player_id: string
          position?: string | null
          team?: string | null
          team_primary_color?: string | null
          team_secondary_color?: string | null
          weight?: number | null
        }
        Update: {
          adp?: number | null
          birth_date?: string | null
          bye_week?: number | null
          college?: string | null
          created_at?: string | null
          draft_pick?: number | null
          draft_round?: number | null
          draft_year?: number | null
          dynasty_adp?: number | null
          experience?: number | null
          fantasy_position_rank?: number | null
          full_name?: string | null
          height?: string | null
          image_url?: string | null
          is_active?: boolean | null
          jersey_number?: number | null
          last_season_points?: number | null
          player_id?: string
          position?: string | null
          team?: string | null
          team_primary_color?: string | null
          team_secondary_color?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      team_rosters: {
        Row: {
          created_at: string | null
          id: string
          league_id: string
          player_id: string
          position_type: string | null
          team_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          league_id: string
          player_id: string
          position_type?: string | null
          team_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          league_id?: string
          player_id?: string
          position_type?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_rosters_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
