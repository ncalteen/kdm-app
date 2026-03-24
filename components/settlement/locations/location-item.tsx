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
import { LocationDetail, SettlementDetail } from '@/lib/types'
import { CheckIcon, TrashIcon, XIcon } from 'lucide-react'
import { memo, ReactElement, useState } from 'react'

/** Settlement location row from SettlementDetail */
type LocationRow = SettlementDetail['locations'][0]

/**
 * Location Item Component Properties
 */
export interface LocationItemProps {
  /** Index */
  index: number
  /** Location Row */
  location: LocationRow
  /** On Remove Handler */
  onRemove: (index: number) => void
  /** On Toggle Unlocked Handler */
  onToggleUnlocked: (index: number, unlocked: boolean) => void
}

/**
 * New Location Item Component Properties
 */
export interface NewLocationItemProps {
  /** Available Locations */
  availableLocations: LocationDetail[]
  /** On Cancel Handler */
  onCancel: () => void
  /** On Save Handler */
  onSave: (locationId: string | undefined) => void
}

/**
 * Location Item Component
 *
 * Displays a single location linked to a settlement with its unlocked state,
 * name, and a remove button.
 *
 * @param props Location Item Component Properties
 * @returns Location Item Component
 */
export const LocationItem = memo(function LocationItem({
  index,
  location,
  onRemove,
  onToggleUnlocked
}: LocationItemProps): ReactElement {
  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Unlocked Checkbox */}
      <Checkbox
        id={`location-unlocked-${index}`}
        name={`location-unlocked-${index}`}
        checked={location.unlocked}
        onCheckedChange={(checked) => onToggleUnlocked(index, !!checked)}
      />

      {/* Location Name */}
      <Label
        className="text-sm truncate ml-1"
        htmlFor={`location-unlocked-${index}`}>
        {location.location_name}
      </Label>

      {/* Remove Button */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => onRemove(index)}
          title="Remove location">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

/**
 * New Location Item Component
 *
 * Renders a select dropdown for choosing a location to add to the settlement.
 *
 * @param props New Location Item Component Properties
 * @returns New Location Item Component
 */
export const NewLocationItem = memo(function NewLocationItem({
  availableLocations,
  onCancel,
  onSave
}: NewLocationItemProps): ReactElement {
  const [selectedLocationId, setSelectedLocationId] = useState<
    string | undefined
  >(undefined)

  return (
    <div className="flex items-center gap-2 pl-2">
      {/* Unlocked Checkbox (Disabled) */}
      <Checkbox
        checked={false}
        disabled={true}
        id="location-new-unlocked"
        name="location-new-unlocked"
      />

      {/* Location Selector */}
      <Select
        value={selectedLocationId}
        onValueChange={(value) => setSelectedLocationId(value)}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          {availableLocations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.location_name}
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
          onClick={() => onSave(selectedLocationId)}
          title="Save location">
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
