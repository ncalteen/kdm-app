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
import { PrincipleDetail, SettlementDetail } from '@/lib/types'
import { CheckIcon, TrashIcon, XIcon } from 'lucide-react'
import { memo, ReactElement, useState } from 'react'

/** Settlement principle row from SettlementDetail */
type PrincipleRow = SettlementDetail['principles'][0]

/**
 * Principle Item Component Properties
 */
export interface PrincipleItemProps {
  /** Index */
  index: number
  /** On Option Select Handler */
  onOptionSelect: (index: number, option: 1 | 2) => void
  /** On Remove Handler */
  onRemove: (index: number) => void
  /** Principle Row */
  principle: PrincipleRow
}

/**
 * New Principle Item Component Properties
 */
export interface NewPrincipleItemProps {
  /** Available Principles */
  availablePrinciples: PrincipleDetail[]
  /** On Cancel Handler */
  onCancel: () => void
  /** On Save Handler */
  onSave: (principleId: string | undefined) => void
}

/**
 * Principle Item Component
 *
 * Displays a single principle linked to a settlement with its two option
 * checkboxes (mutually exclusive) and a remove button.
 *
 * @param props Principle Item Component Properties
 * @returns Principle Item Component
 */
export const PrincipleItem = memo(function PrincipleItem({
  index,
  onOptionSelect,
  onRemove,
  principle
}: PrincipleItemProps): ReactElement {
  return (
    <div className="grid grid-cols-3 items-center gap-2 pl-2">
      {/* Principle Name */}
      <span className="text-sm font-bold truncate">
        {principle.principle_name}
      </span>

      {/* Option Checkboxes */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Checkbox
            id={`principle-${index}-option-1`}
            name={`principle-${index}-option-1`}
            checked={principle.option_1_selected}
            onCheckedChange={(checked) => {
              if (checked) onOptionSelect(index, 1)
            }}
          />
          <Label className="text-sm" htmlFor={`principle-${index}-option-1`}>
            {principle.option_1_name}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`principle-${index}-option-2`}
            name={`principle-${index}-option-2`}
            checked={principle.option_2_selected}
            onCheckedChange={(checked) => {
              if (checked) onOptionSelect(index, 2)
            }}
          />
          <Label className="text-sm" htmlFor={`principle-${index}-option-2`}>
            {principle.option_2_name}
          </Label>
        </div>
      </div>

      {/* Remove Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          title="Remove principle">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

/**
 * New Principle Item Component
 *
 * Renders a select dropdown for choosing a principle to add to the settlement.
 *
 * @param props New Principle Item Component Properties
 * @returns New Principle Item Component
 */
export const NewPrincipleItem = memo(function NewPrincipleItem({
  availablePrinciples,
  onCancel,
  onSave
}: NewPrincipleItemProps): ReactElement {
  const [selectedPrincipleId, setSelectedPrincipleId] = useState<
    string | undefined
  >(undefined)

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Principle Selector */}
      <Select
        value={selectedPrincipleId}
        onValueChange={(value) => setSelectedPrincipleId(value)}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select principle" />
        </SelectTrigger>
        <SelectContent>
          {availablePrinciples.map((principle) => (
            <SelectItem key={principle.id} value={principle.id}>
              {principle.principle_name}
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
          onClick={() => onSave(selectedPrincipleId)}
          title="Save principle">
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
