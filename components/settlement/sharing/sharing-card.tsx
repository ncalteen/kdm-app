'use client'

import { CollaboratorsPanel } from '@/components/settlement/sharing/collaborators-panel'
import { ReactElement } from 'react'

/**
 * Sharing Card Properties
 */
/**
 * Sharing Card Component
 *
 * Hosts the "Light another lantern" share-management UI on its own dedicated
 * tab. Mirrors the layout used by other always-accessible tab cards (Help,
 * Settings) — a single vertical stack of `<Card>` blocks with `pt-12` so the
 * header doesn't sit flush against the sticky site header.
 *
 * The tab itself is gated upstream (sidebar entry + settlement-card branch)
 * to development builds only until the subscription / entitlement plumbing
 * from `docs/settlement-sharing-architecture.md` §9 lands. Once paid gating
 * exists, the gate moves from `NODE_ENV` to a `user_can_share()` check.
 *
 * The active settlement is read from `useLocal()` inside
 * {@link CollaboratorsPanel}, so this card no longer needs to plumb it
 * through props (single source of truth — see panel docs).
 *
 * @returns Sharing Card Component
 */
export function SharingCard(): ReactElement {
  return (
    <div className="flex flex-col gap-4 px-2">
      <CollaboratorsPanel />
    </div>
  )
}
