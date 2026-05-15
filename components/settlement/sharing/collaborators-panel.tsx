'use client'

import { OwnerOnly } from '@/components/generic/owner-only'
import { UserAvatar } from '@/components/generic/user-avatar'
import { UnshareBlockersDialog } from '@/components/settlement/sharing/unshare-blockers-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LocalStateType, useLocal } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import {
  addSettlementSharedUsers,
  getSettlementSharedUsers,
  getUnshareBlockers,
  removeSettlementSharedUsers,
  SettlementCollaboratorDetail,
  UnshareBlockerDetail
} from '@/lib/dal/settlement-shared-user'
import {
  getUserId,
  lookupUserByUsername,
  USERNAME_PATTERN
} from '@/lib/dal/user'
import {
  ERROR_MESSAGE,
  SETTLEMENT_SHARE_ALREADY_SHARED_MESSAGE,
  SETTLEMENT_SHARE_INVITE_SUCCESS_MESSAGE,
  SETTLEMENT_SHARE_REVOKE_BLOCKED_MESSAGE,
  SETTLEMENT_SHARE_REVOKE_SUCCESS_MESSAGE,
  SETTLEMENT_SHARE_SELF_INVITE_MESSAGE,
  SETTLEMENT_SHARE_USERNAME_NOT_FOUND_MESSAGE,
  USERNAME_INVALID_FORMAT_MESSAGE
} from '@/lib/messages'
import { SettlementDetail } from '@/lib/types'
import { formatJoinedTimeAgo } from '@/lib/utils'
import { Loader2, UserPlusIcon, XIcon } from 'lucide-react'
import {
  FormEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState
} from 'react'

/**
 * Collaborators Panel Properties
 */
interface CollaboratorsPanelProps {
  /** Local State (used to gate optional toasts) */
  local: LocalStateType
}

/**
 * Collaborators Panel Component
 *
 * "Light another lantern" share-management UI. Lets the owner of the active
 * settlement invite another user by exact username, see the current list of
 * shared users, and revoke a share. Hidden entirely from collaborators via
 * the {@link OwnerOnly} wrapper so a non-owner never even sees the affordance.
 *
 * `selectedSettlement` is intentionally read from `useLocal()` rather than
 * accepted as a prop. Both `OwnerOnly` and the data-fetching effect must
 * agree on which settlement is active; sourcing one through context and the
 * other through props left room for the gate and the data to disagree
 * (e.g., a stale prop after a settlement switch).
 *
 * Anti-enumeration contract:
 *   - Username field is plain text only — no typeahead, no autocomplete.
 *     Per `docs/settlement-sharing-architecture.md` §11 Q9 the lookup is exact
 *     match only and rate-limited to 30/min by the `lookup_user_by_username`
 *     RPC (see #146). The "no such user" toast intentionally collapses both
 *     "actually missing" and "rate-limited" cases so the caller cannot
 *     fingerprint registered handles.
 *
 * Wired to the realtime share-channel (see contexts/local-context.tsx) by
 * way of the existing settlement-list refetch: when the owner invites or
 * revokes, the corresponding INSERT/DELETE on `settlement_shared_user` is
 * picked up by every recipient's per-user channel; the local list refresh
 * here is only needed to update the owner's own view.
 *
 * @param props Collaborators Panel Properties
 * @returns Collaborators Panel Component (or null when the caller is not
 *   the settlement owner)
 */
export function CollaboratorsPanel({
  local
}: CollaboratorsPanelProps): ReactElement | null {
  const { selectedSettlement } = useLocal()

  return (
    <OwnerOnly>
      {selectedSettlement ? (
        <CollaboratorsPanelContent
          local={local}
          selectedSettlement={selectedSettlement}
        />
      ) : null}
    </OwnerOnly>
  )
}

/**
 * Collaborators Panel Content Properties
 *
 * Owner-only inner component. Split from the wrapper so the data-fetching
 * effect inside {@link CollaboratorsPanelContent} only mounts when the
 * panel is actually visible (the `OwnerOnly` wrapper short-circuits for
 * collaborators).
 */
interface CollaboratorsPanelContentProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement (guaranteed non-null here) */
  selectedSettlement: SettlementDetail
}

/**
 * Collaborators Panel Content Component
 *
 * @param props Collaborators Panel Content Properties
 * @returns Owner-Only Share Management Panel
 */
function CollaboratorsPanelContent({
  local,
  selectedSettlement
}: CollaboratorsPanelContentProps): ReactElement {
  const { toast } = useToast(local)
  const [collaborators, setCollaborators] = useState<
    SettlementCollaboratorDetail[]
  >([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [username, setUsername] = useState<string>('')
  const [isInviting, setIsInviting] = useState<boolean>(false)
  // Tracking a Set of pending revoke IDs (rather than a single id) lets us
  // correctly disable just the rows that have a request in flight while
  // still rejecting concurrent clicks on a single row. The owner can fan
  // out multiple revokes safely without one rollback clobbering another.
  const [revokingUserIds, setRevokingUserIds] = useState<Set<string>>(
    () => new Set()
  )

  // Unshare-blockers dialog state. The dialog is opened by `handleRevoke`
  // when the pre-flight `get_unshare_blockers` RPC returns a non-empty
  // list; closing it returns to the panel without revoking. The username
  // is captured at click-time so the dialog header still reads correctly
  // if the collaborators list is concurrently mutated by realtime.
  const [blockersDialog, setBlockersDialog] = useState<{
    open: boolean
    username: string
    blockers: UnshareBlockerDetail[]
  }>({ open: false, username: '', blockers: [] })

  const settlementId = selectedSettlement.id

  /**
   * Refresh Collaborators
   *
   * Re-fetches the full collaborator list. Called on mount and after every
   * successful invite / revoke so the panel reflects the latest state.
   */
  const refresh = useCallback(async () => {
    try {
      const data = await getSettlementSharedUsers(settlementId)
      setCollaborators(data)
    } catch (err) {
      console.error('Settlement Collaborators Fetch Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [settlementId, toast])

  useEffect(() => {
    setIsLoading(true)
    void refresh()
  }, [refresh])

  /**
   * Handle Invite Form Submission
   *
   * Looks up the typed username via the rate-limited `lookup_user_by_username`
   * RPC, refuses self-invites, optimistically appends the new collaborator
   * row, then persists the share. Rolls back on failure.
   *
   * @param e Form Event
   */
  const handleInvite = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      const trimmed = username.trim()
      if (trimmed.length === 0) return

      if (!USERNAME_PATTERN.test(trimmed)) {
        toast.error(USERNAME_INVALID_FORMAT_MESSAGE())
        return
      }

      setIsInviting(true)

      try {
        const ownerId = await getUserId()
        const targetUserId = await lookupUserByUsername(trimmed)

        // Both "not found" and "rate limited" come back as null from the
        // RPC — the toast deliberately does not distinguish them so the
        // caller cannot enumerate registered handles by burst-probing.
        if (!targetUserId) {
          toast.error(SETTLEMENT_SHARE_USERNAME_NOT_FOUND_MESSAGE())
          return
        }

        if (targetUserId === ownerId) {
          toast.error(SETTLEMENT_SHARE_SELF_INVITE_MESSAGE())
          return
        }

        if (collaborators.some((c) => c.shared_user_id === targetUserId)) {
          toast.error(SETTLEMENT_SHARE_ALREADY_SHARED_MESSAGE())
          return
        }

        // Optimistic insert. The real `created_at` comes from the server;
        // an optimistic `now()` is close enough for the "Joined: just now"
        // label and is reconciled by the post-success refresh below.
        const optimistic: SettlementCollaboratorDetail = {
          shared_user_id: targetUserId,
          username: trimmed,
          avatar_url: null,
          created_at: new Date().toISOString()
        }
        setCollaborators((prev) => [...prev, optimistic])

        try {
          await addSettlementSharedUsers(settlementId, [targetUserId], ownerId)
        } catch (err) {
          // Rollback the optimistic insert before surfacing the error so
          // the next render reflects truth.
          setCollaborators((prev) =>
            prev.filter((c) => c.shared_user_id !== targetUserId)
          )
          throw err
        }

        toast.success(SETTLEMENT_SHARE_INVITE_SUCCESS_MESSAGE())
        setUsername('')

        // Reconcile against the server: pulls the canonical row including
        // the real avatar_url and created_at.
        await refresh()
      } catch (err) {
        console.error('Settlement Share Invite Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setIsInviting(false)
      }
    },
    [collaborators, refresh, settlementId, toast, username]
  )

  /**
   * Handle Revoke Click
   *
   * Calls `get_unshare_blockers` first; if the soon-to-be-revoked
   * collaborator authored custom catalog rows still attached to the
   * settlement, opens the blockers dialog and aborts the revoke (per
   * plan decision **D8** — hard-error, not auto-cascade). Otherwise
   * optimistically removes the collaborator from the list and persists
   * the revoke.
   *
   * On failure of the underlying delete we re-fetch via `refresh()`
   * rather than restoring a snapshot of the prior list. A snapshot
   * rollback would clobber any concurrent invite/revoke (or realtime
   * update) that landed while the request was in flight; re-fetching
   * gets the canonical state from the server and is safe to interleave
   * with other pending mutations.
   *
   * The blockers fetch itself is treated as a hard error — surfacing
   * a generic toast and skipping the revoke — because letting the
   * revoke proceed without verifying blockers would silently produce
   * dead attachments and is exactly the failure mode this RPC exists
   * to prevent.
   *
   * @param sharedUserId Shared User ID
   */
  const handleRevoke = useCallback(
    async (sharedUserId: string) => {
      // Reject double-clicks on a single row without preventing other
      // rows from also being revoked concurrently.
      if (revokingUserIds.has(sharedUserId)) return

      setRevokingUserIds((prev) => {
        const next = new Set(prev)
        next.add(sharedUserId)
        return next
      })

      try {
        // Pre-flight check: any custom catalog rows authored by this
        // collaborator still attached to the settlement?
        const blockers = await getUnshareBlockers(settlementId, sharedUserId)

        if (blockers.length > 0) {
          // Snapshot the username at click-time. If the collaborators
          // list mutates while the dialog is open, the header still
          // reads correctly.
          const target = collaborators.find(
            (c) => c.shared_user_id === sharedUserId
          )
          setBlockersDialog({
            open: true,
            username: target?.username ?? '',
            blockers
          })
          // Hard-block per D8: surface a coherent toast alongside the
          // dialog so users with reduced motion / off-screen dialogs
          // still get the why.
          toast.error(SETTLEMENT_SHARE_REVOKE_BLOCKED_MESSAGE())
          return
        }

        // Optimistic remove via functional update so the change composes
        // cleanly with any other in-flight optimistic updates.
        setCollaborators((prev) =>
          prev.filter((c) => c.shared_user_id !== sharedUserId)
        )

        try {
          await removeSettlementSharedUsers(settlementId, [sharedUserId])
          toast.success(SETTLEMENT_SHARE_REVOKE_SUCCESS_MESSAGE())
        } catch (err) {
          console.error('Settlement Share Revoke Error:', err)
          toast.error(ERROR_MESSAGE())
          // Re-sync from the server instead of restoring a snapshot —
          // see function-level comment.
          await refresh()
        }
      } catch (err) {
        console.error('Settlement Share Unshare Blockers Error:', err)
        toast.error(ERROR_MESSAGE())
      } finally {
        setRevokingUserIds((prev) => {
          const next = new Set(prev)
          next.delete(sharedUserId)
          return next
        })
      }
    },
    [collaborators, refresh, revokingUserIds, settlementId, toast]
  )

  const trimmedUsername = username.trim()
  const submitDisabled =
    isInviting ||
    trimmedUsername.length === 0 ||
    !USERNAME_PATTERN.test(trimmedUsername)

  return (
    <Card className="p-0">
      <CardHeader className="px-4 pt-3 pb-0">
        <CardTitle className="text-lg">Light another lantern</CardTitle>
        <CardDescription className="text-sm">
          Invite a survivor to share this settlement.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-3 space-y-4">
        <form onSubmit={handleInvite}>
          <div className="grid gap-2">
            <Label htmlFor="invite-username" className="sr-only">
              Username
            </Label>
            <div className="flex gap-2">
              <Input
                id="invite-username"
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="Username…"
                pattern="[a-zA-Z0-9_]{3,20}"
                minLength={3}
                maxLength={20}
                disabled={isInviting}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Button type="submit" disabled={submitDisabled}>
                {isInviting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                )}
                Invite
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-2">
          <div className="text-sm font-medium">Lanterns shared with</div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Gathering the watch…
            </div>
          ) : collaborators.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No one keeps watch with you yet. Invite a survivor above.
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-md border">
              {collaborators.map((c) => (
                <li
                  key={c.shared_user_id}
                  className="flex items-center justify-between px-3 py-2 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      avatarUrl={c.avatar_url}
                      username={c.username}
                      userId={c.shared_user_id}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm truncate">
                        @{c.username || 'unknown'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Joined: {formatJoinedTimeAgo(c.created_at)}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Revoke share with @${c.username || 'this collaborator'}`}
                    disabled={revokingUserIds.has(c.shared_user_id)}
                    onClick={() => handleRevoke(c.shared_user_id)}>
                    {revokingUserIds.has(c.shared_user_id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XIcon className="h-4 w-4" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      <UnshareBlockersDialog
        open={blockersDialog.open}
        onOpenChange={(open) =>
          setBlockersDialog((prev) => ({ ...prev, open }))
        }
        username={blockersDialog.username}
        blockers={blockersDialog.blockers}
      />
    </Card>
  )
}
