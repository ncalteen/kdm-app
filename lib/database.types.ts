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
      character: {
        Row: {
          character_name: string
          created_at: string
          custom: boolean
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          character_name: string
          created_at?: string
          custom?: boolean
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          character_name?: string
          created_at?: string
          custom?: boolean
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      character_shared_user: {
        Row: {
          character_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          character_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          character_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_shared_user_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "character"
            referencedColumns: ["id"]
          },
        ]
      }
      collective_cognition_reward: {
        Row: {
          collective_cognition: number
          created_at: string
          custom: boolean
          id: string
          reward_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          collective_cognition?: number
          created_at?: string
          custom?: boolean
          id?: string
          reward_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          collective_cognition?: number
          created_at?: string
          custom?: boolean
          id?: string
          reward_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      collective_cognition_reward_shared_user: {
        Row: {
          collective_cognition_reward_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          collective_cognition_reward_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          collective_cognition_reward_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collective_cognition_reward_s_collective_cognition_reward__fkey"
            columns: ["collective_cognition_reward_id"]
            isOneToOne: false
            referencedRelation: "collective_cognition_reward"
            referencedColumns: ["id"]
          },
        ]
      }
      disorder: {
        Row: {
          created_at: string
          custom: boolean
          disorder_name: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom?: boolean
          disorder_name: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom?: boolean
          disorder_name?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      disorder_shared_user: {
        Row: {
          disorder_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          disorder_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          disorder_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disorder_shared_user_disorder_id_fkey"
            columns: ["disorder_id"]
            isOneToOne: false
            referencedRelation: "disorder"
            referencedColumns: ["id"]
          },
        ]
      }
      fighting_art: {
        Row: {
          created_at: string
          custom: boolean
          fighting_art_name: string
          id: string
          secret_fighting_art: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom?: boolean
          fighting_art_name: string
          id?: string
          secret_fighting_art?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom?: boolean
          fighting_art_name?: string
          id?: string
          secret_fighting_art?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fighting_art_shared_user: {
        Row: {
          fighting_art_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          fighting_art_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          fighting_art_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fighting_art_shared_user_fighting_art_id_fkey"
            columns: ["fighting_art_id"]
            isOneToOne: false
            referencedRelation: "fighting_art"
            referencedColumns: ["id"]
          },
        ]
      }
      gear: {
        Row: {
          created_at: string
          custom: boolean
          gear_name: string
          id: string
          location_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom?: boolean
          gear_name: string
          id?: string
          location_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom?: boolean
          gear_name?: string
          id?: string
          location_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gear_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_shared_user: {
        Row: {
          gear_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          gear_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          gear_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gear_shared_user_gear_id_fkey"
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
          settlement_id: string | null
          survivor_position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          monster_level: number
          monster_position?: number
          settlement_id?: string | null
          survivor_position?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          monster_level?: number
          monster_position?: number
          settlement_id?: string | null
          survivor_position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunt_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
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
          settlement_id: string | null
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
          settlement_id?: string | null
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
          settlement_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunt_hunt_board_hunt_id_fkey"
            columns: ["hunt_id"]
            isOneToOne: false
            referencedRelation: "hunt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunt_hunt_board_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
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
          moods: string[]
          movement: number
          movement_tokens: number
          notes: string
          settlement_id: string
          speed: number
          speed_tokens: number
          strength: number
          strength_tokens: number
          toughness: number
          traits: string[]
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
          moods?: string[]
          movement?: number
          movement_tokens?: number
          notes?: string
          settlement_id: string
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          toughness?: number
          traits?: string[]
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
          moods?: string[]
          movement?: number
          movement_tokens?: number
          notes?: string
          settlement_id?: string
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          toughness?: number
          traits?: string[]
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
          created_at: string
          custom: boolean
          id: string
          innovation_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom?: boolean
          id?: string
          innovation_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom?: boolean
          id?: string
          innovation_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      innovation_shared_user: {
        Row: {
          innovation_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          innovation_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          innovation_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "innovation_shared_user_innovation_id_fkey"
            columns: ["innovation_id"]
            isOneToOne: false
            referencedRelation: "innovation"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge: {
        Row: {
          created_at: string
          custom: boolean
          id: string
          knowledge_name: string
          philosophy_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom?: boolean
          id?: string
          knowledge_name: string
          philosophy_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom?: boolean
          id?: string
          knowledge_name?: string
          philosophy_id?: string | null
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
      knowledge_shared_user: {
        Row: {
          knowledge_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          knowledge_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          knowledge_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_shared_user_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "knowledge"
            referencedColumns: ["id"]
          },
        ]
      }
      location: {
        Row: {
          created_at: string
          custom: boolean
          id: string
          location_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom?: boolean
          id?: string
          location_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom?: boolean
          id?: string
          location_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      location_shared_user: {
        Row: {
          location_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          location_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          location_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_shared_user_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone: {
        Row: {
          campaign_types: Database["public"]["Enums"]["campaign_type"][]
          created_at: string
          custom: boolean
          event_name: string
          id: string
          milestone_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          campaign_types?: Database["public"]["Enums"]["campaign_type"][]
          created_at?: string
          custom?: boolean
          event_name: string
          id?: string
          milestone_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          campaign_types?: Database["public"]["Enums"]["campaign_type"][]
          created_at?: string
          custom?: boolean
          event_name?: string
          id?: string
          milestone_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      milestone_shared_user: {
        Row: {
          milestone_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          milestone_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          milestone_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_shared_user_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestone"
            referencedColumns: ["id"]
          },
        ]
      }
      nemesis: {
        Row: {
          alternate_id: string | null
          created_at: string
          custom: boolean
          id: string
          monster_name: string
          multi_monster: boolean
          node: Database["public"]["Enums"]["monster_node"]
          updated_at: string
          user_id: string | null
          vignette_id: string | null
        }
        Insert: {
          alternate_id?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          monster_name: string
          multi_monster?: boolean
          node: Database["public"]["Enums"]["monster_node"]
          updated_at?: string
          user_id?: string | null
          vignette_id?: string | null
        }
        Update: {
          alternate_id?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          monster_name?: string
          multi_monster?: boolean
          node?: Database["public"]["Enums"]["monster_node"]
          updated_at?: string
          user_id?: string | null
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
          moods: string[]
          movement: number
          movement_tokens: number
          nemesis_id: string
          overtone_cards: number
          speed: number
          speed_tokens: number
          strength: number
          strength_tokens: number
          sub_monster_name: string | null
          survivor_statuses: string[]
          toughness: number
          toughness_tokens: number
          traits: string[]
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
          moods?: string[]
          movement?: number
          movement_tokens?: number
          nemesis_id: string
          overtone_cards?: number
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          sub_monster_name?: string | null
          survivor_statuses?: string[]
          toughness?: number
          toughness_tokens?: number
          traits?: string[]
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
          moods?: string[]
          movement?: number
          movement_tokens?: number
          nemesis_id?: string
          overtone_cards?: number
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          sub_monster_name?: string | null
          survivor_statuses?: string[]
          toughness?: number
          toughness_tokens?: number
          traits?: string[]
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
      nemesis_shared_user: {
        Row: {
          nemesis_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          nemesis_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          nemesis_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nemesis_shared_user_nemesis_id_fkey"
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
          created_at: string
          custom: boolean
          id: string
          neurosis_name: string
          philosophy_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom?: boolean
          id?: string
          neurosis_name: string
          philosophy_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom?: boolean
          id?: string
          neurosis_name?: string
          philosophy_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "neurosis_philosophy_id_fkey"
            columns: ["philosophy_id"]
            isOneToOne: false
            referencedRelation: "philosophy"
            referencedColumns: ["id"]
          },
        ]
      }
      neurosis_shared_user: {
        Row: {
          neurosis_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          neurosis_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          neurosis_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "neurosis_shared_user_neurosis_id_fkey"
            columns: ["neurosis_id"]
            isOneToOne: false
            referencedRelation: "neurosis"
            referencedColumns: ["id"]
          },
        ]
      }
      pattern: {
        Row: {
          created_at: string
          custom: boolean
          id: string
          pattern_name: string
          seed_pattern: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom?: boolean
          id?: string
          pattern_name: string
          seed_pattern?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom?: boolean
          id?: string
          pattern_name?: string
          seed_pattern?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pattern_shared_user: {
        Row: {
          pattern_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          pattern_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          pattern_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pattern_shared_user_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "pattern"
            referencedColumns: ["id"]
          },
        ]
      }
      philosophy: {
        Row: {
          created_at: string
          custom: boolean
          id: string
          neurosis_name: string | null
          philosophy_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom?: boolean
          id?: string
          neurosis_name?: string | null
          philosophy_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom?: boolean
          id?: string
          neurosis_name?: string | null
          philosophy_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      philosophy_shared_user: {
        Row: {
          philosophy_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          philosophy_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          philosophy_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "philosophy_shared_user_philosophy_id_fkey"
            columns: ["philosophy_id"]
            isOneToOne: false
            referencedRelation: "philosophy"
            referencedColumns: ["id"]
          },
        ]
      }
      principle: {
        Row: {
          campaign_types: Database["public"]["Enums"]["campaign_type"][]
          created_at: string
          custom: boolean
          id: string
          option_1_name: string
          option_2_name: string
          principle_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          campaign_types?: Database["public"]["Enums"]["campaign_type"][]
          created_at?: string
          custom?: boolean
          id?: string
          option_1_name: string
          option_2_name: string
          principle_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          campaign_types?: Database["public"]["Enums"]["campaign_type"][]
          created_at?: string
          custom?: boolean
          id?: string
          option_1_name?: string
          option_2_name?: string
          principle_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      principle_shared_user: {
        Row: {
          principle_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          principle_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          principle_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "principle_shared_user_principle_id_fkey"
            columns: ["principle_id"]
            isOneToOne: false
            referencedRelation: "principle"
            referencedColumns: ["id"]
          },
        ]
      }
      quarry: {
        Row: {
          alternate_id: string | null
          created_at: string
          custom: boolean
          id: string
          monster_name: string
          multi_monster: boolean
          node: Database["public"]["Enums"]["monster_node"]
          prologue: boolean
          updated_at: string
          user_id: string | null
          vignette_id: string | null
        }
        Insert: {
          alternate_id?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          monster_name: string
          multi_monster?: boolean
          node: Database["public"]["Enums"]["monster_node"]
          prologue?: boolean
          updated_at?: string
          user_id?: string | null
          vignette_id?: string | null
        }
        Update: {
          alternate_id?: string | null
          created_at?: string
          custom?: boolean
          id?: string
          monster_name?: string
          multi_monster?: boolean
          node?: Database["public"]["Enums"]["monster_node"]
          prologue?: boolean
          updated_at?: string
          user_id?: string | null
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
          hunt_pos: number
          id: string
          legendary_cards: number
          level_number: number
          luck: number
          luck_tokens: number
          moods: string[]
          movement: number
          movement_tokens: number
          overtone_cards: number
          quarry_id: string
          speed: number
          speed_tokens: number
          strength: number
          strength_tokens: number
          sub_monster_name: string | null
          survivor_hunt_pos: number
          survivor_statuses: string[]
          toughness: number
          toughness_tokens: number
          traits: string[]
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
          hunt_pos?: number
          id?: string
          legendary_cards?: number
          level_number: number
          luck?: number
          luck_tokens?: number
          moods?: string[]
          movement?: number
          movement_tokens?: number
          overtone_cards?: number
          quarry_id: string
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          sub_monster_name?: string | null
          survivor_hunt_pos?: number
          survivor_statuses?: string[]
          toughness?: number
          toughness_tokens?: number
          traits?: string[]
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
          hunt_pos?: number
          id?: string
          legendary_cards?: number
          level_number?: number
          luck?: number
          luck_tokens?: number
          moods?: string[]
          movement?: number
          movement_tokens?: number
          overtone_cards?: number
          quarry_id?: string
          speed?: number
          speed_tokens?: number
          strength?: number
          strength_tokens?: number
          sub_monster_name?: string | null
          survivor_hunt_pos?: number
          survivor_statuses?: string[]
          toughness?: number
          toughness_tokens?: number
          traits?: string[]
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
      quarry_shared_user: {
        Row: {
          quarry_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          quarry_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          quarry_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quarry_shared_user_quarry_id_fkey"
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
          category: Database["public"]["Enums"]["resource_category"]
          created_at: string
          custom: boolean
          id: string
          quarry_id: string | null
          resource_name: string
          resource_types: Database["public"]["Enums"]["resource_type"][]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["resource_category"]
          created_at?: string
          custom?: boolean
          id?: string
          quarry_id?: string | null
          resource_name: string
          resource_types?: Database["public"]["Enums"]["resource_type"][]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["resource_category"]
          created_at?: string
          custom?: boolean
          id?: string
          quarry_id?: string | null
          resource_name?: string
          resource_types?: Database["public"]["Enums"]["resource_type"][]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_quarry_id_fkey"
            columns: ["quarry_id"]
            isOneToOne: false
            referencedRelation: "quarry"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_shared_user: {
        Row: {
          resource_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          resource_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          resource_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_shared_user_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resource"
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
            isOneToOne: false
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
      settlement_shared_user: {
        Row: {
          settlement_id: string
          shared_user_id: string
          user_id: string
        }
        Insert: {
          settlement_id: string
          shared_user_id: string
          user_id: string
        }
        Update: {
          settlement_id?: string
          shared_user_id?: string
          user_id?: string
        }
        Relationships: [
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
      settlement_wanderer: {
        Row: {
          created_at: string
          id: string
          settlement_id: string
          updated_at: string
          wanderer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          settlement_id: string
          updated_at?: string
          wanderer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          settlement_id?: string
          updated_at?: string
          wanderer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_wanderer_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_wanderer_wanderer_id_fkey"
            columns: ["wanderer_id"]
            isOneToOne: false
            referencedRelation: "wanderer"
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
          settlement_id: string | null
          showdown_type: Database["public"]["Enums"]["showdown_type"]
          turn: Database["public"]["Enums"]["showdown_turn"]
          updated_at: string
        }
        Insert: {
          ambush?: Database["public"]["Enums"]["ambush_type"]
          created_at?: string
          id?: string
          monster_level: number
          settlement_id?: string | null
          showdown_type?: Database["public"]["Enums"]["showdown_type"]
          turn?: Database["public"]["Enums"]["showdown_turn"]
          updated_at?: string
        }
        Update: {
          ambush?: Database["public"]["Enums"]["ambush_type"]
          created_at?: string
          id?: string
          monster_level?: number
          settlement_id?: string | null
          showdown_type?: Database["public"]["Enums"]["showdown_type"]
          turn?: Database["public"]["Enums"]["showdown_turn"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "showdown_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
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
          moods: string[]
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
          traits: string[]
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
          moods?: string[]
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
          traits?: string[]
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
          moods?: string[]
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
          traits?: string[]
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
          created_at: string
          custom: boolean
          id: string
          strain_milestone_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          custom?: boolean
          id?: string
          strain_milestone_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          custom?: boolean
          id?: string
          strain_milestone_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      strain_milestone_shared_user: {
        Row: {
          shared_user_id: string
          strain_milestone_id: string
          user_id: string
        }
        Insert: {
          shared_user_id: string
          strain_milestone_id: string
          user_id: string
        }
        Update: {
          shared_user_id?: string
          strain_milestone_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strain_milestone_shared_user_strain_milestone_id_fkey"
            columns: ["strain_milestone_id"]
            isOneToOne: false
            referencedRelation: "strain_milestone"
            referencedColumns: ["id"]
          },
        ]
      }
      survivor: {
        Row: {
          abilities_impairments: string[]
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
          cursed_gear: string[]
          dead: boolean
          disorders: string[]
          disposition: number | null
          evasion: number
          fighting_arts: string[]
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
          knowledge_1: string | null
          knowledge_1_observation_conditions: string | null
          knowledge_1_observation_rank: number | null
          knowledge_1_rank_up: number | null
          knowledge_1_rules: string | null
          knowledge_2: string | null
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
          neurosis: string | null
          next_departure: string[]
          notes: string
          once_per_lifetime: string[]
          philosophy: string | null
          philosophy_rank: number | null
          reroll_used: boolean
          retired: boolean
          sculptor_reaper: boolean | null
          sculptor_rust: boolean | null
          sculptor_storm: boolean | null
          sculptor_witch: boolean | null
          secret_fighting_arts: string[]
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
          tenet_knowledge: string | null
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
          weapon_proficiency_type: string | null
        }
        Insert: {
          abilities_impairments?: string[]
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
          cursed_gear?: string[]
          dead?: boolean
          disorders?: string[]
          disposition?: number | null
          evasion?: number
          fighting_arts?: string[]
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
          knowledge_1?: string | null
          knowledge_1_observation_conditions?: string | null
          knowledge_1_observation_rank?: number | null
          knowledge_1_rank_up?: number | null
          knowledge_1_rules?: string | null
          knowledge_2?: string | null
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
          neurosis?: string | null
          next_departure?: string[]
          notes?: string
          once_per_lifetime?: string[]
          philosophy?: string | null
          philosophy_rank?: number | null
          reroll_used?: boolean
          retired?: boolean
          sculptor_reaper?: boolean | null
          sculptor_rust?: boolean | null
          sculptor_storm?: boolean | null
          sculptor_witch?: boolean | null
          secret_fighting_arts?: string[]
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
          tenet_knowledge?: string | null
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
          weapon_proficiency_type?: string | null
        }
        Update: {
          abilities_impairments?: string[]
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
          cursed_gear?: string[]
          dead?: boolean
          disorders?: string[]
          disposition?: number | null
          evasion?: number
          fighting_arts?: string[]
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
          knowledge_1?: string | null
          knowledge_1_observation_conditions?: string | null
          knowledge_1_observation_rank?: number | null
          knowledge_1_rank_up?: number | null
          knowledge_1_rules?: string | null
          knowledge_2?: string | null
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
          neurosis?: string | null
          next_departure?: string[]
          notes?: string
          once_per_lifetime?: string[]
          philosophy?: string | null
          philosophy_rank?: number | null
          reroll_used?: boolean
          retired?: boolean
          sculptor_reaper?: boolean | null
          sculptor_rust?: boolean | null
          sculptor_storm?: boolean | null
          sculptor_witch?: boolean | null
          secret_fighting_arts?: string[]
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
          tenet_knowledge?: string | null
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
          weapon_proficiency_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survivor_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlement"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          unlocked_killenium_butcher: boolean
          unlocked_screaming_nukalope: boolean
          unlocked_white_gigalion: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          unlocked_killenium_butcher?: boolean
          unlocked_screaming_nukalope?: boolean
          unlocked_white_gigalion?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          unlocked_killenium_butcher?: boolean
          unlocked_screaming_nukalope?: boolean
          unlocked_white_gigalion?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wanderer: {
        Row: {
          abilities_impairments: string[]
          accuracy: number
          arc: boolean
          courage: number
          created_at: string
          custom: boolean
          disposition: number
          evasion: number
          fighting_arts: string[]
          gender: Database["public"]["Enums"]["gender"]
          hunt_xp: number
          hunt_xp_rank_up: number[]
          id: string
          insanity: number
          luck: number
          lumi: number
          movement: number
          permanent_injuries: string[]
          rare_gear: string[]
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
          abilities_impairments?: string[]
          accuracy?: number
          arc?: boolean
          courage?: number
          created_at?: string
          custom?: boolean
          disposition?: number
          evasion?: number
          fighting_arts?: string[]
          gender: Database["public"]["Enums"]["gender"]
          hunt_xp?: number
          hunt_xp_rank_up?: number[]
          id?: string
          insanity?: number
          luck?: number
          lumi?: number
          movement?: number
          permanent_injuries?: string[]
          rare_gear?: string[]
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
          abilities_impairments?: string[]
          accuracy?: number
          arc?: boolean
          courage?: number
          created_at?: string
          custom?: boolean
          disposition?: number
          evasion?: number
          fighting_arts?: string[]
          gender?: Database["public"]["Enums"]["gender"]
          hunt_xp?: number
          hunt_xp_rank_up?: number[]
          id?: string
          insanity?: number
          luck?: number
          lumi?: number
          movement?: number
          permanent_injuries?: string[]
          rare_gear?: string[]
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
      wanderer_shared_user: {
        Row: {
          shared_user_id: string
          user_id: string
          wanderer_id: string
        }
        Insert: {
          shared_user_id: string
          user_id: string
          wanderer_id: string
        }
        Update: {
          shared_user_id?: string
          user_id?: string
          wanderer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wanderer_shared_user_wanderer_id_fkey"
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
          created_at: string
          custom: boolean
          id: string
          updated_at: string
          user_id: string | null
          weapon_type_name: string
        }
        Insert: {
          created_at?: string
          custom?: boolean
          id?: string
          updated_at?: string
          user_id?: string | null
          weapon_type_name: string
        }
        Update: {
          created_at?: string
          custom?: boolean
          id?: string
          updated_at?: string
          user_id?: string | null
          weapon_type_name?: string
        }
        Relationships: []
      }
      weapon_type_shared_user: {
        Row: {
          shared_user_id: string
          user_id: string
          weapon_type_id: string
        }
        Insert: {
          shared_user_id: string
          user_id: string
          weapon_type_id: string
        }
        Update: {
          shared_user_id?: string
          user_id?: string
          weapon_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weapon_type_shared_user_weapon_type_id_fkey"
            columns: ["weapon_type_id"]
            isOneToOne: false
            referencedRelation: "weapon_type"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      aenas_state: "Content" | "Hungry"
      ambush_type: "SURVIVORS" | "MONSTER" | "NONE"
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
      ambush_type: ["SURVIVORS", "MONSTER", "NONE"],
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

