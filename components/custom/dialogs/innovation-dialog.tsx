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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from 'next-themes'
import { KeyboardEvent, ReactElement, useCallback, useState } from 'react'

/**
 * Innovation Dialog Properties
 */
interface InnovationDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when innovation is saved */
  onSave: (data: {
    innovation_name: string
    rules: string
    consequences: string
    benefits: string
  }) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Initial innovation name (for editing) */
  initialName?: string
  /** Initial rules (for editing) */
  initialRules?: string
  /** Initial consequences (for editing) */
  initialConsequences?: string
  /** Initial benefits (for editing) */
  initialBenefits?: string
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
 * Innovation Dialog Component
 *
 * Dialog form for creating or editing a custom innovation with a name and
 * three tabbed markdown fields: rules, consequences, and benefits.
 *
 * @param props Component Properties
 * @returns Innovation Dialog Component
 */
export function InnovationDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  initialName = '',
  initialRules = '',
  initialConsequences = '',
  initialBenefits = '',
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: InnovationDialogProps): ReactElement {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useState(initialName)
  const [rules, setRules] = useState(initialRules)
  const [consequences, setConsequences] = useState(initialConsequences)
  const [benefits, setBenefits] = useState(initialBenefits)

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || saving) return

    onSave({
      innovation_name: trimmed,
      rules: rules.trim(),
      consequences: consequences.trim(),
      benefits: benefits.trim()
    })
  }, [name, rules, consequences, benefits, saving, onSave])

  /** Save on Enter in the name field */
  const handleNameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSubmit()
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
            <Label htmlFor="innovation-name">Innovation Name</Label>
            <Input
              id="innovation-name"
              name="innovation-name"
              placeholder="Enter innovation name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleNameKeyDown}
            />
          </div>

          <Tabs defaultValue="rules" data-color-mode={resolvedTheme}>
            <TabsList className="w-full">
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="consequences">Consequences</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
            </TabsList>

            <TabsContent value="rules">
              <SafeMarkdownEditor
                value={rules}
                onChange={(val) => setRules(val ?? '')}
                height={300}
                preview="edit"
              />
            </TabsContent>

            <TabsContent value="consequences">
              <SafeMarkdownEditor
                value={consequences}
                onChange={(val) => setConsequences(val ?? '')}
                height={300}
                preview="edit"
              />
            </TabsContent>

            <TabsContent value="benefits">
              <SafeMarkdownEditor
                value={benefits}
                onChange={(val) => setBenefits(val ?? '')}
                height={300}
                preview="edit"
              />
            </TabsContent>
          </Tabs>
          <MarkdownSyntaxHelp />
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
