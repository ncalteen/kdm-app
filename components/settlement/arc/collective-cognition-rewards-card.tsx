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
import { useCatalogFetch } from '@/hooks/use-catalog-fetch'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import {
  addCollectiveCognitionReward,
  getCollectiveCognitionRewards
} from '@/lib/dal/collective-cognition-reward'
import {
  addSettlementCollectiveCognitionRewards,
  removeSettlementCollectiveCognitionReward,
  updateSettlementCollectiveCognitionReward
} from '@/lib/dal/settlement-collective-cognition-reward'
import { ERROR_MESSAGE } from '@/lib/messages'
import {
  CollectiveCognitionRewardDetail,
  SettlementDetail,
  SettlementStateSetter
} from '@/lib/types'
import { calculateSettlementCollectiveCognition } from '@/lib/utils'
import { BrainIcon, Plus, PlusIcon } from 'lucide-react'
import { ReactElement, useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

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
  const mutate = useOptimisticMutation()

  const [addOpen, setAddOpen] = useState<boolean>(false)
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

  // Available rewards for the select dropdown (fetched once per settlement).
  const {
    data: availableRewards,
    isLoaded: hasFetched,
    setData: setAvailableRewards
  } = useCatalogFetch<{
    [key: string]: CollectiveCognitionRewardDetail
  }>(selectedSettlement?.id, () => getCollectiveCognitionRewards(), {
    initial: {},
    errorContext: 'Collective Cognition Rewards Fetch Error',
    onReset: () => setAddOpen(false),
    onError: () => toast.error(ERROR_MESSAGE())
  })

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
          unlocked: false,
          custom: rewardInfo.custom,
          // Optimistic placeholder; the realtime/refetch reconciles
          // `author_username` from the catalog row's `user_id` (E2.8).
          author_user_id: null,
          author_username: null,
          author_avatar_url: null
        }

      const updatedRewards = [
        ...(selectedSettlement.collective_cognition_rewards ?? []),
        optimisticRow
      ]

      setSelectedSettlement({
        ...selectedSettlement,
        collective_cognition_rewards: updatedRewards
      })

      void mutate({
        context: 'Collective Cognition Reward Add',
        persist: () =>
          addSettlementCollectiveCognitionRewards(
            [rewardId],
            selectedSettlement.id
          ),
        onSuccess: (rows) => {
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
        },
        rollback: () => {
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
        }
      })
    },
    [selectedSettlement, availableRewards, setSelectedSettlement, mutate]
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

      void mutate({
        context: 'Collective Cognition Reward Remove',
        persist: () => removeSettlementCollectiveCognitionReward(removed.id),
        rollback: () => {
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
        }
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
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

      void mutate({
        context: 'Collective Cognition Reward Toggle',
        persist: () =>
          updateSettlementCollectiveCognitionReward(target.id, { unlocked }),
        rollback: () => {
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
        }
      })
    },
    [selectedSettlement, setSelectedSettlement, mutate]
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

        // Add to settlement immediately.
        const tempId = `temp-${crypto.randomUUID()}`
        const optimisticRow: SettlementDetail['collective_cognition_rewards'][0] =
          {
            collective_cognition: newReward.collective_cognition,
            collective_cognition_reward_id: newReward.id,
            id: tempId,
            reward_name: newReward.reward_name,
            rules: newReward.rules ?? null,
            unlocked: false,
            custom: true,
            // Optimistic placeholder; the realtime/refetch reconciles
            // `author_username` from the catalog row's `user_id` (E2.8).
            author_user_id: null,
            author_username: null,
            author_avatar_url: null
          }

        const updatedRewards = [
          ...(selectedSettlement.collective_cognition_rewards ?? []),
          optimisticRow
        ]

        setSelectedSettlement({
          ...selectedSettlement,
          collective_cognition_rewards: updatedRewards
        })

        void mutate({
          context: 'Collective Cognition Reward Add',
          persist: () =>
            addSettlementCollectiveCognitionRewards(
              [newReward.id],
              selectedSettlement.id
            ),
          onSuccess: (rows) => {
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
          },
          rollback: () => {
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
          }
        })
      } catch (error) {
        console.error('Collective Cognition Reward Create Error:', error)
        toast.error(ERROR_MESSAGE())
      } finally {
        setCreating(false)
      }
    },
    [
      creating,
      selectedSettlement,
      setSelectedSettlement,
      mutate,
      setAvailableRewards
    ]
  )

  /** Open the create dialog with the current search term pre-filled. */
  const openCreateDialog = useCallback(() => {
    setDialogKey((k) => k + 1)
    setCreateDialogOpen(true)
  }, [])

  return (
    <Card className="p-0 border gap-0">
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
                      .sort((a, b) =>
                        a.reward_name.localeCompare(b.reward_name)
                      )
                      .map((reward) => (
                        <CommandItem
                          key={reward.id}
                          value={reward.id}
                          keywords={[reward.reward_name]}
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
        <div className="flex flex-col h-100">
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
              sortedRewards.map(({ reward, originalIndex }) => {
                const detail =
                  availableRewards[reward.collective_cognition_reward_id]

                return (
                  <RewardItem
                    key={reward.id}
                    customDetail={
                      detail
                        ? {
                            custom: detail.custom,
                            sections: [
                              { label: 'Rules', content: detail.rules },
                              {
                                label: 'Collective Cognition',
                                content: `${detail.collective_cognition} CC`
                              }
                            ]
                          }
                        : null
                    }
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
                )
              })}
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
