'use client'

import { CustomRulesText } from '@/components/custom/custom-rules-sheet'
import { CustomItemDialog } from '@/components/custom/dialogs/custom-item-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { LocalStateType } from '@/contexts/local-context'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { useToast } from '@/hooks/use-toast'
import {
  addAbilityImpairment,
  getAbilityImpairments
} from '@/lib/dal/ability-impairment'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  addSurvivorAbilityImpairment,
  removeSurvivorAbilityImpairment
} from '@/lib/dal/survivor-ability-impairment'
import {
  ABILITY_IMPAIRMENT_CREATED_MESSAGE,
  ABILITY_IMPAIRMENT_REMOVED_MESSAGE,
  ABILITY_IMPAIRMENT_UPDATED_MESSAGE,
  ERROR_MESSAGE,
  SURVIVOR_SKIP_NEXT_HUNT_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  AbilityImpairmentDetail,
  SurvivorDetail,
  SurvivorsStateSetter
} from '@/lib/types'
import { Plus, PlusIcon, TrashIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Abilities and Impairments Card Properties
 */
interface AbilitiesAndImpairmentsCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
}

/**
 * Abilities and Impairments Card Component
 *
 * Displays a survivor's abilities and impairments with a searchable popover
 * to add from existing records or create new custom ones. Uses the
 * survivor_ability_impairment junction table for persistence.
 *
 * @param props Abilities and Impairments Card Properties
 * @returns Abilities and Impairments Card Component
 */
export function AbilitiesAndImpairmentsCard({
  local,
  selectedSurvivor,
  setSurvivors
}: AbilitiesAndImpairmentsCardProps): ReactElement {
  const { toast } = useToast(local)
  const mutate = useOptimisticMutation(local)

  const [prevSurvivor, setPrevSurvivor] = useState(selectedSurvivor)

  const [availableItems, setAvailableItems] = useState<{
    [key: string]: AbilityImpairmentDetail
  }>({})
  const [items, setItems] = useState<AbilityImpairmentDetail[]>(
    selectedSurvivor?.abilities_impairments ?? []
  )
  const [skipNextHunt, setSkipNextHunt] = useState<boolean>(
    selectedSurvivor?.skip_next_hunt ?? false
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
    setItems([])
    setSkipNextHunt(selectedSurvivor?.skip_next_hunt ?? false)
  }

  // Get the available items when the component mounts
  useEffect(() => {
    getAbilityImpairments()
      .then((data) => setAvailableItems(data))
      .catch((error) => {
        console.error('Abilities/Impairments Fetch Error:', error)
      })
      .finally(() => setHasFetched(true))
  }, [])

  // Update the items when the selected survivor changes
  useEffect(
    () => setItems(selectedSurvivor?.abilities_impairments ?? []),
    [selectedSurvivor]
  )

  /**
   * Handle Add Ability/Impairment
   *
   * @param itemId Ability/Impairment ID
   */
  const handleAdd = useCallback(
    (itemId: string) => {
      if (!selectedSurvivor?.id || !itemId) return

      const detail = availableItems[itemId]
      if (!detail) return

      setAddOpen(false)
      setSearch('')

      const optimisticItem: AbilityImpairmentDetail = {
        id: itemId,
        custom: detail.custom,
        ability_impairment_name: detail.ability_impairment_name,
        rules: detail.rules ?? null
      }
      const oldItems = [...items]

      setItems([...items, optimisticItem])

      void mutate({
        context: 'Ability/Impairment Add',
        persist: () =>
          addSurvivorAbilityImpairment(selectedSurvivor.id, itemId),
        rollback: () => {
          setItems(oldItems)
        },
        successMessage: ABILITY_IMPAIRMENT_UPDATED_MESSAGE(true)
      })
    },
    [availableItems, items, selectedSurvivor, mutate]
  )

  /**
   * Handle Remove Ability/Impairment
   *
   * @param index Item Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSurvivor?.id) return

      const removed = items[index]
      if (!removed) return

      const oldItems = [...items]
      const updated = items.filter((_, i) => i !== index)

      setItems(updated)

      void mutate({
        context: 'Ability/Impairment Remove',
        persist: () =>
          removeSurvivorAbilityImpairment(selectedSurvivor.id, removed.id),
        rollback: () => {
          setItems(oldItems)
        },
        successMessage: ABILITY_IMPAIRMENT_REMOVED_MESSAGE()
      })
    },
    [items, selectedSurvivor, mutate]
  )

  /** Check if an exact match for the search term already exists. */
  const exactMatchExists = Object.values(availableItems).some(
    (a) =>
      a.ability_impairment_name.toLowerCase() === search.trim().toLowerCase()
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

    setCreateDialogName(name)
    setCreateDialogKey((k) => k + 1)
    setAddOpen(false)
    setCreateDialogOpen(true)
  }, [search, selectedSurvivor?.id])

  /**
   * Handle Create Custom Ability/Impairment
   *
   * Creates a new custom ability/impairment with the provided name and rules,
   * adds it to the available items, then assigns it to the survivor.
   */
  const handleCreate = useCallback(
    async (data: { name: string; rules: string }) => {
      if (creating || !selectedSurvivor?.id) return
      const name = data.name.trim()
      if (!name) return

      setCreating(true)

      try {
        const newItem = await addAbilityImpairment({
          custom: true,
          ability_impairment_name: name,
          rules: data.rules || null
        })

        setAvailableItems((prev) => ({
          ...prev,
          [newItem.id]: newItem
        }))

        setSearch('')
        setCreateDialogOpen(false)
        toast.success(ABILITY_IMPAIRMENT_CREATED_MESSAGE())

        // Add to survivor immediately
        const optimisticItem: AbilityImpairmentDetail = {
          id: newItem.id,
          custom: newItem.custom,
          ability_impairment_name: newItem.ability_impairment_name,
          rules: newItem.rules ?? null
        }
        const oldItems = [...items]

        setItems([...items, optimisticItem])

        void mutate({
          context: 'Ability/Impairment Add',
          persist: () =>
            addSurvivorAbilityImpairment(selectedSurvivor.id, newItem.id),
          rollback: () => {
            setItems(oldItems)
          },
          successMessage: ABILITY_IMPAIRMENT_UPDATED_MESSAGE(true)
        })
      } catch (error) {
        console.error('Ability/Impairment Create Error:', error)
        toast.error(ERROR_MESSAGE())
      } finally {
        setCreating(false)
      }
    },
    [creating, selectedSurvivor, items, toast, mutate]
  )

  /**
   * Handle Skip Next Hunt Toggle
   *
   * @param checked Checked State
   */
  const handleSkipNextHuntToggle = useCallback(
    (checked: boolean) => {
      const old = skipNextHunt
      setSkipNextHunt(checked)
      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, skip_next_hunt: checked } : s
        )
      )

      void mutate({
        context: 'Skip Next Hunt Update',
        persist: () =>
          updateSurvivor(selectedSurvivor?.id, { skip_next_hunt: checked }),
        rollback: () => {
          setSkipNextHunt(old)
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, skip_next_hunt: old } : s
            )
          )
        },
        successMessage: SURVIVOR_SKIP_NEXT_HUNT_UPDATED_MESSAGE(checked)
      })
    },
    [skipNextHunt, selectedSurvivor?.id, setSurvivors, mutate]
  )

  return (
    <Card className="p-2 border-0 gap-0">
      <CardHeader className="p-0">
        <CardTitle className="p-0 text-sm flex flex-row items-center justify-between h-8">
          Abilities & Impairments
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-6 w-6">
                <PlusIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command shouldFilter={true}>
                <CommandInput
                  placeholder="Search abilities/impairments..."
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
                      'Loading abilities and impairments...'
                    ) : (
                      'No abilities or impairments found.'
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {Object.values(availableItems)
                      .filter(
                        (a) => !items.some((existing) => existing.id === a.id)
                      )
                      .sort((a, b) =>
                        a.ability_impairment_name.localeCompare(
                          b.ability_impairment_name
                        )
                      )
                      .map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.ability_impairment_name}
                          onSelect={() => handleAdd(item.id)}>
                          {item.ability_impairment_name}
                          {item.custom && (
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
          {items.map((item, index) => {
            return (
              <div
                key={`${item.id}-${index}`}
                className="flex items-center gap-2">
                <CustomRulesText
                  className="ml-1 flex-grow"
                  custom={item.custom}
                  label={item.ability_impairment_name}
                  title={item.ability_impairment_name}
                  description="An ability or impairment carried by this survivor."
                  sections={[{ label: 'Rules', content: item.rules }]}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => handleRemove(index)}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            )
          })}

          {/* Skip Next Hunt */}
          <div className="flex justify-end mt-2 pr-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="skipNextHunt"
                checked={skipNextHunt}
                onCheckedChange={(checked) =>
                  handleSkipNextHuntToggle(!!checked)
                }
              />
              <Label htmlFor="skipNextHunt" className="text-xs cursor-pointer">
                Skip Next Hunt
              </Label>
            </div>
          </div>
        </div>
      </CardContent>

      <CustomItemDialog
        key={`create-ability-impairment-${createDialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={creating}
        initialName={createDialogName}
        title="Create Custom Ability/Impairment"
        description="A new trait manifests from the struggle."
        nameLabel="Ability/Impairment Name"
        namePlaceholder="Enter ability or impairment name"
        saveLabel="Create"
        savingLabel="Creating..."
      />
    </Card>
  )
}
