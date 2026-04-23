'use client'

import { CustomItemDialog } from '@/components/custom/dialogs/custom-item-dialog'
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
import { addDisorder, getDisorders } from '@/lib/dal/disorder'
import {
  addSurvivorDisorder,
  removeSurvivorDisorder
} from '@/lib/dal/survivor-disorder'
import {
  DISORDER_CREATED_MESSAGE,
  ERROR_MESSAGE,
  SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE,
  SURVIVOR_DISORDER_REMOVED_MESSAGE,
  SURVIVOR_DISORDER_UPDATED_MESSAGE
} from '@/lib/messages'
import { DisorderDetail, SurvivorDetail } from '@/lib/types'
import { Plus, PlusIcon, TrashIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

const MAX_DISORDERS = 3

/**
 * Disorders Card Properties
 */
interface DisordersCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
}

/**
 * Disorders Card Component
 *
 * @param props Disorders Card Properties
 * @returns Disorders Card Component
 */
export function DisordersCard({
  local,
  selectedSurvivor
}: DisordersCardProps): ReactElement {
  const { toast } = useToast(local)

  const [prevSurvivor, setPrevSurvivor] = useState(selectedSurvivor)

  const [availableDisorders, setAvailableDisorders] = useState<{
    [key: string]: DisorderDetail
  }>({})
  const [disorders, setDisorders] = useState<DisorderDetail[]>(
    selectedSurvivor?.disorders ?? []
  )
  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createDialogName, setCreateDialogName] = useState('')
  const [createDialogKey, setCreateDialogKey] = useState(0)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  if (prevSurvivor !== selectedSurvivor) {
    setPrevSurvivor(selectedSurvivor)
    setDisorders(selectedSurvivor?.disorders ?? [])
  }

  useEffect(() => {
    getDisorders()
      .then((disorders) => setAvailableDisorders(disorders))
      .catch((error) => {
        console.error('Disorders Fetch Error:', error)
      })
      .finally(() => setHasFetched(true))
  }, [])

  /**
   * Handle Add Disorder
   *
   * @param disorderId Disorder ID
   */
  const handleAdd = useCallback(
    (disorderId: string) => {
      if (!selectedSurvivor?.id || !disorderId) return

      if (disorders.length >= MAX_DISORDERS) {
        toast.error(SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE())
        return
      }

      const detail = availableDisorders[disorderId]
      if (!detail) return

      setAddOpen(false)
      setSearch('')

      const optimisticItem: DisorderDetail = {
        id: disorderId,
        custom: detail.custom,
        disorder_name: detail.disorder_name,
        rules: detail.rules
      }
      const oldDisorders = [...disorders]

      setDisorders([...disorders, optimisticItem])

      addSurvivorDisorder(selectedSurvivor.id, disorderId)
        .then(() => toast.success(SURVIVOR_DISORDER_UPDATED_MESSAGE(true)))
        .catch((error: unknown) => {
          setDisorders(oldDisorders)

          console.error('Disorder Add Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [availableDisorders, disorders, selectedSurvivor, toast]
  )

  /**
   * Handle Remove Disorder
   *
   * @param index Disorder Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSurvivor?.id) return

      const removed = disorders[index]
      if (!removed) return

      const oldDisorders = [...disorders]
      const updated = disorders.filter((_, i) => i !== index)

      setDisorders(updated)

      removeSurvivorDisorder(selectedSurvivor.id, removed.id)
        .then(() => toast.success(SURVIVOR_DISORDER_REMOVED_MESSAGE()))
        .catch((error: unknown) => {
          setDisorders(oldDisorders)

          console.error('Disorder Remove Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [disorders, selectedSurvivor, toast]
  )

  /** Check if an exact match for the search term already exists. */
  const exactMatchExists = Object.values(availableDisorders).some(
    (d) => d.disorder_name.toLowerCase() === search.trim().toLowerCase()
  )

  /**
   * Open Create Dialog
   *
   * Closes the add popover and opens the custom item dialog with the current
   * search term pre-filled as the name.
   */
  const openCreateDialog = useCallback(() => {
    const name = search.trim()
    if (!name || !selectedSurvivor?.id) return

    if (disorders.length >= MAX_DISORDERS) {
      toast.error(SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE())
      return
    }

    setCreateDialogName(name)
    setCreateDialogKey((k) => k + 1)
    setAddOpen(false)
    setCreateDialogOpen(true)
  }, [search, selectedSurvivor?.id, disorders.length, toast])

  /**
   * Handle Create Custom Disorder
   *
   * Creates a new custom disorder with the provided name and rules, adds it
   * to the available disorders, then assigns it to the survivor.
   */
  const handleCreate = useCallback(
    async (data: { name: string; rules: string }) => {
      if (creating || !selectedSurvivor?.id) return
      const name = data.name.trim()
      if (!name) return

      if (disorders.length >= MAX_DISORDERS) {
        toast.error(SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE())
        return
      }

      setCreating(true)

      try {
        const newDisorder = await addDisorder({
          custom: true,
          disorder_name: name,
          rules: data.rules || null
        })

        setAvailableDisorders((prev) => ({
          ...prev,
          [newDisorder.id]: newDisorder
        }))

        setSearch('')
        setCreateDialogOpen(false)
        toast.success(DISORDER_CREATED_MESSAGE())

        // Add to survivor immediately with the data we already have
        const optimisticItem: DisorderDetail = {
          id: newDisorder.id,
          custom: newDisorder.custom,
          disorder_name: newDisorder.disorder_name,
          rules: newDisorder.rules
        }
        const oldDisorders = [...disorders]

        setDisorders([...disorders, optimisticItem])

        addSurvivorDisorder(selectedSurvivor.id, newDisorder.id)
          .then(() => toast.success(SURVIVOR_DISORDER_UPDATED_MESSAGE(true)))
          .catch((error: unknown) => {
            setDisorders(oldDisorders)

            console.error('Disorder Add Error:', error)
            toast.error(ERROR_MESSAGE())
          })
      } catch (error) {
        console.error('Disorder Create Error:', error)
        toast.error(ERROR_MESSAGE())
      } finally {
        setCreating(false)
      }
    },
    [creating, selectedSurvivor, disorders, toast]
  )

  return (
    <Card className="p-2 border-0 gap-0">
      <CardHeader className="p-0">
        <CardTitle className="p-0 text-sm flex flex-row items-center justify-between h-8">
          Disorders
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-6 w-6"
                disabled={disorders.length >= MAX_DISORDERS}>
                <PlusIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command shouldFilter={true}>
                <CommandInput
                  placeholder="Search disorders..."
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
                        onClick={openCreateDialog}>
                        <Plus className="h-4 w-4" />
                        {creating ? 'Creating...' : `Create "${search.trim()}"`}
                      </button>
                    ) : !hasFetched ? (
                      'Loading disorders...'
                    ) : (
                      'No disorders found.'
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {Object.values(availableDisorders)
                      .filter(
                        (d) =>
                          !disorders.some((existing) => existing.id === d.id)
                      )
                      .map((disorder) => (
                        <CommandItem
                          key={disorder.id}
                          value={disorder.disorder_name}
                          onSelect={() => handleAdd(disorder.id)}>
                          {disorder.disorder_name}
                          {disorder.custom && (
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
                        onSelect={openCreateDialog}
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

      <CardContent className="p-0">
        <div className="flex flex-col">
          {disorders.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex items-center gap-2">
              <span className="text-sm ml-1 flex-grow">
                {item.disorder_name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => handleRemove(index)}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      <CustomItemDialog
        key={`create-disorder-${createDialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={creating}
        initialName={createDialogName}
        title="Create Custom Disorder"
        description="A new affliction takes root in the darkness."
        nameLabel="Disorder Name"
        namePlaceholder="Enter disorder name"
        saveLabel="Create"
        savingLabel="Creating..."
      />
    </Card>
  )
}
