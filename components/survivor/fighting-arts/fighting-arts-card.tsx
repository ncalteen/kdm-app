'use client'

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
  SurvivorDetail
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
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

type FightingArtItem = { id: string; fighting_art_name: string }
type SecretFightingArtItem = { id: string; secret_fighting_art_name: string }

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

  const [prevSurvivor, setPrevSurvivor] = useState(selectedSurvivor)

  const [availableFightingArts, setAvailableFightingArts] = useState<{
    [key: string]: FightingArtDetail
  }>({})
  const [availableSecretFightingArts, setAvailableSecretFightingArts] =
    useState<{ [key: string]: SecretFightingArtDetail }>({})
  const [fightingArts, setFightingArts] = useState<FightingArtItem[]>(
    selectedSurvivor?.fighting_arts ?? []
  )
  const [secretFightingArts, setSecretFightingArts] = useState<
    SecretFightingArtItem[]
  >(selectedSurvivor?.secret_fighting_arts ?? [])
  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')
  const [creatingRegular, setCreatingRegular] = useState(false)
  const [creatingSecret, setCreatingSecret] = useState(false)

  const canUseFightingArtsKnowledges =
    survivors.find((s) => s.id === selectedSurvivor?.id)
      ?.can_use_fighting_arts_knowledges ?? true

  if (prevSurvivor !== selectedSurvivor) {
    setPrevSurvivor(selectedSurvivor)
    setFightingArts(selectedSurvivor?.fighting_arts ?? [])
    setSecretFightingArts(selectedSurvivor?.secret_fighting_arts ?? [])
  }

  useEffect(() => {
    getFightingArts()
      .then((arts) => setAvailableFightingArts(arts))
      .catch((error) => {
        console.error('Fighting Arts Fetch Error:', error)
      })

    getSecretFightingArts()
      .then((arts) => setAvailableSecretFightingArts(arts))
      .catch((error) => {
        console.error('Secret Fighting Arts Fetch Error:', error)
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
    return Object.values(availableFightingArts ?? {}).filter(
      (f) => !assignedIds.has(f.id)
    )
  }, [availableFightingArts, fightingArts])

  /** Secret fighting arts available for selection */
  const selectableSecretArts = useMemo(() => {
    const assignedIds = new Set(secretFightingArts.map((f) => f.id))
    return Object.values(availableSecretFightingArts ?? {}).filter(
      (f) => !assignedIds.has(f.id)
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

      const optimisticItem: FightingArtItem = {
        id: fightingArtId,
        fighting_art_name: detail.fighting_art_name
      }
      const oldArts = [...fightingArts]

      setFightingArts([...fightingArts, optimisticItem])
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor.id
            ? { ...s, fighting_arts: [...s.fighting_arts, optimisticItem] }
            : s
        )
      )

      addSurvivorFightingArt(selectedSurvivor.id, fightingArtId)
        .then(() =>
          toast.success(SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE(false, true))
        )
        .catch((error: unknown) => {
          setFightingArts(oldArts)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, fighting_arts: oldArts }
                : s
            )
          )

          console.error('Fighting Art Add Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [
      availableFightingArts,
      fightingArts,
      selectedSurvivor,
      setSurvivors,
      survivors,
      toast
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

      const optimisticItem: SecretFightingArtItem = {
        id: secretFightingArtId,
        secret_fighting_art_name: detail.secret_fighting_art_name
      }
      const oldArts = [...secretFightingArts]

      setSecretFightingArts([...secretFightingArts, optimisticItem])
      setSurvivors(
        survivors.map((s) =>
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

      addSurvivorSecretFightingArt(selectedSurvivor.id, secretFightingArtId)
        .then(() =>
          toast.success(SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE(true, true))
        )
        .catch((error: unknown) => {
          setSecretFightingArts(oldArts)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, secret_fighting_arts: oldArts }
                : s
            )
          )

          console.error('Secret Fighting Art Add Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [
      availableSecretFightingArts,
      secretFightingArts,
      selectedSurvivor,
      setSurvivors,
      survivors,
      toast
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
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor.id ? { ...s, fighting_arts: updated } : s
        )
      )

      removeSurvivorFightingArt(selectedSurvivor.id, removed.id)
        .then(() => toast.success(SURVIVOR_FIGHTING_ART_REMOVED_MESSAGE(false)))
        .catch((error: unknown) => {
          setFightingArts(oldArts)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, fighting_arts: oldArts }
                : s
            )
          )

          console.error('Fighting Art Remove Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [fightingArts, selectedSurvivor, setSurvivors, survivors, toast]
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
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor.id
            ? { ...s, secret_fighting_arts: updated }
            : s
        )
      )

      removeSurvivorSecretFightingArt(selectedSurvivor.id, removed.id)
        .then(() => toast.success(SURVIVOR_FIGHTING_ART_REMOVED_MESSAGE(true)))
        .catch((error: unknown) => {
          setSecretFightingArts(oldArts)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, secret_fighting_arts: oldArts }
                : s
            )
          )

          console.error('Secret Fighting Art Remove Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [secretFightingArts, selectedSurvivor, setSurvivors, survivors, toast]
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

      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, can_use_fighting_arts_knowledges: newValue }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, {
        can_use_fighting_arts_knowledges: newValue
      })
        .then(() =>
          toast.success(
            SURVIVOR_CAN_USE_FIGHTING_ARTS_UPDATED_MESSAGE(newValue)
          )
        )
        .catch((error: unknown) => {
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, can_use_fighting_arts_knowledges: oldValue }
                : s
            )
          )

          console.error('Can Use Fighting Arts Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [
      canUseFightingArtsKnowledges,
      selectedSurvivor?.id,
      setSurvivors,
      survivors,
      toast
    ]
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
   * Creates a new custom fighting art with the current search term, adds it
   * to the available arts, then assigns it to the survivor.
   */
  const handleCreateRegular = useCallback(async () => {
    const name = search.trim()
    if (!name || creatingRegular || !selectedSurvivor?.id) return

    setCreatingRegular(true)

    try {
      const newArt = await addFightingArt({
        custom: true,
        fighting_art_name: name
      })

      setAvailableFightingArts((prev) => ({ ...prev, [newArt.id]: newArt }))
      setSearch('')
      setAddOpen(false)
      toast.success(FIGHTING_ART_CREATED_MESSAGE())

      // Add to survivor immediately
      const optimisticItem: FightingArtItem = {
        id: newArt.id,
        fighting_art_name: newArt.fighting_art_name
      }
      const oldArts = [...fightingArts]

      setFightingArts([...fightingArts, optimisticItem])
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor.id
            ? { ...s, fighting_arts: [...s.fighting_arts, optimisticItem] }
            : s
        )
      )

      addSurvivorFightingArt(selectedSurvivor.id, newArt.id)
        .then(() =>
          toast.success(SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE(false, true))
        )
        .catch((error: unknown) => {
          setFightingArts(oldArts)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, fighting_arts: oldArts }
                : s
            )
          )

          console.error('Fighting Art Add Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    } catch (error) {
      console.error('Fighting Art Create Error:', error)
      toast.error(ERROR_MESSAGE())
    } finally {
      setCreatingRegular(false)
    }
  }, [
    search,
    creatingRegular,
    selectedSurvivor,
    fightingArts,
    setSurvivors,
    survivors,
    toast
  ])

  /**
   * Handle Create Custom Secret Fighting Art
   *
   * Creates a new custom secret fighting art with the current search term,
   * adds it to the available arts, then assigns it to the survivor.
   */
  const handleCreateSecret = useCallback(async () => {
    const name = search.trim()
    if (!name || creatingSecret || !selectedSurvivor?.id) return

    setCreatingSecret(true)

    try {
      const newArt = await addSecretFightingArt({
        custom: true,
        secret_fighting_art_name: name
      })

      setAvailableSecretFightingArts((prev) => ({
        ...prev,
        [newArt.id]: newArt
      }))
      setSearch('')
      setAddOpen(false)
      toast.success(SECRET_FIGHTING_ART_CREATED_MESSAGE())

      // Add to survivor immediately
      const optimisticItem: SecretFightingArtItem = {
        id: newArt.id,
        secret_fighting_art_name: newArt.secret_fighting_art_name
      }
      const oldArts = [...secretFightingArts]

      setSecretFightingArts([...secretFightingArts, optimisticItem])
      setSurvivors(
        survivors.map((s) =>
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

      addSurvivorSecretFightingArt(selectedSurvivor.id, newArt.id)
        .then(() =>
          toast.success(SURVIVOR_FIGHTING_ART_UPDATED_MESSAGE(true, true))
        )
        .catch((error: unknown) => {
          setSecretFightingArts(oldArts)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor.id
                ? { ...s, secret_fighting_arts: oldArts }
                : s
            )
          )

          console.error('Secret Fighting Art Add Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    } catch (error) {
      console.error('Secret Fighting Art Create Error:', error)
      toast.error(ERROR_MESSAGE())
    } finally {
      setCreatingSecret(false)
    }
  }, [
    search,
    creatingSecret,
    selectedSurvivor,
    secretFightingArts,
    setSurvivors,
    survivors,
    toast
  ])

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
                            onClick={handleCreateRegular}>
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
                            onClick={handleCreateSecret}>
                            <Plus className="h-4 w-4" />
                            {creatingSecret
                              ? 'Creating...'
                              : `Create Secret Fighting Art "${search.trim()}"`}
                          </button>
                        )}
                      </div>
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
                          onSelect={handleCreateRegular}
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
                          onSelect={handleCreateSecret}
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
              <span className="text-sm flex-grow">{art.fighting_art_name}</span>
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
              <span className="text-sm flex-grow">
                {art.secret_fighting_art_name}
              </span>
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
    </Card>
  )
}
