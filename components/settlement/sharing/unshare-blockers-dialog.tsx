'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { UnshareBlockerDetail } from '@/lib/dal/settlement-shared-user'
import { SETTLEMENT_SHARE_REVOKE_BLOCKED_MESSAGE } from '@/lib/messages'
import { ReactElement, useMemo } from 'react'

/**
 * Kind Label Map
 *
 * Pretty-prints the snake_case `kind` strings emitted by the
 * `get_unshare_blockers` RPC for the dialog's group headers. The keys
 * mirror the catalog table names; missing keys fall back to a
 * Title Case fallback derived from the kind itself so a future RPC
 * branch shipping ahead of a UI update does not crash the dialog.
 */
const KIND_LABEL_MAP: Record<string, string> = {
  knowledge: 'Knowledge',
  philosophy: 'Philosophies',
  gear: 'Gear',
  innovation: 'Innovations',
  pattern: 'Patterns',
  seed_pattern: 'Seed Patterns',
  collective_cognition_reward: 'Collective Cognition Rewards',
  location: 'Locations',
  milestone: 'Milestones',
  principle: 'Principles',
  resource: 'Resources',
  quarry: 'Quarries',
  nemesis: 'Nemeses'
}

/**
 * Format Kind Label
 *
 * @param kind Catalog Kind (snake_case)
 * @returns Display Label
 */
function formatKindLabel(kind: string): string {
  return (
    KIND_LABEL_MAP[kind] ??
    kind
      .split('_')
      .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
      .join(' ')
  )
}

/**
 * Unshare Blockers Dialog Properties
 */
interface UnshareBlockersDialogProps {
  /** Dialog Open State */
  open: boolean
  /** Dialog Open/Close Callback */
  onOpenChange: (open: boolean) => void
  /**
   * Username being revoked
   *
   * Rendered inside the lead copy so the owner is clear which collaborator
   * is being kept connected by the listed items.
   */
  username: string
  /** Blockers Returned by `get_unshare_blockers` */
  blockers: UnshareBlockerDetail[]
}

/**
 * Unshare Blockers Dialog Component
 *
 * Surfaces the result of `get_unshare_blockers` to the settlement owner
 * when they attempt to revoke a collaborator who has authored custom
 * catalog rows still attached to the settlement. Closing the dialog
 * returns to the share panel without revoking — per plan decision **D8**
 * the unshare is hard-blocked, not auto-cascaded, so the owner must go
 * detach each row from its respective settings tab and retry.
 *
 * The dialog only renders blocker groups for kinds that actually have
 * entries; empty kinds are filtered out so the list stays tight even as
 * the RPC's union grows in Phase 2.
 *
 * @param props Unshare Blockers Dialog Properties
 * @returns Unshare Blockers Dialog Component
 */
export function UnshareBlockersDialog({
  open,
  onOpenChange,
  username,
  blockers
}: UnshareBlockersDialogProps): ReactElement {
  // Group blockers by `kind`, preserving the RPC's order within each
  // group (the SQL uses `order by kind asc, item_name asc`, so the
  // first time we see a kind is also where it should appear in the
  // dialog).
  const grouped = useMemo(() => {
    const map = new Map<string, UnshareBlockerDetail[]>()
    for (const blocker of blockers) {
      const list = map.get(blocker.kind) ?? []
      list.push(blocker)
      map.set(blocker.kind, list)
    }
    return Array.from(map.entries())
  }, [blockers])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{SETTLEMENT_SHARE_REVOKE_BLOCKED_MESSAGE()}</DialogTitle>
          <DialogDescription>
            @{username || 'this collaborator'} authored the following items
            attached to your settlement. Remove them from the settlement before
            revoking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {grouped.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No items remain attached.
            </div>
          ) : (
            grouped.map(([kind, items]) => (
              <section key={kind} className="space-y-1">
                <div className="text-sm font-medium">
                  {formatKindLabel(kind)}
                </div>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-0.5">
                  {items.map((item) => (
                    <li key={item.itemId}>{item.itemName}</li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
