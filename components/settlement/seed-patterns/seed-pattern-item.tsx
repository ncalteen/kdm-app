'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SettlementDetail } from '@/lib/types'
import { TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Seed Pattern Item Component Properties
 */
export interface SeedPatternItemProps {
  /** Index */
  index: number
  /** Seed Pattern Row */
  seedPattern: SettlementDetail['seed_patterns'][0]
  /** On Remove Handler */
  onRemove: (index: number) => void
}

/**
 * Seed Pattern Item Component
 *
 * Displays a single seed pattern linked to a settlement with its name and a
 * remove button.
 *
 * @param props Seed Pattern Item Component Properties
 * @returns Seed Pattern Item Component
 */
export const SeedPatternItem = memo(function SeedPatternItem({
  index,
  seedPattern,
  onRemove
}: SeedPatternItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Seed Pattern Name */}
      <Label className="text-sm truncate ml-1">
        {seedPattern.seed_pattern_name}
      </Label>

      {/* Remove Button */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          title="Remove seed pattern">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
