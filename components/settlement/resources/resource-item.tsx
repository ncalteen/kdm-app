'use client'

import {
  CustomItemDisplay,
  CustomRulesText
} from '@/components/custom/custom-rules-sheet'
import { NumericInput } from '@/components/menu/numeric-input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SettlementDetail } from '@/lib/types'
import { TrashIcon } from 'lucide-react'
import { memo, ReactElement } from 'react'

/**
 * Resource Item Component Properties
 */
export interface ResourceItemProps {
  /** Custom Rules Sheet Display */
  customDetail?: CustomItemDisplay | null
  /** Index */
  index: number
  /** Resource Row */
  resource: SettlementDetail['resources'][0]
  /** On Quantity Change Handler */
  onQuantityChange: (index: number, quantity: number) => void
  /** On Remove Handler */
  onRemove: (index: number) => void
}

/**
 * Resource Item Component
 *
 * Displays a single resource linked to a settlement with its name, category
 * badge, type badges, quantity input, and a remove button.
 *
 * @param props Resource Item Component Properties
 * @returns Resource Item Component
 */
export const ResourceItem = memo(function ResourceItem({
  customDetail,
  index,
  resource,
  onQuantityChange,
  onRemove
}: ResourceItemProps): ReactElement {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] lg:grid-cols-4 items-center gap-1 lg:gap-2 pl-2 py-1">
      {/* Resource Name */}
      <div className="flex flex-col min-w-0 ml-1">
        <CustomRulesText
          className="truncate"
          custom={customDetail?.custom ?? false}
          description={customDetail?.description}
          label={resource.resource_name}
          sections={customDetail?.sections ?? []}
          title={customDetail?.title ?? resource.resource_name}
        />
        {resource.category.toUpperCase() === 'MONSTER' &&
          resource.quarry_monster_name && (
            <span className="text-xs text-muted-foreground truncate">
              &nbsp;&nbsp;{resource.quarry_monster_name}
              {resource.quarry_node && ` (${resource.quarry_node})`}
            </span>
          )}
      </div>

      {/* Category Badge */}
      <div className="flex items-center">
        <Badge variant="default" className="text-xs whitespace-nowrap">
          {resource.category}
        </Badge>
      </div>

      {/* Type Badges */}
      <div className="flex items-center gap-0.5 lg:gap-1 flex-wrap min-w-0">
        {resource.resource_types.map((type) => (
          <Badge
            key={type}
            variant="secondary"
            className="text-xs whitespace-nowrap">
            {type}
          </Badge>
        ))}
      </div>

      {/* Quantity and Remove Button */}
      <div className="flex items-center gap-0.5 lg:gap-1 justify-end">
        <NumericInput
          className="w-14 lg:w-16"
          label={`${resource.resource_name} quantity`}
          min={0}
          onChange={(value) => onQuantityChange(index, value)}
          value={resource.quantity}
        />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="h-8 w-8 shrink-0"
          onClick={() => onRemove(index)}
          title="Remove resource">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})
