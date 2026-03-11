'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { NemesisDefeatedField } from '@/lib/dal/settlement-nemesis'
import { CheckIcon, TrashIcon, XIcon } from 'lucide-react'
import { memo, ReactElement, useState } from 'react'

/**
 * Nemesis Item Properties
 */
export interface NemesisItemProps {
  /** Index */
  index: number
  /** Monster Name */
  monsterName: string
  /** Whether the Nemesis is Unlocked */
  unlocked: boolean
  /** Level 1 Defeated */
  level1Defeated: boolean
  /** Level 2 Defeated */
  level2Defeated: boolean
  /** Level 3 Defeated */
  level3Defeated: boolean
  /** Level 4 Defeated */
  level4Defeated: boolean
  /** Available Level Numbers (determines which level checkboxes to show) */
  availableLevels: number[]
  /** On Remove Handler */
  onRemove: (index: number) => void
  /** On Toggle Unlocked Handler */
  onToggleUnlocked: (index: number, unlocked: boolean) => void
  /** On Toggle Level Defeated Handler */
  onToggleLevel: (
    index: number,
    field: NemesisDefeatedField,
    defeated: boolean
  ) => void
}

/**
 * New Nemesis Item Component Properties
 */
export interface NewNemesisItemProps {
  /** Available Nemeses */
  availableNemeses: { id: string; monster_name: string }[]
  /** On Cancel Handler */
  onCancel: () => void
  /** On Save Handler */
  onSave: (nemesisId: string | undefined) => void
}

/**
 * Level Config
 *
 * Maps level numbers to their defeated field name and display label.
 */
const LEVEL_CONFIG: {
  level: number
  field: NemesisDefeatedField
  label: string
}[] = [
  { level: 1, field: 'level_1_defeated', label: 'L1' },
  { level: 2, field: 'level_2_defeated', label: 'L2' },
  { level: 3, field: 'level_3_defeated', label: 'L3' },
  { level: 4, field: 'level_4_defeated', label: 'L4' }
]

/**
 * Nemesis Item Component
 *
 * Displays a single nemesis linked to a settlement with its unlocked state,
 * name, available level defeated checkboxes, and a remove button.
 *
 * @param props Nemesis Item Component Properties
 * @returns Nemesis Item Component
 */
export const NemesisItem = memo(function NemesisItem({
  index,
  monsterName,
  unlocked,
  level1Defeated,
  level2Defeated,
  level3Defeated,
  level4Defeated,
  availableLevels,
  onRemove,
  onToggleUnlocked,
  onToggleLevel
}: NemesisItemProps): ReactElement {
  // Map level numbers to their current defeated state for easy lookup.
  const defeatedState: Record<number, boolean> = {
    1: level1Defeated,
    2: level2Defeated,
    3: level3Defeated,
    4: level4Defeated
  }

  // Determine the maximum possible level (1-4) so we can reserve consistent
  // space for level checkboxes even when some are hidden.
  const availableSet = new Set(availableLevels)

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Unlocked Checkbox */}
      <Checkbox
        id={`nemesis-unlocked-${index}`}
        name={`nemesis-unlocked-${index}`}
        checked={unlocked}
        onCheckedChange={(checked) => onToggleUnlocked(index, !!checked)}
      />

      {/* Nemesis Name */}
      <Label
        className="text-sm truncate ml-1"
        htmlFor={`nemesis-unlocked-${index}`}>
        {monsterName}
      </Label>

      {/* Level Checkboxes and Remove Button */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        {/* Level Defeated Checkboxes */}
        <div className="flex items-center gap-2">
          {LEVEL_CONFIG.map(({ level, field, label }) => (
            <div
              key={level}
              className="flex items-center space-x-1"
              style={{
                visibility: availableSet.has(level) ? 'visible' : 'hidden'
              }}>
              <Checkbox
                id={`nemesis-${index}-${field}`}
                name={`nemesis-${index}-${field}`}
                checked={defeatedState[level]}
                onCheckedChange={(checked) =>
                  onToggleLevel(index, field, !!checked)
                }
                disabled={!availableSet.has(level)}
              />
              <Label className="text-xs" htmlFor={`nemesis-${index}-${field}`}>
                {label}
              </Label>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          title="Remove nemesis">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

/**
 * New Nemesis Item Component
 *
 * Renders a select dropdown for choosing a nemesis to add to the settlement.
 *
 * @param props New Nemesis Item Component Properties
 * @returns New Nemesis Item Component
 */
export const NewNemesisItem = memo(function NewNemesisItem({
  availableNemeses,
  onCancel,
  onSave
}: NewNemesisItemProps): ReactElement {
  const [selectedNemesisId, setSelectedNemesisId] = useState<
    string | undefined
  >(undefined)

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Unlocked Checkbox (disabled for new items) */}
      <Checkbox
        checked={false}
        disabled={true}
        id="nemesis-new-unlocked"
        name="nemesis-new-unlocked"
      />

      {/* Nemesis Selector */}
      <Select
        value={selectedNemesisId}
        onValueChange={(value) => setSelectedNemesisId(value)}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select nemesis" />
        </SelectTrigger>
        <SelectContent>
          {availableNemeses.map((nemesis) => (
            <SelectItem key={nemesis.id} value={nemesis.id}>
              {nemesis.monster_name}
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
          onClick={() => onSave(selectedNemesisId)}
          title="Save nemesis">
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
