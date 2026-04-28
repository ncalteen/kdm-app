'use client'

import { WeaponTypeDialog } from '@/components/custom/dialogs/weapon-type-dialog'
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
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import { addWeaponType, getWeaponTypes } from '@/lib/dal/weapon-type'
import { ERROR_MESSAGE, WEAPON_TYPE_CREATED_MESSAGE } from '@/lib/messages'
import { WeaponTypeDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Select Weapon Type Component Properties
 */
export interface SelectWeaponTypeProps {
  /** Disabled State */
  disabled?: boolean
  /** Local State */
  local?: LocalStateType
  /** OnChange Handler */
  onChange?: (value: string) => void
  /** Value */
  value?: string | null
}

/**
 * Select Weapon Type Component
 *
 * Displays a searchable dropdown for selecting a weapon type. If the search
 * term does not match any existing weapon types, the user can create a new
 * custom weapon type.
 *
 * @param props Component Properties
 * @returns Select Weapon Type Component
 */
export function SelectWeaponType({
  disabled,
  local,
  onChange,
  value
}: SelectWeaponTypeProps): ReactElement {
  const { toast } = useToast(
    local ?? ({ disableToasts: false } as LocalStateType)
  )

  const [weaponTypes, setWeaponTypes] = useState<{
    [key: string]: WeaponTypeDetail
  }>({})
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createDialogName, setCreateDialogName] = useState('')
  const [createDialogKey, setCreateDialogKey] = useState(0)

  useEffect(() => {
    getWeaponTypes()
      .then((types) => setWeaponTypes(types))
      .catch((error) => {
        console.error('Weapon Types Fetch Error:', error)
      })
  }, [])

  /** Check if an exact match for the search term already exists. */
  const exactMatchExists = Object.values(weaponTypes).some(
    (type) =>
      type.weapon_type_name.toLowerCase() === search.trim().toLowerCase()
  )

  /**
   * Handle Type Select
   *
   * Selecting the already-selected type clears the selection.
   *
   * @param type Selected Weapon Type
   */
  const handleTypeSelect = (type: string) => {
    onChange?.(type === value ? '' : type)
    setOpen(false)
  }

  /**
   * Open Create Dialog
   *
   * Closes the popover and opens the weapon type dialog with the current
   * search term pre-filled as the name.
   */
  const openCreateDialog = useCallback(() => {
    const name = search.trim()
    if (!name) return

    setCreateDialogName(name)
    setCreateDialogKey((k) => k + 1)
    setOpen(false)
    setCreateDialogOpen(true)
  }, [search])

  /**
   * Handle Create Custom Weapon Type
   *
   * Creates a new custom weapon type with the provided name, specialist
   * proficiency rules, and master proficiency rules.
   */
  const handleCreate = useCallback(
    async (data: {
      weapon_type_name: string
      specialist_proficiency_rules: string
      master_proficiency_rules: string
    }) => {
      const name = data.weapon_type_name.trim()
      if (!name || creating) return

      setCreating(true)

      try {
        const newType = await addWeaponType({
          custom: true,
          weapon_type_name: name,
          specialist_proficiency_rules:
            data.specialist_proficiency_rules || null,
          master_proficiency_rules: data.master_proficiency_rules || null
        })

        setWeaponTypes((prev) => ({ ...prev, [newType.id]: newType }))
        onChange?.(newType.id)
        setSearch('')
        setCreateDialogOpen(false)
        toast.success(WEAPON_TYPE_CREATED_MESSAGE())
      } catch (error) {
        console.error('Weapon Type Create Error:', error)
        toast.error(ERROR_MESSAGE())
      } finally {
        setCreating(false)
      }
    },
    [creating, onChange, toast]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between text-sm min-w-[180px]"
          disabled={disabled}>
          {value && weaponTypes[value]
            ? weaponTypes[value].weapon_type_name
            : 'Select Type'}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Command shouldFilter={true}>
          <CommandInput
            placeholder="Search weapon type..."
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
              ) : (
                'No weapon types found.'
              )}
            </CommandEmpty>
            <CommandGroup>
              {Object.values(weaponTypes)
                .sort((a, b) =>
                  a.weapon_type_name.localeCompare(b.weapon_type_name)
                )
                .map((type) => (
                  <CommandItem
                    key={type.id}
                    value={type.weapon_type_name}
                    onSelect={() => handleTypeSelect(type.id)}>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === type.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {type.weapon_type_name}
                    {type.custom && (
                      <Badge variant="outline" className="ml-auto text-xs">
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

      <WeaponTypeDialog
        key={`create-weapon-type-${createDialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={creating}
        initialName={createDialogName}
        title="Create Custom Weapon Type"
        description="A new instrument of survival takes form."
        saveLabel="Create"
        savingLabel="Creating..."
      />
    </Popover>
  )
}
