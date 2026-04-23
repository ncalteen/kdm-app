'use client'

import { CollectiveCognitionRewardDialog } from '@/components/custom/dialogs/collective-cognition-reward-dialog'
import { RewardItem } from '@/components/settlement/arc/collective-cognition-reward-item'
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
import {
  addCollectiveCognitionReward,
  getCollectiveCognitionRewards
} from '@/lib/dal/collective-cognition-reward'
import {
  addSettlementCollectiveCognitionRewards,
  removeSettlementCollectiveCognitionReward,
  updateSettlementCollectiveCognitionReward
} from '@/lib/dal/settlement-collective-cognition-reward'
import {
  COLLECTIVE_COGNITION_REWARD_CREATED_MESSAGE,
  COLLECTIVE_COGNITION_REWARD_REMOVED_MESSAGE,
  COLLECTIVE_COGNITION_REWARD_SAVED_MESSAGE,
  COLLECTIVE_COGNITION_REWARD_UPDATED_MESSAGE,
  ERROR_MESSAGE
} from '@/lib/messages'
import {
  CollectiveCognitionRewardDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { calculateSettlementCollectiveCognition } from '@/lib/utils'
import { BrainIcon, Plus, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Collective Cognition Rewards Card Properties
 */
interface CollectiveCognitionRewardsCardProps {
  /** Local State */
  local: LocalStateType
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: SettlementStateSetter
}

/**
 * Collective Cognition Rewards Card Component
 *
 * Displays the collective cognition rewards linked to a settlement and allows
 * users to add, remove, and toggle the unlocked state. All mutations are
 * applied optimistically so the UI updates before the database transaction
 * completes. Items are sorted by collective cognition value.
 *
 * @param props Collective Cognition Rewards Card Properties
 * @returns Collective Cognition Rewards Card Component
 */
export function CollectiveCognitionRewardsCard({
  local,
  selectedSettlement,
  setSelectedSettlement
}: CollectiveCognitionRewardsCardProps): ReactElement {
  const { toast } = useToast(local)

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [hasFetched, setHasFetched] = useState<boolean>(false)
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  // Available rewards for the select dropdown (fetched once per settlement).
  const [availableRewards, setAvailableRewards] = useState<{
    [key: string]: CollectiveCognitionRewardDetail
  }>({})

  // Track the previous settlement ID to reset state on settlement change.
  const [prevSettlementId, setPrevSettlementId] = useState<string | null>(
    selectedSettlement?.id ?? null
  )

  if (selectedSettlement?.id !== prevSettlementId) {
    setPrevSettlementId(selectedSettlement?.id ?? null)
    setAddOpen(false)
    setHasFetched(false)
  }

  // Fetch available reward options when settlement changes.
  useEffect(() => {
    if (!selectedSettlement?.id || hasFetched) return

    let cancelled = false

    getCollectiveCognitionRewards()
      .then((rewards) => {
        if (cancelled) return

        setAvailableRewards(rewards)
        setHasFetched(true)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        setAvailableRewards({})
        setHasFetched(true)

        console.error('Collective Cognition Rewards Fetch Error:', err)
        toast.error(ERROR_MESSAGE())
      })

    return () => {
      cancelled = true
    }
  }, [selectedSettlement?.id, hasFetched, toast])

  /**
   * Sorted Rewards
   *
   * Sort rewards by collective cognition value (ascending), preserving
   * original indices so handlers operate on the correct source element.
   */
  const sortedRewards = useMemo(() => {
    const rewards = selectedSettlement?.collective_cognition_rewards ?? []

    return rewards
      .map((reward, originalIndex) => ({ reward, originalIndex }))
      .sort(
        (a, b) =>
          Number(a.reward.collective_cognition) -
          Number(b.reward.collective_cognition)
      )
  }, [selectedSettlement?.collective_cognition_rewards])

  /**
   * Settlement Collective Cognition Total
   *
   * Derived from quarry and nemesis victory states so reward eligibility
   * updates reactively as victories are toggled.
   */
  const collectiveCognitionTotal = useMemo(
    () => calculateSettlementCollectiveCognition(selectedSettlement),
    [selectedSettlement]
  )

  /**
   * Handle Add Reward
   *
   * Optimistically adds a reward to the settlement, then persists to the DB.
   *
   * @param rewardId Collective Cognition Reward ID
   */
  const handleAdd = useCallback(
    (rewardId: string | undefined) => {
      if (!rewardId || !selectedSettlement) return

      const rewardInfo = availableRewards[rewardId]
      if (!rewardInfo) return

      setAddOpen(false)

      // Optimistic placeholder row (uses a temporary ID).
      const tempId = `temp-${crypto.randomUUID()}`
      const optimisticRow: SettlementDetail['collective_cognition_rewards'][0] =
        {
          collective_cognition: rewardInfo.collective_cognition,
          collective_cognition_reward_id: rewardId,
          id: tempId,
          reward_name: rewardInfo.reward_name,
          rules: rewardInfo.rules ?? null,
          unlocked: false
        }

      const updatedRewards = [
        ...(selectedSettlement.collective_cognition_rewards ?? []),
        optimisticRow
      ]

      setSelectedSettlement({
        ...selectedSettlement,
        collective_cognition_rewards: updatedRewards
      })

      addSettlementCollectiveCognitionRewards([rewardId], selectedSettlement.id)
        .then((rows) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  collective_cognition_rewards: (
                    prev.collective_cognition_rewards ?? []
                  ).map((r) => (r.id === tempId ? { ...r, id: rows[0].id } : r))
                }
              : null
          )

          toast.success(COLLECTIVE_COGNITION_REWARD_UPDATED_MESSAGE())
        })
        .catch((err: unknown) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  collective_cognition_rewards: (
                    prev.collective_cognition_rewards ?? []
                  ).filter((r) => r.id !== tempId)
                }
              : null
          )

          console.error('Collective Cognition Reward Add Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, availableRewards, setSelectedSettlement, toast]
  )

  /**
   * Handle Remove Reward
   *
   * Optimistically removes a reward from the settlement, then persists to the
   * DB.
   *
   * @param index Settlement Reward Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement) return

      const removed = (selectedSettlement.collective_cognition_rewards ?? [])[
        index
      ]
      if (!removed) return

      setSelectedSettlement({
        ...selectedSettlement,
        collective_cognition_rewards: (
          selectedSettlement.collective_cognition_rewards ?? []
        ).filter((r) => r.id !== removed.id)
      })

      removeSettlementCollectiveCognitionReward(removed.id)
        .then(() =>
          toast.success(COLLECTIVE_COGNITION_REWARD_REMOVED_MESSAGE())
        )
        .catch((err: unknown) => {
          setSelectedSettlement((prev) => {
            if (
              !prev ||
              (prev.collective_cognition_rewards ?? []).some(
                (r) => r.id === removed.id
              )
            )
              return prev
            return {
              ...prev,
              collective_cognition_rewards: [
                ...(prev.collective_cognition_rewards ?? []),
                removed
              ]
            }
          })

          console.error('Collective Cognition Reward Remove Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement, toast]
  )

  /**
   * Handle Toggle Unlocked
   *
   * Optimistically toggles the unlocked state of a reward, then persists to
   * the DB.
   *
   * @param index Reward Index
   * @param unlocked New Unlocked State
   */
  const handleToggleUnlocked = useCallback(
    (index: number, unlocked: boolean) => {
      if (!selectedSettlement) return

      const target = selectedSettlement.collective_cognition_rewards[index]
      if (!target) return

      setSelectedSettlement({
        ...selectedSettlement,
        collective_cognition_rewards:
          selectedSettlement.collective_cognition_rewards.map((r, i) =>
            i === index ? { ...r, unlocked } : r
          )
      })

      updateSettlementCollectiveCognitionReward(target.id, { unlocked })
        .then(() =>
          toast.success(COLLECTIVE_COGNITION_REWARD_SAVED_MESSAGE(unlocked))
        )
        .catch((err: unknown) => {
          setSelectedSettlement((prev) =>
            prev
              ? {
                  ...prev,
                  collective_cognition_rewards:
                    prev.collective_cognition_rewards.map((r) =>
                      r.id === target.id ? { ...r, unlocked: !unlocked } : r
                    )
                }
              : null
          )

          console.error('Collective Cognition Reward Toggle Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSettlement, setSelectedSettlement, toast]
  )

  /** Check if an exact match for the search term already exists. */
  const exactMatchExists = Object.values(availableRewards).some(
    (r) => r.reward_name.toLowerCase() === search.trim().toLowerCase()
  )

  /**
   * Handle Create Custom Reward
   *
   * Creates a custom collective cognition reward via DAL, adds it to the
   * available list, then adds it to the settlement.
   */
  const handleCreate = useCallback(
    async (data: {
      reward_name: string
      collective_cognition: number
      rules: string
    }) => {
      if (creating || !selectedSettlement) return

      setCreating(true)

      try {
        const newReward = await addCollectiveCognitionReward({
          custom: true,
          reward_name: data.reward_name,
          collective_cognition: data.collective_cognition,
          rules: data.rules || null
        })

        setAvailableRewards((prev) => ({
          ...prev,
          [newReward.id]: newReward
        }))
        setCreateDialogOpen(false)
        setSearch('')
        setAddOpen(false)
        toast.success(COLLECTIVE_COGNITION_REWARD_CREATED_MESSAGE())

        // Add to settlement immediately.
        const tempId = `temp-${crypto.randomUUID()}`
        const optimisticRow: SettlementDetail['collective_cognition_rewards'][0] =
          {
            collective_cognition: newReward.collective_cognition,
            collective_cognition_reward_id: newReward.id,
            id: tempId,
            reward_name: newReward.reward_name,
            rules: newReward.rules ?? null,
            unlocked: false
          }

        const updatedRewards = [
          ...(selectedSettlement.collective_cognition_rewards ?? []),
          optimisticRow
        ]

        setSelectedSettlement({
          ...selectedSettlement,
          collective_cognition_rewards: updatedRewards
        })

        addSettlementCollectiveCognitionRewards(
          [newReward.id],
          selectedSettlement.id
        )
          .then((rows) => {
            setSelectedSettlement((prev) =>
              prev
                ? {
                    ...prev,
                    collective_cognition_rewards: (
                      prev.collective_cognition_rewards ?? []
                    ).map((r) =>
                      r.id === tempId ? { ...r, id: rows[0].id } : r
                    )
                  }
                : null
            )
          })
          .catch((err: unknown) => {
            setSelectedSettlement((prev) =>
              prev
                ? {
                    ...prev,
                    collective_cognition_rewards: (
                      prev.collective_cognition_rewards ?? []
                    ).filter((r) => r.id !== tempId)
                  }
                : null
            )
            console.error('Collective Cognition Reward Add Error:', err)
            toast.error(ERROR_MESSAGE())
          })
      } catch (error) {
        console.error('Collective Cognition Reward Create Error:', error)
        toast.error(ERROR_MESSAGE())
      } finally {
        setCreating(false)
      }
    },
    [creating, selectedSettlement, setSelectedSettlement, toast]
  )

  /** Open the create dialog with the current search term pre-filled. */
  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <BrainIcon className="h-4 w-4" />
          Collective Cognition Rewards
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
                  placeholder="Search rewards..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {search.trim() ? (
                      <button
                        type="button"
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm justify-center"
                        onClick={openCreateDialog}>
                        <Plus className="h-4 w-4" />
                        Create &quot;{search.trim()}&quot;
                      </button>
                    ) : (
                      'No rewards found.'
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {Object.values(availableRewards)
                      .filter(
                        (r) =>
                          !(
                            selectedSettlement?.collective_cognition_rewards ??
                            []
                          ).some(
                            (existing) =>
                              existing.collective_cognition_reward_id === r.id
                          )
                      )
                      .map((reward) => (
                        <CommandItem
                          key={reward.id}
                          value={reward.reward_name}
                          onSelect={() => handleAdd(reward.id)}>
                          {reward.reward_name}
                          {reward.custom && (
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
                        onSelect={openCreateDialog}>
                        <Plus className="h-4 w-4" />
                        Create &quot;{search.trim()}&quot;
                      </CommandItem>
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>

      {/* Rewards List */}
      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto">
            {(!selectedSettlement?.collective_cognition_rewards ||
              selectedSettlement.collective_cognition_rewards.length === 0) &&
              hasFetched && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No rewards yet
                </p>
              )}

            {!hasFetched && selectedSettlement?.id && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading rewards...
              </p>
            )}

            {hasFetched &&
              sortedRewards.map(({ reward, originalIndex }) => (
                <RewardItem
                  key={reward.id}
                  index={originalIndex}
                  shouldHighlight={
                    !reward.unlocked &&
                    collectiveCognitionTotal >=
                      Number(reward.collective_cognition)
                  }
                  reward={reward}
                  onRemove={handleRemove}
                  onToggleUnlocked={handleToggleUnlocked}
                />
              ))}
          </div>
        </div>
      </CardContent>

      <CollectiveCognitionRewardDialog
        key={dialogKey}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreate}
        saving={creating}
        initialName={search.trim()}
        title="Create Custom Reward"
        description="A new collective cognition reward is forged."
        saveLabel="Create"
        savingLabel="Creating..."
      />
    </Card>
  )
}
