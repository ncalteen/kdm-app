import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  ERROR_MESSAGE,
  SURVIVOR_CAN_USE_FIGHTING_ARTS_OR_KNOWLEDGES_UPDATED_MESSAGE,
  SURVIVOR_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE,
  SURVIVOR_KNOWLEDGE_OBSERVATION_RANK_UPDATED_MESSAGE,
  SURVIVOR_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE,
  SURVIVOR_KNOWLEDGE_RULES_UPDATED_MESSAGE,
  SURVIVOR_KNOWLEDGE_UPDATED_MESSAGE
} from '@/lib/messages'
import { SettlementDetail, SurvivorDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MouseEvent, ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Knowledge Card Properties
 */
interface KnowledgeCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Knowledge Card Component
 *
 * @param props Knowledge Card Properties
 * @returns Knowledge Card Component
 */
export function KnowledgeCard({
  selectedSettlement,
  selectedSurvivor,
  setSurvivors,
  survivors
}: KnowledgeCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  // Local state for text fields to enable controlled components
  const [knowledge1, setKnowledge1] = useState({
    id: selectedSurvivor?.knowledge_1?.id ?? '',
    knowledge_name: selectedSurvivor?.knowledge_1?.knowledge_name ?? '',
    rules: selectedSurvivor?.knowledge_1_rules ?? '',
    observation_conditions:
      selectedSurvivor?.knowledge_1_observation_conditions ?? '',
    observation_rank: selectedSurvivor?.knowledge_1_observation_rank ?? 0,
    rank_up: selectedSurvivor?.knowledge_1_rank_up ?? null
  })
  const [knowledge2, setKnowledge2] = useState({
    id: selectedSurvivor?.knowledge_2?.id ?? '',
    knowledge_name: selectedSurvivor?.knowledge_2?.knowledge_name ?? '',
    rules: selectedSurvivor?.knowledge_2_rules ?? '',
    observation_conditions:
      selectedSurvivor?.knowledge_2_observation_conditions ?? '',
    observation_rank: selectedSurvivor?.knowledge_2_observation_rank ?? 0,
    rank_up: selectedSurvivor?.knowledge_2_rank_up ?? null
  })

  const canUseFightingArtsKnowledges =
    survivors.find((s) => s.id === selectedSurvivor?.id)
      ?.can_use_fighting_arts_knowledges ?? true

  // Reset local state when survivor changes (different ID)
  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id

    setKnowledge1({
      id: selectedSurvivor?.knowledge_1?.id ?? '',
      knowledge_name: selectedSurvivor?.knowledge_1?.knowledge_name ?? '',
      rules: selectedSurvivor?.knowledge_1_rules ?? '',
      observation_conditions:
        selectedSurvivor?.knowledge_1_observation_conditions ?? '',
      observation_rank: selectedSurvivor?.knowledge_1_observation_rank ?? 0,
      rank_up: selectedSurvivor?.knowledge_1_rank_up ?? null
    })
    setKnowledge2({
      id: selectedSurvivor?.knowledge_2?.id ?? '',
      knowledge_name: selectedSurvivor?.knowledge_2?.knowledge_name ?? '',
      rules: selectedSurvivor?.knowledge_2_rules ?? '',
      observation_conditions:
        selectedSurvivor?.knowledge_2_observation_conditions ?? '',
      observation_rank: selectedSurvivor?.knowledge_2_observation_rank ?? 0,
      rank_up: selectedSurvivor?.knowledge_2_rank_up ?? null
    })
  }

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

      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, [fieldName]: rank } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { [fieldName]: rank })
        .then(() =>
          toast.success(SURVIVOR_KNOWLEDGE_OBSERVATION_RANK_UPDATED_MESSAGE())
        )
        .catch((error) => {
          // Revert on error
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id ? { ...s, [fieldName]: oldRank } : s
            )
          )

          console.error('Knowledge Rank Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [knowledge1, knowledge2, selectedSurvivor?.id, setSurvivors, survivors]
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
            SURVIVOR_CAN_USE_FIGHTING_ARTS_OR_KNOWLEDGES_UPDATED_MESSAGE(
              newValue
            )
          )
        )
        .catch((error) => {
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, can_use_fighting_arts_knowledges: oldValue }
                : s
            )
          )

          console.error('Cannot Use Knowledges Update Error:', error)
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
    const newKnowledge = knowledgeDetail
      ? {
          ...knowledge1,
          id: knowledgeId,
          knowledge_name: knowledgeDetail.knowledge_name
        }
      : { ...knowledge1, id: '', knowledge_name: '' }

    setKnowledge1(newKnowledge)

    setSurvivors(
      survivors.map((s) =>
        s.id === selectedSurvivor?.id
          ? {
              ...s,
              knowledge_1: knowledgeDetail
                ? {
                    id: knowledgeId,
                    knowledge_name: knowledgeDetail.knowledge_name
                  }
                : null
            }
          : s
      )
    )

    updateSurvivor(selectedSurvivor?.id, {
      knowledge_1_id: knowledgeId || null
    })
      .then(() =>
        toast.success(
          SURVIVOR_KNOWLEDGE_UPDATED_MESSAGE(
            knowledgeDetail?.knowledge_name ?? ''
          )
        )
      )
      .catch((error) => {
        console.error('Knowledge Update Error:', error)

        setKnowledge1(oldKnowledge)
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? { ...s, knowledge_1: selectedSurvivor?.knowledge_1 ?? null }
              : s
          )
        )
        toast.error(ERROR_MESSAGE())
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
   * @param event Mouse Event
   */
  const updateKnowledge1RankUp = useCallback(
    (index: number, event: MouseEvent) => {
      event.preventDefault()

      const newRankUp = knowledge1.rank_up === index ? null : index
      const oldRankUp = knowledge1.rank_up

      setKnowledge1({
        ...knowledge1,
        rank_up: newRankUp
      })

      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, knowledge_1_rank_up: newRankUp }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { knowledge_1_rank_up: newRankUp })
        .then(() =>
          toast.success(
            SURVIVOR_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE(newRankUp ?? undefined)
          )
        )
        .catch((error) => {
          setKnowledge1({ ...knowledge1, rank_up: oldRankUp })
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, knowledge_1_rank_up: oldRankUp }
                : s
            )
          )

          console.error('Knowledge Rank Up Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [knowledge1, selectedSurvivor?.id, setSurvivors, survivors]
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

    setSurvivors(
      survivors.map((s) =>
        s.id === selectedSurvivor?.id ? { ...s, knowledge_1_rules: value } : s
      )
    )

    updateSurvivor(selectedSurvivor?.id, { knowledge_1_rules: value })
      .then(() => {
        if (value.trim())
          toast.success(SURVIVOR_KNOWLEDGE_RULES_UPDATED_MESSAGE())
      })
      .catch((error) => {
        setKnowledge1({
          ...knowledge1,
          rules: oldRules
        })
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  knowledge_1_rules: selectedSurvivor?.knowledge_1_rules ?? ''
                }
              : s
          )
        )

        console.error('Knowledge Rules Update Error:', error)
        toast.error(ERROR_MESSAGE())
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

    setSurvivors(
      survivors.map((s) =>
        s.id === selectedSurvivor?.id
          ? { ...s, knowledge_1_observation_conditions: value }
          : s
      )
    )

    updateSurvivor(selectedSurvivor?.id, {
      knowledge_1_observation_conditions: value
    })
      .then(() => {
        if (value.trim())
          toast.success(
            SURVIVOR_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE()
          )
      })
      .catch((error) => {
        setKnowledge1({
          ...knowledge1,
          observation_conditions: oldObservationConditions
        })
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  knowledge_1_observation_conditions:
                    selectedSurvivor?.knowledge_1_observation_conditions ?? ''
                }
              : s
          )
        )

        console.error('Knowledge Observation Conditions Update Error:', error)
        toast.error(ERROR_MESSAGE())
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
    const newKnowledge = knowledgeDetail
      ? {
          ...knowledge2,
          id: knowledgeId,
          knowledge_name: knowledgeDetail.knowledge_name
        }
      : { ...knowledge2, id: '', knowledge_name: '' }

    setKnowledge2(newKnowledge)

    setSurvivors(
      survivors.map((s) =>
        s.id === selectedSurvivor?.id
          ? {
              ...s,
              knowledge_2: knowledgeDetail
                ? {
                    id: knowledgeId,
                    knowledge_name: knowledgeDetail.knowledge_name
                  }
                : null
            }
          : s
      )
    )

    updateSurvivor(selectedSurvivor?.id, {
      knowledge_2_id: knowledgeId || null
    })
      .then(() =>
        toast.success(
          SURVIVOR_KNOWLEDGE_UPDATED_MESSAGE(
            knowledgeDetail?.knowledge_name ?? ''
          )
        )
      )
      .catch((error) => {
        console.error('Knowledge Update Error:', error)

        setKnowledge2(oldKnowledge)
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? { ...s, knowledge_2: selectedSurvivor?.knowledge_2 ?? null }
              : s
          )
        )
        toast.error(ERROR_MESSAGE())
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
   * @param event Mouse Event
   */
  const updateKnowledge2RankUp = useCallback(
    (index: number, event: MouseEvent) => {
      event.preventDefault()

      const newRankUp = knowledge2.rank_up === index ? null : index
      const oldRankUp = knowledge2.rank_up

      setKnowledge2({
        ...knowledge2,
        rank_up: newRankUp
      })

      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, knowledge_2_rank_up: newRankUp }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { knowledge_2_rank_up: newRankUp })
        .then(() =>
          toast.success(
            SURVIVOR_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE(newRankUp ?? undefined)
          )
        )
        .catch((error) => {
          setKnowledge2({ ...knowledge2, rank_up: oldRankUp })
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, knowledge_2_rank_up: oldRankUp }
                : s
            )
          )

          console.error('Knowledge Rank Up Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [knowledge2, selectedSurvivor?.id, setSurvivors, survivors]
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

    setSurvivors(
      survivors.map((s) =>
        s.id === selectedSurvivor?.id ? { ...s, knowledge_2_rules: value } : s
      )
    )

    updateSurvivor(selectedSurvivor?.id, { knowledge_2_rules: value })
      .then(() => {
        if (value.trim())
          toast.success(SURVIVOR_KNOWLEDGE_RULES_UPDATED_MESSAGE())
      })
      .catch((error) => {
        setKnowledge2({
          ...knowledge2,
          rules: oldRules
        })
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  knowledge_2_rules: selectedSurvivor?.knowledge_2_rules ?? ''
                }
              : s
          )
        )

        console.error('Knowledge Rules Update Error:', error)
        toast.error(ERROR_MESSAGE())
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

    setSurvivors(
      survivors.map((s) =>
        s.id === selectedSurvivor?.id
          ? { ...s, knowledge_2_observation_conditions: value }
          : s
      )
    )

    updateSurvivor(selectedSurvivor?.id, {
      knowledge_2_observation_conditions: value
    })
      .then(() => {
        if (value.trim())
          toast.success(
            SURVIVOR_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE()
          )
      })
      .catch((error) => {
        setKnowledge2({
          ...knowledge2,
          observation_conditions: oldObservationConditions
        })
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  knowledge_2_observation_conditions:
                    selectedSurvivor?.knowledge_2_observation_conditions ?? ''
                }
              : s
          )
        )

        console.error('Knowledge Observation Conditions Update Error:', error)
        toast.error(ERROR_MESSAGE())
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
        <div className="flex items-start gap-2">
          <div className="flex-grow flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <Select
                value={knowledge1?.id}
                onValueChange={(value) => updateKnowledge1(value)}>
                <SelectTrigger className="border-0 border-b rounded-none focus:ring-0 px-2 text-sm">
                  <SelectValue placeholder="Select knowledge..." />
                </SelectTrigger>
                <SelectContent>
                  {(selectedSettlement?.knowledges ?? []).map((k) => (
                    <SelectItem key={k.knowledge_id} value={k.knowledge_id}>
                      {k.knowledge_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label className="text-xs text-muted-foreground">
                Knowledge Name
              </Label>
            </div>
          </div>
          <div className="flex gap-1 pt-2">
            {[...Array(9)].map((_, index) => {
              const checked = knowledge1.observation_rank >= index + 1
              const isRankUpMilestone = knowledge1.rank_up === index

              return (
                <Checkbox
                  key={index}
                  checked={checked}
                  onCheckedChange={(checked) =>
                    updateKnowledge1ObservationRank(!!checked, index)
                  }
                  onContextMenu={(event) =>
                    updateKnowledge1RankUp(index, event)
                  }
                  className={cn(
                    'h-4 w-4 rounded-sm',
                    !checked && isRankUpMilestone && 'border-2 border-primary'
                  )}
                />
              )
            })}
          </div>
        </div>

        {/* Knowledge 1 Rules */}
        <div className="mt-1 flex flex-col gap-1">
          <Textarea
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
        <div className="flex items-start gap-2">
          <div className="flex-grow flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <Select
                value={knowledge2?.id}
                onValueChange={(value) => updateKnowledge2(value)}>
                <SelectTrigger className="border-0 border-b rounded-none focus:ring-0 px-2 text-sm">
                  <SelectValue placeholder="Select knowledge..." />
                </SelectTrigger>
                <SelectContent>
                  {(selectedSettlement?.knowledges ?? []).map((k) => (
                    <SelectItem key={k.knowledge_id} value={k.knowledge_id}>
                      {k.knowledge_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label className="text-xs text-muted-foreground">
                Knowledge Name
              </Label>
            </div>
          </div>
          <div className="flex gap-1 pt-2">
            {[...Array(9)].map((_, index) => {
              const checked = knowledge2.observation_rank >= index + 1
              const isRankUpMilestone = knowledge2.rank_up === index

              return (
                <Checkbox
                  key={index}
                  checked={checked}
                  onCheckedChange={(checked) =>
                    updateKnowledge2ObservationRank(!!checked, index)
                  }
                  onContextMenu={(event) =>
                    updateKnowledge2RankUp(index, event)
                  }
                  className={cn(
                    'h-4 w-4 rounded-sm',
                    !checked && isRankUpMilestone && 'border-2 border-primary'
                  )}
                />
              )
            })}
          </div>
        </div>

        {/* Knowledge 2 Rules */}
        <div className="mt-1 flex flex-col gap-1">
          <Textarea
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
