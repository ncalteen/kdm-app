'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { getQuarries } from '@/lib/dal/quarry'
import { Constants, Database } from '@/lib/database.types'
import { ResourceCategory } from '@/lib/enums'
import { QuarryDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Create Custom Resource Dialog Properties
 */
interface CreateCustomResourceDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when custom resource is created */
  onCreate: (data: {
    resource_name: string
    category: Database['public']['Enums']['resource_category']
    resource_types: Database['public']['Enums']['resource_type'][]
    quarry_id: string | null
  }) => void
  /** Whether the create operation is in progress */
  creating: boolean
  /** Initial name to pre-fill */
  initialName?: string
}

/**
 * Create Custom Resource Dialog Component
 *
 * Dialog form for creating a new custom resource with a name, category,
 * resource types, and an optional quarry (when category is Monster).
 *
 * @param props Component Properties
 * @returns Create Custom Resource Dialog Component
 */
export function CreateCustomResourceDialog({
  open,
  onOpenChange,
  onCreate,
  creating,
  initialName = ''
}: CreateCustomResourceDialogProps): ReactElement {
  const [name, setName] = useState(initialName)
  const [category, setCategory] =
    useState<Database['public']['Enums']['resource_category']>('BASIC')
  const [selectedTypes, setSelectedTypes] = useState<
    Database['public']['Enums']['resource_type'][]
  >([])
  const [quarryId, setQuarryId] = useState<string | null>(null)
  const [quarryOpen, setQuarryOpen] = useState(false)
  const [quarries, setQuarries] = useState<{
    [key: string]: QuarryDetail
  }>({})

  useEffect(() => {
    if (!open) return

    getQuarries()
      .then(setQuarries)
      .catch((err) => console.error('Quarries Fetch Error:', err))
  }, [open])

  const toggleType = useCallback(
    (type: Database['public']['Enums']['resource_type']) => {
      setSelectedTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      )
    },
    []
  )

  /** Clear quarry selection when switching away from Monster category */
  const handleCategoryChange = useCallback((value: string) => {
    const newCategory =
      value as Database['public']['Enums']['resource_category']
    setCategory(newCategory)
    if (newCategory !== 'MONSTER') setQuarryId(null)
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || creating) return

    onCreate({
      resource_name: trimmed,
      category,
      resource_types: selectedTypes,
      quarry_id: category === 'MONSTER' ? quarryId : null
    })
  }, [name, category, selectedTypes, quarryId, creating, onCreate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Resource</DialogTitle>
          <DialogDescription>
            A new resource is discovered in the darkness.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="resource-name">Resource Name</Label>
            <Input
              id="resource-name"
              name="resource-name"
              placeholder="Enter resource name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ResourceCategory).map((cat) => (
                  <SelectItem key={cat.toUpperCase()} value={cat.toUpperCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category === 'MONSTER' && (
            <div className="flex flex-col gap-2">
              <Label>Quarry (Optional)</Label>
              <Popover
                modal={true}
                open={quarryOpen}
                onOpenChange={setQuarryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={quarryOpen}
                    className="justify-between">
                    {quarryId && quarries[quarryId]
                      ? quarries[quarryId].monster_name
                      : 'Select quarry...'}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder="Search quarries..." />
                    <CommandList>
                      <CommandEmpty>No quarries found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="__none__"
                          onSelect={() => {
                            setQuarryId(null)
                            setQuarryOpen(false)
                          }}>
                          <Check
                            className={cn(
                              'h-4 w-4',
                              quarryId === null ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          None
                        </CommandItem>
                        {Object.values(quarries).map((q) => (
                          <CommandItem
                            key={q.id}
                            value={q.monster_name}
                            onSelect={() => {
                              setQuarryId(q.id)
                              setQuarryOpen(false)
                            }}>
                            <Check
                              className={cn(
                                'h-4 w-4',
                                quarryId === q.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {q.monster_name}
                            {q.custom && (
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
          )}

          <div className="flex flex-col gap-2">
            <Label>Resource Types</Label>
            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
              {Constants.public.Enums.resource_type.map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => toggleType(type)}
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="text-xs cursor-pointer">
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </Label>
                </div>
              ))}
            </div>
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
