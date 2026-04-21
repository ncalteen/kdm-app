'use client'

import { Button } from '@/components/ui/button'
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
import { KnowledgeDetail } from '@/lib/types'
import { Minus, Plus, XIcon } from 'lucide-react'
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useMemo,
  useState
} from 'react'

/** No knowledge sentinel value */
const NO_KNOWLEDGE = '__none__'

/**
 * Philosophy Dialog Properties
 */
interface PhilosophyDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when philosophy is saved */
  onSave: (data: {
    philosophy_name: string
    hunt_xp_milestones: number[]
    tenet_knowledge_id: string | null
    tier: number | null
  }) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Available knowledges for the tenet dropdown */
  knowledges: { [key: string]: KnowledgeDetail }
  /** Initial philosophy name (for editing) */
  initialName?: string
  /** Initial hunt XP milestones (for editing) */
  initialHuntXpMilestones?: number[]
  /** Initial tenet knowledge ID (for editing) */
  initialTenetKnowledgeId?: string | null
  /** Initial tier (for editing) */
  initialTier?: number | null
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
 * Dialog form for creating or editing a custom philosophy with a name,
 * hunt XP milestones list, optional tenet knowledge link, and tier.
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
  initialName = '',
  initialHuntXpMilestones = [],
  initialTenetKnowledgeId = null,
  initialTier = null,
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: PhilosophyDialogProps): ReactElement {
  const [name, setName] = useState(initialName)
  const [milestones, setMilestones] = useState<number[]>(
    initialHuntXpMilestones
  )
  const [tenetKnowledgeId, setTenetKnowledgeId] = useState<string | null>(
    initialTenetKnowledgeId
  )
  const [tier, setTier] = useState<number | null>(initialTier)
  const [newMilestone, setNewMilestone] = useState('')

  /** Sorted knowledges for dropdown */
  const sortedKnowledges = useMemo(
    () =>
      Object.values(knowledges).sort((a, b) =>
        a.knowledge_name.localeCompare(b.knowledge_name)
      ),
    [knowledges]
  )

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || saving) return

    onSave({
      philosophy_name: trimmed,
      hunt_xp_milestones: [...milestones].sort((a, b) => a - b),
      tenet_knowledge_id: tenetKnowledgeId,
      tier
    })
  }, [name, milestones, tenetKnowledgeId, tier, saving, onSave])

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Philosophy Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="philosophy-name">Philosophy Name</Label>
            <Input
              id="philosophy-name"
              name="philosophy-name"
              placeholder="Enter philosophy name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Tenet Knowledge + Tier side-by-side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="philosophy-tenet">
                Tenet Knowledge (optional)
              </Label>
              <Select
                value={tenetKnowledgeId ?? NO_KNOWLEDGE}
                onValueChange={(v) =>
                  setTenetKnowledgeId(v === NO_KNOWLEDGE ? null : v)
                }>
                <SelectTrigger id="philosophy-tenet">
                  <SelectValue placeholder="No knowledge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_KNOWLEDGE}>No knowledge</SelectItem>
                  {sortedKnowledges.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.knowledge_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  className="w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

          {/* Hunt XP Milestones */}
          <div className="flex flex-col gap-2">
            <Label>Hunt XP Milestones (1–16)</Label>
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
            {milestones.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
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
            )}
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
