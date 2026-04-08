'use client'

import { NumericInput } from '@/components/menu/numeric-input'
import { SelectNeurosis } from '@/components/menu/select-neurosis'
import { SelectPhilosophy } from '@/components/menu/select-philosophy'
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
import { useToast } from '@/hooks/use-toast'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  ERROR_MESSAGE,
  PHILOSOPHY_RANK_MINIMUM_ERROR,
  SURVIVOR_NEUROSIS_UPDATED_MESSAGE,
  SURVIVOR_PHILOSOPHY_RANK_UPDATED_MESSAGE,
  SURVIVOR_PHILOSOPHY_SELECTED_MESSAGE,
  SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE,
  SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_RANK_UPDATED_MESSAGE,
  SURVIVOR_TENET_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE,
  SURVIVOR_TENET_KNOWLEDGE_RULES_UPDATED_MESSAGE,
  SURVIVOR_TENET_KNOWLEDGE_UPDATED_MESSAGE
} from '@/lib/messages'
import { SettlementDetail, SurvivorDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useCallback, useRef, useState } from 'react'

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
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Tenet Knowledge Select Properties
 */
interface TenetKnowledgeSelectProps {
  /** Available Knowledges */
  knowledges: { knowledge_id: string; knowledge_name: string }[]
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
          className="justify-between border-0 border-b rounded-none focus:ring-0 px-2 text-sm">
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
                    value={k.knowledge_name}
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
  const { toast } = useToast(local)

  const [prevSurvivor, setPrevSurvivor] = useState(selectedSurvivor)

  const [neurosis, setNeurosis] = useState<{
    id: string
    neurosis_name: string
  } | null>(selectedSurvivor?.neurosis ?? null)
  const [tenetKnowledge, setTenetKnowledge] = useState({
    id: selectedSurvivor?.tenet_knowledge?.id ?? '',
    knowledge_name: selectedSurvivor?.tenet_knowledge?.knowledge_name ?? '',
    rules: selectedSurvivor?.tenet_knowledge_rules ?? '',
    observation_conditions:
      selectedSurvivor?.tenet_knowledge_observation_conditions ?? '',
    observation_rank: selectedSurvivor?.tenet_knowledge_observation_rank ?? 0,
    rank_up: selectedSurvivor?.tenet_knowledge_rank_up ?? null
  })
  const tenetRankUpRef = useRef(
    selectedSurvivor?.tenet_knowledge_rank_up ?? null
  )
  const [philosophy, setPhilosophy] = useState<{
    id: string
    philosophy_name: string
  } | null>(selectedSurvivor?.philosophy ?? null)
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
      rank_up: selectedSurvivor?.tenet_knowledge_rank_up ?? null
    })
    setPhilosophy(selectedSurvivor?.philosophy ?? null)
    setPhilosophyRank(selectedSurvivor?.philosophy_rank ?? 0)
  }

  /**
   * Handle Philosophy Change
   *
   * @param philosophyId Philosophy ID (or empty string to clear)
   */
  const handlePhilosophyChange = useCallback(
    (philosophyId: string) => {
      const prevPhilosophy = philosophy
      const prevPhilosophyRank = philosophyRank

      const philosophyDetail = philosophyId
        ? selectedSettlement?.philosophies.find(
            (p) => p.philosophy_id === philosophyId
          )
        : null

      const newPhilosophy = philosophyDetail
        ? {
            id: philosophyId,
            philosophy_name: philosophyDetail.philosophy_name
          }
        : null

      // Auto-set neurosis based on linked philosophy_id in the neurosis table
      const prevNeurosis = neurosis
      const matchedNeurosis = philosophyId
        ? selectedSettlement?.neuroses.find(
            (n) => n.philosophy_id === philosophyId
          )
        : null
      const newNeurosis = matchedNeurosis
        ? {
            id: matchedNeurosis.id,
            neurosis_name: matchedNeurosis.neurosis_name
          }
        : null

      setPhilosophy(newPhilosophy)
      setNeurosis(newNeurosis)
      if (!philosophyId) setPhilosophyRank(0)

      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? {
                ...s,
                philosophy: newPhilosophy,
                neurosis: newNeurosis,
                ...(philosophyId ? {} : { philosophy_rank: 0 })
              }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, {
        philosophy_id: philosophyId || null,
        neurosis_id: newNeurosis?.id ?? null,
        ...(philosophyId ? {} : { philosophy_rank: 0 })
      })
        .then(() =>
          toast.success(
            SURVIVOR_PHILOSOPHY_SELECTED_MESSAGE(
              philosophyDetail?.philosophy_name ?? ''
            )
          )
        )
        .catch((error) => {
          setPhilosophy(prevPhilosophy)
          setPhilosophyRank(prevPhilosophyRank)
          setNeurosis(prevNeurosis)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? {
                    ...s,
                    philosophy: prevPhilosophy,
                    philosophy_rank: prevPhilosophyRank,
                    neurosis: prevNeurosis
                  }
                : s
            )
          )

          console.error('Philosophy Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [
      neurosis,
      philosophy,
      philosophyRank,
      selectedSettlement,
      selectedSurvivor?.id,
      setSurvivors,
      survivors,
      toast
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
        ? { id: neurosisId, neurosis_name: neurosisDetail.neurosis_name }
        : null

      setNeurosis(newNeurosis)

      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, neurosis: newNeurosis } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, {
        neurosis_id: neurosisId || null
      })
        .then(() =>
          toast.success(
            SURVIVOR_NEUROSIS_UPDATED_MESSAGE(
              neurosisDetail?.neurosis_name ?? ''
            )
          )
        )
        .catch((error) => {
          setNeurosis(prevNeurosis)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, neurosis: prevNeurosis }
                : s
            )
          )

          console.error('Neurosis Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [
      neurosis,
      selectedSettlement,
      selectedSurvivor?.id,
      setSurvivors,
      survivors,
      toast
    ]
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

      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? { ...s, tenet_knowledge_rank_up: newRankUp }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, {
        tenet_knowledge_rank_up: newRankUp
      })
        .then(() =>
          toast.success(
            SURVIVOR_TENET_KNOWLEDGE_RANK_UP_UPDATED_MESSAGE(newRankUp)
          )
        )
        .catch((error) => {
          tenetRankUpRef.current = prevRankUp
          setTenetKnowledge((prev) => ({ ...prev, rank_up: prevRankUp }))
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, tenet_knowledge_rank_up: prevRankUp }
                : s
            )
          )

          console.error('Tenet Knowledge Rank Up Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [selectedSurvivor?.id, setSurvivors, survivors, toast]
  )

  /**
   * Update Philosophy Rank
   *
   * @param value New Philosophy Rank
   */
  const updatePhilosophyRank = useCallback(
    (value: number) => {
      if (value < 0) return toast.error(PHILOSOPHY_RANK_MINIMUM_ERROR())

      const prevRank = philosophyRank

      setPhilosophyRank(value)

      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, philosophy_rank: value } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { philosophy_rank: value })
        .then(() => toast.success(SURVIVOR_PHILOSOPHY_RANK_UPDATED_MESSAGE()))
        .catch((error) => {
          setPhilosophyRank(prevRank)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? { ...s, philosophy_rank: prevRank }
                : s
            )
          )

          console.error('Philosophy Rank Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [philosophyRank, selectedSurvivor?.id, setSurvivors, survivors, toast]
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

    const newTenetKnowledge = knowledgeDetail
      ? {
          ...tenetKnowledge,
          id: knowledgeId,
          knowledge_name: knowledgeDetail.knowledge_name,
          observation_rank: 0,
          rank_up: null,
          rules: '',
          observation_conditions: ''
        }
      : {
          ...tenetKnowledge,
          id: '',
          knowledge_name: '',
          observation_rank: 0,
          rank_up: null,
          rules: '',
          observation_conditions: ''
        }

    setTenetKnowledge(newTenetKnowledge)

    setSurvivors(
      survivors.map((s) =>
        s.id === selectedSurvivor?.id
          ? {
              ...s,
              tenet_knowledge: knowledgeDetail
                ? {
                    id: knowledgeId,
                    knowledge_name: knowledgeDetail.knowledge_name
                  }
                : null,
              tenet_knowledge_observation_rank: 0,
              tenet_knowledge_rank_up: null,
              tenet_knowledge_rules: '',
              tenet_knowledge_observation_conditions: ''
            }
          : s
      )
    )

    updateSurvivor(selectedSurvivor?.id, {
      tenet_knowledge_id: knowledgeId || null,
      tenet_knowledge_observation_rank: 0,
      tenet_knowledge_rank_up: null,
      tenet_knowledge_rules: '',
      tenet_knowledge_observation_conditions: ''
    })
      .then(() =>
        toast.success(
          SURVIVOR_TENET_KNOWLEDGE_UPDATED_MESSAGE(
            knowledgeDetail?.knowledge_name ?? ''
          )
        )
      )
      .catch((error) => {
        setTenetKnowledge(oldTenetKnowledge)
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  tenet_knowledge: selectedSurvivor?.tenet_knowledge ?? null
                }
              : s
          )
        )

        console.error('Tenet Knowledge Update Error:', error)
        toast.error(ERROR_MESSAGE())
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
    const isRankUp = checked && tenetKnowledge.rank_up === index

    setTenetKnowledge({ ...tenetKnowledge, observation_rank: newRank })

    setSurvivors(
      survivors.map((s) =>
        s.id === selectedSurvivor?.id
          ? { ...s, tenet_knowledge_observation_rank: newRank }
          : s
      )
    )

    updateSurvivor(selectedSurvivor?.id, {
      tenet_knowledge_observation_rank: newRank
    })
      .then(() =>
        toast.success(
          SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_RANK_UPDATED_MESSAGE(
            isRankUp,
            newRank
          )
        )
      )
      .catch((error) => {
        setTenetKnowledge({ ...tenetKnowledge, observation_rank: prevRank })
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? { ...s, tenet_knowledge_observation_rank: prevRank }
              : s
          )
        )

        console.error('Tenet Knowledge Observation Rank Error:', error)
        toast.error(ERROR_MESSAGE())
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

    setSurvivors(
      survivors.map((s) =>
        s.id === selectedSurvivor?.id
          ? { ...s, tenet_knowledge_rules: value }
          : s
      )
    )

    updateSurvivor(selectedSurvivor?.id, { tenet_knowledge_rules: value })
      .then(() => {
        if (value.trim())
          toast.success(SURVIVOR_TENET_KNOWLEDGE_RULES_UPDATED_MESSAGE(value))
      })
      .catch((error) => {
        setTenetKnowledge({ ...tenetKnowledge, rules: oldRules })
        setSurvivors(
          survivors.map((s) =>
            s.id === selectedSurvivor?.id
              ? {
                  ...s,
                  tenet_knowledge_rules:
                    selectedSurvivor?.tenet_knowledge_rules ?? ''
                }
              : s
          )
        )

        console.error('Tenet Knowledge Rules Update Error:', error)
        toast.error(ERROR_MESSAGE())
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

    setSurvivors(
      survivors.map((s) =>
        s.id === selectedSurvivor?.id
          ? { ...s, tenet_knowledge_observation_conditions: value }
          : s
      )
    )

    updateSurvivor(selectedSurvivor?.id, {
      tenet_knowledge_observation_conditions: value
    })
      .then(() => {
        if (value.trim())
          toast.success(
            SURVIVOR_TENET_KNOWLEDGE_OBSERVATION_CONDITIONS_UPDATED_MESSAGE(
              value
            )
          )
      })
      .catch((error) => {
        setTenetKnowledge({
          ...tenetKnowledge,
          observation_conditions: oldConditions
        })
        setSurvivors(
          survivors.map((s) =>
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

        console.error(
          'Tenet Knowledge Observation Conditions Update Error:',
          error
        )
        toast.error(ERROR_MESSAGE())
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
            <SelectPhilosophy
              selectedSettlement={selectedSettlement}
              value={philosophy?.id ?? ''}
              onChange={handlePhilosophyChange}
            />
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
          <SelectNeurosis
            selectedSettlement={selectedSettlement}
            value={neurosis?.id ?? ''}
            onChange={handleNeurosisChange}
          />
          <Label className="text-xs text-muted-foreground">Neurosis</Label>
        </div>

        {/* Tenet Knowledge and Ranks */}
        <div className="flex items-start gap-2 mt-1">
          <div className="flex-grow flex flex-col gap-1">
            <TenetKnowledgeSelect
              knowledges={selectedSettlement?.knowledges ?? []}
              value={tenetKnowledge?.id}
              onChange={handleTenetKnowledgeChange}
            />
            <Label className="text-xs text-muted-foreground">
              Tenet Knowledge
            </Label>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-1 pt-2">
              {[...Array(9)].map((_, index) => {
                const checked = tenetKnowledge.observation_rank > index
                const isRankUpMilestone = tenetKnowledge.rank_up === index
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
            <p className="text-xs text-muted-foreground text-right lg:hidden">
              Long press to mark rank-up
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
