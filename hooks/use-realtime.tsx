'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef } from 'react'

/**
 * Realtime Domain
 *
 * Groups of related tables that trigger the same re-fetch when any table in
 * the group changes.
 *
 * `catalog` covers custom-content tables (knowledge, disorder, gear,
 * trait, mood, survivor_status, etc.) whose rules / definitions are
 * materialized into **multiple** cached views by the DAL projections:
 *   - `SettlementDetail`: knowledges, gear, locations, milestones,
 *     innovations, etc. (rules embedded via the settlement junctions).
 *   - `SurvivorDetail`: disorders, fighting arts, secret fighting arts,
 *     knowledges (x3), neurosis, ability impairments (rules embedded
 *     via `SURVIVOR_SELECT`).
 *   - `HuntDetail` / `ShowdownDetail` monsters: traits, moods, and
 *     survivor_status rules embedded via the monster projections.
 * The consumer is therefore expected to refresh all materialized
 * collections on a catalog event, not just `SettlementDetail`.
 *
 * Changes are received without a row-level filter because the realtime
 * channel filter syntax does not support joins; RLS gates which catalog
 * rows the subscriber can actually see (transitive visibility via
 * settlement membership — see `docs/settlement-sharing-architecture.md` §8.2.2,
 * recommendation B). The single coarse subscription pays a small
 * bandwidth cost in exchange for not having to track every referenced
 * catalog row id per settlement.
 */
type RealtimeDomain =
  | 'settlement'
  | 'encounter'
  | 'hunt'
  | 'showdown'
  | 'settlementPhase'
  | 'survivor'
  | 'catalog'

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
   * - `null`: no filter (catalog subscriptions rely on RLS)
   */
  filterColumn: 'settlement_id' | 'id' | null
}

/**
 * Table Domain Map
 *
 * Maps each subscribed table to its domain and filter configuration.
 */
export const TABLE_DOMAIN_MAP: Record<string, TableDomainEntry> = {
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
  hunt_monster_mood: { domain: 'hunt', filterColumn: 'settlement_id' },
  hunt_monster_survivor_status: {
    domain: 'hunt',
    filterColumn: 'settlement_id'
  },
  hunt_monster_trait: { domain: 'hunt', filterColumn: 'settlement_id' },
  hunt_survivor: { domain: 'hunt', filterColumn: 'settlement_id' },

  // Encounter domain
  encounter: { domain: 'encounter', filterColumn: 'settlement_id' },
  encounter_active_monster: {
    domain: 'encounter',
    filterColumn: 'settlement_id'
  },
  encounter_active_monster_mood: {
    domain: 'encounter',
    filterColumn: 'settlement_id'
  },
  encounter_active_monster_trait: {
    domain: 'encounter',
    filterColumn: 'settlement_id'
  },
  encounter_survivor: { domain: 'encounter', filterColumn: 'settlement_id' },

  // Showdown domain
  showdown: { domain: 'showdown', filterColumn: 'settlement_id' },
  showdown_ai_deck: { domain: 'showdown', filterColumn: 'settlement_id' },
  showdown_monster: { domain: 'showdown', filterColumn: 'settlement_id' },
  showdown_monster_mood: {
    domain: 'showdown',
    filterColumn: 'settlement_id'
  },
  showdown_monster_survivor_status: {
    domain: 'showdown',
    filterColumn: 'settlement_id'
  },
  showdown_monster_trait: {
    domain: 'showdown',
    filterColumn: 'settlement_id'
  },
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
  survivor_ability_impairment: {
    domain: 'survivor',
    filterColumn: 'settlement_id'
  },
  survivor_cursed_gear: {
    domain: 'survivor',
    filterColumn: 'settlement_id'
  },
  survivor_disorder: { domain: 'survivor', filterColumn: 'settlement_id' },
  survivor_fighting_art: {
    domain: 'survivor',
    filterColumn: 'settlement_id'
  },
  survivor_secret_fighting_art: {
    domain: 'survivor',
    filterColumn: 'settlement_id'
  },
  gear_grid: { domain: 'survivor', filterColumn: 'settlement_id' },

  // Catalog domain — custom-content tables whose rules / definitions are
  // materialized into `SettlementDetail` (and its survivor / hunt /
  // showdown collections). Subscribed unfiltered because the realtime
  // channel cannot express the join from a catalog row back to the
  // active settlement; RLS gates which rows are delivered to the
  // subscriber via transitive visibility through settlement membership
  // (see `docs/settlement-sharing-architecture.md` §8.2.2 recommendation B). Kept
  // in sync with the `catalog_tables` array in
  // `supabase/migrations/20260519000000_catalog_realtime_publication.sql`
  // and the `EXPECTED_CATALOG_TABLES` list in
  // `__tests__/integration/realtime-publication.test.ts`.
  knowledge: { domain: 'catalog', filterColumn: null },
  disorder: { domain: 'catalog', filterColumn: null },
  gear: { domain: 'catalog', filterColumn: null },
  pattern: { domain: 'catalog', filterColumn: null },
  seed_pattern: { domain: 'catalog', filterColumn: null },
  innovation: { domain: 'catalog', filterColumn: null },
  fighting_art: { domain: 'catalog', filterColumn: null },
  secret_fighting_art: { domain: 'catalog', filterColumn: null },
  collective_cognition_reward: { domain: 'catalog', filterColumn: null },
  location: { domain: 'catalog', filterColumn: null },
  milestone: { domain: 'catalog', filterColumn: null },
  principle: { domain: 'catalog', filterColumn: null },
  resource: { domain: 'catalog', filterColumn: null },
  quarry: { domain: 'catalog', filterColumn: null },
  nemesis: { domain: 'catalog', filterColumn: null },
  ability_impairment: { domain: 'catalog', filterColumn: null },
  neurosis: { domain: 'catalog', filterColumn: null },
  philosophy: { domain: 'catalog', filterColumn: null },
  philosophy_rank: { domain: 'catalog', filterColumn: null },
  weapon_type: { domain: 'catalog', filterColumn: null },
  trait: { domain: 'catalog', filterColumn: null },
  mood: { domain: 'catalog', filterColumn: null },
  armor_set: { domain: 'catalog', filterColumn: null },
  armor_set_slot: { domain: 'catalog', filterColumn: null },
  quarry_level: { domain: 'catalog', filterColumn: null },
  quarry_level_trait: { domain: 'catalog', filterColumn: null },
  quarry_level_mood: { domain: 'catalog', filterColumn: null },
  nemesis_level: { domain: 'catalog', filterColumn: null },
  nemesis_level_trait: { domain: 'catalog', filterColumn: null },
  nemesis_level_mood: { domain: 'catalog', filterColumn: null },
  character: { domain: 'catalog', filterColumn: null },
  strain_milestone: { domain: 'catalog', filterColumn: null },
  wanderer: { domain: 'catalog', filterColumn: null },
  constellation: { domain: 'catalog', filterColumn: null },
  survivor_status: { domain: 'catalog', filterColumn: null },
  encounter_monster: { domain: 'catalog', filterColumn: null },
  encounter_monster_level: { domain: 'catalog', filterColumn: null },
  encounter_monster_level_trait: { domain: 'catalog', filterColumn: null },
  encounter_monster_level_mood: { domain: 'catalog', filterColumn: null },

  // Catalog sub-row tables — children of the catalog parents above whose
  // transitive SELECT and realtime publication membership were installed
  // in `20260524000000_catalog_sub_row_transitive_select.sql` and
  // `20260525000000_catalog_sub_row_realtime_publication.sql`. Subscribed
  // unfiltered for the same reason as their parents; RLS gates delivery.
  gear_gear_cost: { domain: 'catalog', filterColumn: null },
  gear_resource_cost: { domain: 'catalog', filterColumn: null },
  gear_resource_type_cost: { domain: 'catalog', filterColumn: null },
  gear_other_cost: { domain: 'catalog', filterColumn: null },
  pattern_gear_cost: { domain: 'catalog', filterColumn: null },
  pattern_resource_cost: { domain: 'catalog', filterColumn: null },
  pattern_resource_type_cost: { domain: 'catalog', filterColumn: null },
  pattern_innovation_requirement: { domain: 'catalog', filterColumn: null },
  seed_pattern_gear_cost: { domain: 'catalog', filterColumn: null },
  seed_pattern_resource_cost: { domain: 'catalog', filterColumn: null },
  seed_pattern_resource_type_cost: { domain: 'catalog', filterColumn: null },
  seed_pattern_innovation_requirement: {
    domain: 'catalog',
    filterColumn: null
  },
  armor_set_slot_gear: { domain: 'catalog', filterColumn: null },
  quarry_level_survivor_status: { domain: 'catalog', filterColumn: null },
  nemesis_level_survivor_status: { domain: 'catalog', filterColumn: null },
  // Direct quarry/nemesis sub-rows whose transitive SELECT was
  // installed alongside the level-survivor-status junctions. Wanderer
  // children are intentionally absent because `wanderer` has no
  // settlement junction, so collaborators never satisfy the SELECT
  // predicate for custom wanderer rows.
  quarry_location: { domain: 'catalog', filterColumn: null },
  quarry_timeline_year: { domain: 'catalog', filterColumn: null },
  quarry_hunt_board: { domain: 'catalog', filterColumn: null },
  quarry_hunt_board_position: { domain: 'catalog', filterColumn: null },
  quarry_collective_cognition_reward: {
    domain: 'catalog',
    filterColumn: null
  },
  nemesis_location: { domain: 'catalog', filterColumn: null },
  nemesis_timeline_year: { domain: 'catalog', filterColumn: null }
}

/** Realtime Postgres Change Event Type */
type RealtimeChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE'

/** Minimal shape used from Supabase realtime payloads. */
interface RealtimeChangePayload {
  /** Event Type */
  eventType: RealtimeChangeEvent
  /** New Row */
  new: Record<string, unknown>
  /** Old Row */
  old: Partial<Record<string, unknown>>
}

/** Direct catalog foreign-key fields stored on gameplay rows. */
const DIRECT_CATALOG_LINK_FIELDS_BY_TABLE: Record<string, readonly string[]> = {
  gear_grid: ['selected_armor_set_id'],
  survivor: [
    'knowledge_1_id',
    'knowledge_2_id',
    'neurosis_id',
    'philosophy_id',
    'tenet_knowledge_id',
    'weapon_type_id'
  ]
}

/** Gameplay junctions whose rows reveal or hide catalog content. */
const CATALOG_LINK_JUNCTION_TABLES = new Set([
  'hunt_monster_mood',
  'hunt_monster_survivor_status',
  'hunt_monster_trait',
  'encounter_active_monster_mood',
  'encounter_active_monster_trait',
  'showdown_monster_mood',
  'showdown_monster_survivor_status',
  'showdown_monster_trait',
  'survivor_ability_impairment',
  'survivor_cursed_gear',
  'survivor_disorder',
  'survivor_fighting_art',
  'survivor_secret_fighting_art'
])

/** Snapshot of direct catalog-link fields for one gameplay row. */
type CatalogLinkSnapshot = Record<string, unknown>

/** Catalog-link field snapshots keyed by `table:id`. */
type CatalogLinkSnapshots = Map<string, CatalogLinkSnapshot>

/**
 * Get Catalog Link Row Key
 *
 * Builds a stable key for direct gameplay rows whose catalog-link fields need
 * old/new comparison. Realtime UPDATE payloads often carry only the primary key
 * in `old`, so the hook keeps a per-subscription snapshot after the first
 * event for each row.
 *
 * @param table Table Name
 * @param payload Realtime Payload
 * @returns Snapshot Key, or `null` when no row id is available
 */
function getCatalogLinkRowKey(
  table: string,
  payload: RealtimeChangePayload
): string | null {
  const id =
    typeof payload.new.id === 'string'
      ? payload.new.id
      : typeof payload.old.id === 'string'
        ? payload.old.id
        : null

  return id ? `${table}:${id}` : null
}

/**
 * Pick Catalog Link Fields
 *
 * Extracts only the catalog-link fields for a table from a row-shaped object.
 *
 * @param table Table Name
 * @param row Row Data
 * @returns Link Field Snapshot
 */
function pickCatalogLinkFields(
  table: string,
  row: Partial<Record<string, unknown>>
): CatalogLinkSnapshot {
  const fields = DIRECT_CATALOG_LINK_FIELDS_BY_TABLE[table] ?? []
  return Object.fromEntries(fields.map((field) => [field, row[field] ?? null]))
}

/**
 * Has Any Catalog Link Field
 *
 * @param table Table Name
 * @param row Row Data
 * @returns Whether the payload carries at least one tracked link field
 */
function hasAnyCatalogLinkField(
  table: string,
  row: Partial<Record<string, unknown>>
): boolean {
  return (DIRECT_CATALOG_LINK_FIELDS_BY_TABLE[table] ?? []).some((field) =>
    Object.prototype.hasOwnProperty.call(row, field)
  )
}

/**
 * Has Any Catalog Link Value
 *
 * @param snapshot Direct Link Snapshot
 * @returns Whether any catalog-link field is populated
 */
function hasAnyCatalogLinkValue(snapshot: CatalogLinkSnapshot): boolean {
  return Object.values(snapshot).some((value) => value != null)
}

/**
 * Did Catalog Link Snapshot Change
 *
 * @param previous Previous Link Snapshot
 * @param next Next Link Snapshot
 * @returns Whether any tracked catalog-link field changed
 */
function didCatalogLinkSnapshotChange(
  previous: CatalogLinkSnapshot,
  next: CatalogLinkSnapshot
): boolean {
  return Object.keys(next).some((field) => previous[field] !== next[field])
}

/**
 * Should Refresh Catalog For Linked Content Change
 *
 * Returns `true` when a gameplay-table event may have revealed or hidden a
 * custom catalog row for the active settlement. This plugs the race where a
 * collaborator misses the original catalog INSERT because the row is not
 * transitively visible until a survivor / monster / gear-grid link is written.
 *
 * @param table Changed Table Name
 * @param payload Realtime Payload
 * @param snapshots Direct Link Snapshots
 * @returns Whether the catalog fan-out should run
 */
export function shouldRefreshCatalogForLinkedContentChange(
  table: string,
  payload: RealtimeChangePayload,
  snapshots: CatalogLinkSnapshots = new Map()
): boolean {
  if (CATALOG_LINK_JUNCTION_TABLES.has(table)) return true

  if (!DIRECT_CATALOG_LINK_FIELDS_BY_TABLE[table]) return false

  const rowKey = getCatalogLinkRowKey(table, payload)
  const next = pickCatalogLinkFields(table, payload.new)
  const previous = rowKey ? snapshots.get(rowKey) : undefined
  const old = pickCatalogLinkFields(table, payload.old)
  const newHasPayloadValues = hasAnyCatalogLinkField(table, payload.new)
  const oldHasPayloadValues = hasAnyCatalogLinkField(table, payload.old)
  const previousSnapshot = oldHasPayloadValues ? old : previous

  if (payload.eventType === 'DELETE') {
    if (rowKey) snapshots.delete(rowKey)
    if (previousSnapshot) return hasAnyCatalogLinkValue(previousSnapshot)
    return !oldHasPayloadValues
  }

  if (!newHasPayloadValues) return false

  if (rowKey) snapshots.set(rowKey, next)

  if (payload.eventType === 'INSERT') return hasAnyCatalogLinkValue(next)

  if (!previousSnapshot) return true

  return didCatalogLinkSnapshotChange(previousSnapshot, next)
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
  /** Called when encounter data changes */
  onEncounterChange: () => void
  /** Called when showdown data changes */
  onShowdownChange: () => void
  /** Called when settlement phase data changes */
  onSettlementPhaseChange: () => void
  /** Called when survivor data changes */
  onSurvivorChange: () => void
  /**
   * Called when a custom-content catalog row (knowledge, disorder, gear,
   * trait, mood, survivor_status, etc.) reachable through the active
   * settlement changes. The callback fires on any catalog event
   * delivered by RLS — including rows referenced through a survivor /
   * hunt / showdown.
   *
   * Catalog rules / definitions are embedded by multiple DAL projections
   * (`SettlementDetail`, `SurvivorDetail`, hunt/showdown monster
   * details), so the consumer is expected to refresh every materialized
   * view in lockstep — refetching `SettlementDetail` alone would leave
   * survivor disorders, hunt monster traits, etc. stale. The 300ms
   * domain debounce collapses bursts of catalog edits into a single
   * dispatch.
   */
  onCatalogChange: () => void
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
    const catalogLinkSnapshots: CatalogLinkSnapshots = new Map()

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
            case 'encounter':
              callbacks.onEncounterChange()
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
            case 'catalog':
              callbacks.onCatalogChange()
              break
          }
        }, DEBOUNCE_MS)
      )
    }

    /**
     * Handles a Postgres Realtime Payload
     *
     * Dispatches the table's normal domain unless the gameplay row links to
     * catalog content. Linked-content changes dispatch only the catalog fan-out,
     * which already refreshes the materialized settlement / survivor / hunt /
     * showdown state.
     *
     * @param table Changed Table Name
     * @param domain Table Domain
     * @param payload Realtime Payload
     */
    const handlePostgresChange = (
      table: string,
      domain: RealtimeDomain,
      payload: RealtimeChangePayload
    ) => {
      if (domain === 'catalog') {
        handleChange('catalog')
        return
      }

      if (
        shouldRefreshCatalogForLinkedContentChange(
          table,
          payload,
          catalogLinkSnapshots
        )
      ) {
        handleChange('catalog')
        return
      }

      handleChange(domain)
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
          (payload) => handlePostgresChange(table, domain, payload)
        )
      } else {
        // Catalog tables are subscribed unfiltered because realtime filters
        // cannot express the transitive joins from catalog rows back to the
        // active settlement. RLS still gates delivery to readable rows.
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table
          },
          (payload) => handlePostgresChange(table, domain, payload)
        )
      }
    }

    channel.subscribe((status) => {
      console.debug('Realtime subscription status:', status)
    })

    return () => {
      debounceTimers.forEach(clearTimeout)
      debounceTimers.clear()
      catalogLinkSnapshots.clear()
      supabase.removeChannel(channel)
    }
  }, [options.enabled, options.settlementId])
}

/**
 * Share Change Event
 *
 * Payload delivered to `onShareChange` when a row in
 * `settlement_shared_user` involving the current user is inserted or
 * deleted. `settlementId` is the affected settlement on either side of
 * the event so the caller can refresh the settlement list and (on
 * `DELETE`) decide whether to clear the active selection.
 */
export interface ShareChangeEvent {
  /** Realtime Event Type */
  event: 'INSERT' | 'DELETE'
  /** Affected Settlement ID */
  settlementId: string
}

/**
 * User Realtime Subscriptions Options
 */
interface UseUserRealtimeSubscriptionsOptions {
  /** Whether the subscription should be active */
  enabled: boolean
  /** Authenticated user ID; subscription is skipped while `null` */
  userId: string | null
  /** Called when a share is granted to or revoked from the current user */
  onShareChange: (event: ShareChangeEvent) => void
  /**
   * Called when the current user's `user_subscription` row changes. Fires
   * on UPDATE events only — the row is seeded at sign-up and never
   * inserted or deleted at runtime, so the Stripe webhook always issues
   * an UPDATE (or, for first-time checkout, an UPSERT that lands as an
   * UPDATE against the seeded `free` row). Optional so callers that do
   * not care about subscription state can omit it.
   */
  onSubscriptionChange?: () => void
  /** Called when a notification row is inserted for the current user */
  onNotificationInsert?: () => void
  /**
   * Called when the current user inserts or deletes a row in `settlement`
   * (i.e. an owned settlement appears or disappears). Powers the cached
   * `settlementList` in `LocalContext` so the sidebar settlement switcher
   * — and the free-tier ownership cap that gates the "Found a settlement"
   * action — stays consistent with the database without a manual reload.
   *
   * Fires for INSERT and DELETE events filtered on `user_id`. Share-side
   * changes (a collaborator gaining or losing access to someone else's
   * settlement) flow through `onShareChange` instead. Optional so callers
   * that do not care about settlement-list churn can omit it.
   */
  onOwnedSettlementChange?: () => void
}

/**
 * User Realtime Subscriptions Hook
 *
 * Subscribes a per-user channel to row-level events on:
 *
 *   - `settlement_shared_user` — INSERT / DELETE where
 *     `shared_user_id = userId`, delivering share-grant / share-revoke
 *     notifications to the recipient without a manual reload (Phase 1.5
 *     of the sharing architecture rollout — see issue #144).
 *   - `user_subscription` — UPDATE where `user_id = userId`, so the SPA
 *     can refresh its cached entitlement state as soon as the Stripe
 *     webhook commits a plan change, cancellation, renewal, or pending
 *     cancellation flip. Closes the timing window where the user returns
 *     from the Customer Portal before the webhook has processed. See
 *     issue #170.
 *   - `notification` — INSERT where `recipient_user_id = userId`, so the
 *     bell badge and popover can refetch without polling. See issue #182.
 *   - `settlement` — INSERT / DELETE where `user_id = userId`, so the
 *     cached `settlementList` in `LocalContext` (and therefore the
 *     sidebar settlement switcher + free-tier ownership cap on the
 *     "Found a settlement" action) stays consistent with the database
 *     after a settlement is created or deleted in any tab.
 *
 * All subscriptions share a single `user-${userId}` channel so the
 * realtime socket connection cost is amortized. Events are delivered
 * one-for-one to the matching callback; callers are responsible for any
 * debouncing or state cascades (e.g. clearing the active settlement
 * selection on share revoke).
 *
 * @param options Subscription configuration
 */
export function useUserRealtimeSubscriptions(
  options: UseUserRealtimeSubscriptionsOptions
) {
  const shareCallbackRef = useRef(options.onShareChange)
  const subscriptionCallbackRef = useRef(options.onSubscriptionChange)
  const notificationCallbackRef = useRef(options.onNotificationInsert)
  const ownedSettlementCallbackRef = useRef(options.onOwnedSettlementChange)

  useEffect(() => {
    shareCallbackRef.current = options.onShareChange
    subscriptionCallbackRef.current = options.onSubscriptionChange
    notificationCallbackRef.current = options.onNotificationInsert
    ownedSettlementCallbackRef.current = options.onOwnedSettlementChange
  })

  useEffect(() => {
    if (!options.enabled || !options.userId) return

    const supabase = createClient()
    const userId = options.userId

    const channel = supabase
      .channel(`user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'settlement_shared_user',
          filter: `shared_user_id=eq.${userId}`
        },
        (payload) => {
          const row = payload.new as { settlement_id?: string } | undefined
          if (!row?.settlement_id) return
          shareCallbackRef.current({
            event: 'INSERT',
            settlementId: row.settlement_id
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'settlement_shared_user',
          filter: `shared_user_id=eq.${userId}`
        },
        (payload) => {
          const row = payload.old as { settlement_id?: string } | undefined
          if (!row?.settlement_id) return
          shareCallbackRef.current({
            event: 'DELETE',
            settlementId: row.settlement_id
          })
        }
      )
      .on(
        'postgres_changes',
        {
          // UPDATE only — `user_subscription` rows are seeded at sign-up
          // by `initialize_user_settings` / `provision_user_settings_for_oauth`
          // and never inserted or deleted at runtime. The Stripe webhook's
          // `upsert` on `checkout.session.completed` lands as an UPDATE
          // against the pre-existing seeded row, and the delete handler
          // also writes via UPDATE (we keep the historical row for
          // continuity rather than removing it). A separate event filter
          // for INSERT / DELETE would only fire on admin recovery paths
          // and isn't worth the socket cost.
          event: 'UPDATE',
          schema: 'public',
          table: 'user_subscription',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // The payload carries the new row, but the SPA already has a
          // DAL helper that re-derives `can_share` from the RPC, so we
          // delegate refresh entirely to the caller instead of
          // hand-rolling a partial reconstruction here.
          subscriptionCallbackRef.current?.()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notification',
          filter: `recipient_user_id=eq.${userId}`
        },
        () => {
          notificationCallbackRef.current?.()
        }
      )
      .on(
        'postgres_changes',
        {
          // INSERT on `settlement` for this user — a new owned settlement
          // appeared (e.g. the user submitted the "Found a settlement"
          // form in another tab, or the seed-data generator just ran).
          // The callback is responsible for refetching the cached list;
          // we don't try to merge the new row in-place because
          // `getSettlementForUser` joins additional metadata (role,
          // shared-with markers) that the raw `settlement` payload
          // doesn't carry.
          event: 'INSERT',
          schema: 'public',
          table: 'settlement',
          filter: `user_id=eq.${userId}`
        },
        () => {
          ownedSettlementCallbackRef.current?.()
        }
      )
      .on(
        'postgres_changes',
        {
          // DELETE on `settlement` for this user — an owned settlement
          // was removed (Settings → Delete settlement, or admin cleanup).
          // Refresh so the dropdown stops listing the dead entry and the
          // free-tier ownership counter relaxes back below the cap.
          event: 'DELETE',
          schema: 'public',
          table: 'settlement',
          filter: `user_id=eq.${userId}`
        },
        () => {
          ownedSettlementCallbackRef.current?.()
        }
      )
      .subscribe((status) => {
        console.debug('User realtime subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [options.enabled, options.userId])
}
