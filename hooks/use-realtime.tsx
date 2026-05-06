'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef } from 'react'

/**
 * Realtime Domain
 *
 * Groups of related tables that trigger the same re-fetch when any table in
 * the group changes.
 */
type RealtimeDomain =
  | 'settlement'
  | 'hunt'
  | 'showdown'
  | 'settlementPhase'
  | 'survivor'

/**
 * Table Domain Entry
 *
 * Maps a table to its domain and specifies how to filter subscriptions.
 */
interface TableDomainEntry {
  /** The domain this table belongs to */
  domain: RealtimeDomain
  /**
   * The column to filter on for settlement-scoped changes.
   * - `'settlement_id'`: filter by `settlement_id=eq.{id}`
   * - `'id'`: filter by `id=eq.{id}` (for the settlement table itself)
   * - `null`: no filter (RLS handles scoping)
   */
  filterColumn: 'settlement_id' | 'id' | null
}

/**
 * Table Domain Map
 *
 * Maps each subscribed table to its domain and filter configuration.
 */
const TABLE_DOMAIN_MAP: Record<string, TableDomainEntry> = {
  // Settlement domain
  settlement: { domain: 'settlement', filterColumn: 'id' },
  settlement_collective_cognition_reward: {
    domain: 'settlement',
    filterColumn: 'settlement_id'
  },
  settlement_gear: { domain: 'settlement', filterColumn: 'settlement_id' },
  settlement_innovation: {
    domain: 'settlement',
    filterColumn: 'settlement_id'
  },
  settlement_knowledge: {
    domain: 'settlement',
    filterColumn: 'settlement_id'
  },
  settlement_location: {
    domain: 'settlement',
    filterColumn: 'settlement_id'
  },
  settlement_milestone: {
    domain: 'settlement',
    filterColumn: 'settlement_id'
  },
  settlement_nemesis: { domain: 'settlement', filterColumn: 'settlement_id' },
  settlement_pattern: { domain: 'settlement', filterColumn: 'settlement_id' },
  settlement_philosophy: {
    domain: 'settlement',
    filterColumn: 'settlement_id'
  },
  settlement_principle: {
    domain: 'settlement',
    filterColumn: 'settlement_id'
  },
  settlement_quarry: { domain: 'settlement', filterColumn: 'settlement_id' },
  settlement_resource: {
    domain: 'settlement',
    filterColumn: 'settlement_id'
  },
  settlement_seed_pattern: {
    domain: 'settlement',
    filterColumn: 'settlement_id'
  },
  settlement_timeline_year: {
    domain: 'settlement',
    filterColumn: 'settlement_id'
  },

  // Hunt domain
  hunt: { domain: 'hunt', filterColumn: 'settlement_id' },
  hunt_ai_deck: { domain: 'hunt', filterColumn: 'settlement_id' },
  hunt_hunt_board: { domain: 'hunt', filterColumn: 'settlement_id' },
  hunt_monster: { domain: 'hunt', filterColumn: 'settlement_id' },
  hunt_monster_mood: { domain: 'hunt', filterColumn: null },
  hunt_monster_survivor_status: { domain: 'hunt', filterColumn: null },
  hunt_monster_trait: { domain: 'hunt', filterColumn: null },
  hunt_survivor: { domain: 'hunt', filterColumn: 'settlement_id' },

  // Showdown domain
  showdown: { domain: 'showdown', filterColumn: 'settlement_id' },
  showdown_ai_deck: { domain: 'showdown', filterColumn: 'settlement_id' },
  showdown_monster: { domain: 'showdown', filterColumn: 'settlement_id' },
  showdown_monster_mood: { domain: 'showdown', filterColumn: null },
  showdown_monster_survivor_status: {
    domain: 'showdown',
    filterColumn: null
  },
  showdown_monster_trait: { domain: 'showdown', filterColumn: null },
  showdown_survivor: { domain: 'showdown', filterColumn: 'settlement_id' },

  // Settlement Phase domain
  settlement_phase: {
    domain: 'settlementPhase',
    filterColumn: 'settlement_id'
  },
  settlement_phase_returning_survivor: {
    domain: 'settlementPhase',
    filterColumn: 'settlement_id'
  },

  // Survivor domain
  survivor: { domain: 'survivor', filterColumn: 'settlement_id' },
  survivor_ability_impairment: { domain: 'survivor', filterColumn: null },
  survivor_cursed_gear: { domain: 'survivor', filterColumn: null },
  survivor_disorder: { domain: 'survivor', filterColumn: null },
  survivor_fighting_art: { domain: 'survivor', filterColumn: null },
  survivor_secret_fighting_art: { domain: 'survivor', filterColumn: null },
  gear_grid: { domain: 'survivor', filterColumn: null }
}

/** Debounce delay in milliseconds for batching rapid changes. */
const DEBOUNCE_MS = 300

/**
 * Realtime Subscription Options
 */
interface UseRealtimeSubscriptionsOptions {
  /** Whether subscriptions should be active */
  enabled: boolean
  /** Current settlement ID to scope subscriptions */
  settlementId: string | null
  /** Called when settlement data changes */
  onSettlementChange: () => void
  /** Called when hunt data changes */
  onHuntChange: () => void
  /** Called when showdown data changes */
  onShowdownChange: () => void
  /** Called when settlement phase data changes */
  onSettlementPhaseChange: () => void
  /** Called when survivor data changes */
  onSurvivorChange: () => void
}

/**
 * Realtime Subscriptions Hook
 *
 * Subscribes to Supabase Realtime changes on gameplay tables and triggers
 * domain-specific re-fetch callbacks when changes are detected. Changes within
 * the same domain are debounced to avoid cascading re-fetches when a single
 * user action modifies multiple related tables.
 *
 * @param options Subscription configuration and callbacks
 */
export function useRealtimeSubscriptions(
  options: UseRealtimeSubscriptionsOptions
) {
  // Store callbacks in a ref so the subscription effect doesn't re-run when
  // only the callback references change. The ref always holds the latest
  // closures, ensuring re-fetches use current state.
  const callbacksRef = useRef(options)

  useEffect(() => {
    callbacksRef.current = options
  })

  useEffect(() => {
    if (!options.enabled || !options.settlementId) return

    const supabase = createClient()
    const settlementId = options.settlementId
    const debounceTimers = new Map<
      RealtimeDomain,
      ReturnType<typeof setTimeout>
    >()

    /**
     * Handles a Realtime Change
     *
     * Debounces changes per domain to batch rapid multi-table mutations into a
     * single re-fetch.
     *
     * @param domain The domain that was affected
     */
    const handleChange = (domain: RealtimeDomain) => {
      const existing = debounceTimers.get(domain)
      if (existing) clearTimeout(existing)

      debounceTimers.set(
        domain,
        setTimeout(() => {
          debounceTimers.delete(domain)
          const callbacks = callbacksRef.current

          switch (domain) {
            case 'settlement':
              callbacks.onSettlementChange()
              break
            case 'hunt':
              callbacks.onHuntChange()
              break
            case 'showdown':
              callbacks.onShowdownChange()
              break
            case 'settlementPhase':
              callbacks.onSettlementPhaseChange()
              break
            case 'survivor':
              callbacks.onSurvivorChange()
              break
          }
        }, DEBOUNCE_MS)
      )
    }

    // Create a single channel for all gameplay subscriptions scoped to this
    // settlement. Each table gets its own listener with an appropriate filter.
    let channel = supabase.channel(`settlement-${settlementId}`)

    for (const [table, { domain, filterColumn }] of Object.entries(
      TABLE_DOMAIN_MAP
    )) {
      if (filterColumn) {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `${filterColumn}=eq.${settlementId}`
          },
          () => handleChange(domain)
        )
      } else {
        // Junction tables that don't carry `settlement_id` directly. The
        // realtime filter syntax doesn't support joins, so we subscribe
        // unfiltered and rely on RLS to scope events to rows the user can
        // read. This is the "coarse subscription" pattern from the sharing
        // architecture doc §8.2.2 (option B).
        //
        // Trade-off: a user with multiple accessible settlements (owned or
        // shared) will receive events for ALL of them, not just the active
        // one. The hook fires the domain refetch for any such event,
        // causing one extra refetch per unrelated mutation. The 300ms
        // per-domain debounce bounds the blast radius — bursts of
        // unrelated events collapse into a single refetch. Refining this
        // to be strictly per-active-settlement requires either denormalising
        // `settlement_id` onto each junction or threading parent-id
        // lookups into this hook, both of which are tracked separately.
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table
          },
          () => handleChange(domain)
        )
      }
    }

    channel.subscribe((status) => {
      console.debug('Realtime subscription status:', status)
    })

    return () => {
      debounceTimers.forEach(clearTimeout)
      debounceTimers.clear()
      supabase.removeChannel(channel)
    }
  }, [options.enabled, options.settlementId])
}
