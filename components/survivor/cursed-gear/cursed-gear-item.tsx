'use client'

import { AuthoredByChip } from '@/components/generic/authored-by-chip'
import { CustomGearRulesTrigger } from '@/components/custom/custom-rules-sheet'
import { Button } from '@/components/ui/button'
import { TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Cursed Gear Item Component Properties
 */
export interface CursedGearItemProps {
  /** Whether the underlying gear is user-defined */
  custom: boolean | null | undefined
  /** Gear ID */
  gearId: string
  /** Gear Name */
  gearName: string
  /** On Remove Handler */
  onRemove: () => void
  /** Author User ID (null for built-ins; powers E2.9 authored-by chip) */
  authorUserId?: string | null
  /** Author Username (null for built-ins / ghost authors) */
  authorUsername?: string | null
  /** Author Avatar URL (null for built-ins / no avatar) */
  authorAvatarUrl?: string | null
}

/**
 * Cursed Gear Item Component
 *
 * Displays a single cursed gear item linked to a survivor with its name and a
 * remove button. When the gear is custom, the name becomes a clickable
 * trigger that opens a sheet displaying the gear's rules.
 *
 * @param props Cursed Gear Item Component Properties
 * @returns Cursed Gear Item Component
 */
export const CursedGearItem = memo(function CursedGearItem({
  custom,
  gearId,
  gearName,
  onRemove,
  authorUserId = null,
  authorUsername = null,
  authorAvatarUrl = null
}: CursedGearItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      <CustomGearRulesTrigger
        className="ml-1 grow truncate"
        custom={custom}
        gearId={gearId}
        gearName={gearName}
        showCustomBadge
      />
      <AuthoredByChip
        authorUserId={authorUserId}
        authorUsername={authorUsername}
        authorAvatarUrl={authorAvatarUrl}
      />
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={onRemove}
        aria-label="Remove cursed gear"
        title="Remove cursed gear">
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  )
})
