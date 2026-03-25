'use client'

import { Button } from '@/components/ui/button'
import { SettlementDetail } from '@/lib/types'
import { TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Philosophy Item Component Properties
 */
export interface PhilosophyItemProps {
  /** Index */
  index: number
  /** On Remove Handler */
  onRemove: (index: number) => void
  /** Philosophy Row */
  philosophy: SettlementDetail['philosophies'][0]
}

/**
 * Philosophy Item Component
 *
 * Displays a single philosophy linked to a settlement with its name and a
 * remove button.
 *
 * @param props Philosophy Item Component Properties
 * @returns Philosophy Item Component
 */
export const PhilosophyItem = memo(function PhilosophyItem({
  index,
  onRemove,
  philosophy
}: PhilosophyItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Philosophy Name */}
      <span className="text-sm ml-1 flex-grow">
        {philosophy.philosophy_name}
      </span>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => onRemove(index)}
        title="Remove philosophy">
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  )
})
