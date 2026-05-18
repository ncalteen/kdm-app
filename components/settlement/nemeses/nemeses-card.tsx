'use client'

import { NemesisItem } from '@/components/settlement/nemeses/nemesis-item'
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
import { useCatalogFetch } from '@/hooks/use-catalog-fetch'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { useToast } from '@/hooks/use-toast'
import { getNemeses } from '@/lib/dal/nemesis'
import { getNemesisLocationIds } from '@/lib/dal/nemesis-location'
import { getNemesisTimelineYears } from '@/lib/dal/nemesis-timeline-year'
import { addSettlementLocations } from '@/lib/dal/settlement-location'
import {
  addSettlementNemeses,
  removeSettlementNemesis,
  updateSettlementNemesis
} from '@/lib/dal/settlement-nemesis'
import {
  addSettlementTimelineYear,
  saveSettlementTimelineYearEntry
} from '@/lib/dal/settlement-timeline-year'
import { CampaignType, MonsterNode } from '@/lib/enums'
import {
  ERROR_MESSAGE,
  NEMESIS_ADDED_MESSAGE,
  NEMESIS_DEFEATED_MESSAGE,
  NEMESIS_REMOVED_MESSAGE,
  NEMESIS_UNLOCKED_MESSAGE
} from '@/lib/messages'
import { sortNemeses } from '@/lib/settlement/nemeses'
import {
  NemesisDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { PlusIcon, SkullIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'

/**
 * Nemeses Card Properties
 */
interface NemesesCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
}

/**
 * Nemeses Card Component
 *
 * Displays the nemeses linked to a settlement and allows users to add, remove,
 * toggle the unlocked state, and track defeated levels. All mutations are
 * applied optimistically so the UI updates before the database transaction
 * completes.
 *
 * @param props Nemeses Card Properties
 * @returns Nemeses Card Component
 */
export function NemesesCard({
  local,
  selectedSettlement,
  setSelectedSettlement
}: NemesesCardProps): ReactElement {
  const { toast } = useToast(local)
  const mutate = useOptimisticMutation(local)

  const [addOpen, setAddOpen] = useState<boolean>(false)

  // Available nemeses for the select dropdown (fetched once per settlement).
  const { data: availableNemeses, isLoaded: hasFetched } = useCatalogFetch<{
    [key: string]: NemesisDetail
  }>(
    selectedSettlement?.id,
    () =>
      // Don't include alternates or vignettes in the dropdown
      getNemeses(
        [
          MonsterNode.NN1,
          MonsterNode.NN2,
          MonsterNode.NN3,
          MonsterNode.CO,
          MonsterNode.FI
        ],
        false,
        false
      ),
    {
      initial: {},
      errorContext: 'Settlement Nemeses Fetch Error',
      onReset: () => setAddOpen(false),
      onError: () => toast.error(ERROR_MESSAGE())
    }
  )

  /**
   * Available Nemeses Not Yet Added
   *
   * Filters the full list of available nemeses to only those not already
   * linked to the settlement, preventing duplicates in the add dropdown.
   */
  const selectableNemeses = useMemo(() => {
    const linkedIds = new Set(
      (selectedSettlement?.nemeses ?? []).map((n) => n.nemesis_id)
    )
    return Object.values(availableNemeses)
      .filter((n) => !linkedIds.has(n.id))
      .sort((a, b) => a.monster_name.localeCompare(b.monster_name))
  }, [availableNemeses, selectedSettlement?.nemeses])

  /**
   * Handle Add Nemesis
   *
   * Optimistically adds a nemesis to the settlement, then persists to the DB.
   *
   * @param nemesisId Nemesis ID
   */
  const handleAdd = useCallback(
    (nemesisId: string | undefined) => {
      if (!nemesisId || !selectedSettlement) return

      const nemesisInfo = Object.values(availableNemeses).find(
        (n) => n.id === nemesisId
      )
      if (!nemesisInfo) return

      setAddOpen(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${crypto.randomUUID()}`
      const optimisticRow: SettlementDetail['nemeses'][0] = {
        available_levels: [],
        basic_action: nemesisInfo.basic_action,
        blind_spot: nemesisInfo.blind_spot,
        collective_cognition_level_1: false,
        collective_cognition_level_2: false,
        collective_cognition_level_3: false,
        defeat_outcome: nemesisInfo.defeat_outcome,
        deployment_rules: nemesisInfo.deployment_rules,
        id: tempId,
        instinct: nemesisInfo.instinct,
        level_1_defeated: false,
        level_2_defeated: false,
        level_3_defeated: false,
        level_4_defeated: false,
        monster_name: nemesisInfo.monster_name,
        nemesis_id: nemesisId,
        node: nemesisInfo.node,
        unlocked: false,
        victory_outcome: nemesisInfo.victory_outcome,
        custom: nemesisInfo.custom,
        // Optimistic placeholder; the realtime/refetch reconciles
        // `author_username` from the catalog row's `user_id` (E2.8).
        author_user_id: null,
        author_username: null,
        author_avatar_url: null
      }

      // Capture the updated nemeses list so async callbacks reference it
      // instead of the stale pre-update closure value.
      const updatedNemeses = sortNemeses([
        ...selectedSettlement.nemeses,
        optimisticRow
      ])

      setSelectedSettlement({
        ...selectedSettlement,
        nemeses: updatedNemeses
      })

      void mutate({
        context: 'Nemesis Add',
        persist: () =>
          addSettlementNemeses([nemesisId], selectedSettlement?.id),
        onSuccess: async (row) => {
          // Replace the placeholder with the real row from the DB.
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  nemeses: sortNemeses(
                    prev.nemeses.map((n) =>
                      n.id === tempId
                        ? {
                            ...n,
                            available_levels: row[0].available_levels,
                            id: row[0].id,
                            node: nemesisInfo.node
                          }
                        : n
                    )
                  )
                }
              : null
          )

          // Add related locations and timeline events
          try {
            const campaignType =
              CampaignType[
                selectedSettlement.campaign_type as keyof typeof CampaignType
              ]

            const [locationIds, timelineYears] = await Promise.all([
              getNemesisLocationIds(nemesisId),
              getNemesisTimelineYears(nemesisId, campaignType)
            ])

            // Collect new locations to merge
            let newLocationRows: SettlementDetail['locations'] = []

            if (locationIds.length > 0) {
              const existingLocIds = new Set(
                selectedSettlement.locations.map((l) => l.location_id)
              )
              const newLocIds = locationIds.filter(
                (id) => !existingLocIds.has(id)
              )
              if (newLocIds.length > 0) {
                const inserted = await addSettlementLocations(
                  newLocIds,
                  selectedSettlement.id
                )
                newLocationRows = inserted.map((ins, i) => ({
                  id: ins.id,
                  location_id: newLocIds[i],
                  location_name: ins.location_name,
                  rules: ins.rules,
                  unlocked: false,
                  custom: ins.custom,
                  // Realtime/refetch reconciles author_username (E2.8).
                  author_user_id: null,
                  author_username: null,
                  author_avatar_url: null
                }))
              }
            }

            // Collect timeline changes
            const timelineUpdates: {
              [year: number]: {
                completed: boolean
                entries: string[]
                id: string
              }
            } = {}

            if (timelineYears.length > 0) {
              for (const ty of timelineYears) {
                const existingYear = selectedSettlement.timeline[ty.year_number]
                if (existingYear) {
                  const existingEntries = new Set(existingYear.entries)
                  const newEntries = ty.entries.filter(
                    (e) => !existingEntries.has(e)
                  )
                  let updatedEntries = existingYear.entries
                  for (const entry of newEntries) {
                    updatedEntries = await saveSettlementTimelineYearEntry(
                      existingYear.id,
                      entry,
                      updatedEntries.length
                    )
                  }
                  timelineUpdates[ty.year_number] = {
                    ...existingYear,
                    entries: updatedEntries
                  }
                } else {
                  const yearId = await addSettlementTimelineYear(
                    selectedSettlement.id,
                    ty.year_number
                  )
                  let entries: string[] = []
                  for (let i = 0; i < ty.entries.length; i++) {
                    entries = await saveSettlementTimelineYearEntry(
                      yearId,
                      ty.entries[i],
                      i
                    )
                  }
                  timelineUpdates[ty.year_number] = {
                    id: yearId,
                    completed: false,
                    entries
                  }
                }
              }
            }

            // Merge all collected changes using a functional update.
            setSelectedSettlement((prev) => {
              if (!prev) return null

              const existingLocIds = new Set(
                prev.locations.map((l) => l.location_id)
              )

              return {
                ...prev,
                locations:
                  newLocationRows.length > 0
                    ? [
                        ...prev.locations,
                        ...newLocationRows.filter(
                          (nl) => !existingLocIds.has(nl.location_id)
                        )
                      ]
                    : prev.locations,
                timeline:
                  Object.keys(timelineUpdates).length > 0
                    ? { ...prev.timeline, ...timelineUpdates }
                    : prev.timeline
              }
            })
          } catch (relatedErr) {
            console.error('Nemesis Related Data Add Error:', relatedErr)
          }
        },
        rollback: () => {
          // Remove the optimistic placeholder.
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  nemeses: prev.nemeses.filter((n) => n.id !== tempId)
                }
              : null
          )
        },
        successMessage: NEMESIS_ADDED_MESSAGE()
      })
    },
    [selectedSettlement, availableNemeses, setSelectedSettlement, mutate]
  )

  /**
   * Handle Remove Nemesis
   *
   * Optimistically removes a nemesis from the settlement, then persists to the
   * DB.
   *
   * @param nemesisId Settlement Nemesis ID
   */
  const handleRemove = useCallback(
    (nemesisId: string) => {
      if (!selectedSettlement) return

      const removed = selectedSettlement.nemeses.find((n) => n.id === nemesisId)
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        nemeses: selectedSettlement.nemeses.filter((n) => n.id !== nemesisId)
      })

      void mutate({
        context: 'Nemesis Remove',
        persist: () => removeSettlementNemesis(removed.id),
        rollback: () => {
          setSelectedSettlement((prev) => {
            if (!prev || prev.nemeses.some((n) => n.id === removed.id))
              return prev
            return {
              ...prev,
              nemeses: sortNemeses([...prev.nemeses, removed])
            }
          })
        },
        successMessage: NEMESIS_REMOVED_MESSAGE()
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /**
   * Handle Toggle Unlocked
   *
   * Optimistically toggles the unlocked state of a nemesis, then persists to
   * the DB.
   *
   * @param nemesisId Settlement Nemesis ID
   * @param unlocked New Unlocked State
   */
  const handleToggleUnlocked = useCallback(
    (nemesisId: string, unlocked: boolean) => {
      if (!selectedSettlement) return

      const target = selectedSettlement.nemeses.find((n) => n.id === nemesisId)
      if (!target) return

      setSelectedSettlement({
        ...selectedSettlement,
        nemeses: selectedSettlement.nemeses.map((n) =>
          n.id === nemesisId ? { ...n, unlocked } : n
        )
      })

      void mutate({
        context: 'Nemesis Toggle',
        persist: () => updateSettlementNemesis(target.id, { unlocked }),
        rollback: () => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  nemeses: prev.nemeses.map((n) =>
                    n.id === target.id ? { ...n, unlocked: !unlocked } : n
                  )
                }
              : null
          )
        },
        successMessage: NEMESIS_UNLOCKED_MESSAGE(target.monster_name, unlocked)
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /**
   * Handle Toggle Level Defeated
   *
   * Optimistically toggles a defeated-level flag, then persists to the DB.
   *
   * @param nemesisId Settlement Nemesis ID
   * @param field Defeated Level Field
   * @param defeated Defeated Status
   */
  const handleToggleLevel = useCallback(
    (
      nemesisId: string,
      field:
        | 'level_1_defeated'
        | 'level_2_defeated'
        | 'level_3_defeated'
        | 'level_4_defeated',
      defeated: boolean
    ) => {
      if (!selectedSettlement) return

      const target = selectedSettlement.nemeses.find((n) => n.id === nemesisId)
      if (!target) return

      setSelectedSettlement({
        ...selectedSettlement,
        nemeses: selectedSettlement.nemeses.map((n) =>
          n.id === nemesisId ? { ...n, [field]: defeated } : n
        )
      })

      void mutate({
        context: 'Nemesis Level Toggle',
        persist: () =>
          updateSettlementNemesis(target.id, { [field]: defeated }),
        rollback: () => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  nemeses: prev.nemeses.map((n) =>
                    n.id === target.id ? { ...n, [field]: !defeated } : n
                  )
                }
              : null
          )
        },
        successMessage: NEMESIS_DEFEATED_MESSAGE()
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
  )

  /**
   * Sorted Nemeses
   *
   * Nemeses sorted by node level then alphabetically by name for consistent
   * rendering order.
   */
  const sortedNemeses = useMemo(
    () => sortNemeses(selectedSettlement?.nemeses ?? []),
    [selectedSettlement?.nemeses]
  )

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <SkullIcon className="h-4 w-4" />
          Nemesis Monsters
          <Popover open={addOpen} onOpenChange={setAddOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-0 h-8 w-8"
                disabled={selectableNemeses.length === 0}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search nemeses..." />
                <CommandList>
                  <CommandEmpty>No nemeses found.</CommandEmpty>
                  <CommandGroup>
                    {selectableNemeses.map((nemesis) => (
                      <CommandItem
                        key={nemesis.id}
                        value={nemesis.id}
                        keywords={[nemesis.monster_name]}
                        onSelect={() => handleAdd(nemesis.id)}>
                        {nemesis.monster_name}
                        {nemesis.custom && (
                          <Badge variant="outline" className="ml-auto">
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
        </CardTitle>
      </CardHeader>

      {/* Nemeses List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-60">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.nemeses ||
              selectedSettlement.nemeses.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No nemeses stalk the settlement.
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Watching the shadows...
              </p>
            )}

            {hasFetched &&
              sortedNemeses.map((nemesis) => (
                <NemesisItem
                  key={nemesis.id}
                  id={nemesis.id}
                  custom={nemesis.custom}
                  monsterName={nemesis.monster_name}
                  unlocked={nemesis.unlocked}
                  level1Defeated={nemesis.level_1_defeated}
                  level2Defeated={nemesis.level_2_defeated}
                  level3Defeated={nemesis.level_3_defeated}
                  level4Defeated={nemesis.level_4_defeated}
                  availableLevels={nemesis.available_levels}
                  onRemove={handleRemove}
                  onToggleUnlocked={handleToggleUnlocked}
                  onToggleLevel={handleToggleLevel}
                />
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
