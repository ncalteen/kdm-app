'use client'

import { AuthoredByChip } from '@/components/generic/authored-by-chip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Nemesis Item Properties
 */
export interface NemesisItemProps {
  /** Settlement Nemesis ID */
  id: string
  /** Whether the underlying nemesis is user-defined */
  custom?: boolean | null
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
  onRemove: (id: string) => void
  /** On Toggle Unlocked Handler */
  onToggleUnlocked: (id: string, unlocked: boolean) => void
  /** On Toggle Level Defeated Handler */
  onToggleLevel: (
    id: string,
    field:
      | 'level_1_defeated'
      | 'level_2_defeated'
      | 'level_3_defeated'
      | 'level_4_defeated',
    defeated: boolean
  ) => void
  /** Author User ID (null for built-ins; powers E2.9 authored-by chip) */
  authorUserId?: string | null
  /** Author Username (null for built-ins / ghost authors) */
  authorUsername?: string | null
  /** Author Avatar URL (null for built-ins / no avatar) */
  authorAvatarUrl?: string | null
}

/**
 * Level Config
 *
 * Maps level numbers to their defeated field name and display label.
 */
const LEVEL_CONFIG: {
  level: number
  field:
    | 'level_1_defeated'
    | 'level_2_defeated'
    | 'level_3_defeated'
    | 'level_4_defeated'
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
  id,
  custom,
  monsterName,
  unlocked,
  level1Defeated,
  level2Defeated,
  level3Defeated,
  level4Defeated,
  availableLevels,
  onRemove,
  onToggleUnlocked,
  onToggleLevel,
  authorUserId = null,
  authorUsername = null,
  authorAvatarUrl = null
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
        id={`nemesis-unlocked-${id}`}
        name={`nemesis-unlocked-${id}`}
        checked={unlocked}
        onCheckedChange={(checked) => onToggleUnlocked(id, !!checked)}
      />

      {/* Nemesis Name */}
      <Label
        className="text-sm truncate ml-1"
        htmlFor={`nemesis-unlocked-${id}`}>
        {monsterName}
      </Label>

      {custom && (
        <Badge variant="outline" className="text-xs shrink-0">
          Custom
        </Badge>
      )}

      <AuthoredByChip
        authorUserId={authorUserId}
        authorUsername={authorUsername}
        authorAvatarUrl={authorAvatarUrl}
      />

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
                id={`nemesis-${id}-${field}`}
                name={`nemesis-${id}-${field}`}
                checked={defeatedState[level]}
                onCheckedChange={(checked) =>
                  onToggleLevel(id, field, !!checked)
                }
                disabled={!unlocked || !availableSet.has(level)}
              />
              <Label className="text-xs" htmlFor={`nemesis-${id}-${field}`}>
                {label}
              </Label>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(id)}
          aria-label="Remove nemesis"
          title="Remove nemesis">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
