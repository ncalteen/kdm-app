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
import { PatternDetail, SettlementDetail } from '@/lib/types'
import { CheckIcon, TrashIcon, XIcon } from 'lucide-react'
import { memo, ReactElement, useState } from 'react'

/** Settlement pattern row from SettlementDetail */
type PatternRow = SettlementDetail['patterns'][0]

/**
 * Pattern Item Component Properties
 */
export interface PatternItemProps {
  /** Index */
  index: number
  /** Pattern Row */
  pattern: PatternRow
  /** On Remove Handler */
  onRemove: (index: number) => void
}

/**
 * New Pattern Item Component Properties
 */
export interface NewPatternItemProps {
  /** Available Patterns */
  availablePatterns: PatternDetail[]
  /** On Cancel Handler */
  onCancel: () => void
  /** On Save Handler */
  onSave: (patternId: string | undefined) => void
}

/**
 * Pattern Item Component
 *
 * Displays a single pattern linked to a settlement with its name and a remove
 * button.
 *
 * @param props Pattern Item Component Properties
 * @returns Pattern Item Component
 */
export const PatternItem = memo(function PatternItem({
  index,
  pattern,
  onRemove
}: PatternItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Pattern Name */}
      <Label className="text-sm truncate ml-1">{pattern.pattern_name}</Label>

      {/* Remove Button */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          title="Remove pattern">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

/**
 * New Pattern Item Component
 *
 * Renders a select dropdown for choosing a pattern to add to the settlement.
 *
 * @param props New Pattern Item Component Properties
 * @returns New Pattern Item Component
 */
export const NewPatternItem = memo(function NewPatternItem({
  availablePatterns,
  onCancel,
  onSave
}: NewPatternItemProps): ReactElement {
  const [selectedPatternId, setSelectedPatternId] = useState<
    string | undefined
  >(undefined)

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Pattern Selector */}
      <Select
        value={selectedPatternId}
        onValueChange={(value) => setSelectedPatternId(value)}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select pattern" />
        </SelectTrigger>
        <SelectContent>
          {availablePatterns.map((pattern) => (
            <SelectItem key={pattern.id} value={pattern.id}>
              {pattern.pattern_name}
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
          onClick={() => onSave(selectedPatternId)}
          title="Save pattern">
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
