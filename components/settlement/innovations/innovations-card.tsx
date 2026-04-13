'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import { addInnovation, getInnovations } from '@/lib/dal/innovation'
import {
  addSettlementInnovations,
  removeSettlementInnovation
} from '@/lib/dal/settlement-innovation'
import {
  ERROR_MESSAGE,
  INNOVATION_CREATED_MESSAGE,
  INNOVATION_REMOVED_MESSAGE,
  INNOVATION_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  InnovationDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { LightbulbIcon, Plus, PlusIcon, TrashIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

/** Settlement innovation item with junction table and innovation details */
type InnovationItem = {
  id: string
  innovation_id: string
  innovation_name: string
}

/**
 * Innovations Card Properties
 */
interface InnovationsCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
}

/**
 * Innovations Card Component
 *
 * Displays the innovations for a settlement. Users can add innovations from a
 * searchable dropdown and remove existing ones.
 *
 * @param props Innovations Card Properties
 * @returns Innovations Card Component
 */
export function InnovationsCard({
  local,
  selectedSettlement,
  setSelectedSettlement
}: InnovationsCardProps): ReactElement {
  const { toast } = useToast(local)

  const [prevSettlement, setPrevSettlement] = useState(selectedSettlement)

  const [availableInnovations, setAvailableInnovations] = useState<{
    [key: string]: InnovationDetail
  }>({})
  const [innovations, setInnovations] = useState<InnovationItem[]>(
    selectedSettlement?.innovations ?? []
  )
  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)

  if (prevSettlement !== selectedSettlement) {
    setPrevSettlement(selectedSettlement)
    setInnovations(selectedSettlement?.innovations ?? [])
  }

  /**
   * Sorted Innovations
   *
   * Alphabetically sorted view of the settlement's innovations, preserving
   * original indices so handlers operate on the correct source array element.
   */
  const sortedInnovations = useMemo(
    () =>
      innovations
        .map((item, originalIndex) => ({
          item,
          originalIndex
        }))
        .sort((a, b) =>
          a.item.innovation_name.localeCompare(b.item.innovation_name)
        ),
    [innovations]
  )

  useEffect(() => {
    getInnovations()
      .then((data) => setAvailableInnovations(data))
      .catch((error) => {
        console.error('Innovations Fetch Error:', error)
      })
  }, [])

  /**
   * Handle Add Innovation
   *
   * @param innovationId Innovation ID
   */
  const handleAdd = useCallback(
    (innovationId: string) => {
      if (!selectedSettlement?.id || !innovationId) return

      const detail = availableInnovations[innovationId]
      if (!detail) return

      setAddOpen(false)

      // Optimistic placeholder — the real junction ID comes from the DB.
      const optimisticItem: InnovationItem = {
        id: `temp-${Date.now()}`,
        innovation_id: innovationId,
        innovation_name: detail.innovation_name
      }
      const oldInnovations = [...innovations]

      setInnovations([...innovations, optimisticItem])

      addSettlementInnovations([innovationId], selectedSettlement.id)
        .then((createdInnovations) => {
          const hydratedItem = createdInnovations[0] ?? optimisticItem

          setInnovations((prev) =>
            prev.map((item) =>
              item.id === optimisticItem.id ? hydratedItem : item
            )
          )

          toast.success(INNOVATION_UPDATED_MESSAGE())

          if (selectedSettlement) {
            setSelectedSettlement((prev) =>
              prev
                ? {
                    ...prev,
                    innovations: [...prev.innovations, hydratedItem].filter(
                      (inn) =>
                        inn.id !== optimisticItem.id ||
                        inn.id === hydratedItem.id
                    )
                  }
                : null
            )
          }
        })
        .catch((error: unknown) => {
          setInnovations(oldInnovations)

          console.error('Innovation Add Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [
      availableInnovations,
      innovations,
      selectedSettlement,
      setSelectedSettlement,
      toast
    ]
  )

  /**
   * Handle Remove Innovation
   *
   * @param index Innovation Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement?.id) return

      const removed = innovations[index]
      if (!removed) return

      const oldInnovations = [...innovations]
      const updated = innovations.filter((_, i) => i !== index)

      setInnovations(updated)

      removeSettlementInnovation(removed.id)
        .then(() => {
          toast.success(INNOVATION_REMOVED_MESSAGE())

          if (selectedSettlement) {
            setSelectedSettlement((prev) =>
              prev
                ? {
                    ...prev,
                    innovations: prev.innovations.filter(
                      (inn) => inn.id !== removed.id
                    )
                  }
                : null
            )
          }
        })
        .catch((error: unknown) => {
          setInnovations(oldInnovations)

          console.error('Innovation Remove Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [innovations, selectedSettlement, setSelectedSettlement, toast]
  )

  /** Check if an exact match for the search term already exists. */
  const exactMatchExists = Object.values(availableInnovations).some(
    (i) => i.innovation_name.toLowerCase() === search.trim().toLowerCase()
  )

  /**
   * Handle Create Custom Innovation
   */
  const handleCreate = useCallback(async () => {
    const name = search.trim()
    if (!name || creating || !selectedSettlement) return

    setCreating(true)

    try {
      const newInnovation = await addInnovation({
        custom: true,
        innovation_name: name
      })

      setAvailableInnovations((prev) => ({
        ...prev,
        [newInnovation.id]: newInnovation
      }))

      setSearch('')
      setAddOpen(false)
      toast.success(INNOVATION_CREATED_MESSAGE())

      // Add to settlement immediately
      const optimisticItem: InnovationItem = {
        id: `temp-${Date.now()}`,
        innovation_id: newInnovation.id,
        innovation_name: newInnovation.innovation_name
      }
      const oldInnovations = [...innovations]

      setInnovations([...innovations, optimisticItem])

      addSettlementInnovations([newInnovation.id], selectedSettlement.id)
        .then((createdInnovations) => {
          const hydratedItem = createdInnovations[0] ?? optimisticItem

          setInnovations((prev) =>
            prev.map((item) =>
              item.id === optimisticItem.id ? hydratedItem : item
            )
          )

          toast.success(INNOVATION_UPDATED_MESSAGE())

          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  innovations: [...prev.innovations, hydratedItem].filter(
                    (inn) =>
                      inn.id !== optimisticItem.id || inn.id === hydratedItem.id
                  )
                }
              : null
          )
        })
        .catch((error: unknown) => {
          setInnovations(oldInnovations)

          console.error('Innovation Add Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    } catch (error) {
      console.error('Innovation Create Error:', error)
      toast.error(ERROR_MESSAGE())
    } finally {
      setCreating(false)
    }
  }, [
    search,
    creating,
    innovations,
    selectedSettlement,
    setSelectedSettlement,
    toast
  ])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <LightbulbIcon className="h-4 w-4" />
          Innovations
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-0 h-8 w-8">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command shouldFilter={true}>
                <CommandInput
                  placeholder="Search innovations..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {search.trim() ? (
                      <button
                        type="button"
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm justify-center"
                        disabled={creating}
                        onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        {creating ? 'Creating...' : `Create "${search.trim()}"`}
                      </button>
                    ) : (
                      'No innovations found.'
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {Object.values(availableInnovations)
                      .filter(
                        (i) =>
                          !innovations.some(
                            (existing) => existing.innovation_id === i.id
                          )
                      )
                      .map((innovation) => (
                        <CommandItem
                          key={innovation.id}
                          value={innovation.innovation_name}
                          onSelect={() => handleAdd(innovation.id)}>
                          {innovation.innovation_name}
                          {innovation.custom && (
                            <Badge
                              variant="outline"
                              className="ml-auto text-xs">
                              Custom
                            </Badge>
                          )}
                        </CommandItem>
                      ))}
                    {search.trim() && !exactMatchExists && (
                      <CommandItem
                        value={`__create__${search.trim()}`}
                        onSelect={handleCreate}
                        disabled={creating}>
                        <Plus className="h-4 w-4" />
                        {creating ? 'Creating...' : `Create "${search.trim()}"`}
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto">
            {sortedInnovations.map(({ item, originalIndex }) => (
              <div
                key={`${item.id}-${originalIndex}`}
                className="flex items-center gap-2">
                <span className="text-sm ml-1 flex-grow pl-2">
                  {item.innovation_name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => handleRemove(originalIndex)}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
