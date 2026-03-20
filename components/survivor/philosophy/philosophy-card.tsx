import { NumericInput } from '@/components/menu/numeric-input'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
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
  PHILOSOPHY_RANK_MINIMUM_ERROR,
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
import { MouseEvent, ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Philosophy Card Properties
 */
interface PhilosophyCardProps {
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
 * Philosophy Card Component
 *
 * @param props Philosophy Card Properties
 * @returns Philosophy Card Component
 */
export function PhilosophyCard({
  selectedSettlement,
  selectedSurvivor,
  setSurvivors,
  survivors
}: PhilosophyCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [open, setOpen] = useState(false)
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
  const [philosophy, setPhilosophy] = useState<{
    id: string
    philosophy_name: string
  } | null>(selectedSurvivor?.philosophy ?? null)
  const [philosophyRank, setPhilosophyRank] = useState<number>(
    selectedSurvivor?.philosophy_rank ?? 0
  )

  const philosophyOptions = [
    ...(selectedSettlement?.philosophies ?? []).map((p) => ({
      value: p.philosophy_id,
      label: p.philosophy_name
    }))
  ]

  // Reset local state when survivor changes (different ID)
  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id

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

      setPhilosophy(newPhilosophy)
      if (!philosophyId) setPhilosophyRank(0)

      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id
            ? {
                ...s,
                philosophy: newPhilosophy,
                ...(philosophyId ? {} : { philosophy_rank: 0 })
              }
            : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, {
        philosophy_id: philosophyId || null,
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
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? {
                    ...s,
                    philosophy: prevPhilosophy,
                    philosophy_rank: prevPhilosophyRank
                  }
                : s
            )
          )

          console.error('Philosophy Update Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [
      philosophy,
      philosophyRank,
      selectedSettlement,
      selectedSurvivor?.id,
      setSurvivors,
      survivors
    ]
  )

  /**
   * Handle Tenet Knowledge Rank Up Right Click
   *
   * @param index Checkbox Index (0-Based)
   * @param event Mouse Event
   */
  const handleRightClick = useCallback(
    (index: number, event: MouseEvent) => {
      event.preventDefault()

      const prevRankUp = tenetKnowledge.rank_up
      const newRankUp = tenetKnowledge.rank_up === index ? null : index

      setTenetKnowledge({ ...tenetKnowledge, rank_up: newRankUp })

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
          setTenetKnowledge({ ...tenetKnowledge, rank_up: prevRankUp })
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
    [tenetKnowledge, selectedSurvivor?.id, setSurvivors, survivors]
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
    [philosophyRank, selectedSurvivor?.id, setSurvivors, survivors]
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
          knowledge_name: knowledgeDetail.knowledge_name
        }
      : { ...tenetKnowledge, id: '', knowledge_name: '' }

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
                : null
            }
          : s
      )
    )

    updateSurvivor(selectedSurvivor?.id, {
      tenet_knowledge_id: knowledgeId || null
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
        !selectedSurvivor?.can_use_fighting_arts_knowledges && 'bg-red-500/40'
      )}>
      {/* Title */}
      <CardHeader className="p-0">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-sm flex flex-row items-center gap-1">
              Philosophy
            </CardTitle>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between">
                  {philosophy?.id
                    ? philosophyOptions.find((p) => p.value === philosophy?.id)
                        ?.label
                    : 'Select philosophy...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search philosophy..." />
                  <CommandList>
                    <CommandEmpty>No philosophy found.</CommandEmpty>
                    <CommandGroup>
                      {philosophyOptions.map((p) => (
                        <CommandItem
                          key={p.value ?? 'none'}
                          value={p.value}
                          onSelect={() => {
                            setOpen(false)
                            handlePhilosophyChange(p.value)
                          }}>
                          <Check
                            className={cn(
                              'mr-1 h-4 w-4',
                              philosophy?.id === p.value
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {p.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
          <p className="border-0 border-b px-2 text-sm py-2 text-muted-foreground">
            {neurosis?.neurosis_name || 'No neurosis'}
          </p>
          <Label className="text-xs text-muted-foreground">Neurosis</Label>
        </div>

        {/* Tenet Knowledge and Ranks */}
        <div className="flex items-start gap-2 mt-1">
          <div className="flex-grow flex flex-col gap-1">
            <Select
              value={tenetKnowledge?.id}
              onValueChange={(value) => handleTenetKnowledgeChange(value)}>
              <SelectTrigger className="border-0 border-b rounded-none focus:ring-0 px-2 text-sm">
                <SelectValue placeholder="Select tenet knowledge..." />
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
              Tenet Knowledge
            </Label>
          </div>
          <div className="flex gap-1 pt-2">
            {[...Array(9)].map((_, index) => {
              const checked = tenetKnowledge.observation_rank > index
              const isRankUpMilestone = tenetKnowledge.rank_up === index

              return (
                <Checkbox
                  key={index}
                  checked={checked}
                  onCheckedChange={(checked) =>
                    updateTenetKnowledgeObservationRank(!!checked, index)
                  }
                  onContextMenu={(event) => handleRightClick(index, event)}
                  className={cn(
                    'h-4 w-4 rounded-sm',
                    !checked && isRankUpMilestone && 'border-2 border-primary'
                  )}
                />
              )
            })}
          </div>
        </div>

        {/* Tenet Knowledge Rules */}
        <div className="mt-1 flex flex-col gap-1">
          <Textarea
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
