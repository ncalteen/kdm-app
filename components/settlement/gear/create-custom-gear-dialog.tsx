'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { getLocations } from '@/lib/dal/location'
import { LocationDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Create Custom Gear Dialog Properties
 */
interface CreateCustomGearDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when custom gear is created */
  onCreate: (data: { gear_name: string; location_id: string | null }) => void
  /** Whether the create operation is in progress */
  creating: boolean
  /** Initial name to pre-fill */
  initialName?: string
}

/**
 * Create Custom Gear Dialog Component
 *
 * Dialog form for creating a new custom gear item with a name and optional
 * associated location.
 *
 * @param props Component Properties
 * @returns Create Custom Gear Dialog Component
 */
export function CreateCustomGearDialog({
  open,
  onOpenChange,
  onCreate,
  creating,
  initialName = ''
}: CreateCustomGearDialogProps): ReactElement {
  const [name, setName] = useState(initialName)
  const [locationId, setLocationId] = useState<string | null>(null)
  const [locationOpen, setLocationOpen] = useState(false)
  const [locations, setLocations] = useState<{
    [key: string]: LocationDetail
  }>({})

  useEffect(() => {
    if (!open) return

    getLocations()
      .then(setLocations)
      .catch((err) => console.error('Locations Fetch Error:', err))
  }, [open])

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || creating) return

    onCreate({ gear_name: trimmed, location_id: locationId })
  }, [name, locationId, creating, onCreate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Custom Gear</DialogTitle>
          <DialogDescription>
            Forge a new piece of gear from the darkness.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="gear-name">Gear Name</Label>
            <Input
              id="gear-name"
              name="gear-name"
              placeholder="Enter gear name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Location (Optional)</Label>
            <Popover open={locationOpen} onOpenChange={setLocationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={locationOpen}
                  className="justify-between">
                  {locationId && locations[locationId]
                    ? locations[locationId].location_name
                    : 'Select location...'}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search locations..." />
                  <CommandList>
                    <CommandEmpty>No locations found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="__none__"
                        onSelect={() => {
                          setLocationId(null)
                          setLocationOpen(false)
                        }}>
                        <Check
                          className={cn(
                            'h-4 w-4',
                            locationId === null ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        None
                      </CommandItem>
                      {Object.values(locations).map((loc) => (
                        <CommandItem
                          key={loc.id}
                          value={loc.location_name}
                          onSelect={() => {
                            setLocationId(loc.id)
                            setLocationOpen(false)
                          }}>
                          <Check
                            className={cn(
                              'h-4 w-4',
                              locationId === loc.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {loc.location_name}
                          {loc.custom && (
                            <Badge
                              variant="outline"
                              className="ml-auto text-xs">
                              Custom
                            </Badge>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || creating}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
