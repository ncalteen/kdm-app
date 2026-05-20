'use client'

import { CustomKnowledgeRulesIconButton } from '@/components/custom/custom-rules-sheet'
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
import { LongPressCheckbox } from '@/components/ui/long-press-checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { LocalStateType } from '@/contexts/local-context'
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  SettlementDetail,
  SurvivorDetail,
  SurvivorsStateSetter
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

/**
 * Knowledge Card Properties
 */
interface KnowledgeCardProps {
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
 * Knowledge Select Properties
 */
interface KnowledgeSelectProps {
  /** Available Knowledges */
  knowledges: {
    knowledge_id: string
    knowledge_name: string
    custom?: boolean
  }[]
  /** OnChange Handler */
  onChange: (value: string) => void
  /** Placeholder Text */
  placeholder?: string
  /** Selected Knowledge ID */
  value?: string
}

/**
 * Knowledge Select Component
 *
 * Searchable combobox for selecting a knowledge.
 *
 * @param props Knowledge Select Properties
 * @returns Knowledge Select Component
 */
function KnowledgeSelect({
  knowledges,
  onChange,
  placeholder = 'Select knowledge...',
  value
}: KnowledgeSelectProps): ReactElement {
  const [open, setOpen] = useState(false)

  const selectedName = knowledges.find(
    (k) => k.knowledge_id === value
  )?.knowledge_name

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-0 border-b rounded-none focus:ring-0 px-2 text-sm">
          {selectedName ?? placeholder}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search knowledges..." />
          <CommandList>
            <CommandEmpty>No knowledges found.</CommandEmpty>
            <CommandGroup>
              {[...knowledges]
                .sort((a, b) =>
                  a.knowledge_name.localeCompare(b.knowledge_name)
                )
                .map((k) => (
                  <CommandItem
                    key={k.knowledge_id}
                    value={k.knowledge_id}
                    keywords={[k.knowledge_name]}
                    onSelect={() => {
                      onChange(k.knowledge_id === value ? '' : k.knowledge_id)
                      setOpen(false)
                    }}>
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === k.knowledge_id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {k.knowledge_name}
                    {k.custom && (
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
  )
}

/**
 * Knowledge Card Component
 *
 * @param props Knowledge Card Properties
 * @returns Knowledge Card Component
 */
export function KnowledgeCard({
  local,
  selectedSettlement,
  selectedSurvivor,
  setSurvivors,
  survivors
}: KnowledgeCardProps): ReactElement {
  const mutate = useOptimisticMutation()

  const [prevSurvivor, setPrevSurvivor] = useState(selectedSurvivor)

  // Local state for text fields to enable controlled components
  const [knowledge1, setKnowledge1] = useState({
    id: selectedSurvivor?.knowledge_1?.id ?? '',
    knowledge_name: selectedSurvivor?.knowledge_1?.knowledge_name ?? '',
    rules: selectedSurvivor?.knowledge_1_rules ?? '',
    observation_conditions:
      selectedSurvivor?.knowledge_1_observation_conditions ?? '',
    observation_rank: selectedSurvivor?.knowledge_1_observation_rank ?? 0,
    observation_rank_up_milestone:
      selectedSurvivor?.knowledge_1?.observation_rank_up_milestone ?? null,
    rank_up: selectedSurvivor?.knowledge_1_rank_up ?? null
  })
  const knowledge1RankUpRef = useRef(knowledge1.rank_up)
  const [knowledge2, setKnowledge2] = useState({
    id: selectedSurvivor?.knowledge_2?.id ?? '',
    knowledge_name: selectedSurvivor?.knowledge_2?.knowledge_name ?? '',
    rules: selectedSurvivor?.knowledge_2_rules ?? '',
    observation_conditions:
      selectedSurvivor?.knowledge_2_observation_conditions ?? '',
    observation_rank: selectedSurvivor?.knowledge_2_observation_rank ?? 0,
    observation_rank_up_milestone:
      selectedSurvivor?.knowledge_2?.observation_rank_up_milestone ?? null,
    rank_up: selectedSurvivor?.knowledge_2_rank_up ?? null
  })
  const knowledge2RankUpRef = useRef(knowledge2.rank_up)

  const canUseFightingArtsKnowledges =
    survivors.find((s) => s.id === selectedSurvivor?.id)
      ?.can_use_fighting_arts_knowledges ?? true

  // Reset local state when survivor changes
  if (prevSurvivor !== selectedSurvivor) {
    setPrevSurvivor(selectedSurvivor)

    setKnowledge1({
      id: selectedSurvivor?.knowledge_1?.id ?? '',
      knowledge_name: selectedSurvivor?.knowledge_1?.knowledge_name ?? '',
      rules: selectedSurvivor?.knowledge_1_rules ?? '',
      observation_conditions:
        selectedSurvivor?.knowledge_1_observation_conditions ?? '',
      observation_rank: selectedSurvivor?.knowledge_1_observation_rank ?? 0,
      observation_rank_up_milestone:
        selectedSurvivor?.knowledge_1?.observation_rank_up_milestone ?? null,
      rank_up: selectedSurvivor?.knowledge_1_rank_up ?? null
    })
    setKnowledge2({
      id: selectedSurvivor?.knowledge_2?.id ?? '',
      knowledge_name: selectedSurvivor?.knowledge_2?.knowledge_name ?? '',
      rules: selectedSurvivor?.knowledge_2_rules ?? '',
      observation_conditions:
        selectedSurvivor?.knowledge_2_observation_conditions ?? '',
      observation_rank: selectedSurvivor?.knowledge_2_observation_rank ?? 0,
      observation_rank_up_milestone:
        selectedSurvivor?.knowledge_2?.observation_rank_up_milestone ?? null,
      rank_up: selectedSurvivor?.knowledge_2_rank_up ?? null
    })
  }

  // Sync refs after state updates (refs cannot be written during render)
  useEffect(() => {
    knowledge1RankUpRef.current = knowledge1.rank_up
  }, [knowledge1.rank_up])

  useEffect(() => {
    knowledge2RankUpRef.current = knowledge2.rank_up
  }, [knowledge2.rank_up])

  /**
   * Handle Observation Rank Change
   *
   * @param fieldName Field Name
   * @param rank Selected Rank
   */
  const handleRankChange = useCallback(
    (knowledge: 1 | 2, rank: number) => {
      const fieldName =
        knowledge === 1
          ? 'knowledge_1_observation_rank'
          : 'knowledge_2_observation_rank'

      const oldRank =
        knowledge === 1
          ? knowledge1.observation_rank
          : knowledge2.observation_rank

      // Optimistic update: local state
      if (knowledge === 1)
        setKnowledge1((prev) => ({ ...prev, observation_rank: rank }))
      else setKnowledge2((prev) => ({ ...prev, observation_rank: rank }))

      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, [fieldName]: rank } : s
        )
      )

      void mutate({
        context: 'Knowledge Rank Update',
        persist: () =>
          updateSurvivor(selectedSurvivor?.id, { [fieldName]: rank }),
        rollback: () => {
          if (knowledge === 1)
            setKnowledge1((prev) => ({ ...prev, observation_rank: oldRank }))
          else setKnowledge2((prev) => ({ ...prev, observation_rank: oldRank }))

          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, [fieldName]: oldRank } : s
            )
          )
        }
      })
    },
    [knowledge1, knowledge2, selectedSurvivor?.id, setSurvivors, mutate]
  )

  /**
   * Update Can Use Fighting Arts or Knowledges
   *
   * @param checked Checkbox Checked State
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
        context: 'Cannot Use Knowledges Update',
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
        }
      })
    },
    [canUseFightingArtsKnowledges, selectedSurvivor?.id, setSurvivors, mutate]
  )

  /**
   * Update Knowledge 1
   *
   * @param knowledgeId Knowledge ID (or empty string to clear)
   */
  const updateKnowledge1 = (knowledgeId: string) => {
    const oldKnowledge = knowledge1
    const knowledgeDetail = knowledgeId
      ? selectedSettlement?.knowledges.find(
          (k) => k.knowledge_id === knowledgeId
        )
      : null
    // Cascade catalog defaults (rules + observation conditions) when present;
    // always reset per-survivor progress and clear the chosen rank-up level.
    const cascadedRules = knowledgeDetail?.rules ?? ''
    const cascadedConditions = knowledgeDetail?.observation_conditions ?? ''
    const newKnowledge = knowledgeDetail
      ? {
          ...knowledge1,
          id: knowledgeId,
          knowledge_name: knowledgeDetail.knowledge_name,
          observation_rank: 0,
          observation_rank_up_milestone:
            knowledgeDetail.observation_rank_up_milestone ?? null,
          rank_up: null,
          rules: cascadedRules,
          observation_conditions: cascadedConditions
        }
      : {
          ...knowledge1,
          id: '',
          knowledge_name: '',
          observation_rank: 0,
          observation_rank_up_milestone: null,
          rank_up: null,
          rules: '',
          observation_conditions: ''
        }

    setKnowledge1(newKnowledge)

    setSurvivors((prev) =>
      prev.map((s) =>
        s.id === selectedSurvivor?.id
          ? {
              ...s,
              knowledge_1: knowledgeDetail
                ? {
                    id: knowledgeId,
                    knowledge_name: knowledgeDetail.knowledge_name,
                    custom: knowledgeDetail.custom,
                    rules: knowledgeDetail.rules,
                    observation_conditions:
                      knowledgeDetail.observation_conditions,
                    observation_rank_up_milestone:
                      knowledgeDetail.observation_rank_up_milestone,
                    author_user_id: knowledgeDetail.author_user_id,
                    author_username: knowledgeDetail.author_username,
                    author_avatar_url: knowledgeDetail.author_avatar_url
                  }
                : null,
              knowledge_1_observation_rank: 0,
              knowledge_1_rank_up: null,
              knowledge_1_rules: cascadedRules,
              knowledge_1_observation_conditions: cascadedConditions
            }
          : s
      )
    )

    void mutate({
      context: 'Knowledge Update',
      persist: () =>
        updateSurvivor(selectedSurvivor?.id, {
          knowledge_1_id: knowledgeId || null,
          knowledge_1_observation_rank: 0,
          knowledge_1_rank_up: null,
          knowledge_1_rules: cascadedRules,
          knowledge_1_observation_conditions: cascadedConditions
        }),
      rollback: () => {
        setKnowledge1(oldKnowledge)
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor?.id
              ? { ...s, knowledge_1: selectedSurvivor?.knowledge_1 ?? null }
              : s
          )
        )
      }
    })
  }

  /**
   * Update Knowledge 1 Observation Rank
   *
   * @param checked Checkbox Checked State
   * @param index Checkbox Index (0-based)
   */
  const updateKnowledge1ObservationRank = (checked: boolean, index: number) => {
    const rank = index + 1

    if (checked) handleRankChange(1, rank)
    else if (knowledge1.observation_rank === rank) handleRankChange(1, rank - 1)
  }

  /**
   * Update Knowledge 1 Rank Up Milestone
   *
   * @param index Checkbox Index (0-based)
   */
  const updateKnowledge1RankUp = useCallback(
    (index: number) => {
      const newRankUp = knowledge1RankUpRef.current === index ? null : index
      const oldRankUp = knowledge1RankUpRef.current

      knowledge1RankUpRef.current = newRankUp
      setKnowledge1((prev) => ({
        ...prev,
        rank_up: newRankUp
      }))

      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, knowledge_1_rank_up: newRankUp }
            : s
        )
      )

      void mutate({
        context: 'Knowledge Rank Up',
        persist: () =>
          updateSurvivor(selectedSurvivor?.id, {
            knowledge_1_rank_up: newRankUp
          }),
        rollback: () => {
          knowledge1RankUpRef.current = oldRankUp
          setKnowledge1((prev) => ({ ...prev, rank_up: oldRankUp }))
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, knowledge_1_rank_up: oldRankUp }
                : s
            )
          )
        }
      })
    },
    [selectedSurvivor?.id, setSurvivors, mutate]
  )

  /**
   * Update Knowledge 1 Rules
   *
   * @param value Knowledge 1 Rules Value
   */
  const updateKnowledge1Rules = (value: string) => {
    const oldRules = knowledge1.rules

    setKnowledge1({
      ...knowledge1,
      rules: value
    })

    setSurvivors((prev) =>
      prev.map((s) =>
        s.id === selectedSurvivor?.id ? { ...s, knowledge_1_rules: value } : s
      )
    )

    void mutate({
      context: 'Knowledge Rules Update',
      persist: () =>
        updateSurvivor(selectedSurvivor?.id, { knowledge_1_rules: value }),
      rollback: () => {
        setKnowledge1({
          ...knowledge1,
          rules: oldRules
        })
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  knowledge_1_rules: selectedSurvivor?.knowledge_1_rules ?? ''
                }
              : s
          )
        )
      }
    })
  }

  /**
   * Update Knowledge 1 Observation Conditions
   *
   * @param value Knowledge 1 Observation Conditions Value
   */
  const updateKnowledge1ObservationConditions = (value: string) => {
    const oldObservationConditions = knowledge1.observation_conditions

    setKnowledge1({
      ...knowledge1,
      observation_conditions: value
    })

    setSurvivors((prev) =>
      prev.map((s) =>
        s.id === selectedSurvivor?.id
          ? { ...s, knowledge_1_observation_conditions: value }
          : s
      )
    )

    void mutate({
      context: 'Knowledge Observation Conditions Update',
      persist: () =>
        updateSurvivor(selectedSurvivor?.id, {
          knowledge_1_observation_conditions: value
        }),
      rollback: () => {
        setKnowledge1({
          ...knowledge1,
          observation_conditions: oldObservationConditions
        })
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  knowledge_1_observation_conditions:
                    selectedSurvivor?.knowledge_1_observation_conditions ?? ''
                }
              : s
          )
        )
      }
    })
  }

  /**
   * Update Knowledge 2
   *
   * @param knowledgeId Knowledge ID (or empty string to clear)
   */
  const updateKnowledge2 = (knowledgeId: string) => {
    const oldKnowledge = knowledge2
    const knowledgeDetail = knowledgeId
      ? selectedSettlement?.knowledges.find(
          (k) => k.knowledge_id === knowledgeId
        )
      : null
    // Cascade catalog defaults (rules + observation conditions) when present;
    // always reset per-survivor progress and clear the chosen rank-up level.
    const cascadedRules = knowledgeDetail?.rules ?? ''
    const cascadedConditions = knowledgeDetail?.observation_conditions ?? ''
    const newKnowledge = knowledgeDetail
      ? {
          ...knowledge2,
          id: knowledgeId,
          knowledge_name: knowledgeDetail.knowledge_name,
          observation_rank: 0,
          observation_rank_up_milestone:
            knowledgeDetail.observation_rank_up_milestone ?? null,
          rank_up: null,
          rules: cascadedRules,
          observation_conditions: cascadedConditions
        }
      : {
          ...knowledge2,
          id: '',
          knowledge_name: '',
          observation_rank: 0,
          observation_rank_up_milestone: null,
          rank_up: null,
          rules: '',
          observation_conditions: ''
        }

    setKnowledge2(newKnowledge)

    setSurvivors((prev) =>
      prev.map((s) =>
        s.id === selectedSurvivor?.id
          ? {
              ...s,
              knowledge_2: knowledgeDetail
                ? {
                    id: knowledgeId,
                    knowledge_name: knowledgeDetail.knowledge_name,
                    custom: knowledgeDetail.custom,
                    rules: knowledgeDetail.rules,
                    observation_conditions:
                      knowledgeDetail.observation_conditions,
                    observation_rank_up_milestone:
                      knowledgeDetail.observation_rank_up_milestone,
                    author_user_id: knowledgeDetail.author_user_id,
                    author_username: knowledgeDetail.author_username,
                    author_avatar_url: knowledgeDetail.author_avatar_url
                  }
                : null,
              knowledge_2_observation_rank: 0,
              knowledge_2_rank_up: null,
              knowledge_2_rules: cascadedRules,
              knowledge_2_observation_conditions: cascadedConditions
            }
          : s
      )
    )

    void mutate({
      context: 'Knowledge Update',
      persist: () =>
        updateSurvivor(selectedSurvivor?.id, {
          knowledge_2_id: knowledgeId || null,
          knowledge_2_observation_rank: 0,
          knowledge_2_rank_up: null,
          knowledge_2_rules: cascadedRules,
          knowledge_2_observation_conditions: cascadedConditions
        }),
      rollback: () => {
        setKnowledge2(oldKnowledge)
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor?.id
              ? { ...s, knowledge_2: selectedSurvivor?.knowledge_2 ?? null }
              : s
          )
        )
      }
    })
  }

  /**
   * Update Knowledge 2 Observation Rank
   *
   * @param checked Checkbox Checked State
   * @param index Checkbox Index (0-based)
   */
  const updateKnowledge2ObservationRank = (checked: boolean, index: number) => {
    const rank = index + 1

    if (checked) handleRankChange(2, rank)
    else if (knowledge2.observation_rank === rank) handleRankChange(2, rank - 1)
  }

  /**
   * Update Knowledge 2 Rank Up Milestone
   *
   * @param index Checkbox Index (0-based)
   */
  const updateKnowledge2RankUp = useCallback(
    (index: number) => {
      const newRankUp = knowledge2RankUpRef.current === index ? null : index
      const oldRankUp = knowledge2RankUpRef.current

      knowledge2RankUpRef.current = newRankUp
      setKnowledge2((prev) => ({
        ...prev,
        rank_up: newRankUp
      }))

      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, knowledge_2_rank_up: newRankUp }
            : s
        )
      )

      void mutate({
        context: 'Knowledge Rank Up',
        persist: () =>
          updateSurvivor(selectedSurvivor?.id, {
            knowledge_2_rank_up: newRankUp
          }),
        rollback: () => {
          knowledge2RankUpRef.current = oldRankUp
          setKnowledge2((prev) => ({ ...prev, rank_up: oldRankUp }))
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, knowledge_2_rank_up: oldRankUp }
                : s
            )
          )
        }
      })
    },
    [selectedSurvivor?.id, setSurvivors, mutate]
  )

  /**
   * Update Knowledge 2 Rules
   *
   * @param value Knowledge 2 Rules Value
   */
  const updateKnowledge2Rules = (value: string) => {
    const oldRules = knowledge2.rules

    setKnowledge2({
      ...knowledge2,
      rules: value
    })

    setSurvivors((prev) =>
      prev.map((s) =>
        s.id === selectedSurvivor?.id ? { ...s, knowledge_2_rules: value } : s
      )
    )

    void mutate({
      context: 'Knowledge Rules Update',
      persist: () =>
        updateSurvivor(selectedSurvivor?.id, { knowledge_2_rules: value }),
      rollback: () => {
        setKnowledge2({
          ...knowledge2,
          rules: oldRules
        })
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  knowledge_2_rules: selectedSurvivor?.knowledge_2_rules ?? ''
                }
              : s
          )
        )
      }
    })
  }

  /**
   * Update Knowledge 2 Observation Conditions
   *
   * @param value Knowledge 2 Observation Conditions Value
   */
  const updateKnowledge2ObservationConditions = (value: string) => {
    const oldObservationConditions = knowledge2.observation_conditions

    setKnowledge2({
      ...knowledge2,
      observation_conditions: value
    })

    setSurvivors((prev) =>
      prev.map((s) =>
        s.id === selectedSurvivor?.id
          ? { ...s, knowledge_2_observation_conditions: value }
          : s
      )
    )

    void mutate({
      context: 'Knowledge Observation Conditions Update',
      persist: () =>
        updateSurvivor(selectedSurvivor?.id, {
          knowledge_2_observation_conditions: value
        }),
      rollback: () => {
        setKnowledge2({
          ...knowledge2,
          observation_conditions: oldObservationConditions
        })
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  knowledge_2_observation_conditions:
                    selectedSurvivor?.knowledge_2_observation_conditions ?? ''
                }
              : s
          )
        )
      }
    })
  }

  return (
    <Card
      className={cn(
        'p-2 border-0 gap-0',
        !canUseFightingArtsKnowledges && 'bg-red-500/40'
      )}>
      {/* Title */}
      <CardHeader className="p-0">
        <div className="flex flex-row justify-between">
          <CardTitle className="text-sm flex flex-row items-center gap-1">
            Knowledge
          </CardTitle>

          {/* Cannot Use Fighting Arts or Knowledges */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="canUseFightingArtsOrKnowledges"
              checked={!canUseFightingArtsKnowledges}
              onCheckedChange={updateCanUseFightingArtsOrKnowledges}
            />
            <Label
              htmlFor="canUseFightingArtsOrKnowledges"
              className="text-xs cursor-pointer">
              Cannot Use Knowledges
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col">
        {/* Knowledge 1 */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-2">
          <div className="grow flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center gap-1">
                <div className="grow">
                  <KnowledgeSelect
                    knowledges={selectedSettlement?.knowledges ?? []}
                    value={knowledge1?.id}
                    onChange={updateKnowledge1}
                    placeholder="Select knowledge..."
                  />
                </div>
                {(() => {
                  const settlementKnowledge =
                    selectedSettlement?.knowledges.find(
                      (k) => k.knowledge_id === knowledge1?.id
                    )
                  return (
                    <>
                      <CustomKnowledgeRulesIconButton
                        custom={settlementKnowledge?.custom}
                        knowledgeName={settlementKnowledge?.knowledge_name}
                        rules={settlementKnowledge?.rules}
                        observationConditions={
                          settlementKnowledge?.observation_conditions
                        }
                        observationRankUpMilestone={
                          settlementKnowledge?.observation_rank_up_milestone
                        }
                        philosophyId={settlementKnowledge?.philosophy_id}
                        authorUserId={
                          settlementKnowledge?.author_user_id ?? null
                        }
                        authorUsername={
                          settlementKnowledge?.author_username ?? null
                        }
                      />
                    </>
                  )
                })()}
              </div>
              <Label className="text-xs text-muted-foreground">
                Knowledge Name
              </Label>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-center lg:items-end">
            <div className="flex gap-1 pt-0 lg:pt-2">
              {[...Array(9)].map((_, index) => {
                const checked = knowledge1.observation_rank >= index + 1
                const isRankUpMilestone =
                  (knowledge1.rank_up ??
                    (knowledge1.observation_rank_up_milestone != null &&
                    knowledge1.observation_rank_up_milestone > 0
                      ? knowledge1.observation_rank_up_milestone - 1
                      : null)) === index
                const hasKnowledge = !!knowledge1.id

                return (
                  <LongPressCheckbox
                    key={index}
                    disabled={!hasKnowledge}
                    checked={checked}
                    onCheckedChange={(checked) =>
                      updateKnowledge1ObservationRank(!!checked, index)
                    }
                    onLongPress={
                      hasKnowledge
                        ? () => updateKnowledge1RankUp(index)
                        : undefined
                    }
                    className={cn(
                      'h-4 w-4 rounded-sm',
                      !checked && isRankUpMilestone && 'border-2 border-primary'
                    )}
                  />
                )
              })}
            </div>

            <p className="text-xs text-muted-foreground text-right lg:hidden">
              Long press for rank-up
            </p>
          </div>
        </div>

        {/* Knowledge 1 Rules */}
        <div className="mt-1 flex flex-col gap-1">
          <Textarea
            disabled={!knowledge1.id}
            placeholder=" Enter knowledge rules..."
            className="resize-none border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-b-2 px-2 h-20 overflow-y-auto text-sm"
            value={knowledge1?.rules ?? ''}
            onChange={(e) =>
              setKnowledge1({ ...knowledge1, rules: e.target.value })
            }
            onBlur={(e) => updateKnowledge1Rules(e.target.value)}
          />
          <Label className="text-xs text-muted-foreground text-right">
            Rules
          </Label>
        </div>

        {/* Knowledge 1 Observation Conditions */}
        <div className="mt-1">
          <div className="flex flex-col gap-1">
            <Textarea
              disabled={!knowledge1.id}
              placeholder=" Enter observation conditions..."
              className="resize-none border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-b-2 px-2 h-20 overflow-y-auto text-sm"
              value={knowledge1?.observation_conditions ?? ''}
              onChange={(e) =>
                setKnowledge1({
                  ...knowledge1,
                  observation_conditions: e.target.value
                })
              }
              onBlur={(e) =>
                updateKnowledge1ObservationConditions(e.target.value)
              }
            />
            <Label className="text-xs text-muted-foreground text-right">
              Observation Conditions
            </Label>
          </div>
        </div>

        <hr className="my-2 border-4" />

        {/* Knowledge 2 */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-2">
          <div className="grow flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center gap-1">
                <div className="grow">
                  <KnowledgeSelect
                    knowledges={selectedSettlement?.knowledges ?? []}
                    value={knowledge2?.id}
                    onChange={updateKnowledge2}
                    placeholder="Select knowledge..."
                  />
                </div>
                {(() => {
                  const settlementKnowledge =
                    selectedSettlement?.knowledges.find(
                      (k) => k.knowledge_id === knowledge2?.id
                    )
                  return (
                    <>
                      <CustomKnowledgeRulesIconButton
                        custom={settlementKnowledge?.custom}
                        knowledgeName={settlementKnowledge?.knowledge_name}
                        rules={settlementKnowledge?.rules}
                        observationConditions={
                          settlementKnowledge?.observation_conditions
                        }
                        observationRankUpMilestone={
                          settlementKnowledge?.observation_rank_up_milestone
                        }
                        philosophyId={settlementKnowledge?.philosophy_id}
                        authorUserId={
                          settlementKnowledge?.author_user_id ?? null
                        }
                        authorUsername={
                          settlementKnowledge?.author_username ?? null
                        }
                      />
                    </>
                  )
                })()}
              </div>
              <Label className="text-xs text-muted-foreground">
                Knowledge Name
              </Label>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-center lg:items-end">
            <div className="flex gap-1 pt-0 lg:pt-2">
              {[...Array(9)].map((_, index) => {
                const checked = knowledge2.observation_rank >= index + 1
                const isRankUpMilestone =
                  (knowledge2.rank_up ??
                    (knowledge2.observation_rank_up_milestone != null &&
                    knowledge2.observation_rank_up_milestone > 0
                      ? knowledge2.observation_rank_up_milestone - 1
                      : null)) === index
                const hasKnowledge = !!knowledge2.id

                return (
                  <LongPressCheckbox
                    key={index}
                    disabled={!hasKnowledge}
                    checked={checked}
                    onCheckedChange={(checked) =>
                      updateKnowledge2ObservationRank(!!checked, index)
                    }
                    onLongPress={
                      hasKnowledge
                        ? () => updateKnowledge2RankUp(index)
                        : undefined
                    }
                    className={cn(
                      'h-4 w-4 rounded-sm',
                      !checked && isRankUpMilestone && 'border-2 border-primary'
                    )}
                  />
                )
              })}
            </div>

            <p className="text-xs text-muted-foreground text-right lg:hidden">
              Long press for rank-up
            </p>
          </div>
        </div>

        {/* Knowledge 2 Rules */}
        <div className="mt-1 flex flex-col gap-1">
          <Textarea
            disabled={!knowledge2.id}
            placeholder=" Enter knowledge rules..."
            className="resize-none border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-b-2 px-2 h-20 overflow-y-auto text-sm"
            value={knowledge2?.rules ?? ''}
            onChange={(e) =>
              setKnowledge2({ ...knowledge2, rules: e.target.value })
            }
            onBlur={(e) => updateKnowledge2Rules(e.target.value)}
          />
          <Label className="text-xs text-muted-foreground text-right">
            Rules
          </Label>
        </div>

        {/* Knowledge 2 Observation Conditions */}
        <div className="mt-1 flex flex-col gap-1 pb-2">
          <Textarea
            disabled={!knowledge2.id}
            placeholder=" Enter observation conditions..."
            className="resize-none border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-b-2 px-2 h-20 overflow-y-auto text-sm"
            value={knowledge2?.observation_conditions ?? ''}
            onChange={(e) =>
              setKnowledge2({
                ...knowledge2,
                observation_conditions: e.target.value
              })
            }
            onBlur={(e) =>
              updateKnowledge2ObservationConditions(e.target.value)
            }
          />
          <Label className="text-xs text-muted-foreground text-right">
            Observation Conditions
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
