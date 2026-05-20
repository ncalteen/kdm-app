export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ability_impairment: {
        Row: {
          ability_impairment_name: string
          archived_at: string | null
          created_at: string
          custom: boolean
          id: string
          rules: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ability_impairment_name: string
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ability_impairment_name?: string
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      armor_set: {
        Row: {
          archived_at: string | null
          armor_set_name: string
          bonuses: string | null
          created_at: string
          custom: boolean
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          armor_set_name: string
          bonuses?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          armor_set_name?: string
          bonuses?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      armor_set_slot: {
        Row: {
          armor_set_id: string
          created_at: string
          id: string
          required: boolean
          slot_name: string
          slot_order: number
          updated_at: string
        }
        Insert: {
          armor_set_id: string
          created_at?: string
          id?: string
          required?: boolean
          slot_name: string
          slot_order?: number
          updated_at?: string
        }
        Update: {
          armor_set_id?: string
          created_at?: string
          id?: string
          required?: boolean
          slot_name?: string
          slot_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "armor_set_slot_armor_set_id_fkey"
            columns: ["armor_set_id"]
            isOneToOne: false
            referencedRelation: "armor_set"
            referencedColumns: ["id"]
          },
        ]
      }
      armor_set_slot_gear: {
        Row: {
          armor_set_slot_id: string
          gear_id: string
        }
        Insert: {
          armor_set_slot_id: string
          gear_id: string
        }
        Update: {
          armor_set_slot_id?: string
          gear_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "armor_set_slot_gear_armor_set_slot_id_fkey"
            columns: ["armor_set_slot_id"]
            isOneToOne: false
            referencedRelation: "armor_set_slot"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "armor_set_slot_gear_gear_id_fkey"
            columns: ["gear_id"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
        ]
      }
      character: {
        Row: {
          archived_at: string | null
          character_name: string
          created_at: string
          custom: boolean
          id: string
          rules: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          character_name: string
          created_at?: string
          custom?: boolean
          id?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          character_name?: string
          created_at?: string
          custom?: boolean
          id?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      collective_cognition_reward: {
        Row: {
          archived_at: string | null
          collective_cognition: number
          created_at: string
          custom: boolean
          id: string
          reward_name: string
          rules: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          collective_cognition?: number
          created_at?: string
          custom?: boolean
          id?: string
          reward_name: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          collective_cognition?: number
          created_at?: string
          custom?: boolean
          id?: string
          reward_name?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      constellation: {
        Row: {
          archived_at: string | null
          constellation_name: string
          created_at: string
          custom: boolean
          id: string
          rules: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          constellation_name: string
          created_at?: string
          custom?: boolean
          id?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          constellation_name?: string
          created_at?: string
          custom?: boolean
          id?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      disorder: {
        Row: {
          archived_at: string | null
          created_at: string
          custom: boolean
          disorder_name: string
          id: string
          rules: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          disorder_name: string
          id?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          disorder_name?: string
          id?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fighting_art: {
        Row: {
          archived_at: string | null
          created_at: string
          custom: boolean
          fighting_art_name: string
          id: string
          rules: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          fighting_art_name: string
          id?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          fighting_art_name?: string
          id?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      gear: {
        Row: {
          accessory: boolean | null
          accuracy: number | null
          affinity_bonus: string | null
          affinity_bonus_requirements: Json
          affinity_bottom: Database["public"]["Enums"]["affinity"] | null
          affinity_left: Database["public"]["Enums"]["affinity"] | null
          affinity_right: Database["public"]["Enums"]["affinity"] | null
          affinity_top: Database["public"]["Enums"]["affinity"] | null
          archived_at: string | null
          armor_location: Database["public"]["Enums"]["armor_location"] | null
          armor_points: number | null
          created_at: string
          custom: boolean
          gear_name: string
          id: string
          keywords: Database["public"]["Enums"]["gear_keyword"][] | null
          location_id: string | null
          rules: string | null
          speed: number | null
          strength: number | null
          updated_at: string
          user_id: string | null
          weapon_type_id: string | null
        }
        Insert: {
          accessory?: boolean | null
          accuracy?: number | null
          affinity_bonus?: string | null
          affinity_bonus_requirements?: Json
          affinity_bottom?: Database["public"]["Enums"]["affinity"] | null
          affinity_left?: Database["public"]["Enums"]["affinity"] | null
          affinity_right?: Database["public"]["Enums"]["affinity"] | null
          affinity_top?: Database["public"]["Enums"]["affinity"] | null
          archived_at?: string | null
          armor_location?: Database["public"]["Enums"]["armor_location"] | null
          armor_points?: number | null
          created_at?: string
          custom?: boolean
          gear_name: string
          id?: string
          keywords?: Database["public"]["Enums"]["gear_keyword"][] | null
          location_id?: string | null
          rules?: string | null
          speed?: number | null
          strength?: number | null
          updated_at?: string
          user_id?: string | null
          weapon_type_id?: string | null
        }
        Update: {
          accessory?: boolean | null
          accuracy?: number | null
          affinity_bonus?: string | null
          affinity_bonus_requirements?: Json
          affinity_bottom?: Database["public"]["Enums"]["affinity"] | null
          affinity_left?: Database["public"]["Enums"]["affinity"] | null
          affinity_right?: Database["public"]["Enums"]["affinity"] | null
          affinity_top?: Database["public"]["Enums"]["affinity"] | null
          archived_at?: string | null
          armor_location?: Database["public"]["Enums"]["armor_location"] | null
          armor_points?: number | null
          created_at?: string
          custom?: boolean
          gear_name?: string
          id?: string
          keywords?: Database["public"]["Enums"]["gear_keyword"][] | null
          location_id?: string | null
          rules?: string | null
          speed?: number | null
          strength?: number | null
          updated_at?: string
          user_id?: string | null
          weapon_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gear_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_weapon_type_id_fkey"
            columns: ["weapon_type_id"]
            isOneToOne: false
            referencedRelation: "weapon_type"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_gear_cost: {
        Row: {
          cost_gear_id: string
          gear_id: string
          quantity: number
        }
        Insert: {
          cost_gear_id: string
          gear_id: string
          quantity?: number
        }
        Update: {
          cost_gear_id?: string
          gear_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "gear_gear_cost_cost_gear_id_fkey"
            columns: ["cost_gear_id"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_gear_cost_gear_id_fkey"
            columns: ["gear_id"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_grid: {
        Row: {
          created_at: string
          id: string
          pos_bottom_center: string | null
          pos_bottom_left: string | null
          pos_bottom_right: string | null
          pos_mid_center: string | null
          pos_mid_left: string | null
          pos_mid_right: string | null
          pos_top_center: string | null
          pos_top_left: string | null
          pos_top_right: string | null
          selected_armor_set_id: string | null
          survivor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pos_bottom_center?: string | null
          pos_bottom_left?: string | null
          pos_bottom_right?: string | null
          pos_mid_center?: string | null
          pos_mid_left?: string | null
          pos_mid_right?: string | null
          pos_top_center?: string | null
          pos_top_left?: string | null
          pos_top_right?: string | null
          selected_armor_set_id?: string | null
          survivor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pos_bottom_center?: string | null
          pos_bottom_left?: string | null
          pos_bottom_right?: string | null
          pos_mid_center?: string | null
          pos_mid_left?: string | null
          pos_mid_right?: string | null
          pos_top_center?: string | null
          pos_top_left?: string | null
          pos_top_right?: string | null
          selected_armor_set_id?: string | null
          survivor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gear_grid_pos_bottom_center_fkey"
            columns: ["pos_bottom_center"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_grid_pos_bottom_left_fkey"
            columns: ["pos_bottom_left"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_grid_pos_bottom_right_fkey"
            columns: ["pos_bottom_right"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_grid_pos_mid_center_fkey"
            columns: ["pos_mid_center"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_grid_pos_mid_left_fkey"
            columns: ["pos_mid_left"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_grid_pos_mid_right_fkey"
            columns: ["pos_mid_right"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_grid_pos_top_center_fkey"
            columns: ["pos_top_center"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_grid_pos_top_left_fkey"
            columns: ["pos_top_left"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_grid_pos_top_right_fkey"
            columns: ["pos_top_right"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_grid_selected_armor_set_id_fkey"
            columns: ["selected_armor_set_id"]
            isOneToOne: false
            referencedRelation: "armor_set"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_grid_survivor_id_fkey"
            columns: ["survivor_id"]
            isOneToOne: false
            referencedRelation: "survivor"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_other_cost: {
        Row: {
          cost_name: string
          gear_id: string
          id: string
          quantity: number
        }
        Insert: {
          cost_name: string
          gear_id: string
          id?: string
          quantity?: number
        }
        Update: {
          cost_name?: string
          gear_id?: string
          id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "gear_other_cost_gear_id_fkey"
            columns: ["gear_id"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_resource_cost: {
        Row: {
          gear_id: string
          quantity: number
          resource_id: string
        }
        Insert: {
          gear_id: string
          quantity?: number
          resource_id: string
        }
        Update: {
          gear_id?: string
          quantity?: number
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gear_resource_cost_gear_id_fkey"
            columns: ["gear_id"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_resource_cost_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resource"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_resource_type_cost: {
        Row: {
          gear_id: string
          quantity: number
          resource_type: Database["public"]["Enums"]["resource_type"]
        }
        Insert: {
          gear_id: string
          quantity?: number
          resource_type: Database["public"]["Enums"]["resource_type"]
        }
        Update: {
          gear_id?: string
          quantity?: number
          resource_type?: Database["public"]["Enums"]["resource_type"]
        }
        Relationships: [
          {
            foreignKeyName: "gear_resource_type_cost_gear_id_fkey"
            columns: ["gear_id"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
        ]
      }
      hunt: {
        Row: {
          created_at: string
          id: string
          monster_level: number
          monster_position: number
          settlement_id: string
          survivor_position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          monster_level: number
          monster_position?: number
          settlement_id: string
          survivor_position?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          monster_level?: number
          monster_position?: number
          settlement_id?: string
          survivor_position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunt_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: true
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      hunt_ai_deck: {
        Row: {
          advanced_cards: number
          basic_cards: number
          created_at: string
          hunt_id: string
          id: string
          legendary_cards: number
          overtone_cards: number
          settlement_id: string
          updated_at: string
        }
        Insert: {
          advanced_cards?: number
          basic_cards?: number
          created_at?: string
          hunt_id: string
          id?: string
          legendary_cards?: number
          overtone_cards?: number
          settlement_id: string
          updated_at?: string
        }
        Update: {
          advanced_cards?: number
          basic_cards?: number
          created_at?: string
          hunt_id?: string
          id?: string
          legendary_cards?: number
          overtone_cards?: number
          settlement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunt_ai_deck_hunt_id_fkey"
            columns: ["hunt_id"]
            isOneToOne: false
            referencedRelation: "hunt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunt_ai_deck_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      hunt_hunt_board: {
        Row: {
          created_at: string
          hunt_id: string
          id: string
          pos_1: Database["public"]["Enums"]["hunt_event_type"]
          pos_10: Database["public"]["Enums"]["hunt_event_type"]
          pos_11: Database["public"]["Enums"]["hunt_event_type"]
          pos_2: Database["public"]["Enums"]["hunt_event_type"]
          pos_3: Database["public"]["Enums"]["hunt_event_type"]
          pos_4: Database["public"]["Enums"]["hunt_event_type"]
          pos_5: Database["public"]["Enums"]["hunt_event_type"]
          pos_7: Database["public"]["Enums"]["hunt_event_type"]
          pos_8: Database["public"]["Enums"]["hunt_event_type"]
          pos_9: Database["public"]["Enums"]["hunt_event_type"]
          settlement_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hunt_id: string
          id?: string
          pos_1?: Database["public"]["Enums"]["hunt_event_type"]
          pos_10?: Database["public"]["Enums"]["hunt_event_type"]
          pos_11?: Database["public"]["Enums"]["hunt_event_type"]
          pos_2?: Database["public"]["Enums"]["hunt_event_type"]
          pos_3?: Database["public"]["Enums"]["hunt_event_type"]
          pos_4?: Database["public"]["Enums"]["hunt_event_type"]
          pos_5?: Database["public"]["Enums"]["hunt_event_type"]
          pos_7?: Database["public"]["Enums"]["hunt_event_type"]
          pos_8?: Database["public"]["Enums"]["hunt_event_type"]
          pos_9?: Database["public"]["Enums"]["hunt_event_type"]
          settlement_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hunt_id?: string
          id?: string
          pos_1?: Database["public"]["Enums"]["hunt_event_type"]
          pos_10?: Database["public"]["Enums"]["hunt_event_type"]
          pos_11?: Database["public"]["Enums"]["hunt_event_type"]
          pos_2?: Database["public"]["Enums"]["hunt_event_type"]
          pos_3?: Database["public"]["Enums"]["hunt_event_type"]
          pos_4?: Database["public"]["Enums"]["hunt_event_type"]
          pos_5?: Database["public"]["Enums"]["hunt_event_type"]
          pos_7?: Database["public"]["Enums"]["hunt_event_type"]
          pos_8?: Database["public"]["Enums"]["hunt_event_type"]
          pos_9?: Database["public"]["Enums"]["hunt_event_type"]
          settlement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunt_hunt_board_hunt_id_fkey"
            columns: ["hunt_id"]
            isOneToOne: true
            referencedRelation: "hunt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunt_hunt_board_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: true
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      hunt_monster: {
        Row: {
          accuracy: number
          accuracy_tokens: number
          ai_deck_id: string
          ai_deck_remaining: number
          created_at: string
          damage: number
          damage_tokens: number
          evasion: number
          evasion_tokens: number
          hunt_id: string
          id: string
          knocked_down: boolean
          luck: number
          luck_tokens: number
          monster_name: string | null
          movement: number
          movement_tokens: number
          notes: string
          settlement_id: string
          speed: number
          speed_tokens: number
          strength: number
          strength_tokens: number
          toughness: number
          updated_at: string
          wounds: number
        }
        Insert: {
          accuracy?: number
          accuracy_tokens?: number
          ai_deck_id: string
          ai_deck_remaining?: number
          created_at?: string
          damage?: number
          damage_tokens?: number
          evasion?: number
          evasion_tokens?: number
          hunt_id: string
          id?: string
          knocked_down?: boolean
          luck?: number
          luck_tokens?: number
          monster_name?: string | null
          movement?: number
          movement_tokens?: number
          notes?: string
          settlement_id: string
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          toughness?: number
          updated_at?: string
          wounds?: number
        }
        Update: {
          accuracy?: number
          accuracy_tokens?: number
          ai_deck_id?: string
          ai_deck_remaining?: number
          created_at?: string
          damage?: number
          damage_tokens?: number
          evasion?: number
          evasion_tokens?: number
          hunt_id?: string
          id?: string
          knocked_down?: boolean
          luck?: number
          luck_tokens?: number
          monster_name?: string | null
          movement?: number
          movement_tokens?: number
          notes?: string
          settlement_id?: string
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          toughness?: number
          updated_at?: string
          wounds?: number
        }
        Relationships: [
          {
            foreignKeyName: "hunt_monster_ai_deck_id_fkey"
            columns: ["ai_deck_id"]
            isOneToOne: false
            referencedRelation: "hunt_ai_deck"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunt_monster_hunt_id_fkey"
            columns: ["hunt_id"]
            isOneToOne: false
            referencedRelation: "hunt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunt_monster_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      hunt_monster_mood: {
        Row: {
          created_at: string
          hunt_monster_id: string
          id: string
          mood_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hunt_monster_id: string
          id?: string
          mood_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hunt_monster_id?: string
          id?: string
          mood_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunt_monster_mood_hunt_monster_id_fkey"
            columns: ["hunt_monster_id"]
            isOneToOne: false
            referencedRelation: "hunt_monster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunt_monster_mood_mood_id_fkey"
            columns: ["mood_id"]
            isOneToOne: false
            referencedRelation: "mood"
            referencedColumns: ["id"]
          },
        ]
      }
      hunt_monster_survivor_status: {
        Row: {
          created_at: string
          hunt_monster_id: string
          id: string
          survivor_status_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hunt_monster_id: string
          id?: string
          survivor_status_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hunt_monster_id?: string
          id?: string
          survivor_status_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunt_monster_survivor_status_hunt_monster_id_fkey"
            columns: ["hunt_monster_id"]
            isOneToOne: false
            referencedRelation: "hunt_monster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunt_monster_survivor_status_survivor_status_id_fkey"
            columns: ["survivor_status_id"]
            isOneToOne: false
            referencedRelation: "survivor_status"
            referencedColumns: ["id"]
          },
        ]
      }
      hunt_monster_trait: {
        Row: {
          created_at: string
          hunt_monster_id: string
          id: string
          trait_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hunt_monster_id: string
          id?: string
          trait_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hunt_monster_id?: string
          id?: string
          trait_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunt_monster_trait_hunt_monster_id_fkey"
            columns: ["hunt_monster_id"]
            isOneToOne: false
            referencedRelation: "hunt_monster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunt_monster_trait_trait_id_fkey"
            columns: ["trait_id"]
            isOneToOne: false
            referencedRelation: "trait"
            referencedColumns: ["id"]
          },
        ]
      }
      hunt_survivor: {
        Row: {
          accuracy_tokens: number
          created_at: string
          evasion_tokens: number
          hunt_id: string
          id: string
          insanity_tokens: number
          luck_tokens: number
          movement_tokens: number
          notes: string
          scout: boolean
          settlement_id: string
          speed_tokens: number
          strength_tokens: number
          survival_tokens: number
          survivor_id: string
          updated_at: string
        }
        Insert: {
          accuracy_tokens?: number
          created_at?: string
          evasion_tokens?: number
          hunt_id: string
          id?: string
          insanity_tokens?: number
          luck_tokens?: number
          movement_tokens?: number
          notes?: string
          scout?: boolean
          settlement_id: string
          speed_tokens?: number
          strength_tokens?: number
          survival_tokens?: number
          survivor_id: string
          updated_at?: string
        }
        Update: {
          accuracy_tokens?: number
          created_at?: string
          evasion_tokens?: number
          hunt_id?: string
          id?: string
          insanity_tokens?: number
          luck_tokens?: number
          movement_tokens?: number
          notes?: string
          scout?: boolean
          settlement_id?: string
          speed_tokens?: number
          strength_tokens?: number
          survival_tokens?: number
          survivor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunt_survivor_hunt_id_fkey"
            columns: ["hunt_id"]
            isOneToOne: false
            referencedRelation: "hunt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunt_survivor_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunt_survivor_survivor_id_fkey"
            columns: ["survivor_id"]
            isOneToOne: false
            referencedRelation: "survivor"
            referencedColumns: ["id"]
          },
        ]
      }
      innovation: {
        Row: {
          archived_at: string | null
          benefits: string | null
          consequences: string | null
          created_at: string
          custom: boolean
          id: string
          innovation_name: string
          rules: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          benefits?: string | null
          consequences?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          innovation_name: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          benefits?: string | null
          consequences?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          innovation_name?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge: {
        Row: {
          archived_at: string | null
          created_at: string
          custom: boolean
          id: string
          knowledge_name: string
          observation_conditions: string | null
          observation_rank_up_milestone: number | null
          philosophy_id: string | null
          rules: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          knowledge_name: string
          observation_conditions?: string | null
          observation_rank_up_milestone?: number | null
          philosophy_id?: string | null
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          knowledge_name?: string
          observation_conditions?: string | null
          observation_rank_up_milestone?: number | null
          philosophy_id?: string | null
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_philosophy_id_fkey"
            columns: ["philosophy_id"]
            isOneToOne: false
            referencedRelation: "philosophy"
            referencedColumns: ["id"]
          },
        ]
      }
      location: {
        Row: {
          archived_at: string | null
          created_at: string
          custom: boolean
          id: string
          location_name: string
          rules: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          location_name: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          location_name?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lookup_user_audit: {
        Row: {
          attempted_at: string
          user_id: string
        }
        Insert: {
          attempted_at?: string
          user_id: string
        }
        Update: {
          attempted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      milestone: {
        Row: {
          archived_at: string | null
          campaign_types: Database["public"]["Enums"]["campaign_type"][]
          created_at: string
          custom: boolean
          event_name: string
          id: string
          milestone_name: string
          requirements: string | null
          rules: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          campaign_types?: Database["public"]["Enums"]["campaign_type"][]
          created_at?: string
          custom?: boolean
          event_name: string
          id?: string
          milestone_name: string
          requirements?: string | null
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          campaign_types?: Database["public"]["Enums"]["campaign_type"][]
          created_at?: string
          custom?: boolean
          event_name?: string
          id?: string
          milestone_name?: string
          requirements?: string | null
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mood: {
        Row: {
          archived_at: string | null
          created_at: string
          custom: boolean
          id: string
          mood_name: string
          rules: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          mood_name: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          mood_name?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      nemesis: {
        Row: {
          alternate_id: string | null
          archived_at: string | null
          basic_action: string | null
          blind_spot: string | null
          created_at: string
          custom: boolean
          defeat_outcome: string | null
          deployment_rules: string | null
          id: string
          instinct: string | null
          monster_name: string
          multi_monster: boolean
          node: Database["public"]["Enums"]["monster_node"]
          updated_at: string
          user_id: string | null
          victory_outcome: string | null
          vignette_id: string | null
        }
        Insert: {
          alternate_id?: string | null
          archived_at?: string | null
          basic_action?: string | null
          blind_spot?: string | null
          created_at?: string
          custom?: boolean
          defeat_outcome?: string | null
          deployment_rules?: string | null
          id?: string
          instinct?: string | null
          monster_name: string
          multi_monster?: boolean
          node: Database["public"]["Enums"]["monster_node"]
          updated_at?: string
          user_id?: string | null
          victory_outcome?: string | null
          vignette_id?: string | null
        }
        Update: {
          alternate_id?: string | null
          archived_at?: string | null
          basic_action?: string | null
          blind_spot?: string | null
          created_at?: string
          custom?: boolean
          defeat_outcome?: string | null
          deployment_rules?: string | null
          id?: string
          instinct?: string | null
          monster_name?: string
          multi_monster?: boolean
          node?: Database["public"]["Enums"]["monster_node"]
          updated_at?: string
          user_id?: string | null
          victory_outcome?: string | null
          vignette_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nemesis_alternate_id_fkey"
            columns: ["alternate_id"]
            isOneToOne: false
            referencedRelation: "nemesis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nemesis_vignette_id_fkey"
            columns: ["vignette_id"]
            isOneToOne: false
            referencedRelation: "nemesis"
            referencedColumns: ["id"]
          },
        ]
      }
      nemesis_level: {
        Row: {
          accuracy: number
          accuracy_tokens: number
          advanced_cards: number
          ai_deck_remaining: number
          basic_cards: number
          created_at: string
          damage: number
          damage_tokens: number
          evasion: number
          evasion_tokens: number
          id: string
          legendary_cards: number
          level_number: number
          life: number | null
          luck: number
          luck_tokens: number
          movement: number
          movement_tokens: number
          nemesis_id: string
          overtone_cards: number
          speed: number
          speed_tokens: number
          strength: number
          strength_tokens: number
          sub_monster_name: string | null
          toughness: number
          toughness_tokens: number
          updated_at: string
        }
        Insert: {
          accuracy?: number
          accuracy_tokens?: number
          advanced_cards?: number
          ai_deck_remaining?: number
          basic_cards?: number
          created_at?: string
          damage?: number
          damage_tokens?: number
          evasion?: number
          evasion_tokens?: number
          id?: string
          legendary_cards?: number
          level_number: number
          life?: number | null
          luck?: number
          luck_tokens?: number
          movement?: number
          movement_tokens?: number
          nemesis_id: string
          overtone_cards?: number
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          sub_monster_name?: string | null
          toughness?: number
          toughness_tokens?: number
          updated_at?: string
        }
        Update: {
          accuracy?: number
          accuracy_tokens?: number
          advanced_cards?: number
          ai_deck_remaining?: number
          basic_cards?: number
          created_at?: string
          damage?: number
          damage_tokens?: number
          evasion?: number
          evasion_tokens?: number
          id?: string
          legendary_cards?: number
          level_number?: number
          life?: number | null
          luck?: number
          luck_tokens?: number
          movement?: number
          movement_tokens?: number
          nemesis_id?: string
          overtone_cards?: number
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          sub_monster_name?: string | null
          toughness?: number
          toughness_tokens?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nemesis_level_nemesis_id_fkey"
            columns: ["nemesis_id"]
            isOneToOne: false
            referencedRelation: "nemesis"
            referencedColumns: ["id"]
          },
        ]
      }
      nemesis_level_mood: {
        Row: {
          created_at: string
          id: string
          mood_id: string
          nemesis_level_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood_id: string
          nemesis_level_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mood_id?: string
          nemesis_level_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nemesis_level_mood_mood_id_fkey"
            columns: ["mood_id"]
            isOneToOne: false
            referencedRelation: "mood"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nemesis_level_mood_nemesis_level_id_fkey"
            columns: ["nemesis_level_id"]
            isOneToOne: false
            referencedRelation: "nemesis_level"
            referencedColumns: ["id"]
          },
        ]
      }
      nemesis_level_survivor_status: {
        Row: {
          created_at: string
          id: string
          nemesis_level_id: string
          survivor_status_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nemesis_level_id: string
          survivor_status_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nemesis_level_id?: string
          survivor_status_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nemesis_level_survivor_status_nemesis_level_id_fkey"
            columns: ["nemesis_level_id"]
            isOneToOne: false
            referencedRelation: "nemesis_level"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nemesis_level_survivor_status_survivor_status_id_fkey"
            columns: ["survivor_status_id"]
            isOneToOne: false
            referencedRelation: "survivor_status"
            referencedColumns: ["id"]
          },
        ]
      }
      nemesis_level_trait: {
        Row: {
          created_at: string
          id: string
          nemesis_level_id: string
          trait_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nemesis_level_id: string
          trait_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nemesis_level_id?: string
          trait_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nemesis_level_trait_nemesis_level_id_fkey"
            columns: ["nemesis_level_id"]
            isOneToOne: false
            referencedRelation: "nemesis_level"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nemesis_level_trait_trait_id_fkey"
            columns: ["trait_id"]
            isOneToOne: false
            referencedRelation: "trait"
            referencedColumns: ["id"]
          },
        ]
      }
      nemesis_location: {
        Row: {
          created_at: string
          id: string
          location_id: string
          nemesis_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          nemesis_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          nemesis_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nemesis_location_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nemesis_location_nemesis_id_fkey"
            columns: ["nemesis_id"]
            isOneToOne: false
            referencedRelation: "nemesis"
            referencedColumns: ["id"]
          },
        ]
      }
      nemesis_timeline_year: {
        Row: {
          campaign_types: Database["public"]["Enums"]["campaign_type"][]
          created_at: string
          entries: string[]
          id: string
          nemesis_id: string
          updated_at: string
          year_number: number
        }
        Insert: {
          campaign_types?: Database["public"]["Enums"]["campaign_type"][]
          created_at?: string
          entries?: string[]
          id?: string
          nemesis_id: string
          updated_at?: string
          year_number: number
        }
        Update: {
          campaign_types?: Database["public"]["Enums"]["campaign_type"][]
          created_at?: string
          entries?: string[]
          id?: string
          nemesis_id?: string
          updated_at?: string
          year_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "nemesis_timeline_year_nemesis_id_fkey"
            columns: ["nemesis_id"]
            isOneToOne: false
            referencedRelation: "nemesis"
            referencedColumns: ["id"]
          },
        ]
      }
      neurosis: {
        Row: {
          archived_at: string | null
          created_at: string
          custom: boolean
          id: string
          neurosis_name: string
          rules: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          neurosis_name: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          neurosis_name?: string
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification: {
        Row: {
          created_at: string
          id: string
          kind: string
          payload: Json
          read_at: string | null
          recipient_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          payload?: Json
          read_at?: string | null
          recipient_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          payload?: Json
          read_at?: string | null
          recipient_user_id?: string
        }
        Relationships: []
      }
      pattern: {
        Row: {
          archived_at: string | null
          crafted_gear_id: string | null
          crafting_limit: number | null
          created_at: string
          custom: boolean
          endeavor_cost: number | null
          id: string
          pattern_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          crafted_gear_id?: string | null
          crafting_limit?: number | null
          created_at?: string
          custom?: boolean
          endeavor_cost?: number | null
          id?: string
          pattern_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          crafted_gear_id?: string | null
          crafting_limit?: number | null
          created_at?: string
          custom?: boolean
          endeavor_cost?: number | null
          id?: string
          pattern_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pattern_crafted_gear_id_fkey"
            columns: ["crafted_gear_id"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
        ]
      }
      pattern_gear_cost: {
        Row: {
          cost_gear_id: string
          pattern_id: string
          quantity: number
        }
        Insert: {
          cost_gear_id: string
          pattern_id: string
          quantity?: number
        }
        Update: {
          cost_gear_id?: string
          pattern_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "pattern_gear_cost_cost_gear_id_fkey"
            columns: ["cost_gear_id"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pattern_gear_cost_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "pattern"
            referencedColumns: ["id"]
          },
        ]
      }
      pattern_innovation_requirement: {
        Row: {
          innovation_id: string
          pattern_id: string
        }
        Insert: {
          innovation_id: string
          pattern_id: string
        }
        Update: {
          innovation_id?: string
          pattern_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pattern_innovation_requirement_innovation_id_fkey"
            columns: ["innovation_id"]
            isOneToOne: false
            referencedRelation: "innovation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pattern_innovation_requirement_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "pattern"
            referencedColumns: ["id"]
          },
        ]
      }
      pattern_resource_cost: {
        Row: {
          pattern_id: string
          quantity: number
          resource_id: string
        }
        Insert: {
          pattern_id: string
          quantity?: number
          resource_id: string
        }
        Update: {
          pattern_id?: string
          quantity?: number
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pattern_resource_cost_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "pattern"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pattern_resource_cost_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resource"
            referencedColumns: ["id"]
          },
        ]
      }
      pattern_resource_type_cost: {
        Row: {
          pattern_id: string
          quantity: number
          resource_type: Database["public"]["Enums"]["resource_type"]
        }
        Insert: {
          pattern_id: string
          quantity?: number
          resource_type: Database["public"]["Enums"]["resource_type"]
        }
        Update: {
          pattern_id?: string
          quantity?: number
          resource_type?: Database["public"]["Enums"]["resource_type"]
        }
        Relationships: [
          {
            foreignKeyName: "pattern_resource_type_cost_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "pattern"
            referencedColumns: ["id"]
          },
        ]
      }
      philosophy: {
        Row: {
          archived_at: string | null
          created_at: string
          custom: boolean
          hunt_xp_milestones: number[] | null
          id: string
          neurosis_id: string | null
          philosophy_name: string
          tenet_knowledge_id: string | null
          tier: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          hunt_xp_milestones?: number[] | null
          id?: string
          neurosis_id?: string | null
          philosophy_name: string
          tenet_knowledge_id?: string | null
          tier?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          hunt_xp_milestones?: number[] | null
          id?: string
          neurosis_id?: string | null
          philosophy_name?: string
          tenet_knowledge_id?: string | null
          tier?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "philosophy_neurosis_id_fkey"
            columns: ["neurosis_id"]
            isOneToOne: false
            referencedRelation: "neurosis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "philosophy_tenet_knowledge_id_fkey"
            columns: ["tenet_knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge"
            referencedColumns: ["id"]
          },
        ]
      }
      philosophy_rank: {
        Row: {
          created_at: string
          id: string
          philosophy_id: string
          rank_number: number
          rules: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          philosophy_id: string
          rank_number: number
          rules?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          philosophy_id?: string
          rank_number?: number
          rules?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "philosophy_rank_philosophy_id_fkey"
            columns: ["philosophy_id"]
            isOneToOne: false
            referencedRelation: "philosophy"
            referencedColumns: ["id"]
          },
        ]
      }
      principle: {
        Row: {
          archived_at: string | null
          campaign_types: Database["public"]["Enums"]["campaign_type"][]
          created_at: string
          custom: boolean
          id: string
          option_1_name: string
          option_1_rules: string | null
          option_2_name: string
          option_2_rules: string | null
          principle_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          campaign_types?: Database["public"]["Enums"]["campaign_type"][]
          created_at?: string
          custom?: boolean
          id?: string
          option_1_name: string
          option_1_rules?: string | null
          option_2_name: string
          option_2_rules?: string | null
          principle_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          campaign_types?: Database["public"]["Enums"]["campaign_type"][]
          created_at?: string
          custom?: boolean
          id?: string
          option_1_name?: string
          option_1_rules?: string | null
          option_2_name?: string
          option_2_rules?: string | null
          principle_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      quarry: {
        Row: {
          alternate_id: string | null
          archived_at: string | null
          basic_action: string | null
          blind_spot: string | null
          created_at: string
          custom: boolean
          defeat_outcome: string | null
          deployment_rules: string | null
          id: string
          instinct: string | null
          monster_name: string
          multi_monster: boolean
          node: Database["public"]["Enums"]["monster_node"]
          prologue: boolean
          updated_at: string
          user_id: string | null
          victory_outcome: string | null
          vignette_id: string | null
        }
        Insert: {
          alternate_id?: string | null
          archived_at?: string | null
          basic_action?: string | null
          blind_spot?: string | null
          created_at?: string
          custom?: boolean
          defeat_outcome?: string | null
          deployment_rules?: string | null
          id?: string
          instinct?: string | null
          monster_name: string
          multi_monster?: boolean
          node: Database["public"]["Enums"]["monster_node"]
          prologue?: boolean
          updated_at?: string
          user_id?: string | null
          victory_outcome?: string | null
          vignette_id?: string | null
        }
        Update: {
          alternate_id?: string | null
          archived_at?: string | null
          basic_action?: string | null
          blind_spot?: string | null
          created_at?: string
          custom?: boolean
          defeat_outcome?: string | null
          deployment_rules?: string | null
          id?: string
          instinct?: string | null
          monster_name?: string
          multi_monster?: boolean
          node?: Database["public"]["Enums"]["monster_node"]
          prologue?: boolean
          updated_at?: string
          user_id?: string | null
          victory_outcome?: string | null
          vignette_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quarry_alternate_id_fkey"
            columns: ["alternate_id"]
            isOneToOne: false
            referencedRelation: "quarry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarry_vignette_id_fkey"
            columns: ["vignette_id"]
            isOneToOne: false
            referencedRelation: "quarry"
            referencedColumns: ["id"]
          },
        ]
      }
      quarry_collective_cognition_reward: {
        Row: {
          collective_cognition_reward_id: string
          created_at: string
          id: string
          quarry_id: string
          updated_at: string
        }
        Insert: {
          collective_cognition_reward_id: string
          created_at?: string
          id?: string
          quarry_id: string
          updated_at?: string
        }
        Update: {
          collective_cognition_reward_id?: string
          created_at?: string
          id?: string
          quarry_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarry_collective_cognition_r_collective_cognition_reward__fkey"
            columns: ["collective_cognition_reward_id"]
            isOneToOne: false
            referencedRelation: "collective_cognition_reward"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarry_collective_cognition_reward_quarry_id_fkey"
            columns: ["quarry_id"]
            isOneToOne: false
            referencedRelation: "quarry"
            referencedColumns: ["id"]
          },
        ]
      }
      quarry_hunt_board: {
        Row: {
          created_at: string
          id: string
          pos_1: Database["public"]["Enums"]["hunt_event_type"]
          pos_10: Database["public"]["Enums"]["hunt_event_type"]
          pos_11: Database["public"]["Enums"]["hunt_event_type"]
          pos_2: Database["public"]["Enums"]["hunt_event_type"]
          pos_3: Database["public"]["Enums"]["hunt_event_type"]
          pos_4: Database["public"]["Enums"]["hunt_event_type"]
          pos_5: Database["public"]["Enums"]["hunt_event_type"]
          pos_7: Database["public"]["Enums"]["hunt_event_type"]
          pos_8: Database["public"]["Enums"]["hunt_event_type"]
          pos_9: Database["public"]["Enums"]["hunt_event_type"]
          quarry_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pos_1?: Database["public"]["Enums"]["hunt_event_type"]
          pos_10?: Database["public"]["Enums"]["hunt_event_type"]
          pos_11?: Database["public"]["Enums"]["hunt_event_type"]
          pos_2?: Database["public"]["Enums"]["hunt_event_type"]
          pos_3?: Database["public"]["Enums"]["hunt_event_type"]
          pos_4?: Database["public"]["Enums"]["hunt_event_type"]
          pos_5?: Database["public"]["Enums"]["hunt_event_type"]
          pos_7?: Database["public"]["Enums"]["hunt_event_type"]
          pos_8?: Database["public"]["Enums"]["hunt_event_type"]
          pos_9?: Database["public"]["Enums"]["hunt_event_type"]
          quarry_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pos_1?: Database["public"]["Enums"]["hunt_event_type"]
          pos_10?: Database["public"]["Enums"]["hunt_event_type"]
          pos_11?: Database["public"]["Enums"]["hunt_event_type"]
          pos_2?: Database["public"]["Enums"]["hunt_event_type"]
          pos_3?: Database["public"]["Enums"]["hunt_event_type"]
          pos_4?: Database["public"]["Enums"]["hunt_event_type"]
          pos_5?: Database["public"]["Enums"]["hunt_event_type"]
          pos_7?: Database["public"]["Enums"]["hunt_event_type"]
          pos_8?: Database["public"]["Enums"]["hunt_event_type"]
          pos_9?: Database["public"]["Enums"]["hunt_event_type"]
          quarry_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarry_hunt_board_quarry_id_fkey"
            columns: ["quarry_id"]
            isOneToOne: false
            referencedRelation: "quarry"
            referencedColumns: ["id"]
          },
        ]
      }
      quarry_hunt_board_position: {
        Row: {
          created_at: string
          id: string
          level_number: number
          monster_hunt_pos: number
          quarry_id: string
          survivor_hunt_pos: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          level_number: number
          monster_hunt_pos?: number
          quarry_id: string
          survivor_hunt_pos?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          level_number?: number
          monster_hunt_pos?: number
          quarry_id?: string
          survivor_hunt_pos?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarry_hunt_board_position_quarry_id_fkey"
            columns: ["quarry_id"]
            isOneToOne: false
            referencedRelation: "quarry"
            referencedColumns: ["id"]
          },
        ]
      }
      quarry_level: {
        Row: {
          accuracy: number
          accuracy_tokens: number
          advanced_cards: number
          ai_deck_remaining: number
          basic_cards: number
          created_at: string
          damage: number
          damage_tokens: number
          evasion: number
          evasion_tokens: number
          id: string
          legendary_cards: number
          level_number: number
          luck: number
          luck_tokens: number
          movement: number
          movement_tokens: number
          overtone_cards: number
          quarry_id: string
          speed: number
          speed_tokens: number
          strength: number
          strength_tokens: number
          sub_monster_name: string | null
          toughness: number
          toughness_tokens: number
          updated_at: string
        }
        Insert: {
          accuracy?: number
          accuracy_tokens?: number
          advanced_cards?: number
          ai_deck_remaining?: number
          basic_cards?: number
          created_at?: string
          damage?: number
          damage_tokens?: number
          evasion?: number
          evasion_tokens?: number
          id?: string
          legendary_cards?: number
          level_number: number
          luck?: number
          luck_tokens?: number
          movement?: number
          movement_tokens?: number
          overtone_cards?: number
          quarry_id: string
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          sub_monster_name?: string | null
          toughness?: number
          toughness_tokens?: number
          updated_at?: string
        }
        Update: {
          accuracy?: number
          accuracy_tokens?: number
          advanced_cards?: number
          ai_deck_remaining?: number
          basic_cards?: number
          created_at?: string
          damage?: number
          damage_tokens?: number
          evasion?: number
          evasion_tokens?: number
          id?: string
          legendary_cards?: number
          level_number?: number
          luck?: number
          luck_tokens?: number
          movement?: number
          movement_tokens?: number
          overtone_cards?: number
          quarry_id?: string
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          sub_monster_name?: string | null
          toughness?: number
          toughness_tokens?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarry_level_quarry_id_fkey"
            columns: ["quarry_id"]
            isOneToOne: false
            referencedRelation: "quarry"
            referencedColumns: ["id"]
          },
        ]
      }
      quarry_level_mood: {
        Row: {
          created_at: string
          id: string
          mood_id: string
          quarry_level_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood_id: string
          quarry_level_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mood_id?: string
          quarry_level_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarry_level_mood_mood_id_fkey"
            columns: ["mood_id"]
            isOneToOne: false
            referencedRelation: "mood"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarry_level_mood_quarry_level_id_fkey"
            columns: ["quarry_level_id"]
            isOneToOne: false
            referencedRelation: "quarry_level"
            referencedColumns: ["id"]
          },
        ]
      }
      quarry_level_survivor_status: {
        Row: {
          created_at: string
          id: string
          quarry_level_id: string
          survivor_status_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          quarry_level_id: string
          survivor_status_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          quarry_level_id?: string
          survivor_status_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarry_level_survivor_status_quarry_level_id_fkey"
            columns: ["quarry_level_id"]
            isOneToOne: false
            referencedRelation: "quarry_level"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarry_level_survivor_status_survivor_status_id_fkey"
            columns: ["survivor_status_id"]
            isOneToOne: false
            referencedRelation: "survivor_status"
            referencedColumns: ["id"]
          },
        ]
      }
      quarry_level_trait: {
        Row: {
          created_at: string
          id: string
          quarry_level_id: string
          trait_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          quarry_level_id: string
          trait_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          quarry_level_id?: string
          trait_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarry_level_trait_quarry_level_id_fkey"
            columns: ["quarry_level_id"]
            isOneToOne: false
            referencedRelation: "quarry_level"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarry_level_trait_trait_id_fkey"
            columns: ["trait_id"]
            isOneToOne: false
            referencedRelation: "trait"
            referencedColumns: ["id"]
          },
        ]
      }
      quarry_location: {
        Row: {
          created_at: string
          id: string
          location_id: string
          quarry_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          quarry_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          quarry_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarry_location_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quarry_location_quarry_id_fkey"
            columns: ["quarry_id"]
            isOneToOne: false
            referencedRelation: "quarry"
            referencedColumns: ["id"]
          },
        ]
      }
      quarry_timeline_year: {
        Row: {
          campaign_types: Database["public"]["Enums"]["campaign_type"][]
          created_at: string
          entries: string[]
          id: string
          quarry_id: string
          updated_at: string
          year_number: number
        }
        Insert: {
          campaign_types?: Database["public"]["Enums"]["campaign_type"][]
          created_at?: string
          entries?: string[]
          id?: string
          quarry_id: string
          updated_at?: string
          year_number: number
        }
        Update: {
          campaign_types?: Database["public"]["Enums"]["campaign_type"][]
          created_at?: string
          entries?: string[]
          id?: string
          quarry_id?: string
          updated_at?: string
          year_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "quarry_timeline_year_quarry_id_fkey"
            columns: ["quarry_id"]
            isOneToOne: false
            referencedRelation: "quarry"
            referencedColumns: ["id"]
          },
        ]
      }
      resource: {
        Row: {
          archived_at: string | null
          category: Database["public"]["Enums"]["resource_category"]
          created_at: string
          custom: boolean
          id: string
          nemesis_id: string | null
          pattern_id: string | null
          quarry_id: string | null
          resource_name: string
          resource_types: Database["public"]["Enums"]["resource_type"][]
          rules: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          category: Database["public"]["Enums"]["resource_category"]
          created_at?: string
          custom?: boolean
          id?: string
          nemesis_id?: string | null
          pattern_id?: string | null
          quarry_id?: string | null
          resource_name: string
          resource_types?: Database["public"]["Enums"]["resource_type"][]
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          category?: Database["public"]["Enums"]["resource_category"]
          created_at?: string
          custom?: boolean
          id?: string
          nemesis_id?: string | null
          pattern_id?: string | null
          quarry_id?: string | null
          resource_name?: string
          resource_types?: Database["public"]["Enums"]["resource_type"][]
          rules?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_nemesis_id_fkey"
            columns: ["nemesis_id"]
            isOneToOne: false
            referencedRelation: "nemesis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "pattern"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_quarry_id_fkey"
            columns: ["quarry_id"]
            isOneToOne: false
            referencedRelation: "quarry"
            referencedColumns: ["id"]
          },
        ]
      }
      secret_fighting_art: {
        Row: {
          archived_at: string | null
          created_at: string
          custom: boolean
          id: string
          rules: string | null
          secret_fighting_art_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          rules?: string | null
          secret_fighting_art_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          rules?: string | null
          secret_fighting_art_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      seed_pattern: {
        Row: {
          archived_at: string | null
          crafted_gear_id: string | null
          crafting_limit: number | null
          crafting_steps: string | null
          created_at: string
          custom: boolean
          endeavor_cost: number | null
          era: number | null
          id: string
          keywords: string[] | null
          requirements: string | null
          seed_pattern_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          crafted_gear_id?: string | null
          crafting_limit?: number | null
          crafting_steps?: string | null
          created_at?: string
          custom?: boolean
          endeavor_cost?: number | null
          era?: number | null
          id?: string
          keywords?: string[] | null
          requirements?: string | null
          seed_pattern_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          crafted_gear_id?: string | null
          crafting_limit?: number | null
          crafting_steps?: string | null
          created_at?: string
          custom?: boolean
          endeavor_cost?: number | null
          era?: number | null
          id?: string
          keywords?: string[] | null
          requirements?: string | null
          seed_pattern_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seed_pattern_crafted_gear_id_fkey"
            columns: ["crafted_gear_id"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
        ]
      }
      seed_pattern_gear_cost: {
        Row: {
          cost_gear_id: string
          quantity: number
          seed_pattern_id: string
        }
        Insert: {
          cost_gear_id: string
          quantity?: number
          seed_pattern_id: string
        }
        Update: {
          cost_gear_id?: string
          quantity?: number
          seed_pattern_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seed_pattern_gear_cost_cost_gear_id_fkey"
            columns: ["cost_gear_id"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seed_pattern_gear_cost_seed_pattern_id_fkey"
            columns: ["seed_pattern_id"]
            isOneToOne: false
            referencedRelation: "seed_pattern"
            referencedColumns: ["id"]
          },
        ]
      }
      seed_pattern_innovation_requirement: {
        Row: {
          innovation_id: string
          seed_pattern_id: string
        }
        Insert: {
          innovation_id: string
          seed_pattern_id: string
        }
        Update: {
          innovation_id?: string
          seed_pattern_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seed_pattern_innovation_requirement_innovation_id_fkey"
            columns: ["innovation_id"]
            isOneToOne: false
            referencedRelation: "innovation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seed_pattern_innovation_requirement_seed_pattern_id_fkey"
            columns: ["seed_pattern_id"]
            isOneToOne: false
            referencedRelation: "seed_pattern"
            referencedColumns: ["id"]
          },
        ]
      }
      seed_pattern_resource_cost: {
        Row: {
          quantity: number
          resource_id: string
          seed_pattern_id: string
        }
        Insert: {
          quantity?: number
          resource_id: string
          seed_pattern_id: string
        }
        Update: {
          quantity?: number
          resource_id?: string
          seed_pattern_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seed_pattern_resource_cost_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resource"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seed_pattern_resource_cost_seed_pattern_id_fkey"
            columns: ["seed_pattern_id"]
            isOneToOne: false
            referencedRelation: "seed_pattern"
            referencedColumns: ["id"]
          },
        ]
      }
      seed_pattern_resource_type_cost: {
        Row: {
          quantity: number
          resource_type: Database["public"]["Enums"]["resource_type"]
          seed_pattern_id: string
        }
        Insert: {
          quantity?: number
          resource_type: Database["public"]["Enums"]["resource_type"]
          seed_pattern_id: string
        }
        Update: {
          quantity?: number
          resource_type?: Database["public"]["Enums"]["resource_type"]
          seed_pattern_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seed_pattern_resource_type_cost_seed_pattern_id_fkey"
            columns: ["seed_pattern_id"]
            isOneToOne: false
            referencedRelation: "seed_pattern"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement: {
        Row: {
          arrival_bonuses: string[]
          campaign_type: Database["public"]["Enums"]["campaign_type"]
          created_at: string
          current_year: number
          departing_bonuses: string[]
          id: string
          lantern_research: number
          monster_volumes: string[]
          notes: string
          settlement_name: string
          survival_limit: number
          survivor_type: Database["public"]["Enums"]["survivor_type"]
          updated_at: string
          user_id: string
          uses_scouts: boolean
        }
        Insert: {
          arrival_bonuses?: string[]
          campaign_type?: Database["public"]["Enums"]["campaign_type"]
          created_at?: string
          current_year?: number
          departing_bonuses?: string[]
          id?: string
          lantern_research?: number
          monster_volumes?: string[]
          notes?: string
          settlement_name?: string
          survival_limit?: number
          survivor_type?: Database["public"]["Enums"]["survivor_type"]
          updated_at?: string
          user_id: string
          uses_scouts?: boolean
        }
        Update: {
          arrival_bonuses?: string[]
          campaign_type?: Database["public"]["Enums"]["campaign_type"]
          created_at?: string
          current_year?: number
          departing_bonuses?: string[]
          id?: string
          lantern_research?: number
          monster_volumes?: string[]
          notes?: string
          settlement_name?: string
          survival_limit?: number
          survivor_type?: Database["public"]["Enums"]["survivor_type"]
          updated_at?: string
          user_id?: string
          uses_scouts?: boolean
        }
        Relationships: []
      }
      settlement_collective_cognition_reward: {
        Row: {
          collective_cognition_reward_id: string
          created_at: string
          id: string
          settlement_id: string
          unlocked: boolean
          updated_at: string
        }
        Insert: {
          collective_cognition_reward_id: string
          created_at?: string
          id?: string
          settlement_id: string
          unlocked?: boolean
          updated_at?: string
        }
        Update: {
          collective_cognition_reward_id?: string
          created_at?: string
          id?: string
          settlement_id?: string
          unlocked?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_collective_cogniti_collective_cognition_reward__fkey"
            columns: ["collective_cognition_reward_id"]
            isOneToOne: false
            referencedRelation: "collective_cognition_reward"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_collective_cognition_reward_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_gear: {
        Row: {
          created_at: string
          gear_id: string
          id: string
          quantity: number
          settlement_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gear_id: string
          id?: string
          quantity?: number
          settlement_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gear_id?: string
          id?: string
          quantity?: number
          settlement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_gear_gear_id_fkey"
            columns: ["gear_id"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_gear_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_innovation: {
        Row: {
          created_at: string
          id: string
          innovation_id: string
          settlement_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          innovation_id: string
          settlement_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          innovation_id?: string
          settlement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_innovation_innovation_id_fkey"
            columns: ["innovation_id"]
            isOneToOne: false
            referencedRelation: "innovation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_innovation_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_knowledge: {
        Row: {
          created_at: string
          id: string
          knowledge_id: string
          settlement_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          knowledge_id: string
          settlement_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          knowledge_id?: string
          settlement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_knowledge_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_knowledge_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_location: {
        Row: {
          created_at: string
          id: string
          location_id: string
          settlement_id: string
          unlocked: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_id: string
          settlement_id: string
          unlocked?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          location_id?: string
          settlement_id?: string
          unlocked?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_location_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_location_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_milestone: {
        Row: {
          complete: boolean
          created_at: string
          id: string
          milestone_id: string
          settlement_id: string
          updated_at: string
        }
        Insert: {
          complete?: boolean
          created_at?: string
          id?: string
          milestone_id: string
          settlement_id: string
          updated_at?: string
        }
        Update: {
          complete?: boolean
          created_at?: string
          id?: string
          milestone_id?: string
          settlement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_milestone_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestone"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_milestone_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_nemesis: {
        Row: {
          collective_cognition_level_1: boolean
          collective_cognition_level_2: boolean
          collective_cognition_level_3: boolean
          created_at: string
          id: string
          level_1_defeated: boolean
          level_2_defeated: boolean
          level_3_defeated: boolean
          level_4_defeated: boolean
          nemesis_id: string
          settlement_id: string
          unlocked: boolean
          updated_at: string
        }
        Insert: {
          collective_cognition_level_1?: boolean
          collective_cognition_level_2?: boolean
          collective_cognition_level_3?: boolean
          created_at?: string
          id?: string
          level_1_defeated?: boolean
          level_2_defeated?: boolean
          level_3_defeated?: boolean
          level_4_defeated?: boolean
          nemesis_id: string
          settlement_id: string
          unlocked?: boolean
          updated_at?: string
        }
        Update: {
          collective_cognition_level_1?: boolean
          collective_cognition_level_2?: boolean
          collective_cognition_level_3?: boolean
          created_at?: string
          id?: string
          level_1_defeated?: boolean
          level_2_defeated?: boolean
          level_3_defeated?: boolean
          level_4_defeated?: boolean
          nemesis_id?: string
          settlement_id?: string
          unlocked?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_nemesis_nemesis_id_fkey"
            columns: ["nemesis_id"]
            isOneToOne: false
            referencedRelation: "nemesis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_nemesis_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_pattern: {
        Row: {
          created_at: string
          id: string
          pattern_id: string
          settlement_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pattern_id: string
          settlement_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pattern_id?: string
          settlement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_pattern_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "pattern"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_pattern_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_phase: {
        Row: {
          created_at: string
          endeavors: number
          id: string
          returning_scout_id: string | null
          settlement_id: string
          step: Database["public"]["Enums"]["settlement_phase_step"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          endeavors?: number
          id?: string
          returning_scout_id?: string | null
          settlement_id: string
          step?: Database["public"]["Enums"]["settlement_phase_step"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          endeavors?: number
          id?: string
          returning_scout_id?: string | null
          settlement_id?: string
          step?: Database["public"]["Enums"]["settlement_phase_step"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_phase_returning_scout_id_fkey"
            columns: ["returning_scout_id"]
            isOneToOne: false
            referencedRelation: "survivor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_phase_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: true
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_phase_returning_survivor: {
        Row: {
          settlement_id: string
          settlement_phase_id: string
          survivor_id: string
        }
        Insert: {
          settlement_id: string
          settlement_phase_id: string
          survivor_id: string
        }
        Update: {
          settlement_id?: string
          settlement_phase_id?: string
          survivor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_phase_returning_survivor_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_phase_returning_survivor_settlement_phase_id_fkey"
            columns: ["settlement_phase_id"]
            isOneToOne: false
            referencedRelation: "settlement_phase"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_phase_returning_survivor_survivor_id_fkey"
            columns: ["survivor_id"]
            isOneToOne: false
            referencedRelation: "survivor"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_philosophy: {
        Row: {
          created_at: string
          id: string
          philosophy_id: string
          settlement_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          philosophy_id: string
          settlement_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          philosophy_id?: string
          settlement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_philosophy_philosophy_id_fkey"
            columns: ["philosophy_id"]
            isOneToOne: false
            referencedRelation: "philosophy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_philosophy_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_principle: {
        Row: {
          created_at: string
          id: string
          option_1_selected: boolean
          option_2_selected: boolean
          principle_id: string
          settlement_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_1_selected?: boolean
          option_2_selected?: boolean
          principle_id: string
          settlement_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          option_1_selected?: boolean
          option_2_selected?: boolean
          principle_id?: string
          settlement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_principle_principle_id_fkey"
            columns: ["principle_id"]
            isOneToOne: false
            referencedRelation: "principle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_principle_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_quarry: {
        Row: {
          collective_cognition_level_1: boolean
          collective_cognition_level_2: boolean[]
          collective_cognition_level_3: boolean[]
          collective_cognition_prologue: boolean
          created_at: string
          id: string
          quarry_id: string
          settlement_id: string
          unlocked: boolean
          updated_at: string
        }
        Insert: {
          collective_cognition_level_1?: boolean
          collective_cognition_level_2?: boolean[]
          collective_cognition_level_3?: boolean[]
          collective_cognition_prologue?: boolean
          created_at?: string
          id?: string
          quarry_id: string
          settlement_id: string
          unlocked?: boolean
          updated_at?: string
        }
        Update: {
          collective_cognition_level_1?: boolean
          collective_cognition_level_2?: boolean[]
          collective_cognition_level_3?: boolean[]
          collective_cognition_prologue?: boolean
          created_at?: string
          id?: string
          quarry_id?: string
          settlement_id?: string
          unlocked?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_quarry_quarry_id_fkey"
            columns: ["quarry_id"]
            isOneToOne: false
            referencedRelation: "quarry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_quarry_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_resource: {
        Row: {
          created_at: string
          id: string
          quantity: number
          resource_id: string
          settlement_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          resource_id: string
          settlement_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          resource_id?: string
          settlement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_resource_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resource"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_resource_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_seed_pattern: {
        Row: {
          created_at: string
          id: string
          seed_pattern_id: string
          settlement_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          seed_pattern_id: string
          settlement_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          seed_pattern_id?: string
          settlement_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_seed_pattern_seed_pattern_id_fkey"
            columns: ["seed_pattern_id"]
            isOneToOne: false
            referencedRelation: "seed_pattern"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_seed_pattern_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_shared_user: {
        Row: {
          created_at: string
          settlement_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          settlement_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          settlement_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_settlement_shared_user_settings"
            columns: ["shared_user_id"]
            isOneToOne: false
            referencedRelation: "user_settings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "settlement_shared_user_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_timeline_year: {
        Row: {
          completed: boolean
          created_at: string
          entries: string[]
          id: string
          settlement_id: string
          updated_at: string
          year_number: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          entries?: string[]
          id?: string
          settlement_id: string
          updated_at?: string
          year_number: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          entries?: string[]
          id?: string
          settlement_id?: string
          updated_at?: string
          year_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "settlement_timeline_year_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      showdown: {
        Row: {
          ambush: Database["public"]["Enums"]["ambush_type"]
          created_at: string
          id: string
          monster_level: number
          settlement_id: string
          showdown_type: Database["public"]["Enums"]["showdown_type"]
          turn: Database["public"]["Enums"]["showdown_turn"]
          updated_at: string
        }
        Insert: {
          ambush?: Database["public"]["Enums"]["ambush_type"]
          created_at?: string
          id?: string
          monster_level: number
          settlement_id: string
          showdown_type?: Database["public"]["Enums"]["showdown_type"]
          turn?: Database["public"]["Enums"]["showdown_turn"]
          updated_at?: string
        }
        Update: {
          ambush?: Database["public"]["Enums"]["ambush_type"]
          created_at?: string
          id?: string
          monster_level?: number
          settlement_id?: string
          showdown_type?: Database["public"]["Enums"]["showdown_type"]
          turn?: Database["public"]["Enums"]["showdown_turn"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "showdown_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: true
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      showdown_ai_deck: {
        Row: {
          advanced_cards: number
          basic_cards: number
          created_at: string
          id: string
          legendary_cards: number
          overtone_cards: number
          settlement_id: string
          showdown_id: string
          updated_at: string
        }
        Insert: {
          advanced_cards?: number
          basic_cards?: number
          created_at?: string
          id?: string
          legendary_cards?: number
          overtone_cards?: number
          settlement_id: string
          showdown_id: string
          updated_at?: string
        }
        Update: {
          advanced_cards?: number
          basic_cards?: number
          created_at?: string
          id?: string
          legendary_cards?: number
          overtone_cards?: number
          settlement_id?: string
          showdown_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "showdown_ai_deck_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showdown_ai_deck_showdown_id_fkey"
            columns: ["showdown_id"]
            isOneToOne: false
            referencedRelation: "showdown"
            referencedColumns: ["id"]
          },
        ]
      }
      showdown_monster: {
        Row: {
          accuracy: number
          accuracy_tokens: number
          ai_card_drawn: boolean
          ai_deck_id: string
          ai_deck_remaining: number
          created_at: string
          damage: number
          damage_tokens: number
          evasion: number
          evasion_tokens: number
          id: string
          knocked_down: boolean
          luck: number
          luck_tokens: number
          monster_name: string | null
          movement: number
          movement_tokens: number
          notes: string
          settlement_id: string
          showdown_id: string
          speed: number
          speed_tokens: number
          strength: number
          strength_tokens: number
          toughness: number
          updated_at: string
          wounds: number
        }
        Insert: {
          accuracy?: number
          accuracy_tokens?: number
          ai_card_drawn?: boolean
          ai_deck_id: string
          ai_deck_remaining?: number
          created_at?: string
          damage?: number
          damage_tokens?: number
          evasion?: number
          evasion_tokens?: number
          id?: string
          knocked_down?: boolean
          luck?: number
          luck_tokens?: number
          monster_name?: string | null
          movement?: number
          movement_tokens?: number
          notes?: string
          settlement_id: string
          showdown_id: string
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          toughness?: number
          updated_at?: string
          wounds?: number
        }
        Update: {
          accuracy?: number
          accuracy_tokens?: number
          ai_card_drawn?: boolean
          ai_deck_id?: string
          ai_deck_remaining?: number
          created_at?: string
          damage?: number
          damage_tokens?: number
          evasion?: number
          evasion_tokens?: number
          id?: string
          knocked_down?: boolean
          luck?: number
          luck_tokens?: number
          monster_name?: string | null
          movement?: number
          movement_tokens?: number
          notes?: string
          settlement_id?: string
          showdown_id?: string
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          toughness?: number
          updated_at?: string
          wounds?: number
        }
        Relationships: [
          {
            foreignKeyName: "showdown_monster_ai_deck_id_fkey"
            columns: ["ai_deck_id"]
            isOneToOne: false
            referencedRelation: "showdown_ai_deck"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showdown_monster_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showdown_monster_showdown_id_fkey"
            columns: ["showdown_id"]
            isOneToOne: false
            referencedRelation: "showdown"
            referencedColumns: ["id"]
          },
        ]
      }
      showdown_monster_mood: {
        Row: {
          created_at: string
          id: string
          mood_id: string
          showdown_monster_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood_id: string
          showdown_monster_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mood_id?: string
          showdown_monster_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "showdown_monster_mood_mood_id_fkey"
            columns: ["mood_id"]
            isOneToOne: false
            referencedRelation: "mood"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showdown_monster_mood_showdown_monster_id_fkey"
            columns: ["showdown_monster_id"]
            isOneToOne: false
            referencedRelation: "showdown_monster"
            referencedColumns: ["id"]
          },
        ]
      }
      showdown_monster_survivor_status: {
        Row: {
          created_at: string
          id: string
          showdown_monster_id: string
          survivor_status_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          showdown_monster_id: string
          survivor_status_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          showdown_monster_id?: string
          survivor_status_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "showdown_monster_survivor_status_showdown_monster_id_fkey"
            columns: ["showdown_monster_id"]
            isOneToOne: false
            referencedRelation: "showdown_monster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showdown_monster_survivor_status_survivor_status_id_fkey"
            columns: ["survivor_status_id"]
            isOneToOne: false
            referencedRelation: "survivor_status"
            referencedColumns: ["id"]
          },
        ]
      }
      showdown_monster_trait: {
        Row: {
          created_at: string
          id: string
          showdown_monster_id: string
          trait_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          showdown_monster_id: string
          trait_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          showdown_monster_id?: string
          trait_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "showdown_monster_trait_showdown_monster_id_fkey"
            columns: ["showdown_monster_id"]
            isOneToOne: false
            referencedRelation: "showdown_monster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showdown_monster_trait_trait_id_fkey"
            columns: ["trait_id"]
            isOneToOne: false
            referencedRelation: "trait"
            referencedColumns: ["id"]
          },
        ]
      }
      showdown_survivor: {
        Row: {
          accuracy_tokens: number
          activation_used: boolean
          bleeding_tokens: number
          block_tokens: number
          created_at: string
          deflect_tokens: number
          evasion_tokens: number
          id: string
          insanity_tokens: number
          knocked_down: boolean
          luck_tokens: number
          movement_tokens: number
          movement_used: boolean
          notes: string
          priority_target: boolean
          scout: boolean
          settlement_id: string
          showdown_id: string
          speed_tokens: number
          strength_tokens: number
          survival_tokens: number
          survivor_id: string
          updated_at: string
        }
        Insert: {
          accuracy_tokens?: number
          activation_used?: boolean
          bleeding_tokens?: number
          block_tokens?: number
          created_at?: string
          deflect_tokens?: number
          evasion_tokens?: number
          id?: string
          insanity_tokens?: number
          knocked_down?: boolean
          luck_tokens?: number
          movement_tokens?: number
          movement_used?: boolean
          notes?: string
          priority_target?: boolean
          scout?: boolean
          settlement_id: string
          showdown_id: string
          speed_tokens?: number
          strength_tokens?: number
          survival_tokens?: number
          survivor_id: string
          updated_at?: string
        }
        Update: {
          accuracy_tokens?: number
          activation_used?: boolean
          bleeding_tokens?: number
          block_tokens?: number
          created_at?: string
          deflect_tokens?: number
          evasion_tokens?: number
          id?: string
          insanity_tokens?: number
          knocked_down?: boolean
          luck_tokens?: number
          movement_tokens?: number
          movement_used?: boolean
          notes?: string
          priority_target?: boolean
          scout?: boolean
          settlement_id?: string
          showdown_id?: string
          speed_tokens?: number
          strength_tokens?: number
          survival_tokens?: number
          survivor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "showdown_survivor_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showdown_survivor_showdown_id_fkey"
            columns: ["showdown_id"]
            isOneToOne: false
            referencedRelation: "showdown"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showdown_survivor_survivor_id_fkey"
            columns: ["survivor_id"]
            isOneToOne: false
            referencedRelation: "survivor"
            referencedColumns: ["id"]
          },
        ]
      }
      strain_milestone: {
        Row: {
          archived_at: string | null
          created_at: string
          custom: boolean
          id: string
          milestone_condition: string | null
          permanent_effect: string | null
          strain_milestone_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          milestone_condition?: string | null
          permanent_effect?: string | null
          strain_milestone_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          milestone_condition?: string | null
          permanent_effect?: string | null
          strain_milestone_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plan: {
        Row: {
          display_name: string
          id: string
          max_collaborators_per_settlement: number | null
          max_owned_settlements: number | null
          may_be_invited: boolean
          may_create_custom: boolean
          may_share: boolean
          monthly_price_cents: number
        }
        Insert: {
          display_name: string
          id: string
          max_collaborators_per_settlement?: number | null
          max_owned_settlements?: number | null
          may_be_invited?: boolean
          may_create_custom?: boolean
          may_share?: boolean
          monthly_price_cents: number
        }
        Update: {
          display_name?: string
          id?: string
          max_collaborators_per_settlement?: number | null
          max_owned_settlements?: number | null
          may_be_invited?: boolean
          may_create_custom?: boolean
          may_share?: boolean
          monthly_price_cents?: number
        }
        Relationships: []
      }
      survivor: {
        Row: {
          absolute_reaper: boolean | null
          absolute_rust: boolean | null
          absolute_storm: boolean | null
          absolute_witch: boolean | null
          accuracy: number
          aenas_state: Database["public"]["Enums"]["aenas_state"] | null
          arc: boolean
          arm_armor: number
          arm_broken: number
          arm_contracture: number
          arm_dismembered: number
          arm_heavy_damage: boolean | null
          arm_light_damage: boolean | null
          arm_ruptured_muscle: boolean
          body_armor: number
          body_broken_rib: number
          body_destroyed_back: boolean
          body_gaping_chest_wound: number
          body_heavy_damage: boolean | null
          body_light_damage: boolean | null
          brain_light_damage: boolean | null
          can_dash: boolean
          can_dodge: boolean
          can_encourage: boolean
          can_endure: boolean | null
          can_fist_pump: boolean
          can_spend_survival: boolean
          can_surge: boolean
          can_use_fighting_arts_knowledges: boolean
          color: Database["public"]["Enums"]["color_choice"]
          courage: number
          created_at: string
          dead: boolean
          disposition: number | null
          evasion: number
          gambler_reaper: boolean | null
          gambler_rust: boolean | null
          gambler_storm: boolean | null
          gambler_witch: boolean | null
          gender: Database["public"]["Enums"]["gender"]
          goblin_reaper: boolean | null
          goblin_rust: boolean | null
          goblin_storm: boolean | null
          goblin_witch: boolean | null
          has_analyze: boolean
          has_explore: boolean
          has_matchmaker: boolean
          has_prepared: boolean
          has_stalwart: boolean
          has_tinker: boolean
          head_armor: number
          head_blind: number
          head_deaf: boolean
          head_heavy_damage: boolean | null
          head_intracranial_hemorrhage: boolean
          head_shattered_jaw: boolean
          hunt_xp: number
          hunt_xp_rank_up: number[]
          id: string
          insanity: number
          knowledge_1_id: string | null
          knowledge_1_observation_conditions: string | null
          knowledge_1_observation_rank: number | null
          knowledge_1_rank_up: number | null
          knowledge_1_rules: string | null
          knowledge_2_id: string | null
          knowledge_2_observation_conditions: string | null
          knowledge_2_observation_rank: number | null
          knowledge_2_rank_up: number | null
          knowledge_2_rules: string | null
          leg_armor: number
          leg_broken: number
          leg_dismembered: number
          leg_hamstrung: boolean
          leg_heavy_damage: boolean | null
          leg_light_damage: boolean | null
          luck: number
          lumi: number | null
          movement: number
          neurosis_id: string | null
          next_departure: string[]
          notes: string
          once_per_lifetime: string[]
          parent_1_id: string | null
          parent_2_id: string | null
          philosophy_id: string | null
          philosophy_rank: number | null
          reroll_used: boolean
          retired: boolean
          sculptor_reaper: boolean | null
          sculptor_rust: boolean | null
          sculptor_storm: boolean | null
          sculptor_witch: boolean | null
          settlement_id: string
          skip_next_hunt: boolean
          speed: number
          squire_suspicion_level_1: boolean
          squire_suspicion_level_2: boolean
          squire_suspicion_level_3: boolean
          squire_suspicion_level_4: boolean
          strength: number
          survival: number
          survivor_name: string | null
          systemic_pressure: number | null
          tenet_knowledge_id: string | null
          tenet_knowledge_observation_conditions: string | null
          tenet_knowledge_observation_rank: number | null
          tenet_knowledge_rank_up: number | null
          tenet_knowledge_rules: string | null
          torment: number | null
          understanding: number
          updated_at: string
          waist_armor: number
          waist_broken_hip: boolean
          waist_destroyed_genitals: boolean
          waist_heavy_damage: boolean | null
          waist_intestinal_prolapse: boolean
          waist_light_damage: boolean | null
          waist_warped_pelvis: number
          wanderer: boolean
          weapon_proficiency: number
          weapon_type_id: string | null
        }
        Insert: {
          absolute_reaper?: boolean | null
          absolute_rust?: boolean | null
          absolute_storm?: boolean | null
          absolute_witch?: boolean | null
          accuracy?: number
          aenas_state?: Database["public"]["Enums"]["aenas_state"] | null
          arc?: boolean
          arm_armor?: number
          arm_broken?: number
          arm_contracture?: number
          arm_dismembered?: number
          arm_heavy_damage?: boolean | null
          arm_light_damage?: boolean | null
          arm_ruptured_muscle?: boolean
          body_armor?: number
          body_broken_rib?: number
          body_destroyed_back?: boolean
          body_gaping_chest_wound?: number
          body_heavy_damage?: boolean | null
          body_light_damage?: boolean | null
          brain_light_damage?: boolean | null
          can_dash?: boolean
          can_dodge?: boolean
          can_encourage?: boolean
          can_endure?: boolean | null
          can_fist_pump?: boolean
          can_spend_survival?: boolean
          can_surge?: boolean
          can_use_fighting_arts_knowledges?: boolean
          color?: Database["public"]["Enums"]["color_choice"]
          courage?: number
          created_at?: string
          dead?: boolean
          disposition?: number | null
          evasion?: number
          gambler_reaper?: boolean | null
          gambler_rust?: boolean | null
          gambler_storm?: boolean | null
          gambler_witch?: boolean | null
          gender: Database["public"]["Enums"]["gender"]
          goblin_reaper?: boolean | null
          goblin_rust?: boolean | null
          goblin_storm?: boolean | null
          goblin_witch?: boolean | null
          has_analyze?: boolean
          has_explore?: boolean
          has_matchmaker?: boolean
          has_prepared?: boolean
          has_stalwart?: boolean
          has_tinker?: boolean
          head_armor?: number
          head_blind?: number
          head_deaf?: boolean
          head_heavy_damage?: boolean | null
          head_intracranial_hemorrhage?: boolean
          head_shattered_jaw?: boolean
          hunt_xp?: number
          hunt_xp_rank_up?: number[]
          id?: string
          insanity?: number
          knowledge_1_id?: string | null
          knowledge_1_observation_conditions?: string | null
          knowledge_1_observation_rank?: number | null
          knowledge_1_rank_up?: number | null
          knowledge_1_rules?: string | null
          knowledge_2_id?: string | null
          knowledge_2_observation_conditions?: string | null
          knowledge_2_observation_rank?: number | null
          knowledge_2_rank_up?: number | null
          knowledge_2_rules?: string | null
          leg_armor?: number
          leg_broken?: number
          leg_dismembered?: number
          leg_hamstrung?: boolean
          leg_heavy_damage?: boolean | null
          leg_light_damage?: boolean | null
          luck?: number
          lumi?: number | null
          movement?: number
          neurosis_id?: string | null
          next_departure?: string[]
          notes?: string
          once_per_lifetime?: string[]
          parent_1_id?: string | null
          parent_2_id?: string | null
          philosophy_id?: string | null
          philosophy_rank?: number | null
          reroll_used?: boolean
          retired?: boolean
          sculptor_reaper?: boolean | null
          sculptor_rust?: boolean | null
          sculptor_storm?: boolean | null
          sculptor_witch?: boolean | null
          settlement_id: string
          skip_next_hunt?: boolean
          speed?: number
          squire_suspicion_level_1?: boolean
          squire_suspicion_level_2?: boolean
          squire_suspicion_level_3?: boolean
          squire_suspicion_level_4?: boolean
          strength?: number
          survival?: number
          survivor_name?: string | null
          systemic_pressure?: number | null
          tenet_knowledge_id?: string | null
          tenet_knowledge_observation_conditions?: string | null
          tenet_knowledge_observation_rank?: number | null
          tenet_knowledge_rank_up?: number | null
          tenet_knowledge_rules?: string | null
          torment?: number | null
          understanding?: number
          updated_at?: string
          waist_armor?: number
          waist_broken_hip?: boolean
          waist_destroyed_genitals?: boolean
          waist_heavy_damage?: boolean | null
          waist_intestinal_prolapse?: boolean
          waist_light_damage?: boolean | null
          waist_warped_pelvis?: number
          wanderer?: boolean
          weapon_proficiency?: number
          weapon_type_id?: string | null
        }
        Update: {
          absolute_reaper?: boolean | null
          absolute_rust?: boolean | null
          absolute_storm?: boolean | null
          absolute_witch?: boolean | null
          accuracy?: number
          aenas_state?: Database["public"]["Enums"]["aenas_state"] | null
          arc?: boolean
          arm_armor?: number
          arm_broken?: number
          arm_contracture?: number
          arm_dismembered?: number
          arm_heavy_damage?: boolean | null
          arm_light_damage?: boolean | null
          arm_ruptured_muscle?: boolean
          body_armor?: number
          body_broken_rib?: number
          body_destroyed_back?: boolean
          body_gaping_chest_wound?: number
          body_heavy_damage?: boolean | null
          body_light_damage?: boolean | null
          brain_light_damage?: boolean | null
          can_dash?: boolean
          can_dodge?: boolean
          can_encourage?: boolean
          can_endure?: boolean | null
          can_fist_pump?: boolean
          can_spend_survival?: boolean
          can_surge?: boolean
          can_use_fighting_arts_knowledges?: boolean
          color?: Database["public"]["Enums"]["color_choice"]
          courage?: number
          created_at?: string
          dead?: boolean
          disposition?: number | null
          evasion?: number
          gambler_reaper?: boolean | null
          gambler_rust?: boolean | null
          gambler_storm?: boolean | null
          gambler_witch?: boolean | null
          gender?: Database["public"]["Enums"]["gender"]
          goblin_reaper?: boolean | null
          goblin_rust?: boolean | null
          goblin_storm?: boolean | null
          goblin_witch?: boolean | null
          has_analyze?: boolean
          has_explore?: boolean
          has_matchmaker?: boolean
          has_prepared?: boolean
          has_stalwart?: boolean
          has_tinker?: boolean
          head_armor?: number
          head_blind?: number
          head_deaf?: boolean
          head_heavy_damage?: boolean | null
          head_intracranial_hemorrhage?: boolean
          head_shattered_jaw?: boolean
          hunt_xp?: number
          hunt_xp_rank_up?: number[]
          id?: string
          insanity?: number
          knowledge_1_id?: string | null
          knowledge_1_observation_conditions?: string | null
          knowledge_1_observation_rank?: number | null
          knowledge_1_rank_up?: number | null
          knowledge_1_rules?: string | null
          knowledge_2_id?: string | null
          knowledge_2_observation_conditions?: string | null
          knowledge_2_observation_rank?: number | null
          knowledge_2_rank_up?: number | null
          knowledge_2_rules?: string | null
          leg_armor?: number
          leg_broken?: number
          leg_dismembered?: number
          leg_hamstrung?: boolean
          leg_heavy_damage?: boolean | null
          leg_light_damage?: boolean | null
          luck?: number
          lumi?: number | null
          movement?: number
          neurosis_id?: string | null
          next_departure?: string[]
          notes?: string
          once_per_lifetime?: string[]
          parent_1_id?: string | null
          parent_2_id?: string | null
          philosophy_id?: string | null
          philosophy_rank?: number | null
          reroll_used?: boolean
          retired?: boolean
          sculptor_reaper?: boolean | null
          sculptor_rust?: boolean | null
          sculptor_storm?: boolean | null
          sculptor_witch?: boolean | null
          settlement_id?: string
          skip_next_hunt?: boolean
          speed?: number
          squire_suspicion_level_1?: boolean
          squire_suspicion_level_2?: boolean
          squire_suspicion_level_3?: boolean
          squire_suspicion_level_4?: boolean
          strength?: number
          survival?: number
          survivor_name?: string | null
          systemic_pressure?: number | null
          tenet_knowledge_id?: string | null
          tenet_knowledge_observation_conditions?: string | null
          tenet_knowledge_observation_rank?: number | null
          tenet_knowledge_rank_up?: number | null
          tenet_knowledge_rules?: string | null
          torment?: number | null
          understanding?: number
          updated_at?: string
          waist_armor?: number
          waist_broken_hip?: boolean
          waist_destroyed_genitals?: boolean
          waist_heavy_damage?: boolean | null
          waist_intestinal_prolapse?: boolean
          waist_light_damage?: boolean | null
          waist_warped_pelvis?: number
          wanderer?: boolean
          weapon_proficiency?: number
          weapon_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survivor_knowledge_1_id_fkey"
            columns: ["knowledge_1_id"]
            isOneToOne: false
            referencedRelation: "knowledge"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survivor_knowledge_2_id_fkey"
            columns: ["knowledge_2_id"]
            isOneToOne: false
            referencedRelation: "knowledge"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survivor_neurosis_id_fkey"
            columns: ["neurosis_id"]
            isOneToOne: false
            referencedRelation: "neurosis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survivor_parent_1_id_fkey"
            columns: ["parent_1_id"]
            isOneToOne: false
            referencedRelation: "survivor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survivor_parent_2_id_fkey"
            columns: ["parent_2_id"]
            isOneToOne: false
            referencedRelation: "survivor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survivor_philosophy_id_fkey"
            columns: ["philosophy_id"]
            isOneToOne: false
            referencedRelation: "philosophy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survivor_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survivor_tenet_knowledge_id_fkey"
            columns: ["tenet_knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survivor_weapon_type_id_fkey"
            columns: ["weapon_type_id"]
            isOneToOne: false
            referencedRelation: "weapon_type"
            referencedColumns: ["id"]
          },
        ]
      }
      survivor_ability_impairment: {
        Row: {
          ability_impairment_id: string
          created_at: string
          id: string
          survivor_id: string
          updated_at: string
        }
        Insert: {
          ability_impairment_id: string
          created_at?: string
          id?: string
          survivor_id: string
          updated_at?: string
        }
        Update: {
          ability_impairment_id?: string
          created_at?: string
          id?: string
          survivor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survivor_ability_impairment_ability_impairment_id_fkey"
            columns: ["ability_impairment_id"]
            isOneToOne: false
            referencedRelation: "ability_impairment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survivor_ability_impairment_survivor_id_fkey"
            columns: ["survivor_id"]
            isOneToOne: false
            referencedRelation: "survivor"
            referencedColumns: ["id"]
          },
        ]
      }
      survivor_cursed_gear: {
        Row: {
          created_at: string
          gear_id: string
          id: string
          survivor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gear_id: string
          id?: string
          survivor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gear_id?: string
          id?: string
          survivor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survivor_cursed_gear_gear_id_fkey"
            columns: ["gear_id"]
            isOneToOne: false
            referencedRelation: "gear"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survivor_cursed_gear_survivor_id_fkey"
            columns: ["survivor_id"]
            isOneToOne: false
            referencedRelation: "survivor"
            referencedColumns: ["id"]
          },
        ]
      }
      survivor_disorder: {
        Row: {
          created_at: string
          disorder_id: string
          id: string
          survivor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          disorder_id: string
          id?: string
          survivor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          disorder_id?: string
          id?: string
          survivor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survivor_disorder_disorder_id_fkey"
            columns: ["disorder_id"]
            isOneToOne: false
            referencedRelation: "disorder"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survivor_disorder_survivor_id_fkey"
            columns: ["survivor_id"]
            isOneToOne: false
            referencedRelation: "survivor"
            referencedColumns: ["id"]
          },
        ]
      }
      survivor_fighting_art: {
        Row: {
          created_at: string
          fighting_art_id: string
          id: string
          survivor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fighting_art_id: string
          id?: string
          survivor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fighting_art_id?: string
          id?: string
          survivor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survivor_fighting_art_fighting_art_id_fkey"
            columns: ["fighting_art_id"]
            isOneToOne: false
            referencedRelation: "fighting_art"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survivor_fighting_art_survivor_id_fkey"
            columns: ["survivor_id"]
            isOneToOne: false
            referencedRelation: "survivor"
            referencedColumns: ["id"]
          },
        ]
      }
      survivor_secret_fighting_art: {
        Row: {
          created_at: string
          id: string
          secret_fighting_art_id: string
          survivor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          secret_fighting_art_id: string
          survivor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          secret_fighting_art_id?: string
          survivor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "survivor_secret_fighting_art_secret_fighting_art_id_fkey"
            columns: ["secret_fighting_art_id"]
            isOneToOne: false
            referencedRelation: "secret_fighting_art"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survivor_secret_fighting_art_survivor_id_fkey"
            columns: ["survivor_id"]
            isOneToOne: false
            referencedRelation: "survivor"
            referencedColumns: ["id"]
          },
        ]
      }
      survivor_status: {
        Row: {
          archived_at: string | null
          created_at: string
          custom: boolean
          id: string
          rules: string | null
          survivor_status_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          rules?: string | null
          survivor_status_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          rules?: string | null
          survivor_status_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trait: {
        Row: {
          archived_at: string | null
          created_at: string
          custom: boolean
          id: string
          rules: string | null
          trait_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          rules?: string | null
          trait_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          rules?: string | null
          trait_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          app_role: string
          avatar_url: string | null
          created_at: string
          id: string
          unlocked_killenium_butcher: boolean
          unlocked_screaming_nukalope: boolean
          unlocked_white_gigalion: boolean
          updated_at: string
          user_id: string
          username: string
          username_renamed_at: string | null
        }
        Insert: {
          app_role?: string
          avatar_url?: string | null
          created_at?: string
          id?: string
          unlocked_killenium_butcher?: boolean
          unlocked_screaming_nukalope?: boolean
          unlocked_white_gigalion?: boolean
          updated_at?: string
          user_id: string
          username: string
          username_renamed_at?: string | null
        }
        Update: {
          app_role?: string
          avatar_url?: string | null
          created_at?: string
          id?: string
          unlocked_killenium_butcher?: boolean
          unlocked_screaming_nukalope?: boolean
          unlocked_white_gigalion?: boolean
          updated_at?: string
          user_id?: string
          username?: string
          username_renamed_at?: string | null
        }
        Relationships: []
      }
      user_subscription: {
        Row: {
          cancel_at_period_end: boolean
          current_period_end: string | null
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          current_period_end?: string | null
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          current_period_end?: string | null
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscription_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plan"
            referencedColumns: ["id"]
          },
        ]
      }
      wanderer: {
        Row: {
          accuracy: number
          arc: boolean
          archived_at: string | null
          courage: number
          created_at: string
          custom: boolean
          disposition: number
          evasion: number
          fighting_art_ids: string[]
          gender: Database["public"]["Enums"]["gender"]
          hunt_xp: number
          hunt_xp_rank_up: number[]
          id: string
          insanity: number
          luck: number
          lumi: number
          movement: number
          permanent_injuries: string[]
          rare_gear_ids: string[]
          speed: number
          strength: number
          survival: number
          systemic_pressure: number
          torment: number
          understanding: number
          updated_at: string
          user_id: string | null
          wanderer_name: string
        }
        Insert: {
          accuracy?: number
          arc?: boolean
          archived_at?: string | null
          courage?: number
          created_at?: string
          custom?: boolean
          disposition?: number
          evasion?: number
          fighting_art_ids?: string[]
          gender: Database["public"]["Enums"]["gender"]
          hunt_xp?: number
          hunt_xp_rank_up?: number[]
          id?: string
          insanity?: number
          luck?: number
          lumi?: number
          movement?: number
          permanent_injuries?: string[]
          rare_gear_ids?: string[]
          speed?: number
          strength?: number
          survival?: number
          systemic_pressure?: number
          torment?: number
          understanding?: number
          updated_at?: string
          user_id?: string | null
          wanderer_name: string
        }
        Update: {
          accuracy?: number
          arc?: boolean
          archived_at?: string | null
          courage?: number
          created_at?: string
          custom?: boolean
          disposition?: number
          evasion?: number
          fighting_art_ids?: string[]
          gender?: Database["public"]["Enums"]["gender"]
          hunt_xp?: number
          hunt_xp_rank_up?: number[]
          id?: string
          insanity?: number
          luck?: number
          lumi?: number
          movement?: number
          permanent_injuries?: string[]
          rare_gear_ids?: string[]
          speed?: number
          strength?: number
          survival?: number
          systemic_pressure?: number
          torment?: number
          understanding?: number
          updated_at?: string
          user_id?: string | null
          wanderer_name?: string
        }
        Relationships: []
      }
      wanderer_ability_impairment: {
        Row: {
          ability_impairment_id: string
          created_at: string
          id: string
          updated_at: string
          wanderer_id: string
        }
        Insert: {
          ability_impairment_id: string
          created_at?: string
          id?: string
          updated_at?: string
          wanderer_id: string
        }
        Update: {
          ability_impairment_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          wanderer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wanderer_ability_impairment_ability_impairment_id_fkey"
            columns: ["ability_impairment_id"]
            isOneToOne: false
            referencedRelation: "ability_impairment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wanderer_ability_impairment_wanderer_id_fkey"
            columns: ["wanderer_id"]
            isOneToOne: false
            referencedRelation: "wanderer"
            referencedColumns: ["id"]
          },
        ]
      }
      wanderer_timeline_year: {
        Row: {
          created_at: string
          entries: string[]
          id: string
          updated_at: string
          wanderer_id: string
          year_number: number
        }
        Insert: {
          created_at?: string
          entries?: string[]
          id?: string
          updated_at?: string
          wanderer_id: string
          year_number: number
        }
        Update: {
          created_at?: string
          entries?: string[]
          id?: string
          updated_at?: string
          wanderer_id?: string
          year_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "wanderer_timeline_year_wanderer_id_fkey"
            columns: ["wanderer_id"]
            isOneToOne: false
            referencedRelation: "wanderer"
            referencedColumns: ["id"]
          },
        ]
      }
      weapon_type: {
        Row: {
          archived_at: string | null
          created_at: string
          custom: boolean
          id: string
          master_proficiency_rules: string | null
          specialist_proficiency_rules: string | null
          updated_at: string
          user_id: string | null
          weapon_type_name: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          master_proficiency_rules?: string | null
          specialist_proficiency_rules?: string | null
          updated_at?: string
          user_id?: string | null
          weapon_type_name: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          master_proficiency_rules?: string | null
          specialist_proficiency_rules?: string | null
          updated_at?: string
          user_id?: string | null
          weapon_type_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      armor_set_qualifies: {
        Args: { p_armor_set_id: string; p_equipped_gear_ids: string[] }
        Returns: boolean
      }
      check_username_available: {
        Args: { desired_username: string }
        Returns: boolean
      }
      get_settlement_collaborators: {
        Args: { target_settlement: string }
        Returns: {
          avatar_url: string
          created_at: string
          shared_user_id: string
          username: string
        }[]
      }
      get_settlement_member_usernames: {
        Args: { target_settlement: string }
        Returns: {
          avatar_url: string
          user_id: string
          username: string
        }[]
      }
      get_shared_settlement_owners: {
        Args: never
        Returns: {
          settlement_id: string
          username: string
        }[]
      }
      get_unshare_blockers: {
        Args: { p_settlement_id: string; p_shared_user_id: string }
        Returns: {
          item_id: string
          item_name: string
          kind: string
        }[]
      }
      initialize_user_settings: {
        Args: { p_user_id: string; p_username: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_armor_set_owner: { Args: { record_id: string }; Returns: boolean }
      is_collective_cognition_reward_visible_via_quarry_reference: {
        Args: { ref_ccr_id: string; ref_ccr_user_id: string }
        Returns: boolean
      }
      is_gear_visible_via_cost_reference: {
        Args: { ref_gear_id: string; ref_gear_user_id: string }
        Returns: boolean
      }
      is_innovation_visible_via_cost_reference: {
        Args: { ref_innovation_id: string; ref_innovation_user_id: string }
        Returns: boolean
      }
      is_location_visible_via_quarry_nemesis_reference: {
        Args: { ref_location_id: string; ref_location_user_id: string }
        Returns: boolean
      }
      is_resource_visible_via_cost_reference: {
        Args: { ref_resource_id: string; ref_resource_user_id: string }
        Returns: boolean
      }
      is_settlement_collaborator: {
        Args: { target_settlement: string }
        Returns: boolean
      }
      is_settlement_member: {
        Args: { target_settlement: string; target_user: string }
        Returns: boolean
      }
      is_settlement_owner: { Args: { record_id: string }; Returns: boolean }
      lookup_user_by_username: { Args: { p_username: string }; Returns: string }
      provision_user_settings_for_oauth: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      realtime_publication_tables: {
        Args: never
        Returns: {
          tablename: string
        }[]
      }
      rename_username: { Args: { new_username: string }; Returns: boolean }
      sanitize_username_candidate: { Args: { raw: string }; Returns: string }
      survivor_qualifies_for_armor_set: {
        Args: { p_armor_set_id: string; p_survivor_id: string }
        Returns: boolean
      }
      user_can_share: { Args: never; Returns: boolean }
    }
    Enums: {
      aenas_state: "Content" | "Hungry"
      affinity: "BLUE" | "GREEN" | "RED"
      ambush_type: "SURVIVORS" | "MONSTER" | "NONE"
      armor_location: "ARMS" | "CHEST" | "FEET" | "HEAD" | "WAIST"
      campaign_type:
        | "PEOPLE_OF_THE_DREAM_KEEPER"
        | "PEOPLE_OF_THE_LANTERN"
        | "PEOPLE_OF_THE_STARS"
        | "PEOPLE_OF_THE_SUN"
        | "SQUIRES_OF_THE_CITADEL"
        | "CUSTOM"
      color_choice:
        | "neutral"
        | "stone"
        | "zinc"
        | "slate"
        | "gray"
        | "red"
        | "orange"
        | "amber"
        | "yellow"
        | "lime"
        | "green"
        | "emerald"
        | "teal"
        | "cyan"
        | "sky"
        | "blue"
        | "indigo"
        | "violet"
        | "purple"
        | "fuchsia"
        | "pink"
        | "rose"
      gear_keyword:
        | "AMBER"
        | "AMMUNITION"
        | "ARMOR"
        | "ARROW"
        | "AXE"
        | "BALM"
        | "BONE"
        | "BOW"
        | "CLEAVER"
        | "CLUB"
        | "DAGGER"
        | "DEATHMETAL"
        | "FAN"
        | "FEATHER"
        | "FINESSE"
        | "FIST_AND_TOOTH"
        | "FLAMMABLE"
        | "FLESH"
        | "FRAGILE"
        | "FUR"
        | "GLOOMY"
        | "GORMSKIN"
        | "GRAND"
        | "HEAVY"
        | "HERB"
        | "INSTRUMENT"
        | "ITEM"
        | "JEWELRY"
        | "KATANA"
        | "KATAR"
        | "KNIGHT"
        | "LANTERN"
        | "LEATHER"
        | "MASK"
        | "MELEE"
        | "METAL"
        | "MINERAL"
        | "NOISY"
        | "NUCLEAR"
        | "OTHER"
        | "PICKAXE"
        | "RANGED"
        | "RAWHIDE"
        | "SAW"
        | "SCALE"
        | "SCIMITAR"
        | "SCYTHE"
        | "SEED"
        | "SELFISH"
        | "SHIELD"
        | "SICKLE"
        | "SILK"
        | "SOLUBLE"
        | "SPEAR"
        | "STINKY"
        | "SWORD"
        | "SYMBOL"
        | "THROWN"
        | "TOOL"
        | "TWO_HANDED"
        | "WHIP"
      gender: "FEMALE" | "MALE"
      hunt_event_type: "ARC" | "BASIC" | "MONSTER" | "SCOUT"
      monster_node:
        | "NQ1"
        | "NQ2"
        | "NQ3"
        | "NQ4"
        | "NN1"
        | "NN2"
        | "NN3"
        | "CO"
        | "FI"
      monster_version: "ORIGINAL" | "ALTERNATE" | "VIGNETTE"
      resource_category: "BASIC" | "MONSTER" | "STRANGE" | "VERMIN"
      resource_type:
        | "BONE"
        | "CLOTH"
        | "CONSUMABLE"
        | "COPPER"
        | "DEATHMETAL"
        | "DIAMOND"
        | "DUNG"
        | "ELASTOMER"
        | "EMOTION"
        | "FISH"
        | "FLOWER"
        | "FRUIT"
        | "GLASS"
        | "HIDE"
        | "INDOMITABLE"
        | "IRON"
        | "ORGAN"
        | "OTHER"
        | "PERFECT"
        | "SCRAP"
        | "SILK"
        | "SKULL"
        | "STONE"
        | "HERB"
        | "VEGETABLE"
        | "VERMIN"
        | "VIRID"
        | "PARASITE"
      settlement_phase_step:
        | "SET_UP_SETTLEMENT"
        | "SURVIVORS_RETURN"
        | "GAIN_ENDEAVORS"
        | "UPDATE_TIMELINE"
        | "UPDATE_DEATH_COUNT"
        | "CHECK_MILESTONES"
        | "DEVELOP"
        | "PREPARE_DEPARTING_SURVIVORS"
        | "SPECIAL_SHOWDOWN"
        | "RECORD_AND_ARCHIVE_RESOURCES"
        | "END_SETTLEMENT_PHASE"
      showdown_turn: "MONSTER" | "SURVIVOR"
      showdown_type: "REGULAR" | "SPECIAL"
      survivor_type: "CORE" | "ARC"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      aenas_state: ["Content", "Hungry"],
      affinity: ["BLUE", "GREEN", "RED"],
      ambush_type: ["SURVIVORS", "MONSTER", "NONE"],
      armor_location: ["ARMS", "CHEST", "FEET", "HEAD", "WAIST"],
      campaign_type: [
        "PEOPLE_OF_THE_DREAM_KEEPER",
        "PEOPLE_OF_THE_LANTERN",
        "PEOPLE_OF_THE_STARS",
        "PEOPLE_OF_THE_SUN",
        "SQUIRES_OF_THE_CITADEL",
        "CUSTOM",
      ],
      color_choice: [
        "neutral",
        "stone",
        "zinc",
        "slate",
        "gray",
        "red",
        "orange",
        "amber",
        "yellow",
        "lime",
        "green",
        "emerald",
        "teal",
        "cyan",
        "sky",
        "blue",
        "indigo",
        "violet",
        "purple",
        "fuchsia",
        "pink",
        "rose",
      ],
      gear_keyword: [
        "AMBER",
        "AMMUNITION",
        "ARMOR",
        "ARROW",
        "AXE",
        "BALM",
        "BONE",
        "BOW",
        "CLEAVER",
        "CLUB",
        "DAGGER",
        "DEATHMETAL",
        "FAN",
        "FEATHER",
        "FINESSE",
        "FIST_AND_TOOTH",
        "FLAMMABLE",
        "FLESH",
        "FRAGILE",
        "FUR",
        "GLOOMY",
        "GORMSKIN",
        "GRAND",
        "HEAVY",
        "HERB",
        "INSTRUMENT",
        "ITEM",
        "JEWELRY",
        "KATANA",
        "KATAR",
        "KNIGHT",
        "LANTERN",
        "LEATHER",
        "MASK",
        "MELEE",
        "METAL",
        "MINERAL",
        "NOISY",
        "NUCLEAR",
        "OTHER",
        "PICKAXE",
        "RANGED",
        "RAWHIDE",
        "SAW",
        "SCALE",
        "SCIMITAR",
        "SCYTHE",
        "SEED",
        "SELFISH",
        "SHIELD",
        "SICKLE",
        "SILK",
        "SOLUBLE",
        "SPEAR",
        "STINKY",
        "SWORD",
        "SYMBOL",
        "THROWN",
        "TOOL",
        "TWO_HANDED",
        "WHIP",
      ],
      gender: ["FEMALE", "MALE"],
      hunt_event_type: ["ARC", "BASIC", "MONSTER", "SCOUT"],
      monster_node: [
        "NQ1",
        "NQ2",
        "NQ3",
        "NQ4",
        "NN1",
        "NN2",
        "NN3",
        "CO",
        "FI",
      ],
      monster_version: ["ORIGINAL", "ALTERNATE", "VIGNETTE"],
      resource_category: ["BASIC", "MONSTER", "STRANGE", "VERMIN"],
      resource_type: [
        "BONE",
        "CLOTH",
        "CONSUMABLE",
        "COPPER",
        "DEATHMETAL",
        "DIAMOND",
        "DUNG",
        "ELASTOMER",
        "EMOTION",
        "FISH",
        "FLOWER",
        "FRUIT",
        "GLASS",
        "HIDE",
        "INDOMITABLE",
        "IRON",
        "ORGAN",
        "OTHER",
        "PERFECT",
        "SCRAP",
        "SILK",
        "SKULL",
        "STONE",
        "HERB",
        "VEGETABLE",
        "VERMIN",
        "VIRID",
        "PARASITE",
      ],
      settlement_phase_step: [
        "SET_UP_SETTLEMENT",
        "SURVIVORS_RETURN",
        "GAIN_ENDEAVORS",
        "UPDATE_TIMELINE",
        "UPDATE_DEATH_COUNT",
        "CHECK_MILESTONES",
        "DEVELOP",
        "PREPARE_DEPARTING_SURVIVORS",
        "SPECIAL_SHOWDOWN",
        "RECORD_AND_ARCHIVE_RESOURCES",
        "END_SETTLEMENT_PHASE",
      ],
      showdown_turn: ["MONSTER", "SURVIVOR"],
      showdown_type: ["REGULAR", "SPECIAL"],
      survivor_type: ["CORE", "ARC"],
    },
  },
} as const

