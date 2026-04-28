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
  CommandList,
  CommandSeparator
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
import { addFightingArt, getFightingArts } from '@/lib/dal/fighting-art'
import {
  addSecretFightingArt,
  getSecretFightingArts
} from '@/lib/dal/secret-fighting-art'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  addSurvivorFightingArt,
  removeSurvivorFightingArt
} from '@/lib/dal/survivor-fighting-art'
import {
  addSurvivorSecretFightingArt,
  removeSurvivorSecretFightingArt
} from '@/lib/dal/survivor-secret-fighting-art'
import {
  ERROR_MESSAGE,
  FIGHTING_ART_CREATED_MESSAGE,
  SECRET_FIGHTING_ART_CREATED_MESSAGE,
  SURVIVOR_CAN_USE_FIGHTING_ARTS_UPDATED_MESSAGE,
  SURVIVOR_FIGHTING_ART_REMOVED_MESSAGE,
  SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE
} from '@/lib/messages'
import {
  FightingArtDetail,
  SecretFightingArtDetail,
  SettlementDetail,
  SurvivorDetail,
  SurvivorsStateSetter
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { Plus, PlusIcon, TrashIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Fighting Arts Card Properties
 */
interface FightingArtsCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: SurvivorsStateSetter
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Fighting Arts Card Component
 *
 * @param props Fighting Arts Card Properties
 * @returns Fighting Arts Card Component
 */
export function FightingArtsCard({
  local,
  selectedSettlement,
  selectedSurvivor,
  setSurvivors,
  survivors
}: FightingArtsCardProps): ReactElement {
  const { toast } = useToast(local)
  const mutate = useOptimisticMutation(local)

  const [prevSurvivor, setPrevSurvivor] = useState(selectedSurvivor)

  const [availableFightingArts, setAvailableFightingArts] = useState<{
    [key: string]: FightingArtDetail
  }>({})
  const [availableSecretFightingArts, setAvailableSecretFightingArts] =
    useState<{ [key: string]: SecretFightingArtDetail }>({})
  const [fightingArts, setFightingArts] = useState<FightingArtDetail[]>(
    selectedSurvivor?.fighting_arts ?? []
  )
  const [secretFightingArts, setSecretFightingArts] = useState<
    SecretFightingArtDetail[]
  >(selectedSurvivor?.secret_fighting_arts ?? [])
  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')
  const [creatingRegular, setCreatingRegular] = useState(false)
  const [creatingSecret, setCreatingSecret] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createDialogType, setCreateDialogType] = useState<
    'regular' | 'secret'
  >('regular')
  const [createDialogName, setCreateDialogName] = useState('')
  const [createDialogKey, setCreateDialogKey] = useState(0)
  const [hasFetched, setHasFetched] = useState<boolean>(false)

  const canUseFightingArtsKnowledges =
    survivors.find((s) => s.id === selectedSurvivor?.id)
      ?.can_use_fighting_arts_knowledges ?? true

  if (prevSurvivor !== selectedSurvivor) {
    setPrevSurvivor(selectedSurvivor)
    setFightingArts(selectedSurvivor?.fighting_arts ?? [])
    setSecretFightingArts(selectedSurvivor?.secret_fighting_arts ?? [])
  }

  useEffect(() => {
    let regularLoaded = false
    let secretLoaded = false

    const markLoaded = () => {
      if (regularLoaded && secretLoaded) setHasFetched(true)
    }

    getFightingArts()
      .then((arts) => setAvailableFightingArts(arts))
      .catch((error) => {
        console.error('Fighting Arts Fetch Error:', error)
      })
      .finally(() => {
        regularLoaded = true
        markLoaded()
      })

    getSecretFightingArts()
      .then((arts) => setAvailableSecretFightingArts(arts))
      .catch((error) => {
        console.error('Secret Fighting Arts Fetch Error:', error)
      })
      .finally(() => {
        secretLoaded = true
        markLoaded()
      })
  }, [])

  const totalArts = fightingArts.length + secretFightingArts.length

  const isAtRegularLimit =
    selectedSettlement?.survivor_type === 'ARC'
      ? fightingArts.length >= 1
      : totalArts >= 3

  const isAtSecretLimit =
    selectedSettlement?.survivor_type === 'ARC'
      ? secretFightingArts.length >= 1
      : totalArts >= 3

  /** Regular fighting arts available for selection */
  const selectableRegularArts = useMemo(() => {
    const assignedIds = new Set(fightingArts.map((f) => f.id))
    return Object.values(availableFightingArts ?? {})
      .filter((f) => !assignedIds.has(f.id))
      .sort((a, b) => a.fighting_art_name.localeCompare(b.fighting_art_name))
  }, [availableFightingArts, fightingArts])

  /** Secret fighting arts available for selection */
  const selectableSecretArts = useMemo(() => {
    const assignedIds = new Set(secretFightingArts.map((f) => f.id))
    return Object.values(availableSecretFightingArts ?? {})
      .filter((f) => !assignedIds.has(f.id))
      .sort((a, b) =>
        a.secret_fighting_art_name.localeCompare(b.secret_fighting_art_name)
      )
  }, [availableSecretFightingArts, secretFightingArts])

  /**
   * Handle Add Regular Fighting Art
   *
   * @param fightingArtId Fighting Art ID
   */
  const handleAddRegular = useCallback(
    (fightingArtId: string) => {
      if (!selectedSurvivor?.id || !fightingArtId) return

      const detail = availableFightingArts[fightingArtId]
      if (!detail) return

      const optimisticItem: FightingArtDetail = {
        id: fightingArtId,
        fighting_art_name: detail.fighting_art_name,
        custom: detail.custom,
        rules: detail.rules ?? null
      }
      const oldArts = [...fightingArts]

      setFightingArts([...fightingArts, optimisticItem])
      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor.id
            ? { ...s, fighting_arts: [...s.fighting_arts, optimisticItem] }
            : s
        )
      )

      void mutate({
        context: 'Fighting Art Add',
        persist: () =>
          addSurvivorFightingArt(selectedSurvivor.id, fightingArtId),
        rollback: () => {
          setFightingArts(oldArts)
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, fighting_arts: oldArts }
                : s
            )
          )
        },
        successMessage: SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE(false, true)
      })
    },
    [
      availableFightingArts,
      fightingArts,
      selectedSurvivor,
      setSurvivors,
      mutate
    ]
  )

  /**
   * Handle Add Secret Fighting Art
   *
   * @param secretFightingArtId Secret Fighting Art ID
   */
  const handleAddSecret = useCallback(
    (secretFightingArtId: string) => {
      if (!selectedSurvivor?.id || !secretFightingArtId) return

      const detail = availableSecretFightingArts[secretFightingArtId]
      if (!detail) return

      const optimisticItem: SecretFightingArtDetail = {
        id: secretFightingArtId,
        secret_fighting_art_name: detail.secret_fighting_art_name,
        custom: detail.custom,
        rules: detail.rules ?? null
      }
      const oldArts = [...secretFightingArts]

      setSecretFightingArts([...secretFightingArts, optimisticItem])
      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor.id
            ? {
                ...s,
                secret_fighting_arts: [
                  ...s.secret_fighting_arts,
                  optimisticItem
                ]
              }
            : s
        )
      )

      void mutate({
        context: 'Secret Fighting Art Add',
        persist: () =>
          addSurvivorSecretFightingArt(
            selectedSurvivor.id,
            secretFightingArtId
          ),
        rollback: () => {
          setSecretFightingArts(oldArts)
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, secret_fighting_arts: oldArts }
                : s
            )
          )
        },
        successMessage: SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE(true, true)
      })
    },
    [
      availableSecretFightingArts,
      secretFightingArts,
      selectedSurvivor,
      setSurvivors,
      mutate
    ]
  )

  /**
   * Handle Add Fighting Art
   *
   * Adds a regular or secret fighting art to the survivor.
   *
   * @param id Fighting Art ID
   * @param isSecret Whether the art is a secret fighting art
   */
  const handleAdd = useCallback(
    (id: string, isSecret: boolean) => {
      setAddOpen(false)
      if (isSecret) handleAddSecret(id)
      else handleAddRegular(id)
    },
    [handleAddRegular, handleAddSecret]
  )

  /**
   * Handle Remove Regular Fighting Art
   *
   * @param index Fighting Art Index
   */
  const handleRemoveRegular = useCallback(
    (index: number) => {
      if (!selectedSurvivor?.id) return

      const removed = fightingArts[index]
      if (!removed) return

      const oldArts = [...fightingArts]
      const updated = fightingArts.filter((_, i) => i !== index)

      setFightingArts(updated)
      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor.id ? { ...s, fighting_arts: updated } : s
        )
      )

      void mutate({
        context: 'Fighting Art Remove',
        persist: () =>
          removeSurvivorFightingArt(selectedSurvivor.id, removed.id),
        rollback: () => {
          setFightingArts(oldArts)
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, fighting_arts: oldArts }
                : s
            )
          )
        },
        successMessage: SURVIVOR_FIGHTING_ART_REMOVED_MESSAGE(false)
      })
    },
    [fightingArts, selectedSurvivor, setSurvivors, mutate]
  )

  /**
   * Handle Remove Secret Fighting Art
   *
   * @param index Secret Fighting Art Index
   */
  const handleRemoveSecret = useCallback(
    (index: number) => {
      if (!selectedSurvivor?.id) return

      const removed = secretFightingArts[index]
      if (!removed) return

      const oldArts = [...secretFightingArts]
      const updated = secretFightingArts.filter((_, i) => i !== index)

      setSecretFightingArts(updated)
      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor.id
            ? { ...s, secret_fighting_arts: updated }
            : s
        )
      )

      void mutate({
        context: 'Secret Fighting Art Remove',
        persist: () =>
          removeSurvivorSecretFightingArt(selectedSurvivor.id, removed.id),
        rollback: () => {
          setSecretFightingArts(oldArts)
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, secret_fighting_arts: oldArts }
                : s
            )
          )
        },
        successMessage: SURVIVOR_FIGHTING_ART_REMOVED_MESSAGE(true)
      })
    },
    [secretFightingArts, selectedSurvivor, setSurvivors, mutate]
  )

  /**
   * Update Can Use Fighting Arts or Knowledges Status
   *
   * @param checked Checkbox Checked Status
   */
  const updateCanUseFightingArtsOrKnowledges = useCallback(
    (checked: boolean) => {
      const newValue = !checked
      const oldValue = canUseFightingArtsKnowledges

      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, can_use_fighting_arts_knowledges: newValue }
            : s
        )
      )

      void mutate({
        context: 'Can Use Fighting Arts Update',
        persist: () =>
          updateSurvivor(selectedSurvivor?.id, {
            can_use_fighting_arts_knowledges: newValue
          }),
        rollback: () => {
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, can_use_fighting_arts_knowledges: oldValue }
                : s
            )
          )
        },
        successMessage: SURVIVOR_CAN_USE_FIGHTING_ARTS_UPDATED_MESSAGE(newValue)
      })
    },
    [canUseFightingArtsKnowledges, selectedSurvivor?.id, setSurvivors, mutate]
  )

  /** Check if an exact match for the search term already exists in regular arts. */
  const exactRegularMatch = Object.values(availableFightingArts).some(
    (a) => a.fighting_art_name.toLowerCase() === search.trim().toLowerCase()
  )

  /** Check if an exact match for the search term already exists in secret arts. */
  const exactSecretMatch = Object.values(availableSecretFightingArts).some(
    (a) =>
      a.secret_fighting_art_name.toLowerCase() === search.trim().toLowerCase()
  )

  /**
   * Handle Create Custom Fighting Art
   *
   * Creates a new custom fighting art with the provided name and rules, adds
   * it to the available arts, then assigns it to the survivor.
   */
  const handleCreateRegular = useCallback(
    async (data: { name: string; rules: string }) => {
      const name = data.name.trim()
      if (!name || creatingRegular || !selectedSurvivor?.id) return

      setCreatingRegular(true)

      try {
        const newArt = await addFightingArt({
          custom: true,
          fighting_art_name: name,
          rules: data.rules || null
        })

        setAvailableFightingArts((prev) => ({ ...prev, [newArt.id]: newArt }))
        setSearch('')
        setCreateDialogOpen(false)
        toast.success(FIGHTING_ART_CREATED_MESSAGE())

        // Add to survivor immediately
        const optimisticItem: FightingArtDetail = {
          id: newArt.id,
          fighting_art_name: newArt.fighting_art_name,
          custom: newArt.custom,
          rules: newArt.rules ?? null
        }
        const oldArts = [...fightingArts]

        setFightingArts([...fightingArts, optimisticItem])
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor.id
              ? { ...s, fighting_arts: [...s.fighting_arts, optimisticItem] }
              : s
          )
        )

        void mutate({
          context: 'Fighting Art Add',
          persist: () => addSurvivorFightingArt(selectedSurvivor.id, newArt.id),
          rollback: () => {
            setFightingArts(oldArts)
            setSurvivors((prev) =>
              prev.map((s) =>
                s.id === selectedSurvivor.id
                  ? { ...s, fighting_arts: oldArts }
                  : s
              )
            )
          },
          successMessage: SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE(false, true)
        })
      } catch (error) {
        console.error('Fighting Art Create Error:', error)
        toast.error(ERROR_MESSAGE())
      } finally {
        setCreatingRegular(false)
      }
    },
    [
      creatingRegular,
      selectedSurvivor,
      fightingArts,
      setSurvivors,
      toast,
      mutate
    ]
  )

  /**
   * Handle Create Custom Secret Fighting Art
   *
   * Creates a new custom secret fighting art with the provided name and
   * rules, adds it to the available arts, then assigns it to the survivor.
   */
  const handleCreateSecret = useCallback(
    async (data: { name: string; rules: string }) => {
      const name = data.name.trim()
      if (!name || creatingSecret || !selectedSurvivor?.id) return

      setCreatingSecret(true)

      try {
        const newArt = await addSecretFightingArt({
          custom: true,
          secret_fighting_art_name: name,
          rules: data.rules || null
        })

        setAvailableSecretFightingArts((prev) => ({
          ...prev,
          [newArt.id]: newArt
        }))
        setSearch('')
        setCreateDialogOpen(false)
        toast.success(SECRET_FIGHTING_ART_CREATED_MESSAGE())

        // Add to survivor immediately
        const optimisticItem: SecretFightingArtDetail = {
          id: newArt.id,
          secret_fighting_art_name: newArt.secret_fighting_art_name,
          custom: newArt.custom,
          rules: newArt.rules ?? null
        }
        const oldArts = [...secretFightingArts]

        setSecretFightingArts([...secretFightingArts, optimisticItem])
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor.id
              ? {
                  ...s,
                  secret_fighting_arts: [
                    ...s.secret_fighting_arts,
                    optimisticItem
                  ]
                }
              : s
          )
        )

        void mutate({
          context: 'Secret Fighting Art Add',
          persist: () =>
            addSurvivorSecretFightingArt(selectedSurvivor.id, newArt.id),
          rollback: () => {
            setSecretFightingArts(oldArts)
            setSurvivors((prev) =>
              prev.map((s) =>
                s.id === selectedSurvivor.id
                  ? { ...s, secret_fighting_arts: oldArts }
                  : s
              )
            )
          },
          successMessage: SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE(true, true)
        })
      } catch (error) {
        console.error('Secret Fighting Art Create Error:', error)
        toast.error(ERROR_MESSAGE())
      } finally {
        setCreatingSecret(false)
      }
    },
    [
      creatingSecret,
      selectedSurvivor,
      secretFightingArts,
      setSurvivors,
      toast,
      mutate
    ]
  )

  /**
   * Open Create Dialog
   *
   * Closes the add popover and opens the custom item dialog for creating a
   * regular or secret fighting art, pre-filled with the current search term.
   */
  const openCreateDialog = useCallback(
    (type: 'regular' | 'secret') => {
      const name = search.trim()
      if (!name || !selectedSurvivor?.id) return

      if (type === 'regular' && isAtRegularLimit) return
      if (type === 'secret' && isAtSecretLimit) return

      setCreateDialogType(type)
      setCreateDialogName(name)
      setCreateDialogKey((k) => k + 1)
      setAddOpen(false)
      setCreateDialogOpen(true)
    },
    [search, selectedSurvivor?.id, isAtRegularLimit, isAtSecretLimit]
  )

  /** Dispatch dialog save to the appropriate creator. */
  const handleDialogSave = useCallback(
    (data: { name: string; rules: string }) => {
      if (createDialogType === 'regular') return handleCreateRegular(data)
      return handleCreateSecret(data)
    },
    [createDialogType, handleCreateRegular, handleCreateSecret]
  )

  if (selectedSettlement?.campaign_type === 'SQUIRES_OF_THE_CITADEL')
    return <></>

  return (
    <Card
      className={cn(
        'p-2 border-0 gap-0',
        !canUseFightingArtsKnowledges && 'bg-red-500/40'
      )}>
      <CardHeader className="p-0">
        <CardTitle className="p-0 text-sm flex flex-row items-center justify-between h-8">
          Fighting Arts &amp; Secret Fighting Arts
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-6 w-6"
                disabled={isAtRegularLimit && isAtSecretLimit}>
                <PlusIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command shouldFilter={true}>
                <CommandInput
                  placeholder="Search fighting arts..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {search.trim() ? (
                      <div className="flex flex-col gap-1">
                        {!isAtRegularLimit && (
                          <button
                            type="button"
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm justify-center"
                            disabled={creatingRegular}
                            onClick={() => openCreateDialog('regular')}>
                            <Plus className="h-4 w-4" />
                            {creatingRegular
                              ? 'Creating...'
                              : `Create Fighting Art "${search.trim()}"`}
                          </button>
                        )}
                        {!isAtSecretLimit && (
                          <button
                            type="button"
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm justify-center"
                            disabled={creatingSecret}
                            onClick={() => openCreateDialog('secret')}>
                            <Plus className="h-4 w-4" />
                            {creatingSecret
                              ? 'Creating...'
                              : `Create Secret Fighting Art "${search.trim()}"`}
                          </button>
                        )}
                      </div>
                    ) : !hasFetched ? (
                      'Loading fighting arts...'
                    ) : (
                      'No fighting arts found.'
                    )}
                  </CommandEmpty>
                  {!isAtRegularLimit && (
                    <CommandGroup heading="Fighting Arts">
                      {selectableRegularArts.map((art) => (
                        <CommandItem
                          key={art.id}
                          value={art.fighting_art_name}
                          onSelect={() => handleAdd(art.id, false)}>
                          {art.fighting_art_name}
                          {art.custom && (
                            <Badge
                              variant="outline"
                              className="ml-auto text-xs">
                              Custom
                            </Badge>
                          )}
                        </CommandItem>
                      ))}
                      {search.trim() && !exactRegularMatch && (
                        <CommandItem
                          value={`__create_regular__${search.trim()}`}
                          onSelect={() => openCreateDialog('regular')}
                          disabled={creatingRegular}>
                          <Plus className="h-4 w-4" />
                          {creatingRegular
                            ? 'Creating...'
                            : `Create "${search.trim()}"`}
                        </CommandItem>
                      )}
                    </CommandGroup>
                  )}
                  <CommandSeparator />
                  {!isAtSecretLimit && (
                    <CommandGroup heading="Secret Fighting Arts">
                      {selectableSecretArts.map((art) => (
                        <CommandItem
                          key={art.id}
                          value={art.secret_fighting_art_name}
                          onSelect={() => handleAdd(art.id, true)}>
                          {art.secret_fighting_art_name}
                          {art.custom && (
                            <Badge
                              variant="outline"
                              className="ml-auto text-xs">
                              Custom
                            </Badge>
                          )}
                        </CommandItem>
                      ))}
                      {search.trim() && !exactSecretMatch && (
                        <CommandItem
                          value={`__create_secret__${search.trim()}`}
                          onSelect={() => openCreateDialog('secret')}
                          disabled={creatingSecret}>
                          <Plus className="h-4 w-4" />
                          {creatingSecret
                            ? 'Creating...'
                            : `Create "${search.trim()}"`}
                        </CommandItem>
                      )}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col">
          {fightingArts.map((art, index) => (
            <div key={`regular-${art.id}`} className="flex items-center gap-2">
              <Badge variant="default" className="w-[60px] text-center">
                Fighting
              </Badge>
              <CustomRulesText
                className="flex-grow"
                custom={art.custom}
                label={art.fighting_art_name}
                title={art.fighting_art_name}
                description="A fighting art mastered by this survivor."
                sections={[{ label: 'Rules', content: art.rules }]}
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => handleRemoveRegular(index)}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {secretFightingArts.map((art, index) => (
            <div key={`secret-${art.id}`} className="flex items-center gap-2">
              <Badge variant="secondary" className="w-[60px] text-center">
                Secret
              </Badge>
              <CustomRulesText
                className="flex-grow"
                custom={art.custom}
                label={art.secret_fighting_art_name}
                title={art.secret_fighting_art_name}
                description="A secret fighting art guarded by this survivor."
                sections={[{ label: 'Rules', content: art.rules }]}
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => handleRemoveSecret(index)}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-2 pr-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="canUseFightingArtsOrKnowledges"
              checked={!canUseFightingArtsKnowledges}
              onCheckedChange={updateCanUseFightingArtsOrKnowledges}
            />
            <Label
              htmlFor="canUseFightingArtsOrKnowledges"
              className="text-xs cursor-pointer">
              Cannot Use Fighting Arts
            </Label>
          </div>
        </div>
      </CardContent>

      <CustomItemDialog
        key={`create-fighting-art-${createDialogKey}`}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleDialogSave}
        saving={
          createDialogType === 'regular' ? creatingRegular : creatingSecret
        }
        initialName={createDialogName}
        title={
          createDialogType === 'regular'
            ? 'Create Custom Fighting Art'
            : 'Create Custom Secret Fighting Art'
        }
        description="A new discipline is mastered against the odds."
        nameLabel={
          createDialogType === 'regular'
            ? 'Fighting Art Name'
            : 'Secret Fighting Art Name'
        }
        namePlaceholder={
          createDialogType === 'regular'
            ? 'Enter fighting art name'
            : 'Enter secret fighting art name'
        }
        saveLabel="Create"
        savingLabel="Creating..."
      />
    </Card>
  )
}
