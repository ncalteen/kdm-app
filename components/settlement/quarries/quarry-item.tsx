'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Quarry Item Properties
 */
export interface QuarryItemProps {
  /** Settlement Quarry ID */
  id: string
  /** Whether the underlying quarry is user-defined */
  custom?: boolean | null
  /** Monster Name */
  monsterName: string
  /** Monster Node */
  node: string
  /** On Remove Handler */
  onRemove: (id: string) => void
  /** On Toggle Unlocked Handler */
  onToggleUnlocked: (id: string, unlocked: boolean) => void
  /** Unlocked */
  unlocked: boolean
}

/**
 * Quarry Item Component
 *
 * Displays a single quarry linked to a settlement with its unlocked state,
 * name, node badge, and a remove button.
 *
 * @param props Quarry Item Component Properties
 * @returns Quarry Item Component
 */
export const QuarryItem = memo(function QuarryItem({
  id,
  custom,
  monsterName,
  node,
  onRemove,
  onToggleUnlocked,
  unlocked
}: QuarryItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Unlocked Checkbox */}
      <Checkbox
        id={`quarry-unlocked-${id}`}
        name={`quarry-unlocked-${id}`}
        checked={unlocked}
        onCheckedChange={(checked) => onToggleUnlocked(id, !!checked)}
      />

      {/* Quarry Name */}
      <Label
        className="text-sm truncate ml-1"
        htmlFor={`quarry-unlocked-${id}`}>
        {monsterName}
      </Label>

      {custom && (
        <Badge variant="outline" className="text-xs shrink-0">
          Custom
        </Badge>
      )}

      {/* Node Badge and Remove Button */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        {node && (
          <Badge variant="secondary" className="h-8 w-20">
            {node}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(id)}
          aria-label="Remove quarry"
          title="Remove quarry">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
