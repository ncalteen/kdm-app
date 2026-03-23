'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SeedPatternDetail, SettlementDetail } from '@/lib/types'
import { CheckIcon, TrashIcon, XIcon } from 'lucide-react'
import { memo, ReactElement, useState } from 'react'

/** Settlement seed pattern row from SettlementDetail */
type SeedPatternRow = SettlementDetail['seed_patterns'][0]

/**
 * Seed Pattern Item Component Properties
 */
export interface SeedPatternItemProps {
  /** Index */
  index: number
  /** Seed Pattern Row */
  seedPattern: SeedPatternRow
  /** On Remove Handler */
  onRemove: (index: number) => void
}

/**
 * New Seed Pattern Item Component Properties
 */
export interface NewSeedPatternItemProps {
  /** Available Seed Patterns */
  availableSeedPatterns: SeedPatternDetail[]
  /** On Cancel Handler */
  onCancel: () => void
  /** On Save Handler */
  onSave: (seedPatternId: string | undefined) => void
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

/**
 * New Seed Pattern Item Component
 *
 * Renders a select dropdown for choosing a seed pattern to add to the
 * settlement.
 *
 * @param props New Seed Pattern Item Component Properties
 * @returns New Seed Pattern Item Component
 */
export const NewSeedPatternItem = memo(function NewSeedPatternItem({
  availableSeedPatterns,
  onCancel,
  onSave
}: NewSeedPatternItemProps): ReactElement {
  const [selectedSeedPatternId, setSelectedSeedPatternId] = useState<
    string | undefined
  >(undefined)

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Seed Pattern Selector */}
      <Select
        value={selectedSeedPatternId}
        onValueChange={(value) => setSelectedSeedPatternId(value)}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select seed pattern" />
        </SelectTrigger>
        <SelectContent>
          {availableSeedPatterns.map((seedPattern) => (
            <SelectItem key={seedPattern.id} value={seedPattern.id}>
              {seedPattern.seed_pattern_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Interaction Buttons */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onSave(selectedSeedPatternId)}
          title="Save seed pattern">
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          title="Cancel">
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
