'use client'

import {
  CustomItemDisplay,
  CustomRulesText
} from '@/components/custom/custom-rules-sheet'
import { AuthoredByChip } from '@/components/generic/authored-by-chip'
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
    <div
      className={[
        // Mobile (< sm): 2-row grid. Row 1 = name + qty + remove.
        // Row 2 = all badges (category + types) wrapped together full width.
        'grid items-center pl-2 py-1',
        'grid-cols-[minmax(0,1fr)_auto_auto] gap-x-1 gap-y-1',
        // sm+ collapses back to today's single-row 4-column layout via the
        // `sm:contents` trick on the badges wrapper below.
        'sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] sm:gap-1',
        'lg:grid-cols-4 lg:gap-2'
      ].join(' ')}>
      {/* Resource Name */}
      <div className="row-start-1 col-start-1 sm:col-end-2 sm:row-start-1 flex flex-col min-w-0 ml-1">
        <div className="flex items-center gap-1 min-w-0">
          <CustomRulesText
            className="truncate"
            custom={resource.custom}
            description={customDetail?.description}
            label={resource.resource_name}
            sections={customDetail?.sections ?? []}
            title={customDetail?.title ?? resource.resource_name}
            showCustomBadge
          />
          <AuthoredByChip
            authorUserId={resource.author_user_id}
            authorUsername={resource.author_username}
            authorAvatarUrl={resource.author_avatar_url}
          />
        </div>
        {resource.category.toUpperCase() === 'MONSTER' &&
          resource.quarry_monster_name && (
            <span className="text-xs text-muted-foreground truncate">
              &nbsp;&nbsp;{resource.quarry_monster_name}
              {resource.quarry_node && ` (${resource.quarry_node})`}
            </span>
          )}
      </div>

      {/* Quantity and Remove Button (mobile: row 1 cols 2-3; sm+: col 4) */}
      <div className="row-start-1 col-start-2 col-end-4 sm:col-start-4 sm:col-end-5 sm:row-start-1 flex items-center gap-0.5 lg:gap-1 justify-end">
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
          aria-label="Remove resource"
          title="Remove resource">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>

      {/*
        Badges Wrapper

        Mobile: a real flex-wrap container that spans row 2 across all 3
        columns, so the category badge and every type badge share one
        wrapping line below the name/quantity row.

        sm and up: `display: contents` dissolves this wrapper so its
        children become direct grid items, restoring today's layout where
        the category badge and the type badges live in their own columns.
      */}
      <div className="row-start-2 col-start-1 col-end-4 ml-1 flex flex-wrap items-center gap-1 sm:contents">
        {/* Category Badge cell */}
        <div className="contents sm:flex sm:items-center sm:row-start-1 sm:col-start-2 sm:col-end-3">
          <Badge variant="default" className="text-xs whitespace-nowrap">
            {resource.category}
          </Badge>
        </div>

        {/* Type Badges cell */}
        <div className="contents sm:flex sm:items-center sm:gap-0.5 sm:flex-wrap sm:min-w-0 sm:row-start-1 sm:col-start-3 sm:col-end-4 lg:gap-1">
          {resource.resource_types.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="text-xs whitespace-nowrap">
              {type}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
})
