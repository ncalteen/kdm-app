'use client'

import {
  CustomKnowledgeRulesIconButton,
  CustomNeurosisRulesIconButton,
  CustomPhilosophyRulesIconButton
} from '@/components/custom/custom-rules-sheet'
import { NumericInput } from '@/components/menu/numeric-input'
import { SelectNeurosis } from '@/components/menu/select-neurosis'
import { SelectPhilosophy } from '@/components/menu/select-philosophy'
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
import { PHILOSOPHY_RANK_MINIMUM_ERROR_MESSAGE } from '@/lib/messages'
import {
  SettlementDetail,
  SurvivorDetail,
  SurvivorsStateSetter
} from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Philosophy Card Properties
 */
interface PhilosophyCardProps {
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
 * Tenet Knowledge Select Properties
 */
interface TenetKnowledgeSelectProps {
  /** Available Knowledges */
  knowledges: {
    knowledge_id: string
    knowledge_name: string
    custom?: boolean
  }[]
  /** OnChange Handler */
  onChange: (value: string) => void
  /** Selected Knowledge ID */
  value?: string
}

/**
 * Tenet Knowledge Select Component
 *
 * Searchable combobox for selecting a tenet knowledge.
 *
 * @param props Tenet Knowledge Select Properties
 * @returns Tenet Knowledge Select Component
 */
function TenetKnowledgeSelect({
  knowledges,
  onChange,
  value
}: TenetKnowledgeSelectProps): ReactElement {
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
          {selectedName ?? 'Select tenet knowledge...'}
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
 * Philosophy Card Component
 *
 * @param props Philosophy Card Properties
 * @returns Philosophy Card Component
 */
export function PhilosophyCard({
  local,
  selectedSettlement,
  selectedSurvivor,
  setSurvivors,
  survivors
}: PhilosophyCardProps): ReactElement {
  const mutate = useOptimisticMutation()

  const [prevSurvivor, setPrevSurvivor] = useState(selectedSurvivor)

  const [neurosis, setNeurosis] = useState<SurvivorDetail['neurosis']>(
    selectedSurvivor?.neurosis ?? null
  )
  const [tenetKnowledge, setTenetKnowledge] = useState({
    id: selectedSurvivor?.tenet_knowledge?.id ?? '',
    knowledge_name: selectedSurvivor?.tenet_knowledge?.knowledge_name ?? '',
    rules: selectedSurvivor?.tenet_knowledge_rules ?? '',
    observation_conditions:
      selectedSurvivor?.tenet_knowledge_observation_conditions ?? '',
    observation_rank: selectedSurvivor?.tenet_knowledge_observation_rank ?? 0,
    observation_rank_up_milestone:
      selectedSurvivor?.tenet_knowledge?.observation_rank_up_milestone ?? null,
    rank_up: selectedSurvivor?.tenet_knowledge_rank_up ?? null
  })
  const tenetRankUpRef = useRef(
    selectedSurvivor?.tenet_knowledge_rank_up ?? null
  )
  const [philosophy, setPhilosophy] = useState<SurvivorDetail['philosophy']>(
    selectedSurvivor?.philosophy ?? null
  )
  const [philosophyRank, setPhilosophyRank] = useState<number>(
    selectedSurvivor?.philosophy_rank ?? 0
  )

  // Reset local state when survivor changes
  if (prevSurvivor !== selectedSurvivor) {
    setPrevSurvivor(selectedSurvivor)

    setNeurosis(selectedSurvivor?.neurosis ?? null)
    setTenetKnowledge({
      id: selectedSurvivor?.tenet_knowledge?.id ?? '',
      knowledge_name: selectedSurvivor?.tenet_knowledge?.knowledge_name ?? '',
      rules: selectedSurvivor?.tenet_knowledge_rules ?? '',
      observation_conditions:
        selectedSurvivor?.tenet_knowledge_observation_conditions ?? '',
      observation_rank: selectedSurvivor?.tenet_knowledge_observation_rank ?? 0,
      observation_rank_up_milestone:
        selectedSurvivor?.tenet_knowledge?.observation_rank_up_milestone ??
        null,
      rank_up: selectedSurvivor?.tenet_knowledge_rank_up ?? null
    })
    setPhilosophy(selectedSurvivor?.philosophy ?? null)
    setPhilosophyRank(selectedSurvivor?.philosophy_rank ?? 0)
  }

  // Sync ref after state updates (refs cannot be written during render)
  useEffect(() => {
    tenetRankUpRef.current = tenetKnowledge.rank_up
  }, [tenetKnowledge.rank_up])

  /**
   * Handle Philosophy Change
   *
   * @param philosophyId Philosophy ID (or empty string to clear)
   */
  const handlePhilosophyChange = useCallback(
    (philosophyId: string) => {
      const prevPhilosophy = philosophy
      const prevPhilosophyRank = philosophyRank
      const prevTenetKnowledge = tenetKnowledge

      const philosophyDetail = philosophyId
        ? selectedSettlement?.philosophies.find(
            (p) => p.philosophy_id === philosophyId
          )
        : null

      const newPhilosophy = philosophyDetail
        ? {
            id: philosophyId,
            philosophy_name: philosophyDetail.philosophy_name,
            custom: philosophyDetail.custom,
            hunt_xp_milestones: philosophyDetail.hunt_xp_milestones,
            tenet_knowledge_id: philosophyDetail.tenet_knowledge_id,
            tier: philosophyDetail.tier,
            author_user_id: philosophyDetail.author_user_id,
            author_username: philosophyDetail.author_username,
            author_avatar_url: philosophyDetail.author_avatar_url
          }
        : null

      // Auto-set neurosis based on the philosophy's linked neurosis_id
      const prevNeurosis = neurosis
      const matchedNeurosis = philosophyDetail?.neurosis_id
        ? selectedSettlement?.neuroses.find(
            (n) => n.id === philosophyDetail.neurosis_id
          )
        : null
      const newNeurosis = matchedNeurosis
        ? {
            id: matchedNeurosis.id,
            neurosis_name: matchedNeurosis.neurosis_name,
            custom: matchedNeurosis.custom,
            rules: null,
            // This optimistic cascade only has the picker/catalog neurosis
            // data, so the authorship triplet remains null until the next
            // refetch hydrates the full survivor neurosis detail.
            author_user_id: null,
            author_username: null,
            author_avatar_url: null
          }
        : null

      // Auto-set tenet knowledge based on the philosophy's linked tenet_knowledge_id.
      // When the cascade fires, also populate the linked knowledge's catalog
      // defaults (rules, observation conditions, rank-up milestone) and reset
      // the survivor's per-instance progress fields.
      const matchedKnowledge = philosophyDetail?.tenet_knowledge_id
        ? selectedSettlement?.knowledges.find(
            (k) => k.knowledge_id === philosophyDetail.tenet_knowledge_id
          )
        : null
      const newTenetKnowledgeJoin = matchedKnowledge
        ? {
            id: matchedKnowledge.knowledge_id,
            knowledge_name: matchedKnowledge.knowledge_name,
            custom: matchedKnowledge.custom,
            rules: matchedKnowledge.rules,
            observation_conditions: matchedKnowledge.observation_conditions,
            observation_rank_up_milestone:
              matchedKnowledge.observation_rank_up_milestone,
            author_user_id: matchedKnowledge.author_user_id,
            author_username: matchedKnowledge.author_username,
            author_avatar_url: matchedKnowledge.author_avatar_url
          }
        : null
      const newTenetKnowledgeState = {
        id: matchedKnowledge?.knowledge_id ?? '',
        knowledge_name: matchedKnowledge?.knowledge_name ?? '',
        rules: matchedKnowledge?.rules ?? '',
        observation_conditions: matchedKnowledge?.observation_conditions ?? '',
        observation_rank: 0,
        observation_rank_up_milestone:
          matchedKnowledge?.observation_rank_up_milestone ?? null,
        rank_up: null
      }

      setPhilosophy(newPhilosophy)
      setNeurosis(newNeurosis)
      setTenetKnowledge(newTenetKnowledgeState)
      if (!philosophyId) setPhilosophyRank(0)

      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id
            ? {
                ...s,
                philosophy: newPhilosophy,
                neurosis: newNeurosis,
                tenet_knowledge: newTenetKnowledgeJoin,
                tenet_knowledge_rules: newTenetKnowledgeState.rules,
                tenet_knowledge_observation_conditions:
                  newTenetKnowledgeState.observation_conditions,
                tenet_knowledge_observation_rank: 0,
                tenet_knowledge_rank_up: null,
                ...(philosophyId ? {} : { philosophy_rank: 0 })
              }
            : s
        )
      )

      void mutate({
        context: 'Philosophy Update',
        persist: () =>
          updateSurvivor(selectedSurvivor?.id, {
            philosophy_id: philosophyId || null,
            neurosis_id: newNeurosis?.id ?? null,
            tenet_knowledge_id: matchedKnowledge?.knowledge_id ?? null,
            tenet_knowledge_rules: newTenetKnowledgeState.rules,
            tenet_knowledge_observation_conditions:
              newTenetKnowledgeState.observation_conditions,
            tenet_knowledge_observation_rank: 0,
            tenet_knowledge_rank_up: null,
            ...(philosophyId ? {} : { philosophy_rank: 0 })
          }),
        rollback: () => {
          setPhilosophy(prevPhilosophy)
          setPhilosophyRank(prevPhilosophyRank)
          setNeurosis(prevNeurosis)
          setTenetKnowledge(prevTenetKnowledge)
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor?.id
                ? {
                    ...s,
                    philosophy: prevPhilosophy,
                    philosophy_rank: prevPhilosophyRank,
                    neurosis: prevNeurosis,
                    tenet_knowledge: selectedSurvivor?.tenet_knowledge ?? null,
                    tenet_knowledge_rules:
                      selectedSurvivor?.tenet_knowledge_rules ?? '',
                    tenet_knowledge_observation_conditions:
                      selectedSurvivor?.tenet_knowledge_observation_conditions ??
                      '',
                    tenet_knowledge_observation_rank:
                      selectedSurvivor?.tenet_knowledge_observation_rank ?? 0,
                    tenet_knowledge_rank_up:
                      selectedSurvivor?.tenet_knowledge_rank_up ?? null
                  }
                : s
            )
          )
        }
      })
    },
    [
      neurosis,
      philosophy,
      philosophyRank,
      tenetKnowledge,
      selectedSettlement,
      selectedSurvivor,
      setSurvivors,
      mutate
    ]
  )

  /**
   * Handle Neurosis Change
   *
   * @param neurosisId Neurosis ID (or empty string to clear)
   */
  const handleNeurosisChange = useCallback(
    (neurosisId: string) => {
      const prevNeurosis = neurosis

      const neurosisDetail = neurosisId
        ? selectedSettlement?.neuroses.find((n) => n.id === neurosisId)
        : null

      const newNeurosis = neurosisDetail
        ? {
            id: neurosisId,
            neurosis_name: neurosisDetail.neurosis_name,
            custom: neurosisDetail.custom,
            rules: null,
            // This optimistic local neurosis detail does not carry authorship;
            // keep the triplet null here and let the next refetch backfill it.
            author_user_id: null,
            author_username: null,
            author_avatar_url: null
          }
        : null

      setNeurosis(newNeurosis)

      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, neurosis: newNeurosis } : s
        )
      )

      void mutate({
        context: 'Neurosis Update',
        persist: () =>
          updateSurvivor(selectedSurvivor?.id, {
            neurosis_id: neurosisId || null
          }),
        rollback: () => {
          setNeurosis(prevNeurosis)
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, neurosis: prevNeurosis }
                : s
            )
          )
        }
      })
    },
    [neurosis, selectedSettlement, selectedSurvivor?.id, setSurvivors, mutate]
  )

  /**
   * Handle Tenet Knowledge Rank Up (Right-Click or Long Press)
   *
   * @param index Checkbox Index (0-Based)
   */
  const handleRankUpToggle = useCallback(
    (index: number) => {
      const prevRankUp = tenetRankUpRef.current
      const newRankUp = tenetRankUpRef.current === index ? null : index

      tenetRankUpRef.current = newRankUp
      setTenetKnowledge((prev) => ({ ...prev, rank_up: newRankUp }))

      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, tenet_knowledge_rank_up: newRankUp }
            : s
        )
      )

      void mutate({
        context: 'Tenet Knowledge Rank Up',
        persist: () =>
          updateSurvivor(selectedSurvivor?.id, {
            tenet_knowledge_rank_up: newRankUp
          }),
        rollback: () => {
          tenetRankUpRef.current = prevRankUp
          setTenetKnowledge((prev) => ({ ...prev, rank_up: prevRankUp }))
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, tenet_knowledge_rank_up: prevRankUp }
                : s
            )
          )
        }
      })
    },
    [selectedSurvivor?.id, setSurvivors, mutate]
  )

  /**
   * Update Philosophy Rank
   *
   * @param value New Philosophy Rank
   */
  const updatePhilosophyRank = useCallback(
    (value: number) => {
      if (value < 0) return toast.error(PHILOSOPHY_RANK_MINIMUM_ERROR_MESSAGE())

      const prevRank = philosophyRank

      setPhilosophyRank(value)

      setSurvivors((prev) =>
        prev.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, philosophy_rank: value } : s
        )
      )

      void mutate({
        context: 'Philosophy Rank Update',
        persist: () =>
          updateSurvivor(selectedSurvivor?.id, { philosophy_rank: value }),
        rollback: () => {
          setPhilosophyRank(prevRank)
          setSurvivors((prev) =>
            prev.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, philosophy_rank: prevRank }
                : s
            )
          )
        }
      })
    },
    [philosophyRank, selectedSurvivor?.id, setSurvivors, mutate]
  )

  /**
   * Update Tenet Knowledge
   *
   * @param knowledgeId Knowledge ID (or empty string to clear)
   */
  const handleTenetKnowledgeChange = (knowledgeId: string) => {
    const oldTenetKnowledge = tenetKnowledge
    const knowledgeDetail = knowledgeId
      ? selectedSettlement?.knowledges.find(
          (k) => k.knowledge_id === knowledgeId
        )
      : null

    // Cascade catalog defaults from the linked knowledge row when present
    // (rules + observation conditions). Always reset per-survivor progress
    // (observation_rank) and clear the user's chosen rank-up level.
    const cascadedRules = knowledgeDetail?.rules ?? ''
    const cascadedConditions = knowledgeDetail?.observation_conditions ?? ''

    const newTenetKnowledge = knowledgeDetail
      ? {
          ...tenetKnowledge,
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
          ...tenetKnowledge,
          id: '',
          knowledge_name: '',
          observation_rank: 0,
          observation_rank_up_milestone: null,
          rank_up: null,
          rules: '',
          observation_conditions: ''
        }

    setTenetKnowledge(newTenetKnowledge)

    setSurvivors((prev) =>
      prev.map((s) =>
        s.id === selectedSurvivor?.id
          ? {
              ...s,
              tenet_knowledge: knowledgeDetail
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
              tenet_knowledge_observation_rank: 0,
              tenet_knowledge_rank_up: null,
              tenet_knowledge_rules: cascadedRules,
              tenet_knowledge_observation_conditions: cascadedConditions
            }
          : s
      )
    )

    void mutate({
      context: 'Tenet Knowledge Update',
      persist: () =>
        updateSurvivor(selectedSurvivor?.id, {
          tenet_knowledge_id: knowledgeId || null,
          tenet_knowledge_observation_rank: 0,
          tenet_knowledge_rank_up: null,
          tenet_knowledge_rules: cascadedRules,
          tenet_knowledge_observation_conditions: cascadedConditions
        }),
      rollback: () => {
        setTenetKnowledge(oldTenetKnowledge)
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  tenet_knowledge: selectedSurvivor?.tenet_knowledge ?? null
                }
              : s
          )
        )
      }
    })
  }

  /**
   * Update Tenet Knowledge Observation Rank
   *
   * @param checked Checked Status
   * @param index Checkbox Index (0-Based)
   */
  const updateTenetKnowledgeObservationRank = (
    checked: boolean,
    index: number
  ) => {
    const newRank = checked
      ? index + 1
      : tenetKnowledge.observation_rank === index + 1
        ? index
        : undefined

    if (newRank === undefined) return

    const prevRank = tenetKnowledge.observation_rank

    setTenetKnowledge({ ...tenetKnowledge, observation_rank: newRank })

    setSurvivors((prev) =>
      prev.map((s) =>
        s.id === selectedSurvivor?.id
          ? { ...s, tenet_knowledge_observation_rank: newRank }
          : s
      )
    )

    void mutate({
      context: 'Tenet Knowledge Observation Rank',
      persist: () =>
        updateSurvivor(selectedSurvivor?.id, {
          tenet_knowledge_observation_rank: newRank
        }),
      rollback: () => {
        setTenetKnowledge({ ...tenetKnowledge, observation_rank: prevRank })
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor?.id
              ? { ...s, tenet_knowledge_observation_rank: prevRank }
              : s
          )
        )
      }
    })
  }

  /**
   * Update Tenet Knowledge Rules
   *
   * @param value New Tenet Knowledge Rules Value
   */
  const updateTenetKnowledgeRules = (value: string) => {
    const oldRules = tenetKnowledge.rules

    setTenetKnowledge({ ...tenetKnowledge, rules: value })

    setSurvivors((prev) =>
      prev.map((s) =>
        s.id === selectedSurvivor?.id
          ? { ...s, tenet_knowledge_rules: value }
          : s
      )
    )

    void mutate({
      context: 'Tenet Knowledge Rules Update',
      persist: () =>
        updateSurvivor(selectedSurvivor?.id, { tenet_knowledge_rules: value }),
      rollback: () => {
        setTenetKnowledge({ ...tenetKnowledge, rules: oldRules })
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  tenet_knowledge_rules:
                    selectedSurvivor?.tenet_knowledge_rules ?? ''
                }
              : s
          )
        )
      }
    })
  }

  /**
   * Update Tenet Knowledge Observation Conditions
   *
   * @param value New Tenet Knowledge Observation Conditions Value
   */
  const updateTenetKnowledgeObservationConditions = (value: string) => {
    const oldConditions = tenetKnowledge.observation_conditions

    setTenetKnowledge({ ...tenetKnowledge, observation_conditions: value })

    setSurvivors((prev) =>
      prev.map((s) =>
        s.id === selectedSurvivor?.id
          ? { ...s, tenet_knowledge_observation_conditions: value }
          : s
      )
    )

    void mutate({
      context: 'Tenet Knowledge Observation Conditions Update',
      persist: () =>
        updateSurvivor(selectedSurvivor?.id, {
          tenet_knowledge_observation_conditions: value
        }),
      rollback: () => {
        setTenetKnowledge({
          ...tenetKnowledge,
          observation_conditions: oldConditions
        })
        setSurvivors((prev) =>
          prev.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  tenet_knowledge_observation_conditions:
                    selectedSurvivor?.tenet_knowledge_observation_conditions ??
                    ''
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
        'p-2 border-0',
        !(
          survivors.find((s) => s.id === selectedSurvivor?.id)
            ?.can_use_fighting_arts_knowledges ?? true
        ) && 'bg-red-500/40'
      )}>
      {/* Title */}
      <CardHeader className="p-0">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-sm flex flex-row items-center gap-1">
              Philosophy
            </CardTitle>
            <div className="flex flex-row items-center gap-1">
              <SelectPhilosophy
                selectedSettlement={selectedSettlement}
                value={philosophy?.id ?? ''}
                onChange={handlePhilosophyChange}
              />
              {(() => {
                const settlementPhilosophy =
                  selectedSettlement?.philosophies.find(
                    (p) => p.philosophy_id === philosophy?.id
                  )

                return (
                  <>
                    <CustomPhilosophyRulesIconButton
                      custom={settlementPhilosophy?.custom}
                      philosophyId={philosophy?.id ?? null}
                      philosophyName={philosophy?.philosophy_name ?? null}
                      tier={philosophy?.tier ?? null}
                      huntXpMilestones={philosophy?.hunt_xp_milestones ?? null}
                      authorUserId={
                        settlementPhilosophy?.author_user_id ?? null
                      }
                      authorUsername={
                        settlementPhilosophy?.author_username ?? null
                      }
                    />
                  </>
                )
              })()}
            </div>
          </div>

          {/* Rank */}
          <NumericInput
            label="Philosophy Rank"
            value={philosophyRank}
            onChange={(value) => updatePhilosophyRank(value)}
            min={0}
            className="w-14 h-14 text-2xl sm:text-2xl md:text-2xl focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Rules Text */}
        <p className="text-xs text-muted-foreground">
          <strong>Ponder:</strong> If you are a{' '}
          <strong>returning survivor</strong> and reach a new Hunt XP milestone,
          you must rank up your philosophy. Limit, once per settlement phase.
        </p>

        <hr />
      </CardHeader>

      <CardContent className="p-0 flex flex-col">
        {/* Neurosis */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-1">
            <div className="grow">
              <SelectNeurosis
                selectedSettlement={selectedSettlement}
                value={neurosis?.id ?? ''}
                onChange={handleNeurosisChange}
              />
            </div>
            {(() => {
              const settlementNeurosis = selectedSettlement?.neuroses.find(
                (n) => n.id === neurosis?.id
              )
              // Note: settlement-level neuroses come from the global catalog
              // (`getNeuroses`) and do not yet carry authorship, so the chip
              // is intentionally omitted here. Custom-authored neurosis chips
              // can be added once settlement.neuroses gains the triplet.
              return (
                <CustomNeurosisRulesIconButton
                  custom={settlementNeurosis?.custom}
                  neurosisId={neurosis?.id ?? null}
                  neurosisName={settlementNeurosis?.neurosis_name ?? null}
                />
              )
            })()}
          </div>
          <Label className="text-xs text-muted-foreground">Neurosis</Label>
        </div>

        {/* Tenet Knowledge and Ranks */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-2 mt-1">
          <div className="grow flex flex-col gap-1">
            <div className="flex flex-row items-center gap-1">
              <div className="grow">
                <TenetKnowledgeSelect
                  knowledges={selectedSettlement?.knowledges ?? []}
                  value={tenetKnowledge?.id}
                  onChange={handleTenetKnowledgeChange}
                />
              </div>
              {(() => {
                const settlementKnowledge = selectedSettlement?.knowledges.find(
                  (k) => k.knowledge_id === tenetKnowledge?.id
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
                      authorUserId={settlementKnowledge?.author_user_id ?? null}
                      authorUsername={
                        settlementKnowledge?.author_username ?? null
                      }
                    />
                  </>
                )
              })()}
            </div>
            <Label className="text-xs text-muted-foreground">
              Tenet Knowledge
            </Label>
          </div>
          <div className="flex flex-col gap-1 items-center lg:items-end">
            <div className="flex gap-1 pt-0 lg:pt-2">
              {[...Array(9)].map((_, index) => {
                const checked = tenetKnowledge.observation_rank > index
                // Highlight the user's chosen rank-up if set; otherwise fall
                // back to the catalog's rank-up milestone (1-based rank in DB,
                // mapped to 0-based checkbox index).
                const milestoneIndex =
                  tenetKnowledge.rank_up ??
                  (tenetKnowledge.observation_rank_up_milestone != null &&
                  tenetKnowledge.observation_rank_up_milestone > 0
                    ? tenetKnowledge.observation_rank_up_milestone - 1
                    : null)
                const isRankUpMilestone = milestoneIndex === index
                const hasTenetKnowledge = !!tenetKnowledge.id

                return (
                  <LongPressCheckbox
                    key={index}
                    disabled={!hasTenetKnowledge}
                    checked={checked}
                    onCheckedChange={(checked) =>
                      updateTenetKnowledgeObservationRank(!!checked, index)
                    }
                    onLongPress={
                      hasTenetKnowledge
                        ? () => handleRankUpToggle(index)
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
            <p className="text-xs text-muted-foreground text-right pr-6 lg:hidden">
              Long press for rank-up
            </p>
          </div>
        </div>

        {/* Tenet Knowledge Rules */}
        <div className="mt-1 flex flex-col gap-1">
          <Textarea
            disabled={!tenetKnowledge.id}
            placeholder=" Tenet knowledge rules..."
            className="resize-none border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-b-2 px-2 h-20 overflow-y-auto text-sm"
            value={tenetKnowledge.rules}
            onChange={(e) =>
              setTenetKnowledge({ ...tenetKnowledge, rules: e.target.value })
            }
            onBlur={(e) => updateTenetKnowledgeRules(e.target.value)}
          />
          <Label className="text-xs text-muted-foreground text-right">
            Rules
          </Label>
        </div>

        {/* Tenet Knowledge Observation Conditions */}
        <div className="mt-1 flex flex-col gap-1">
          <Textarea
            disabled={!tenetKnowledge.id}
            placeholder=" Observation conditions..."
            className="resize-none border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-b-2 px-2 h-20 overflow-y-auto text-sm"
            value={tenetKnowledge.observation_conditions}
            onChange={(e) =>
              setTenetKnowledge({
                ...tenetKnowledge,
                observation_conditions: e.target.value
              })
            }
            onBlur={(e) =>
              updateTenetKnowledgeObservationConditions(e.target.value)
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
