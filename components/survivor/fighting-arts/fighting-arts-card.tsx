'use client'

import { SelectFightingArt } from '@/components/menu/select-fighting-art'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { getFightingArts } from '@/lib/dal/fighting-art'
import { getSecretFightingArts } from '@/lib/dal/secret-fighting-art'
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
import { PlusIcon, TrashIcon } from 'lucide-react'
import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { toast } from 'sonner'

/**
 * Fighting Arts Card Properties
 */
interface FightingArtsCardProps {
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
  selectedSettlement,
  selectedSurvivor,
  setSurvivors,
  survivors
}: FightingArtsCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

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
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)

  const canUseFightingArtsKnowledges =
    survivors.find((s) => s.id === selectedSurvivor?.id)
      ?.can_use_fighting_arts_knowledges ?? true

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id
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
      survivors
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
      survivors
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
      setIsAddingNew(false)
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
    [fightingArts, selectedSurvivor, setSurvivors, survivors]
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
    [secretFightingArts, selectedSurvivor, setSurvivors, survivors]
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
      survivors
    ]
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
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="h-6 w-6"
              disabled={isAddingNew || (isAtRegularLimit && isAtSecretLimit)}>
              <PlusIcon />
            </Button>
          )}
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

          {isAddingNew && (
            <div className="flex items-center justify-between gap-2">
              <SelectFightingArt
                fightingArts={selectableRegularArts}
                secretFightingArts={selectableSecretArts}
                regularAtLimit={isAtRegularLimit}
                secretAtLimit={isAtSecretLimit}
                onChange={handleAdd}
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => setIsAddingNew(false)}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
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
