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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MDEditor from '@uiw/react-md-editor'
import { useTheme } from 'next-themes'
import { KeyboardEvent, ReactElement, useCallback, useState } from 'react'

/**
 * Milestone Dialog Properties
 */
interface MilestoneDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when milestone is saved */
  onSave: (data: {
    milestone_name: string
    event_name: string
    requirements: string
    rules: string
  }) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Initial milestone name (for editing) */
  initialName?: string
  /** Initial event name (for editing) */
  initialEventName?: string
  /** Initial requirements (for editing) */
  initialRequirements?: string
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
 * Milestone Dialog Component
 *
 * Dialog form for creating or editing a custom milestone with a name, event
 * name, and two tabbed markdown fields: requirements and rules.
 *
 * @param props Component Properties
 * @returns Milestone Dialog Component
 */
export function MilestoneDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  initialName = '',
  initialEventName = '',
  initialRequirements = '',
  initialRules = '',
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: MilestoneDialogProps): ReactElement {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useState(initialName)
  const [eventName, setEventName] = useState(initialEventName)
  const [requirements, setRequirements] = useState(initialRequirements)
  const [rules, setRules] = useState(initialRules)

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim()
    if (!trimmedName || saving) return

    onSave({
      milestone_name: trimmedName,
      event_name: eventName.trim(),
      requirements: requirements.trim(),
      rules: rules.trim()
    })
  }, [name, eventName, requirements, rules, saving, onSave])

  /** Save on Enter in the input fields */
  const handleKeyDown = useCallback(
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
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="milestone-name">Milestone Name</Label>
              <Input
                id="milestone-name"
                name="milestone-name"
                placeholder="Enter milestone name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="milestone-event">Event Name</Label>
              <Input
                id="milestone-event"
                name="milestone-event"
                placeholder="Story event name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <Tabs defaultValue="requirements" data-color-mode={resolvedTheme}>
            <TabsList className="w-full">
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="requirements">
              <MDEditor
                value={requirements}
                onChange={(val) => setRequirements(val ?? '')}
                height={300}
                preview="edit"
              />
            </TabsContent>

            <TabsContent value="rules">
              <MDEditor
                value={rules}
                onChange={(val) => setRules(val ?? '')}
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
