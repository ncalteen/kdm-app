'use client'

import { Button } from '@/components/ui/button'
import { TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Cursed Gear Item Component Properties
 */
export interface CursedGearItemProps {
  /** Gear Name */
  gearName: string
  /** On Remove Handler */
  onRemove: () => void
}

/**
 * Cursed Gear Item Component
 *
 * Displays a single cursed gear item linked to a survivor with its name and a
 * remove button.
 *
 * @param props Cursed Gear Item Component Properties
 * @returns Cursed Gear Item Component
 */
export const CursedGearItem = memo(function CursedGearItem({
  gearName,
  onRemove
}: CursedGearItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      <span className="text-sm ml-1 flex-grow truncate">{gearName}</span>
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={onRemove}
        title="Remove cursed gear">
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  )
})
