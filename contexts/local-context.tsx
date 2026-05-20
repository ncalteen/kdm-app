'use client'

import {
  ShareChangeEvent,
  useRealtimeSubscriptions,
  useUserRealtimeSubscriptions
} from '@/hooks/use-realtime'
import { LOCAL_STORAGE_KEY } from '@/lib/common'
import { getHunt } from '@/lib/dal/hunt'
import { getSettlement } from '@/lib/dal/settlement'
import { getSettlementPhase } from '@/lib/dal/settlement-phase'
import { getShowdown } from '@/lib/dal/showdown'
import { getSurvivor, getSurvivors } from '@/lib/dal/survivor'
import { getSettlementForUser, getUserSettings } from '@/lib/dal/user'
import { getUserSubscription } from '@/lib/dal/user-subscription'
import { TabType } from '@/lib/enums'
import { ERROR_MESSAGE } from '@/lib/messages'
import { isUserSettingsAdmin } from '@/lib/supabase/admin-role'
import { createClient } from '@/lib/supabase/client'
import {
  HuntDetail,
  HuntStateSetter,
  SettlementDetail,
  SettlementListEntry,
  SettlementPhaseDetail,
  SettlementStateSetter,
  ShowdownDetail,
  ShowdownStateSetter,
  SurvivorDetail,
  SurvivorsStateSetter,
  SurvivorStateSetter,
  UserSettingsDetail,
  UserSubscriptionDetail
} from '@/lib/types'
import { saveToLocalStorage } from '@/lib/utils'
import {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { toast as sonnerToast } from 'sonner'

/**
 * Local State Type
 */
export interface LocalStateType {
  /** Selected Hunt ID */
  selectedHuntId: string | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number
  /** Selected Settlement ID */
  selectedSettlementId: string | null
  /** Selected Settlement Phase ID */
  selectedSettlementPhaseId: string | null
  /** Selected Showdown ID */
  selectedShowdownId: string | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Survivor ID */
  selectedSurvivorId: string | null
  /** Selected Tab */
  selectedTab: TabType | null
}

const newLocal: LocalStateType = {
  selectedHuntId: null,
  selectedHuntMonsterIndex: 0,
  selectedSettlementId: null,
  selectedSettlementPhaseId: null,
  selectedShowdownId: null,
  selectedShowdownMonsterIndex: 0,
  selectedSurvivorId: null,
  selectedTab: null
}

const NOTIFICATION_INSERT_COALESCE_MS = 250

type NotificationInsertListener = () => void

/**
 * Local Context Type
 */
interface LocalContextType {
  /**
   * Authentication State
   *
   * `null` while the initial `auth.getUser()` check is in flight, `true`
   * once a user is verified, `false` when no user is present. Consumers
   * should treat `null` the same as `false` for gating data fetches, but
   * may use it to distinguish "still checking" from "definitely signed
   * out" (e.g. before redirecting to the login page).
   */
  isAuthenticated: boolean | null
  /** Whether the verified Supabase Auth user has the app admin role */
  isAdmin: boolean
  /** Is Creating New Hunt */
  isCreatingNewHunt: boolean
  /** Is Creating New Settlement */
  isCreatingNewSettlement: boolean
  /** Is Creating New Showdown */
  isCreatingNewShowdown: boolean
  /** Is Creating New Survivor */
  isCreatingNewSurvivor: boolean

  /** Pending Special Showdown */
  pendingSpecialShowdown: boolean
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
  /** Selected Hunt ID */
  selectedHuntId: string | null
  /** Selected Hunt Monster Index */
  selectedHuntMonsterIndex: number
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Settlement ID */
  selectedSettlementId: string | null
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
  /** Selected Settlement Phase ID */
  selectedSettlementPhaseId: string | null
  /** Selected Showdown */
  selectedShowdown: ShowdownDetail | null
  /** Selected Showdown ID */
  selectedShowdownId: string | null
  /** Selected Showdown Monster Index */
  selectedShowdownMonsterIndex: number
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Selected Survivor ID */
  selectedSurvivorId: string | null
  /** Selected Tab */
  selectedTab: TabType

  /** Set Is Creating New Hunt */
  setIsCreatingNewHunt: (isCreating: boolean) => void
  /** Set Is Creating New Settlement */
  setIsCreatingNewSettlement: (isCreating: boolean) => void
  /** Set Is Creating New Showdown */
  setIsCreatingNewShowdown: (isCreating: boolean) => void
  /** Set Is Creating New Survivor */
  setIsCreatingNewSurvivor: (isCreating: boolean) => void

  /** Set Pending Special Showdown */
  setPendingSpecialShowdown: (pending: boolean) => void
  /** Set Selected Hunt */
  setSelectedHunt: HuntStateSetter
  /** Set Selected Hunt ID */
  setSelectedHuntId: (huntId: string | null) => void
  /** Set Selected Hunt Monster Index */
  setSelectedHuntMonsterIndex: (index: number) => void
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
  /** Set Selected Settlement ID */
  setSelectedSettlementId: (settlementId: string | null) => void
  /** Set Selected Settlement Phase */
  setSelectedSettlementPhase: (
    settlementPhase: SettlementPhaseDetail | null
  ) => void
  /** Set Selected Settlement Phase ID */
  setSelectedSettlementPhaseId: (settlementPhaseId: string | null) => void
  /** Set Selected Showdown */
  setSelectedShowdown: ShowdownStateSetter
  /** Set Selected Showdown ID */
  setSelectedShowdownId: (showdownId: string | null) => void
  /** Set Selected Showdown Monster Index */
  setSelectedShowdownMonsterIndex: (index: number) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: SurvivorStateSetter
  /** Set Selected Survivor ID */
  setSelectedSurvivorId: (survivorId: string | null) => void
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void

  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
  /** Survivors */
  survivors: SurvivorDetail[]

  /** Local Context */
  local: LocalStateType
  /** Update Local Context */
  updateLocal: (local: LocalStateType) => void

  /** User Settings */
  userSettings: UserSettingsDetail | null
  /** Set User Settings */
  setUserSettings: (settings: UserSettingsDetail | null) => void

  /**
   * User Subscription
   *
   * Cached result of `getUserSubscription`. `null` while the initial fetch
   * is in flight or when the caller has no `user_subscription` row yet
   * (e.g. a brand-new user racing the sign-up trigger). Consumers should
   * read `canShare` rather than re-deriving from `plan_id` so the gate
   * tracks the Postgres `user_can_share()` predicate that RLS already
   * enforces.
   */
  userSubscription: UserSubscriptionDetail | null
  /** Set User Subscription */
  setUserSubscription: (subscription: UserSubscriptionDetail | null) => void
  /** Subscribe To Notification Inserts */
  subscribeToNotificationInserts: (
    listener: NotificationInsertListener
  ) => () => void
  /**
   * Whether The User May Create New Shares
   *
   * Convenience derivation of `userSubscription?.can_share`. `false`
   * whenever the subscription is missing, on the free plan, or in a
   * non-entitling status (`past_due`, `canceled`, `incomplete`).
   */
  canShare: boolean

  /**
   * Subscription Management Flag
   *
   * Mirrors the `subscription-management` Vercel feature flag for the
   * current request. Resolved server-side in `app/layout.tsx` and
   * threaded through this provider so client components can gate UI
   * surfaces (Subscription tab, Sharing tab, useStripeReturn fallback)
   * without re-fetching the flag. `false` is the safe direction — the
   * flag closes when Edge Config is unreachable or the caller is not
   * on the allowlist.
   */
  subscriptionManagementEnabled: boolean

  /**
   * Settlement List
   *
   * Cached result of `getSettlementForUser`. Refreshed automatically when
   * the user-level realtime channel observes share grants / revokes
   * targeting the current user (Phase 1.5 — issue #144).
   */
  settlementList: SettlementListEntry[]
  /** Whether the initial settlement-list fetch is still pending */
  isSettlementListLoading: boolean
}

/**
 * Local Context Provider Properties
 */
interface LocalProviderProps {
  /** Children */
  children: ReactNode
  /**
   * Subscription Management Flag
   *
   * Pre-resolved server-side via `subscriptionManagementFlag()` in
   * `app/layout.tsx`. Defaults to `false` when omitted so unit tests
   * and Storybook stories can wrap components in `<LocalProvider>`
   * without resolving Vercel Flags. Server-side resolution avoids
   * client-side flag evaluation, which would require a round-trip to
   * Edge Config from the browser.
   */
  subscriptionManagementEnabled?: boolean
}

/**
 * Local Context
 */
const LocalContext = createContext<LocalContextType | undefined>(undefined)

/**
 * Local Context Provider
 *
 * @param props Local Provider Properties
 * @returns Local Context Provider Component
 */
export function LocalProvider({
  children,
  subscriptionManagementEnabled = false
}: LocalProviderProps): ReactElement {
  // Get the local state information from local storage, or set to default if
  // not present.
  const [local, setLocalState] = useState<LocalStateType>(() =>
    typeof window === 'undefined'
      ? newLocal
      : JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_KEY) ?? JSON.stringify(newLocal)
        )
  )

  // Hunt
  const [selectedHunt, setSelectedHuntState] = useState<HuntDetail | null>(null)
  const [selectedHuntId, setSelectedHuntIdState] = useState<string | null>(
    () => local.selectedHuntId ?? null
  )
  const [selectedHuntMonsterIndex, setSelectedHuntMonsterIndexState] =
    useState<number>(() => local.selectedHuntMonsterIndex)

  // Settlement
  const [selectedSettlement, setSelectedSettlementState] =
    useState<SettlementDetail | null>(null)
  const [selectedSettlementId, setSelectedSettlementIdState] = useState<
    string | null
  >(() => local.selectedSettlementId ?? null)

  // Settlement Phase
  const [selectedSettlementPhase, setSelectedSettlementPhaseState] =
    useState<SettlementPhaseDetail | null>(null)
  const [selectedSettlementPhaseId, setSelectedSettlementPhaseIdState] =
    useState<string | null>(() => local.selectedSettlementPhaseId ?? null)

  // Showdown
  const [selectedShowdown, setSelectedShowdownState] =
    useState<ShowdownDetail | null>(null)
  const [selectedShowdownId, setSelectedShowdownIdState] = useState<
    string | null
  >(() => local.selectedShowdownId ?? null)
  const [selectedShowdownMonsterIndex, setSelectedShowdownMonsterIndexState] =
    useState<number>(() => local.selectedShowdownMonsterIndex)

  // Survivor
  const [selectedSurvivor, setSelectedSurvivorState] =
    useState<SurvivorDetail | null>(null)
  const [selectedSurvivorId, setSelectedSurvivorIdState] = useState<
    string | null
  >(() => local.selectedSurvivorId ?? null)

  // Survivors (all for Settlement)
  const [survivors, setSurvivors] = useState<SurvivorDetail[]>([])

  // Tab
  const [selectedTab, setSelectedTabState] = useState<TabType>(
    () => local.selectedTab ?? TabType.TIMELINE
  )

  // User Settings
  const [userSettings, setUserSettingsState] =
    useState<UserSettingsDetail | null>(null)

  // User Subscription — paid-feature gating snapshot. Refreshed alongside
  // user settings whenever authentication transitions to true. `canShare`
  // is derived from this in the memoized context value.
  const [userSubscription, setUserSubscriptionState] =
    useState<UserSubscriptionDetail | null>(null)

  const [isCreatingNewHunt, setIsCreatingNewHunt] = useState<boolean>(false)
  const [isCreatingNewSettlement, setIsCreatingNewSettlement] =
    useState<boolean>(false)
  const [isCreatingNewShowdown, setIsCreatingNewShowdown] =
    useState<boolean>(false)
  const [isCreatingNewSurvivor, setIsCreatingNewSurvivor] =
    useState<boolean>(false)

  const [pendingSpecialShowdown, setPendingSpecialShowdown] =
    useState<boolean>(false)

  // Wait for authentication before fetching any data.
  // `null` = check in flight, `true` = authenticated, `false` = not
  // authenticated. The tri-state lets downstream consumers (e.g. `app/page.tsx`)
  // distinguish "still checking" from "definitely signed out" without
  // issuing a redundant `auth.getUser()` call.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)

  // Authenticated user ID — drives the per-user realtime channel that
  // delivers share grant / revoke notifications. Mirrors the lifecycle of
  // `isAuthenticated` and is captured from the same `auth.getUser()` call
  // to avoid a redundant round trip.
  const [userId, setUserId] = useState<string | null>(null)

  // Notification insert listeners hang off refs so realtime inbox events do not
  // mutate the global context value and re-render unrelated consumers.
  const notificationInsertListenersRef = useRef(
    new Set<NotificationInsertListener>()
  )
  const notificationInsertTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null)

  // Settlement list shown in the switcher. Held at the context layer so the
  // user-level realtime channel can refresh it from a single source of
  // truth when a share is granted to or revoked from the current user
  // (Phase 1.5 — issue #144).
  const [settlementList, setSettlementList] = useState<SettlementListEntry[]>(
    []
  )
  const [isSettlementListLoading, setIsSettlementListLoading] =
    useState<boolean>(true)

  useEffect(() => {
    let isCancelled = false

    const supabase = createClient()

    supabase.auth.getUser().then(({ data, error }) => {
      if (isCancelled) return
      const authedUser = !error ? (data?.user ?? null) : null
      const authedUserId = authedUser?.id ?? null
      setIsAuthenticated(!!authedUser)
      setUserId(authedUserId)
      setIsAdmin(false)
    })

    // Re-evaluate when the auth state changes (e.g. login/logout).
    // Use server-verified getUser() instead of trusting the session's user
    // object, which can reference a deleted user (e.g. after a DB reset).
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isCancelled) return

      if (!session?.user) {
        setIsAuthenticated(false)
        setUserId(null)
        setIsAdmin(false)
        return
      }

      supabase.auth.getUser().then(({ data, error }) => {
        if (isCancelled) return

        if (error || !data?.user) {
          // Stale session — sign out to clear the invalid token.
          supabase.auth.signOut()
          setIsAuthenticated(false)
          setUserId(null)
          setIsAdmin(false)
          return
        }

        setIsAuthenticated(true)
        setUserId(data.user.id)
        setIsAdmin(false)
      })
    })

    return () => {
      isCancelled = true
      subscription.unsubscribe()
    }
  }, [])

  // Persist `local` to localStorage on every commit. Centralizing this in a
  // single effect lets every setter mutate state with a plain functional
  // updater (no inline `saveToLocalStorage` calls), which keeps setter
  // identities stable and collapses redundant writes when multiple setters fire
  // in the same React batch.
  useEffect(() => {
    saveToLocalStorage(local)
  }, [local])

  // Subscribe to Supabase Realtime changes on gameplay tables. When another
  // tab or player modifies data, the affected domain is re-fetched.
  useRealtimeSubscriptions({
    enabled: isAuthenticated === true,
    settlementId: selectedSettlementId,
    onSettlementChange: () => {
      if (!selectedSettlementId) return

      getSettlement(selectedSettlementId)
        .then((settlement) => {
          setSelectedSettlementState(settlement)

          if (!settlement) {
            setSelectedSettlementIdState(null)
            setSelectedHuntState(null)
            setSelectedHuntIdState(null)
            setSelectedHuntMonsterIndexState(0)
            setSelectedSettlementPhaseState(null)
            setSelectedSettlementPhaseIdState(null)
            setSelectedShowdownState(null)
            setSelectedShowdownIdState(null)
            setSelectedShowdownMonsterIndexState(0)
            setSelectedSurvivorState(null)
            setSelectedSurvivorIdState(null)
            setSurvivors([])

            setLocalState((prev) => ({
              ...prev,
              selectedSettlementId: null,
              selectedHuntId: null,
              selectedHuntMonsterIndex: 0,
              selectedSettlementPhaseId: null,
              selectedShowdownId: null,
              selectedShowdownMonsterIndex: 0,
              selectedSurvivorId: null
            }))
          }
        })
        .catch((err: unknown) => {
          console.error('Realtime Settlement Refetch Error:', err)
        })
    },
    onHuntChange: () => {
      if (!selectedSettlementId) return

      getHunt(selectedSettlementId)
        .then((hunt) => {
          setSelectedHuntState(hunt)

          if (!hunt && selectedHuntId) {
            setSelectedHuntIdState(null)
            setSelectedHuntMonsterIndexState(0)

            setLocalState((prev) => ({
              ...prev,
              selectedHuntId: null,
              selectedHuntMonsterIndex: 0
            }))
          } else if (hunt && !selectedHuntId) {
            setSelectedHuntIdState(hunt.id)

            setLocalState((prev) => ({
              ...prev,
              selectedHuntId: hunt.id,
              selectedHuntMonsterIndex: 0
            }))
          }
        })
        .catch((err: unknown) => {
          console.error('Realtime Hunt Refetch Error:', err)
        })
    },
    onShowdownChange: () => {
      if (!selectedSettlementId) return

      getShowdown(selectedSettlementId)
        .then((showdown) => {
          setSelectedShowdownState(showdown)

          if (!showdown && selectedShowdownId) {
            setSelectedShowdownIdState(null)
            setSelectedShowdownMonsterIndexState(0)

            setLocalState((prev) => ({
              ...prev,
              selectedShowdownId: null,
              selectedShowdownMonsterIndex: 0
            }))
          } else if (showdown && !selectedShowdownId) {
            setSelectedShowdownIdState(showdown.id)

            setLocalState((prev) => ({
              ...prev,
              selectedShowdownId: showdown.id,
              selectedShowdownMonsterIndex: 0
            }))
          }
        })
        .catch((err: unknown) => {
          console.error('Realtime Showdown Refetch Error:', err)
        })
    },
    onSettlementPhaseChange: () => {
      if (!selectedSettlementId) return

      getSettlementPhase(selectedSettlementId)
        .then((settlementPhase) => {
          setSelectedSettlementPhaseState(settlementPhase)

          if (!settlementPhase && selectedSettlementPhaseId) {
            setSelectedSettlementPhaseIdState(null)

            setLocalState((prev) => ({
              ...prev,
              selectedSettlementPhaseId: null
            }))
          } else if (settlementPhase && !selectedSettlementPhaseId) {
            setSelectedSettlementPhaseIdState(settlementPhase.id)

            setLocalState((prev) => ({
              ...prev,
              selectedSettlementPhaseId: settlementPhase.id
            }))
          }
        })
        .catch((err: unknown) => {
          console.error('Realtime Settlement Phase Refetch Error:', err)
        })
    },
    onSurvivorChange: () => {
      if (!selectedSettlementId) return

      getSurvivors(selectedSettlementId)
        .then((updatedSurvivors) => {
          setSurvivors(updatedSurvivors ?? [])
        })
        .catch((err: unknown) => {
          console.error('Realtime Survivors Refetch Error:', err)
        })

      if (selectedSurvivorId) {
        getSurvivor(selectedSurvivorId)
          .then((survivor) => {
            setSelectedSurvivorState(survivor)

            if (!survivor) {
              setSelectedSurvivorIdState(null)

              setLocalState((prev) => ({
                ...prev,
                selectedSurvivorId: null
              }))
            }
          })
          .catch((err: unknown) => {
            console.error('Realtime Survivor Refetch Error:', err)
          })
      }
    },
    onCatalogChange: () => {
      if (!selectedSettlementId) return

      // Custom-content catalog row changes (rules text edits, etc.) are
      // materialized into multiple cached views by the DAL projections:
      //   * `selectedSettlement` (knowledges, gear, locations,
      //     milestones, innovations, ...).
      //   * `survivors` + `selectedSurvivor` (disorders, fighting arts,
      //     secret fighting arts, knowledges, neurosis, ability
      //     impairments — embedded via `SURVIVOR_SELECT`).
      //   * `selectedHunt` / `selectedShowdown` monster details (traits,
      //     moods, survivor_status rules embedded via the monster
      //     projections).
      // A single catalog event can touch any of them, so each
      // materialized collection is refreshed in lockstep — refetching
      // `SettlementDetail` alone would leave survivor disorders / hunt
      // monster traits / etc. stale. The 300ms catalog-domain debounce
      // in `useRealtimeSubscriptions` collapses bursts of rules edits
      // into a single dispatch, so this fan-out runs at most once per
      // burst. RLS is what makes the coarse subscription safe: events
      // for catalog rows the user cannot read (i.e. rows not
      // transitively reachable through any settlement they belong to)
      // are never delivered. See `docs/settlement-sharing-architecture.md`
      // §8.2.2 (recommendation B).
      getSettlement(selectedSettlementId)
        .then((settlement) => {
          setSelectedSettlementState(settlement)
        })
        .catch((err: unknown) => {
          console.error('Realtime Catalog Settlement Refetch Error:', err)
        })

      getSurvivors(selectedSettlementId)
        .then((updatedSurvivors) => {
          setSurvivors(updatedSurvivors ?? [])
        })
        .catch((err: unknown) => {
          console.error('Realtime Catalog Survivors Refetch Error:', err)
        })

      if (selectedSurvivorId) {
        getSurvivor(selectedSurvivorId)
          .then((survivor) => {
            setSelectedSurvivorState(survivor)
          })
          .catch((err: unknown) => {
            console.error('Realtime Catalog Survivor Refetch Error:', err)
          })
      }

      getHunt(selectedSettlementId)
        .then((hunt) => {
          setSelectedHuntState(hunt)
        })
        .catch((err: unknown) => {
          console.error('Realtime Catalog Hunt Refetch Error:', err)
        })

      getShowdown(selectedSettlementId)
        .then((showdown) => {
          setSelectedShowdownState(showdown)
        })
        .catch((err: unknown) => {
          console.error('Realtime Catalog Showdown Refetch Error:', err)
        })
    }
  })

  // Fetch the settlement list once authentication is confirmed and again on
  // every share grant / revoke event delivered through the user-level
  // realtime channel below. Wrapped in a callback so the realtime handler
  // can refresh on demand.
  const refetchSettlementList = useCallback(() => {
    getSettlementForUser()
      .then((data) => setSettlementList(data))
      .catch((err: unknown) => {
        console.error('Settlement List Fetch Error:', err)
        sonnerToast.error(ERROR_MESSAGE())
      })
  }, [])

  useEffect(() => {
    let isCancelled = false

    if (!isAuthenticated)
      return () => {
        isCancelled = true
      }

    getSettlementForUser()
      .then((data) => {
        if (isCancelled) return
        setSettlementList(data)
      })
      .catch((err: unknown) => {
        if (isCancelled) return
        console.error('Settlement List Fetch Error:', err)
        sonnerToast.error(ERROR_MESSAGE())
      })
      .finally(() => {
        if (!isCancelled) setIsSettlementListLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [isAuthenticated])

  // Per-user realtime channel listening for inserts / deletes on
  // `settlement_shared_user` where `shared_user_id = userId`. Toasts the
  // recipient on grant / revoke and refreshes the cached settlement list.
  // When the active settlement is the one being revoked, the existing
  // settlement-channel cascade clears all derived state via a fresh
  // `getSettlement` fetch (RLS will return null post-revoke).
  //
  // A short debounce on the refetch coalesces bursts (e.g. an owner mass
  // revoking) into a single list refresh while still firing one toast per
  // event for clarity.
  const shareChangeRefetchTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null)

  const handleShareChange = useCallback(
    (event: ShareChangeEvent) => {
      if (event.event !== 'INSERT') {
        // If the active settlement is the one being revoked, force a
        // fresh fetch so the existing onSettlementChange cascade clears
        // derived state. RLS will return null post-revoke.
        if (event.settlementId === selectedSettlementId) {
          getSettlement(event.settlementId)
            .then((settlement) => {
              if (!settlement) {
                setSelectedSettlementState(null)
                setSelectedSettlementIdState(null)
                setSelectedHuntState(null)
                setSelectedHuntIdState(null)
                setSelectedHuntMonsterIndexState(0)
                setSelectedSettlementPhaseState(null)
                setSelectedSettlementPhaseIdState(null)
                setSelectedShowdownState(null)
                setSelectedShowdownIdState(null)
                setSelectedShowdownMonsterIndexState(0)
                setSelectedSurvivorState(null)
                setSelectedSurvivorIdState(null)
                setSurvivors([])

                setLocalState((prev) => ({
                  ...prev,
                  selectedSettlementId: null,
                  selectedHuntId: null,
                  selectedHuntMonsterIndex: 0,
                  selectedSettlementPhaseId: null,
                  selectedShowdownId: null,
                  selectedShowdownMonsterIndex: 0,
                  selectedSurvivorId: null
                }))
              }
            })
            .catch((err: unknown) => {
              console.error('Revoked Settlement Refetch Error:', err)
            })
        }
      }

      if (shareChangeRefetchTimerRef.current)
        clearTimeout(shareChangeRefetchTimerRef.current)

      shareChangeRefetchTimerRef.current = setTimeout(() => {
        shareChangeRefetchTimerRef.current = null
        refetchSettlementList()
      }, 300)
    },
    [refetchSettlementList, selectedSettlementId]
  )

  useEffect(() => {
    return () => {
      if (shareChangeRefetchTimerRef.current)
        clearTimeout(shareChangeRefetchTimerRef.current)
    }
  }, [])

  /**
   * Handle Subscription Change
   *
   * Re-fetches the cached `user_subscription` row whenever the Stripe
   * webhook commits a change (plan switch, status transition, renewal,
   * pending cancellation, or resume). Without this listener the SPA only
   * picks up new state on re-mount, which races the webhook delivery
   * after a Customer Portal trip. Failures are logged but never reset
   * the cache to `null` — a transient realtime hiccup should leave the
   * prior good state in place rather than collapse the user to free.
   */
  const handleSubscriptionChange = useCallback(() => {
    getUserSubscription()
      .then((subscription) => {
        setUserSubscriptionState(subscription)
      })
      .catch((err: unknown) => {
        console.error('Realtime User Subscription Refetch Error:', err)
      })
  }, [])

  /**
   * Subscribe To Notification Inserts
   *
   * Registers a lightweight listener for notification INSERT events without
   * storing notification churn in the global context value.
   *
   * @param listener Notification Insert Listener
   * @returns Unsubscribe Function
   */
  const subscribeToNotificationInserts = useCallback(
    (listener: NotificationInsertListener) => {
      notificationInsertListenersRef.current.add(listener)

      return () => {
        notificationInsertListenersRef.current.delete(listener)
      }
    },
    []
  )

  /**
   * Handle Notification Insert
   *
   * Coalesces bursty inbox INSERT events before notifying subscribers, keeping
   * the bell fresh without causing one list/count refetch per row.
   */
  const handleNotificationInsert = useCallback(() => {
    if (notificationInsertTimerRef.current)
      clearTimeout(notificationInsertTimerRef.current)

    notificationInsertTimerRef.current = setTimeout(() => {
      notificationInsertTimerRef.current = null

      notificationInsertListenersRef.current.forEach((listener) => {
        listener()
      })
    }, NOTIFICATION_INSERT_COALESCE_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (notificationInsertTimerRef.current)
        clearTimeout(notificationInsertTimerRef.current)
    }
  }, [])

  // Coalesces bursty INSERT / DELETE events on `settlement` (e.g. the
  // seed-data generator dropping a handful of settlements in quick
  // succession) into a single refetch of the cached list. Matches the
  // debounce on `handleShareChange` so the two listeners behave
  // consistently when both fire for the same gesture (creating a
  // settlement and sharing it in one motion is not currently a flow, but
  // future product shapes may combine them).
  const ownedSettlementRefetchTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null)

  /**
   * Handle Owned Settlement Change
   *
   * Re-fetches the cached `settlementList` whenever an owned settlement
   * row is inserted or deleted for the current user. Without this listener
   * the dropdown stays stale until the next full reload, which lets a
   * free-tier user open the "Found a settlement" form even after they
   * have already hit the cap (the count derives from the cached list, and
   * the cap check guards both the dropdown affordance and the embedded
   * create card on the settlements page).
   */
  const handleOwnedSettlementChange = useCallback(() => {
    if (ownedSettlementRefetchTimerRef.current)
      clearTimeout(ownedSettlementRefetchTimerRef.current)

    ownedSettlementRefetchTimerRef.current = setTimeout(() => {
      ownedSettlementRefetchTimerRef.current = null
      refetchSettlementList()
    }, 300)
  }, [refetchSettlementList])

  useEffect(() => {
    return () => {
      if (ownedSettlementRefetchTimerRef.current)
        clearTimeout(ownedSettlementRefetchTimerRef.current)
    }
  }, [])

  useUserRealtimeSubscriptions({
    enabled: isAuthenticated === true,
    userId,
    onShareChange: handleShareChange,
    onSubscriptionChange: handleSubscriptionChange,
    onNotificationInsert: handleNotificationInsert,
    onOwnedSettlementChange: handleOwnedSettlementChange
  })

  /**
   * Fetch Hunt Data
   *
   * Triggered whenever the active settlement changes. The hunt is a per-
   * settlement singleton, so this effect is the single source of truth: it
   * resolves the current hunt for the settlement and reconciles
   * `selectedHuntId` accordingly. Setters that change the hunt selection are
   * pure ID/state mutations and never re-trigger this effect on their own.
   */
  useEffect(() => {
    console.debug('Fetching Hunt Data')

    let isCancelled = false

    if (!isAuthenticated || !selectedSettlementId)
      return () => {
        isCancelled = true
      }

    // Skip-if-fresh: the active hunt for this settlement is already loaded.
    if (selectedHunt && selectedHunt.settlement_id === selectedSettlementId)
      return () => {
        isCancelled = true
      }

    getHunt(selectedSettlementId)
      .then((hunt) => {
        if (isCancelled) return

        console.debug('Hunt Data:', hunt)
        setSelectedHuntState(hunt)
        setSelectedHuntIdState((prev) => {
          const next = hunt?.id ?? null
          if (prev !== next) {
            setLocalState((local) => ({
              ...local,
              selectedHuntId: next,
              selectedHuntMonsterIndex: 0
            }))
            setSelectedHuntMonsterIndexState(0)
          }
          return next
        })
      })
      .catch((err: unknown) => {
        if (isCancelled) return
        console.error('Hunt Fetch Error:', err)

        setSelectedHuntState(null)
        setSelectedHuntIdState(null)
        setSelectedHuntMonsterIndexState(0)

        setLocalState((prev) => ({
          ...prev,
          selectedHuntId: null,
          selectedHuntMonsterIndex: 0
        }))
      })

    return () => {
      isCancelled = true
    }
  }, [isAuthenticated, selectedSettlementId, selectedHunt])

  /**
   * Fetch Settlement Data
   *
   * Triggered whenever the settlement selection changes. Uses a cancellation
   * flag to prevent state updates on unmounted components or when selections
   * change rapidly.
   */
  useEffect(() => {
    console.debug('Fetching Settlement Data')

    let isCancelled = false

    if (!isAuthenticated || !selectedSettlementId)
      return () => {
        isCancelled = true
      }

    // Skip-if-fresh: the settlement is already loaded.
    if (selectedSettlement?.id === selectedSettlementId)
      return () => {
        isCancelled = true
      }

    getSettlement(selectedSettlementId)
      .then((settlement) => {
        if (isCancelled) return

        console.debug('Settlement Data:', settlement)

        setSelectedSettlementState(settlement)

        // Settlement not found — clear all dependent data.
        if (!settlement) {
          setSelectedSettlementIdState(null)
          setSelectedHuntState(null)
          setSelectedHuntIdState(null)
          setSelectedHuntMonsterIndexState(0)
          setSelectedSettlementPhaseState(null)
          setSelectedSettlementPhaseIdState(null)
          setSelectedShowdownState(null)
          setSelectedShowdownIdState(null)
          setSelectedShowdownMonsterIndexState(0)
          setSelectedSurvivorState(null)
          setSelectedSurvivorIdState(null)
          setSurvivors([])

          setLocalState((prev) => ({
            ...prev,
            selectedSettlementId: null,
            selectedHuntId: null,
            selectedHuntMonsterIndex: 0,
            selectedSettlementPhaseId: null,
            selectedShowdownId: null,
            selectedShowdownMonsterIndex: 0,
            selectedSurvivorId: null
          }))
        }
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        console.error('Settlement Fetch Error:', err)

        setSelectedSettlementState(null)
        setSelectedSettlementIdState(null)
        setSelectedHuntState(null)
        setSelectedHuntIdState(null)
        setSelectedHuntMonsterIndexState(0)
        setSelectedSettlementPhaseState(null)
        setSelectedSettlementPhaseIdState(null)
        setSelectedShowdownState(null)
        setSelectedShowdownIdState(null)
        setSelectedShowdownMonsterIndexState(0)
        setSelectedSurvivorState(null)
        setSelectedSurvivorIdState(null)
        setSurvivors([])

        setLocalState((prev) => ({
          ...prev,
          selectedSettlementId: null,
          selectedHuntId: null,
          selectedHuntMonsterIndex: 0,
          selectedSettlementPhaseId: null,
          selectedShowdownId: null,
          selectedShowdownMonsterIndex: 0,
          selectedSurvivorId: null
        }))
      })

    return () => {
      isCancelled = true
    }
  }, [isAuthenticated, selectedSettlementId, selectedSettlement?.id])

  /**
   * Fetch Survivors Data
   *
   * Triggered whenever the settlement selection changes. Uses a cancellation
   * flag to prevent state updates on unmounted components or when selections
   * change rapidly.
   */
  useEffect(() => {
    console.debug('Fetching Survivors Data')

    let isCancelled = false

    if (!isAuthenticated || !selectedSettlementId)
      return () => {
        isCancelled = true
      }

    getSurvivors(selectedSettlementId)
      .then((survivors) => {
        if (isCancelled) return

        console.debug('Survivors Data:', survivors)
        setSurvivors(survivors ?? [])
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        console.error('Survivors Fetch Error:', err)
        setSurvivors([])
      })

    return () => {
      isCancelled = true
    }
  }, [isAuthenticated, selectedSettlementId])

  /**
   * Fetch Settlement Phase Data
   *
   * Triggered whenever the active settlement changes. The settlement phase
   * is a per-settlement singleton, so this effect is the single source of
   * truth: it resolves the current phase for the settlement and reconciles
   * `selectedSettlementPhaseId` accordingly.
   */
  useEffect(() => {
    console.debug('Fetching Settlement Phase Data')

    let isCancelled = false

    if (!isAuthenticated || !selectedSettlementId)
      return () => {
        isCancelled = true
      }

    // Skip-if-fresh: the active phase for this settlement is already loaded.
    if (
      selectedSettlementPhase &&
      selectedSettlementPhase.settlement_id === selectedSettlementId
    )
      return () => {
        isCancelled = true
      }

    getSettlementPhase(selectedSettlementId)
      .then((settlementPhase) => {
        if (isCancelled) return

        console.debug('Settlement Phase Data:', settlementPhase)
        setSelectedSettlementPhaseState(settlementPhase)
        setSelectedSettlementPhaseIdState((prev) => {
          const next = settlementPhase?.id ?? null
          if (prev !== next)
            setLocalState((local) => ({
              ...local,
              selectedSettlementPhaseId: next
            }))
          return next
        })
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        console.error('Settlement Phase Fetch Error:', err)

        setSelectedSettlementPhaseState(null)
        setSelectedSettlementPhaseIdState(null)

        setLocalState((prev) => ({
          ...prev,
          selectedSettlementPhaseId: null
        }))
      })

    return () => {
      isCancelled = true
    }
  }, [isAuthenticated, selectedSettlementId, selectedSettlementPhase])

  /**
   * Fetch Showdown Data
   *
   * Triggered whenever the active settlement changes. The showdown is a per-
   * settlement singleton, so this effect is the single source of truth: it
   * resolves the current showdown for the settlement and reconciles
   * `selectedShowdownId` accordingly.
   */
  useEffect(() => {
    console.debug('Fetching Showdown Data')

    let isCancelled = false

    if (!isAuthenticated || !selectedSettlementId)
      return () => {
        isCancelled = true
      }

    // Skip-if-fresh: the active showdown for this settlement is already loaded.
    if (
      selectedShowdown &&
      selectedShowdown.settlement_id === selectedSettlementId
    )
      return () => {
        isCancelled = true
      }

    getShowdown(selectedSettlementId)
      .then((showdown) => {
        if (isCancelled) return

        console.debug('Showdown Data:', showdown)

        setSelectedShowdownState(showdown)
        setSelectedShowdownIdState((prev) => {
          const next = showdown?.id ?? null
          if (prev !== next) {
            setLocalState((local) => ({
              ...local,
              selectedShowdownId: next,
              selectedShowdownMonsterIndex: 0
            }))
            setSelectedShowdownMonsterIndexState(0)
          }
          return next
        })
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        console.error('Showdown Fetch Error:', err)

        setSelectedShowdownState(null)
        setSelectedShowdownIdState(null)
        setSelectedShowdownMonsterIndexState(0)

        setLocalState((prev) => ({
          ...prev,
          selectedShowdownId: null,
          selectedShowdownMonsterIndex: 0
        }))
      })

    return () => {
      isCancelled = true
    }
  }, [isAuthenticated, selectedSettlementId, selectedShowdown])

  /**
   * Fetch Survivor Data
   *
   * Triggered whenever the settlement or survivor selection changes. Uses a
   * cancellation flag to prevent state updates on unmounted components or when
   * selections change rapidly.
   */
  useEffect(() => {
    console.debug('Fetching Survivor Data')

    let isCancelled = false

    if (!isAuthenticated || !selectedSettlementId || !selectedSurvivorId)
      return () => {
        isCancelled = true
      }

    // Skip-if-fresh: the selected survivor is already loaded.
    if (selectedSurvivor?.id === selectedSurvivorId)
      return () => {
        isCancelled = true
      }

    getSurvivor(selectedSurvivorId)
      .then((survivor) => {
        if (isCancelled) return

        console.debug('Survivor Data:', survivor)

        setSelectedSurvivorState(survivor)

        if (!survivor) {
          setSelectedSurvivorIdState(null)

          setLocalState((prev) => ({
            ...prev,
            selectedSurvivorId: null
          }))
        }
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        console.error('Survivor Fetch Error:', err)

        setSelectedSurvivorState(null)
        setSelectedSurvivorIdState(null)

        setLocalState((prev) => ({
          ...prev,
          selectedSurvivorId: null
        }))
      })

    return () => {
      isCancelled = true
    }
  }, [
    isAuthenticated,
    selectedSettlementId,
    selectedSurvivorId,
    selectedSurvivor?.id
  ])

  /**
   * Fetch User Settings Data
   */
  useEffect(() => {
    console.debug('Fetching User Settings Data')

    let isCancelled = false

    if (!isAuthenticated)
      return () => {
        isCancelled = true
      }

    getUserSettings()
      .then((userSettingsData) => {
        if (isCancelled) return

        console.debug('User Settings:', userSettingsData)

        setUserSettingsState(userSettingsData)
        setIsAdmin(isUserSettingsAdmin(userSettingsData))
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        console.error('User Settings Fetch Error:', err)

        setUserSettingsState(null)
        setIsAdmin(false)
      })

    return () => {
      isCancelled = true
      setIsAdmin(false)
    }
  }, [isAuthenticated])

  /**
   * Fetch User Subscription Data
   *
   * Mirrors the user-settings effect. The cleanup callback clears
   * `userSubscription` whenever `isAuthenticated` transitions (or the
   * provider unmounts) so paid-gating state can never survive a logout or
   * user-switch in memory — `canShare` always falls back to `false` until
   * the next fetch resolves. Failures inside the fetch likewise reset to
   * `null` so a stale `true` cannot leak across an error.
   */
  useEffect(() => {
    console.debug('Fetching User Subscription Data')

    let isCancelled = false

    if (!isAuthenticated)
      return () => {
        isCancelled = true
      }

    getUserSubscription()
      .then((subscription) => {
        if (isCancelled) return

        console.debug('User Subscription:', subscription)

        setUserSubscriptionState(subscription)
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        console.error('User Subscription Fetch Error:', err)

        setUserSubscriptionState(null)
      })

    return () => {
      isCancelled = true
      // Clear the cached subscription on auth-flip (true → false) or
      // unmount. Calling `setState` from the cleanup callback is the
      // documented safe pattern — the synchronous-setState-in-effect-body
      // lint rule targets the initial render path, not teardown.
      setUserSubscriptionState(null)
    }
  }, [isAuthenticated])

  /**
   * Set Selected Hunt
   *
   * @param huntOrUpdater Selected Hunt or functional updater receiving the
   * previous hunt state
   */
  const setSelectedHunt = useCallback<HuntStateSetter>((huntOrUpdater) => {
    // Functional updater form — used for safe optimistic async callbacks
    // that must operate on the latest state instead of a stale closure.
    if (typeof huntOrUpdater === 'function') {
      setSelectedHuntState(huntOrUpdater)
      return
    }

    const hunt = huntOrUpdater

    // When selecting a hunt, stop creation mode.
    if (hunt) setIsCreatingNewHunt(false)

    setSelectedHuntState(hunt)
    setSelectedHuntIdState(hunt ? hunt.id : null)
    setSelectedHuntMonsterIndexState(0)

    setLocalState((local) => ({
      ...local,
      selectedHuntId: hunt ? hunt.id : null,
      selectedHuntMonsterIndex: 0
    }))
  }, [])

  /**
   * Set Selected Hunt ID
   *
   * Pure ID/state mutation. The hunt is a per-settlement singleton, so the
   * fetch effect (keyed on `selectedSettlementId`) is the source of truth for
   * resolving hunt detail. Callers passing a non-null id should already have
   * the matching `HuntDetail` and prefer `setSelectedHunt(detail)`.
   *
   * @param huntId Selected Hunt ID
   */
  const setSelectedHuntId = useCallback((huntId: string | null) => {
    // When selecting a hunt, stop creation mode.
    if (huntId) setIsCreatingNewHunt(false)

    setSelectedHuntIdState(huntId)
    setSelectedHuntMonsterIndexState(0)
    if (!huntId) setSelectedHuntState(null)

    setLocalState((local) => ({
      ...local,
      selectedHuntId: huntId,
      selectedHuntMonsterIndex: 0
    }))
  }, [])

  /**
   * Set Selected Hunt Monster Index
   *
   * @param index Selected Hunt Monster Index
   */
  const setSelectedHuntMonsterIndex = useCallback((index: number) => {
    setSelectedHuntMonsterIndexState(index)
    setLocalState((local) => ({ ...local, selectedHuntMonsterIndex: index }))
  }, [])

  /**
   * Set Selected Settlement
   *
   * Switching to a different settlement clears survivor selection and lets
   * the hunt / phase / showdown discovery effects (keyed on
   * `selectedSettlementId`) re-populate state on the next render. Same-ID
   * updates are optimistic UI mutations and intentionally do NOT trigger
   * any side-effects.
   *
   * @param settlementOrUpdater Selected Settlement or functional updater
   * receiving the previous settlement state
   */
  const setSelectedSettlement = useCallback<SettlementStateSetter>(
    (settlementOrUpdater) => {
      // Functional updater form — used for safe optimistic async callbacks
      // that must operate on the latest state instead of a stale closure.
      if (typeof settlementOrUpdater === 'function') {
        setSelectedSettlementState(settlementOrUpdater)
        return
      }

      const settlement = settlementOrUpdater

      if (settlement) setIsCreatingNewSettlement(false)

      setSelectedSettlementState(settlement)
      setSelectedSettlementIdState((prevId) => {
        const nextId = settlement?.id ?? null
        if (prevId !== nextId) {
          // Settlement actually changed — drop survivor selection so the
          // detail effect doesn't strand a survivor from the previous
          // settlement. Hunt / phase / showdown effects re-discover their
          // values from `selectedSettlementId` automatically.
          setSelectedSurvivorState(null)
          setSelectedSurvivorIdState(null)

          setLocalState((local) => ({
            ...local,
            selectedSettlementId: nextId,
            selectedSurvivorId: null
          }))
        }
        return nextId
      })
    },
    []
  )

  /**
   * Set Selected Settlement ID
   *
   * @param settlementId Selected Settlement ID
   */
  const setSelectedSettlementId = useCallback((settlementId: string | null) => {
    if (settlementId) setIsCreatingNewSettlement(false)

    setSelectedSettlementIdState((prevId) => {
      if (prevId === settlementId) return prevId

      setSelectedSurvivorState(null)
      setSelectedSurvivorIdState(null)
      if (!settlementId) setSelectedSettlementState(null)

      setLocalState((local) => ({
        ...local,
        selectedSettlementId: settlementId,
        selectedSurvivorId: null
      }))
      return settlementId
    })
  }, [])

  /**
   * Set Selected Settlement Phase
   *
   * @param settlementPhase Selected Settlement Phase
   */
  const setSelectedSettlementPhase = useCallback(
    (settlementPhase: SettlementPhaseDetail | null) => {
      setSelectedSettlementPhaseState(settlementPhase)
      setSelectedSettlementPhaseIdState(
        settlementPhase ? settlementPhase.id : null
      )
      setLocalState((local) => ({
        ...local,
        selectedSettlementPhaseId: settlementPhase ? settlementPhase.id : null
      }))
    },
    []
  )

  /**
   * Set Selected Settlement Phase ID
   *
   * @param settlementPhaseId Selected Settlement Phase ID
   */
  const setSelectedSettlementPhaseId = useCallback(
    (settlementPhaseId: string | null) => {
      setSelectedSettlementPhaseIdState(settlementPhaseId)
      if (!settlementPhaseId) setSelectedSettlementPhaseState(null)
      setLocalState((local) => ({
        ...local,
        selectedSettlementPhaseId: settlementPhaseId
      }))
    },
    []
  )

  /**
   * Set Selected Showdown
   *
   * @param showdownOrUpdater Selected Showdown or functional updater receiving
   * the previous showdown state
   */
  const setSelectedShowdown = useCallback<ShowdownStateSetter>(
    (showdownOrUpdater) => {
      // Functional updater form — used for safe optimistic async callbacks
      // that must operate on the latest state instead of a stale closure.
      if (typeof showdownOrUpdater === 'function') {
        setSelectedShowdownState(showdownOrUpdater)
        return
      }

      const showdown = showdownOrUpdater

      if (showdown) setIsCreatingNewShowdown(false)

      setSelectedShowdownState(showdown)
      setSelectedShowdownIdState(showdown ? showdown.id : null)
      setSelectedShowdownMonsterIndexState(0)

      setLocalState((local) => ({
        ...local,
        selectedShowdownId: showdown ? showdown.id : null,
        selectedShowdownMonsterIndex: 0
      }))
    },
    []
  )

  /**
   * Set Selected Showdown ID
   *
   * Pure ID/state mutation. The showdown is a per-settlement singleton, so
   * the fetch effect (keyed on `selectedSettlementId`) is the source of
   * truth for resolving showdown detail.
   *
   * @param showdownId Selected Showdown ID
   */
  const setSelectedShowdownId = useCallback((showdownId: string | null) => {
    if (showdownId) setIsCreatingNewShowdown(false)

    setSelectedShowdownIdState(showdownId)
    setSelectedShowdownMonsterIndexState(0)
    if (!showdownId) setSelectedShowdownState(null)

    setLocalState((local) => ({
      ...local,
      selectedShowdownId: showdownId,
      selectedShowdownMonsterIndex: 0
    }))
  }, [])

  /**
   * Set Selected Showdown Monster Index
   *
   * @param index Selected Showdown Monster Index
   */
  const setSelectedShowdownMonsterIndex = useCallback((index: number) => {
    setSelectedShowdownMonsterIndexState(index)
    setLocalState((local) => ({
      ...local,
      selectedShowdownMonsterIndex: index
    }))
  }, [])

  /**
   * Set Selected Survivor
   *
   * @param survivorOrUpdater Selected Survivor or functional updater receiving
   * the previous survivor state
   */
  const setSelectedSurvivor = useCallback<SurvivorStateSetter>(
    (survivorOrUpdater) => {
      // Functional updater form — used for safe optimistic async callbacks
      // that must operate on the latest state instead of a stale closure.
      if (typeof survivorOrUpdater === 'function') {
        setSelectedSurvivorState(survivorOrUpdater)
        return
      }

      const survivor = survivorOrUpdater

      if (survivor) setIsCreatingNewSurvivor(false)

      setSelectedSurvivorState(survivor)
      setSelectedSurvivorIdState(survivor ? survivor.id : null)
      setLocalState((local) => ({
        ...local,
        selectedSurvivorId: survivor ? survivor.id : null
      }))
    },
    []
  )

  /**
   * Set Selected Survivor ID
   *
   * Pure ID mutation. The survivor fetch effect (keyed on the id) is the
   * source of truth for resolving survivor detail.
   *
   * @param survivorId Selected Survivor ID
   */
  const setSelectedSurvivorId = useCallback((survivorId: string | null) => {
    if (survivorId) setIsCreatingNewSurvivor(false)

    setSelectedSurvivorIdState(survivorId)
    if (!survivorId) setSelectedSurvivorState(null)

    setLocalState((local) => ({ ...local, selectedSurvivorId: survivorId }))
  }, [])

  /**
   * Set Selected Tab
   *
   * @param tab Selected Tab
   */
  const setSelectedTab = useCallback((tab: TabType) => {
    setSelectedTabState(tab)
    setLocalState((local) => ({ ...local, selectedTab: tab }))
  }, [])

  /**
   * Set User Settings
   *
   * @param settings User Settings
   */
  const setUserSettings = useCallback((settings: UserSettingsDetail | null) => {
    setUserSettingsState(settings)
    setIsAdmin(isUserSettingsAdmin(settings))
  }, [])

  /**
   * Set User Subscription
   *
   * @param subscription User Subscription
   */
  const setUserSubscription = useCallback(
    (subscription: UserSubscriptionDetail | null) => {
      setUserSubscriptionState(subscription)
    },
    []
  )

  /**
   * Update Local State
   *
   * @param next Updated Local Data
   */
  const updateLocal = useCallback((next: LocalStateType) => {
    setLocalState(next)
  }, [])

  // Memoize the context value so consumers only re-render when a state piece
  // they actually depend on has changed. All custom setters are stable refs
  // (wrapped in `useCallback` with empty deps), so they never invalidate the
  // memo on their own.
  const value = useMemo<LocalContextType>(
    () => ({
      isAuthenticated,
      isAdmin,
      isCreatingNewHunt,
      isCreatingNewSettlement,
      isCreatingNewShowdown,
      isCreatingNewSurvivor,

      pendingSpecialShowdown,

      selectedHunt,
      selectedHuntId,
      selectedHuntMonsterIndex,
      selectedSettlement,
      selectedSettlementId,
      selectedSettlementPhase,
      selectedSettlementPhaseId,
      selectedShowdown,
      selectedShowdownId,
      selectedShowdownMonsterIndex,
      selectedSurvivor,
      selectedSurvivorId,
      selectedTab,

      setIsCreatingNewHunt,
      setIsCreatingNewSettlement,
      setIsCreatingNewShowdown,
      setIsCreatingNewSurvivor,

      setPendingSpecialShowdown,

      setSelectedHunt,
      setSelectedHuntId,
      setSelectedHuntMonsterIndex,
      setSelectedSettlement,
      setSelectedSettlementId,
      setSelectedSettlementPhase,
      setSelectedSettlementPhaseId,
      setSelectedShowdown,
      setSelectedShowdownId,
      setSelectedShowdownMonsterIndex,
      setSelectedSurvivor,
      setSelectedSurvivorId,
      setSelectedTab,

      setSurvivors,
      survivors,

      local,
      updateLocal,

      userSettings,
      setUserSettings,

      userSubscription,
      setUserSubscription,
      subscribeToNotificationInserts,
      canShare: userSubscription?.can_share === true,
      subscriptionManagementEnabled,

      settlementList,
      isSettlementListLoading
    }),
    [
      isAuthenticated,
      isAdmin,
      isCreatingNewHunt,
      isCreatingNewSettlement,
      isCreatingNewShowdown,
      isCreatingNewSurvivor,
      pendingSpecialShowdown,
      selectedHunt,
      selectedHuntId,
      selectedHuntMonsterIndex,
      selectedSettlement,
      selectedSettlementId,
      selectedSettlementPhase,
      selectedSettlementPhaseId,
      selectedShowdown,
      selectedShowdownId,
      selectedShowdownMonsterIndex,
      selectedSurvivor,
      selectedSurvivorId,
      selectedTab,
      survivors,
      local,
      userSettings,
      userSubscription,
      subscribeToNotificationInserts,
      subscriptionManagementEnabled,
      settlementList,
      isSettlementListLoading,
      setSelectedHunt,
      setSelectedHuntId,
      setSelectedHuntMonsterIndex,
      setSelectedSettlement,
      setSelectedSettlementId,
      setSelectedSettlementPhase,
      setSelectedSettlementPhaseId,
      setSelectedShowdown,
      setSelectedShowdownId,
      setSelectedShowdownMonsterIndex,
      setSelectedSurvivor,
      setSelectedSurvivorId,
      setSelectedTab,
      setUserSettings,
      setUserSubscription,
      updateLocal
    ]
  )

  return <LocalContext.Provider value={value}>{children}</LocalContext.Provider>
}

/**
 * Local Context Hook
 *
 * @returns Local Context Value
 */
export function useLocal(): LocalContextType {
  const context = useContext(LocalContext)

  if (!context)
    throw new Error('Context hook useLocal must be used within a LocalProvider')

  return context
}
