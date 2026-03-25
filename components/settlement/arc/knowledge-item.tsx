'use client'

import { Button } from '@/components/ui/button'
import { SettlementDetail } from '@/lib/types'
import { TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Knowledge Item Component Properties
 */
export interface KnowledgeItemProps {
  /** Index */
  index: number
  /** Knowledge Row */
  knowledge: SettlementDetail['knowledges'][0]
  /** On Remove Handler */
  onRemove: (index: number) => void
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
