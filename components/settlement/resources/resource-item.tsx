'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ResourceDetail, SettlementDetail } from '@/lib/types'
import { CheckIcon, TrashIcon, XIcon } from 'lucide-react'
import { memo, ReactElement, useState } from 'react'

/** Settlement resource row from SettlementDetail */
type ResourceRow = SettlementDetail['resources'][0]

/**
 * Resource Item Component Properties
 */
export interface ResourceItemProps {
  /** Index */
  index: number
  /** Resource Row */
  resource: ResourceRow
  /** On Quantity Change Handler */
  onQuantityChange: (index: number, quantity: number) => void
  /** On Remove Handler */
  onRemove: (index: number) => void
}

/**
 * New Resource Item Component Properties
 */
export interface NewResourceItemProps {
  /** Available Resources */
  availableResources: ResourceDetail[]
  /** On Cancel Handler */
  onCancel: () => void
  /** On Save Handler */
  onSave: (resourceId: string | undefined) => void
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
  index,
  resource,
  onQuantityChange,
  onRemove
}: ResourceItemProps): ReactElement {
  return (
    <div className="grid grid-cols-4 items-center gap-2 pl-2 py-1">
      {/* Resource Name */}
      <div className="flex flex-col ml-1">
        <Label className="text-sm truncate">{resource.resource_name}</Label>
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
        <Badge variant="default" className="text-xs">
          {resource.category}
        </Badge>
      </div>

      {/* Type Badges */}
      <div className="flex items-center gap-1 flex-wrap">
        {resource.resource_types.map((type) => (
          <Badge key={type} variant="secondary" className="text-xs">
            {type}
          </Badge>
        ))}
      </div>

      {/* Quantity and Remove Button */}
      <div className="flex items-center gap-1 justify-end">
        <NumericInput
          className="w-16"
          label={`${resource.resource_name} quantity`}
          min={0}
          onChange={(value) => onQuantityChange(index, value)}
          value={resource.quantity}
        />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          title="Remove resource">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

/**
 * New Resource Item Component
 *
 * Renders a select dropdown for choosing a resource to add to the settlement.
 *
 * @param props New Resource Item Component Properties
 * @returns New Resource Item Component
 */
export const NewResourceItem = memo(function NewResourceItem({
  availableResources,
  onCancel,
  onSave
}: NewResourceItemProps): ReactElement {
  const [selectedResourceId, setSelectedResourceId] = useState<
    string | undefined
  >(undefined)

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Resource Selector */}
      <Select
        value={selectedResourceId}
        onValueChange={(value) => setSelectedResourceId(value)}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select resource" />
        </SelectTrigger>
        <SelectContent>
          {availableResources.map((resource) => (
            <SelectItem key={resource.id} value={resource.id}>
              {resource.resource_name}
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
          onClick={() => onSave(selectedResourceId)}
          title="Save resource">
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
