'use client'

import { MarkdownSyntaxHelp } from '@/components/generic/markdown-syntax-help'
import { SafeMarkdownEditor } from '@/components/generic/safe-markdown-editor'
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
import { useTheme } from 'next-themes'
import { KeyboardEvent, ReactElement, useCallback, useState } from 'react'

/**
 * Custom Item Dialog Properties
 */
interface CustomItemDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when item is saved */
  onSave: (data: { name: string; rules: string }) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Initial name to pre-fill (for editing) */
  initialName?: string
  /** Initial rules to pre-fill (for editing) */
  initialRules?: string
  /** Dialog title */
  title: string
  /** Dialog description */
  description: string
  /** Label for the name field */
  nameLabel?: string
  /** Placeholder for the name input */
  namePlaceholder?: string
  /** Save button label */
  saveLabel?: string
  /** Saving button label */
  savingLabel?: string
}

/**
 * Custom Item Dialog Component
 *
 * Reusable dialog form for creating or editing a custom item with a name and
 * markdown rules field. Used by character, disorder, fighting art, and other
 * custom item cards.
 *
 * @param props Component Properties
 * @returns Custom Item Dialog Component
 */
export function CustomItemDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  initialName = '',
  initialRules = '',
  title,
  description,
  nameLabel = 'Name',
  namePlaceholder = 'Enter name',
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: CustomItemDialogProps): ReactElement {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useState(initialName)
  const [rules, setRules] = useState(initialRules)

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || saving) return

    onSave({
      name: trimmed,
      rules: rules.trim()
    })
  }, [name, rules, saving, onSave])

  /** Save on Enter in the name field */
  const handleNameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="item-name">{nameLabel}</Label>
            <Input
              id="item-name"
              name="item-name"
              placeholder={namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleNameKeyDown}
            />
          </div>

          <div className="flex flex-col gap-2" data-color-mode={resolvedTheme}>
            <Label htmlFor="item-rules">Rules</Label>
            <SafeMarkdownEditor
              id="item-rules"
              value={rules}
              onChange={(val) => setRules(val ?? '')}
              height={300}
              preview="edit"
            />
            <MarkdownSyntaxHelp />
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
