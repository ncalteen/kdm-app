'use client'

import { CollaboratorsPanel } from '@/components/settlement/sharing/collaborators-panel'
import { LocalStateType } from '@/contexts/local-context'
import { SettlementDetail } from '@/lib/types'
import { ReactElement } from 'react'

/**
 * Sharing Card Properties
 */
interface SharingCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement (panel is hidden when null or not owner) */
  selectedSettlement: SettlementDetail | null
}

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
 * from `local/sharing-architecture.md` §9 lands. Once paid gating exists,
 * the gate moves from `NODE_ENV` to a `user_can_share()` check.
 *
 * @param props Sharing Card Properties
 * @returns Sharing Card Component
 */
export function SharingCard({
  local,
  selectedSettlement
}: SharingCardProps): ReactElement {
  return (
    <div className="flex flex-col gap-4 pt-12 px-2">
      <CollaboratorsPanel
        local={local}
        selectedSettlement={selectedSettlement}
      />
    </div>
  )
}
