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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PhilosophyDetail } from '@/lib/types'
import MDEditor from '@uiw/react-md-editor'
import { Minus, Plus } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useMemo,
  useState
} from 'react'

/** No philosophy sentinel value */
const NO_PHILOSOPHY = '__none__'

/**
 * Knowledge Dialog Properties
 */
interface KnowledgeDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when knowledge is saved */
  onSave: (data: {
    knowledge_name: string
    philosophy_id: string | null
    rules: string
    observation_conditions: string
    observation_rank_up_milestone: number | null
  }) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Available philosophies for the dropdown */
  philosophies: { [key: string]: PhilosophyDetail }
  /** Initial knowledge name (for editing) */
  initialName?: string
  /** Initial philosophy ID (for editing) */
  initialPhilosophyId?: string | null
  /** Initial rules (for editing) */
  initialRules?: string
  /** Initial observation conditions (for editing) */
  initialObservationConditions?: string
  /** Initial observation rank up milestone (for editing) */
  initialObservationRankUpMilestone?: number | null
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
 * Knowledge Dialog Component
 *
 * Dialog form for creating or editing a custom knowledge entry with a name,
 * optional philosophy link, and two tabbed sections: Rules (markdown) and
 * Observation Conditions (markdown + rank up milestone numeric input).
 *
 * @param props Component Properties
 * @returns Knowledge Dialog Component
 */
export function KnowledgeDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  philosophies,
  initialName = '',
  initialPhilosophyId = null,
  initialRules = '',
  initialObservationConditions = '',
  initialObservationRankUpMilestone = null,
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: KnowledgeDialogProps): ReactElement {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useState(initialName)
  const [philosophyId, setPhilosophyId] = useState<string | null>(
    initialPhilosophyId
  )
  const [rules, setRules] = useState(initialRules)
  const [observationConditions, setObservationConditions] = useState(
    initialObservationConditions
  )
  const [rankUpMilestone, setRankUpMilestone] = useState<number | null>(
    initialObservationRankUpMilestone
  )

  /** Sorted philosophies for dropdown */
  const sortedPhilosophies = useMemo(
    () =>
      Object.values(philosophies).sort((a, b) =>
        a.philosophy_name.localeCompare(b.philosophy_name)
      ),
    [philosophies]
  )

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || saving) return

    onSave({
      knowledge_name: trimmed,
      philosophy_id: philosophyId,
      rules: rules.trim(),
      observation_conditions: observationConditions.trim(),
      observation_rank_up_milestone: rankUpMilestone
    })
  }, [
    name,
    philosophyId,
    rules,
    observationConditions,
    rankUpMilestone,
    saving,
    onSave
  ])

  /** Save on Enter in the name field */
  const handleNameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit()
    },
    [handleSubmit]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="knowledge-name">Knowledge Name</Label>
            <Input
              id="knowledge-name"
              name="knowledge-name"
              placeholder="Enter knowledge name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleNameKeyDown}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="knowledge-philosophy">
                Philosophy (optional)
              </Label>
              <Select
                value={philosophyId ?? NO_PHILOSOPHY}
                onValueChange={(v) =>
                  setPhilosophyId(v === NO_PHILOSOPHY ? null : v)
                }>
                <SelectTrigger id="knowledge-philosophy">
                  <SelectValue placeholder="No philosophy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PHILOSOPHY}>No philosophy</SelectItem>
                  {sortedPhilosophies.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.philosophy_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Rank Up Milestone</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setRankUpMilestone((prev) =>
                      prev === null ? 0 : Math.max(0, prev - 1)
                    )
                  }
                  disabled={rankUpMilestone === null || rankUpMilestone <= 0}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={rankUpMilestone ?? ''}
                  placeholder="-"
                  onChange={(e) => {
                    const raw = e.target.value
                    if (raw === '') {
                      setRankUpMilestone(null)
                      return
                    }
                    const val = parseInt(raw, 10)
                    setRankUpMilestone(isNaN(val) ? null : Math.max(0, val))
                  }}
                  className="w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min={0}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setRankUpMilestone((prev) => (prev === null ? 1 : prev + 1))
                  }>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="rules" data-color-mode={resolvedTheme}>
            <TabsList className="w-full">
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="observation">
                Observation Conditions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rules">
              <MDEditor
                value={rules}
                onChange={(val) => setRules(val ?? '')}
                height={300}
                preview="edit"
              />
            </TabsContent>

            <TabsContent value="observation">
              <MDEditor
                value={observationConditions}
                onChange={(val) => setObservationConditions(val ?? '')}
                height={300}
                preview="edit"
              />
            </TabsContent>
          </Tabs>
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
