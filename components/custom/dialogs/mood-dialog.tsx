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
import MDEditor from '@uiw/react-md-editor'
import { useTheme } from 'next-themes'
import { KeyboardEvent, ReactElement, useCallback, useState } from 'react'

/**
 * Mood Dialog Properties
 */
interface MoodDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when mood is saved */
  onSave: (data: { mood_name: string; rules: string }) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Initial mood name (for editing) */
  initialName?: string
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
 * Mood Dialog Component
 *
 * Dialog form for creating or editing a custom monster mood with a name and
 * markdown rules field.
 *
 * @param props Component Properties
 * @returns Mood Dialog Component
 */
export function MoodDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  initialName = '',
  initialRules = '',
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: MoodDialogProps): ReactElement {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useState(initialName)
  const [rules, setRules] = useState(initialRules)

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || saving) return

    onSave({
      mood_name: trimmed,
      rules: rules.trim()
    })
  }, [name, rules, saving, onSave])

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
            <Label htmlFor="mood-name">Mood Name</Label>
            <Input
              id="mood-name"
              name="mood-name"
              placeholder="Enter mood name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleNameKeyDown}
            />
          </div>

          <div className="flex flex-col gap-2" data-color-mode={resolvedTheme}>
            <Label htmlFor="mood-rules">Rules</Label>
            <MDEditor
              id="mood-rules"
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
