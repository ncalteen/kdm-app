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
import { PhilosophyDetail } from '@/lib/types'
import MDEditor from '@uiw/react-md-editor'
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
 * Neurosis Dialog Properties
 */
interface NeurosisDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when neurosis is saved */
  onSave: (data: {
    neurosis_name: string
    philosophy_id: string | null
    rules: string
  }) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Available philosophies for the dropdown */
  philosophies: { [key: string]: PhilosophyDetail }
  /** Initial neurosis name (for editing) */
  initialName?: string
  /** Initial philosophy ID (for editing) */
  initialPhilosophyId?: string | null
  /** Initial rules (for editing) */
  initialRules?: string
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
 * Neurosis Dialog Component
 *
 * Dialog form for creating or editing a custom neurosis with a name, optional
 * philosophy link, and markdown rules field.
 *
 * @param props Component Properties
 * @returns Neurosis Dialog Component
 */
export function NeurosisDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  philosophies,
  initialName = '',
  initialPhilosophyId = null,
  initialRules = '',
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: NeurosisDialogProps): ReactElement {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useState(initialName)
  const [philosophyId, setPhilosophyId] = useState<string | null>(
    initialPhilosophyId
  )
  const [rules, setRules] = useState(initialRules)

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
      neurosis_name: trimmed,
      philosophy_id: philosophyId,
      rules: rules.trim()
    })
  }, [name, philosophyId, rules, saving, onSave])

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
            <Label htmlFor="neurosis-name">Neurosis Name</Label>
            <Input
              id="neurosis-name"
              name="neurosis-name"
              placeholder="Enter neurosis name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleNameKeyDown}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="neurosis-philosophy">Philosophy (optional)</Label>
            <Select
              value={philosophyId ?? NO_PHILOSOPHY}
              onValueChange={(v) =>
                setPhilosophyId(v === NO_PHILOSOPHY ? null : v)
              }>
              <SelectTrigger id="neurosis-philosophy">
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

          <div className="flex flex-col gap-2" data-color-mode={resolvedTheme}>
            <Label htmlFor="neurosis-rules">Rules</Label>
            <MDEditor
              id="neurosis-rules"
              value={rules}
              onChange={(val) => setRules(val ?? '')}
              height={300}
              preview="edit"
            />
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
