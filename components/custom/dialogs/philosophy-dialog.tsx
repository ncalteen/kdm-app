'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { KnowledgeDetail, NeurosisDetail } from '@/lib/types'
import MDEditor from '@uiw/react-md-editor'
import { ChevronDown, Minus, Plus, XIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useMemo,
  useState
} from 'react'

/** Fixed number of ranks on a philosophy. */
const RANK_COUNT = 5

/** No selection sentinel value (Radix Select does not accept empty string). */
const NO_SELECTION = '__none__'

/**
 * Philosophy Rank Draft
 *
 * Form-local shape for a rank. `id` is present for ranks loaded from the
 * database (edit mode) and absent for newly added ranks.
 */
export interface PhilosophyRankDraft {
  /** Existing Rank ID (edit mode only) */
  id?: string
  /** Rank Number (1–5, unique within the philosophy) */
  rank_number: number
  /** Rank Rules (Markdown) */
  rules: string
}

/**
 * Build Initial Ranks
 *
 * Produces the canonical 5-rank draft array, preserving any existing `id`
 * and `rules` from the supplied initial ranks and filling gaps with blanks.
 *
 * @param initial Optional existing rank drafts (edit mode)
 * @returns Exactly 5 rank drafts, one per rank number 1-5
 */
function buildInitialRanks(
  initial?: PhilosophyRankDraft[]
): PhilosophyRankDraft[] {
  const byNumber = new Map<number, PhilosophyRankDraft>()
  for (const r of initial ?? []) byNumber.set(r.rank_number, r)

  return Array.from({ length: RANK_COUNT }, (_, i) => {
    const n = i + 1
    const existing = byNumber.get(n)
    return existing
      ? { id: existing.id, rank_number: n, rules: existing.rules }
      : { rank_number: n, rules: '' }
  })
}

/**
 * Philosophy Dialog Save Payload
 */
export interface PhilosophyDialogPayload {
  /** Philosophy Name */
  philosophy_name: string
  /** Hunt XP Milestones */
  hunt_xp_milestones: number[]
  /** Tenet Knowledge ID (null when unset) */
  tenet_knowledge_id: string | null
  /** Tier */
  tier: number | null
  /** Neurosis ID (null when unset) */
  neurosis_id: string | null
  /** Ranks (always 5, sorted by rank number) */
  ranks: PhilosophyRankDraft[]
}

/**
 * Philosophy Dialog Properties
 */
interface PhilosophyDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when philosophy is saved */
  onSave: (data: PhilosophyDialogPayload) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Available knowledges for the tenet dropdown */
  knowledges: { [key: string]: KnowledgeDetail }
  /** Available neuroses for the neurosis dropdown */
  neuroses: { [key: string]: NeurosisDetail }
  /** Initial philosophy name (for editing) */
  initialName?: string
  /** Initial hunt XP milestones (for editing) */
  initialHuntXpMilestones?: number[]
  /** Initial tenet knowledge ID (for editing) */
  initialTenetKnowledgeId?: string | null
  /** Initial tier (for editing) */
  initialTier?: number | null
  /** Initial neurosis ID (for editing) */
  initialNeurosisId?: string | null
  /** Initial ranks (for editing) */
  initialRanks?: PhilosophyRankDraft[]
  /** Dialog title */
  title: string
  /** Dialog description */
  description: string
  /** Save button label */
  saveLabel?: string
  /** Saving button label */
  savingLabel?: string
}

/**
 * Philosophy Dialog Component
 *
 * Dialog form for creating or editing a custom philosophy. Collects the
 * philosophy name, hunt XP milestones, optional tenet knowledge, tier,
 * optional neurosis link, and between 1 and 5 ranks (each with a rank number
 * and Markdown rules). Persistence is owned by the caller; this component
 * only collects input and emits a `PhilosophyDialogPayload` via `onSave`.
 *
 * @param props Component Properties
 * @returns Philosophy Dialog Component
 */
export function PhilosophyDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  knowledges,
  neuroses,
  initialName = '',
  initialHuntXpMilestones = [],
  initialTenetKnowledgeId = null,
  initialTier = null,
  initialNeurosisId = null,
  initialRanks,
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: PhilosophyDialogProps): ReactElement {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useState(initialName)
  const [milestones, setMilestones] = useState<number[]>(
    initialHuntXpMilestones
  )
  const [tenetKnowledgeId, setTenetKnowledgeId] = useState<string | null>(
    initialTenetKnowledgeId
  )
  const [tier, setTier] = useState<number | null>(initialTier)
  const [neurosisId, setNeurosisId] = useState<string | null>(initialNeurosisId)
  const [newMilestone, setNewMilestone] = useState('')

  // Always render 5 ranks. Existing ids/rules are preserved when editing.
  const [ranks, setRanks] = useState<PhilosophyRankDraft[]>(() =>
    buildInitialRanks(initialRanks)
  )
  // Track which rank panel is expanded. Only one rank can be open at a time;
  // null means all ranks are collapsed. Rank 1 is expanded by default.
  const [openRank, setOpenRank] = useState<number | null>(1)

  /** Sorted knowledges for dropdown */
  const sortedKnowledges = useMemo(
    () =>
      Object.values(knowledges).sort((a, b) =>
        a.knowledge_name.localeCompare(b.knowledge_name)
      ),
    [knowledges]
  )

  /** Sorted neuroses for dropdown */
  const sortedNeuroses = useMemo(
    () =>
      Object.values(neuroses).sort((a, b) =>
        a.neurosis_name.localeCompare(b.neurosis_name)
      ),
    [neuroses]
  )

  /** Update the rules markdown for a rank by index. */
  const handleRankRulesChange = useCallback((index: number, rules: string) => {
    setRanks((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], rules }
      return next
    })
  }, [])

  /** Toggle a rank's collapsible section. Only one rank may be open at a time. */
  const toggleRank = useCallback((rankNumber: number, open: boolean) => {
    setOpenRank((prev) => {
      if (open) return rankNumber
      return prev === rankNumber ? null : prev
    })
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || saving) return

    onSave({
      philosophy_name: trimmed,
      hunt_xp_milestones: [...milestones].sort((a, b) => a - b),
      tenet_knowledge_id: tenetKnowledgeId,
      tier,
      neurosis_id: neurosisId,
      ranks: [...ranks]
        .sort((a, b) => a.rank_number - b.rank_number)
        .map((r) => ({ ...r, rules: r.rules.trim() }))
    })
  }, [
    name,
    milestones,
    tenetKnowledgeId,
    tier,
    neurosisId,
    ranks,
    saving,
    onSave
  ])

  /** Add a milestone value */
  const handleAddMilestone = useCallback(() => {
    const val = parseInt(newMilestone, 10)
    if (isNaN(val) || val < 1 || val > 16) return
    if (milestones.includes(val)) return

    setMilestones((prev) => [...prev, val].sort((a, b) => a - b))
    setNewMilestone('')
  }, [newMilestone, milestones])

  /** Handle Enter in the milestone input */
  const handleMilestoneKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddMilestone()
      }
    },
    [handleAddMilestone]
  )

  /** Remove a milestone by index */
  const handleRemoveMilestone = useCallback((index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index))
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Philosophy Name & Tier */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col flex-1 gap-2">
              <Label htmlFor="philosophy-name">Philosophy Name</Label>
              <Input
                id="philosophy-name"
                name="philosophy-name"
                placeholder="Enter philosophy name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tier</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setTier((prev) =>
                      prev === null ? 0 : Math.max(0, prev - 1)
                    )
                  }
                  disabled={tier === null || tier <= 0}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={tier ?? ''}
                  placeholder="-"
                  onChange={(e) => {
                    const raw = e.target.value
                    if (raw === '') {
                      setTier(null)
                      return
                    }
                    const val = parseInt(raw, 10)
                    setTier(isNaN(val) ? null : Math.max(0, val))
                  }}
                  className="w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min={0}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setTier((prev) => (prev === null ? 1 : prev + 1))
                  }>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tenet Knowledge + Neurosis */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="philosophy-tenet">Tenet Knowledge</Label>
              <Select
                value={tenetKnowledgeId ?? NO_SELECTION}
                onValueChange={(v) =>
                  setTenetKnowledgeId(v === NO_SELECTION ? null : v)
                }>
                <SelectTrigger id="philosophy-tenet" className="w-full">
                  <SelectValue placeholder="No knowledge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>No knowledge</SelectItem>
                  {sortedKnowledges.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      <span className="flex items-center gap-2 w-full">
                        <span>{k.knowledge_name}</span>
                        {k.custom && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Custom
                          </Badge>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="philosophy-neurosis">Neurosis</Label>
              <Select
                value={neurosisId ?? NO_SELECTION}
                onValueChange={(v) =>
                  setNeurosisId(v === NO_SELECTION ? null : v)
                }>
                <SelectTrigger id="philosophy-neurosis" className="w-full">
                  <SelectValue placeholder="No neurosis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SELECTION}>No neurosis</SelectItem>
                  {sortedNeuroses.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      <span className="flex items-center gap-2 w-full">
                        <span>{n.neurosis_name}</span>
                        {n.custom && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Custom
                          </Badge>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hunt XP Milestones */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Hunt XP Milestones (1-16)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newMilestone}
                  placeholder="Add milestone value"
                  onChange={(e) => setNewMilestone(e.target.value)}
                  onKeyDown={handleMilestoneKeyDown}
                  className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min={1}
                  max={16}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddMilestone}
                  disabled={
                    !newMilestone ||
                    isNaN(parseInt(newMilestone, 10)) ||
                    parseInt(newMilestone, 10) < 1 ||
                    parseInt(newMilestone, 10) > 16 ||
                    milestones.includes(parseInt(newMilestone, 10))
                  }>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Current Milestones</Label>
              {milestones.length > 0 ? (
                <div className="flex flex-wrap gap-2 items-center min-h-9">
                  {milestones.map((m, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-0.5 text-sm">
                      {m}
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(i)}
                        className="text-muted-foreground hover:text-foreground">
                        <XIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-center min-h-9 text-sm text-muted-foreground">
                  None set.
                </div>
              )}
            </div>
          </div>

          {/* Ranks */}
          <div className="flex flex-col gap-2">
            <Label>Rank Rules</Label>
            <div className="flex flex-col gap-2">
              {ranks.map((r, index) => {
                const isOpen = openRank === r.rank_number
                return (
                  <Collapsible
                    key={r.rank_number}
                    open={isOpen}
                    onOpenChange={(open) => toggleRank(r.rank_number, open)}
                    className="rounded-md border">
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50">
                        <span>Rank {r.rank_number}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-3 pb-3">
                      <div className="flex flex-col gap-2">
                        <div
                          id={`rank-rules-${index}`}
                          data-color-mode={
                            resolvedTheme === 'dark' ? 'dark' : 'light'
                          }>
                          <MDEditor
                            value={r.rules}
                            onChange={(val) =>
                              handleRankRulesChange(index, val ?? '')
                            }
                            height={200}
                            preview="edit"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || saving}>
            {saving ? savingLabel : saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
