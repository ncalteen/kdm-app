'use client'

import { SelectKnowledge } from '@/components/menu/select-knowledge'
import { Button } from '@/components/ui/button'
import { KnowledgeDetail, SettlementDetail } from '@/lib/types'
import { CheckIcon, TrashIcon, XIcon } from 'lucide-react'
import { memo, ReactElement, useState } from 'react'

/** Settlement knowledge row from SettlementDetail */
type KnowledgeRow = SettlementDetail['knowledges'][0]

/**
 * Knowledge Item Component Properties
 */
export interface KnowledgeItemProps {
  /** Index */
  index: number
  /** Knowledge Row */
  knowledge: KnowledgeRow
  /** On Remove Handler */
  onRemove: (index: number) => void
}

/**
 * New Knowledge Item Component Properties
 */
export interface NewKnowledgeItemProps {
  /** Available Knowledges Map */
  availableKnowledgesMap: { [key: string]: KnowledgeDetail }
  /** Exclude IDs */
  excludeIds: string[]
  /** On Cancel Handler */
  onCancel: () => void
  /** On Save Handler */
  onSave: (knowledgeId: string | undefined) => void
}

/**
 * Knowledge Item Component
 *
 * Displays a single knowledge linked to a settlement with its name and a
 * remove button.
 *
 * @param props Knowledge Item Component Properties
 * @returns Knowledge Item Component
 */
export const KnowledgeItem = memo(function KnowledgeItem({
  index,
  knowledge,
  onRemove
}: KnowledgeItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Knowledge Name */}
      <span className="text-sm ml-1 flex-grow">{knowledge.knowledge_name}</span>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => onRemove(index)}
        title="Remove knowledge">
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  )
})

/**
 * New Knowledge Item Component
 *
 * Renders a select dropdown for choosing a knowledge to add to the settlement.
 *
 * @param props New Knowledge Item Component Properties
 * @returns New Knowledge Item Component
 */
export const NewKnowledgeItem = memo(function NewKnowledgeItem({
  availableKnowledgesMap,
  excludeIds,
  onCancel,
  onSave
}: NewKnowledgeItemProps): ReactElement {
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<
    string | undefined
  >(undefined)

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Knowledge Select */}
      <SelectKnowledge
        knowledges={availableKnowledgesMap}
        excludeIds={excludeIds}
        onChange={setSelectedKnowledgeId}
        value={selectedKnowledgeId}
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onSave(selectedKnowledgeId)}
          disabled={!selectedKnowledgeId}
          title="Save knowledge">
          <CheckIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={onCancel}
          title="Cancel">
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
