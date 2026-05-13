'use client'

import {
  CustomItemDisplay,
  CustomKnowledgeRulesText,
  CustomRulesText
} from '@/components/custom/custom-rules-sheet'
import { Button } from '@/components/ui/button'
import { SettlementDetail } from '@/lib/types'
import { TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Knowledge Item Component Properties
 */
export interface KnowledgeItemProps {
  /**
   * Custom Rules Sheet Display
   *
   * Optional override used for non-custom knowledges (e.g. catalog detail
   * surfaces). Custom knowledges render their own sheet via
   * {@link CustomKnowledgeRulesText} and ignore this prop.
   */
  customDetail?: CustomItemDisplay | null
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
 * remove button. When the knowledge is user-defined, the name becomes a
 * clickable trigger that opens a sheet displaying its rules, observation
 * conditions, observation rank-up milestone, and (when linked) the parent
 * philosophy.
 *
 * @param props Knowledge Item Component Properties
 * @returns Knowledge Item Component
 */
export const KnowledgeItem = memo(function KnowledgeItem({
  customDetail,
  index,
  knowledge,
  onRemove
}: KnowledgeItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Knowledge Name */}
      {knowledge.custom ? (
        <CustomKnowledgeRulesText
          className="ml-1 grow"
          custom={knowledge.custom}
          knowledgeName={knowledge.knowledge_name}
          rules={knowledge.rules}
          observationConditions={knowledge.observation_conditions}
          observationRankUpMilestone={knowledge.observation_rank_up_milestone}
          philosophyId={knowledge.philosophy_id}
          showCustomBadge
          authorUserId={knowledge.author_user_id}
          authorUsername={knowledge.author_username}
        />
      ) : (
        <CustomRulesText
          className="ml-1 grow"
          custom={customDetail?.custom ?? knowledge.custom}
          description={customDetail?.description}
          label={knowledge.knowledge_name}
          sections={
            customDetail?.sections ?? [
              { label: 'Rules', content: knowledge.rules },
              {
                label: 'Observation Conditions',
                content: knowledge.observation_conditions
              }
            ]
          }
          title={customDetail?.title ?? knowledge.knowledge_name}
          showCustomBadge
          authorUserId={knowledge.author_user_id}
          authorUsername={knowledge.author_username}
        />
      )}

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => onRemove(index)}
        aria-label="Remove knowledge"
        title="Remove knowledge">
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  )
})
