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
 * Strain Milestone Dialog Properties
 */
interface StrainMilestoneDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when strain milestone is saved */
  onSave: (data: {
    strain_milestone_name: string
    milestone_condition: string
    permanent_effect: string
  }) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Initial strain milestone name (for editing) */
  initialName?: string
  /** Initial milestone condition (for editing) */
  initialMilestoneCondition?: string
  /** Initial permanent effect (for editing) */
  initialPermanentEffect?: string
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
 * Strain Milestone Dialog Component
 *
 * Dialog form for creating or editing a custom strain milestone with a name and
 * two tabbed markdown fields: milestone condition and permanent effect.
 *
 * @param props Component Properties
 * @returns Strain Milestone Dialog Component
 */
export function StrainMilestoneDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  initialName = '',
  initialMilestoneCondition = '',
  initialPermanentEffect = '',
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: StrainMilestoneDialogProps): ReactElement {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useState(initialName)
  const [milestoneCondition, setMilestoneCondition] = useState(
    initialMilestoneCondition
  )
  const [permanentEffect, setPermanentEffect] = useState(initialPermanentEffect)

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim()
    if (!trimmedName || saving) return

    onSave({
      strain_milestone_name: trimmedName,
      milestone_condition: milestoneCondition.trim(),
      permanent_effect: permanentEffect.trim()
    })
  }, [name, milestoneCondition, permanentEffect, saving, onSave])

  /** Save on Enter in the name input */
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="strain-milestone-name">Strain Milestone Name</Label>
            <Input
              id="strain-milestone-name"
              name="strain-milestone-name"
              placeholder="Enter strain milestone name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <Tabs defaultValue="condition" data-color-mode={resolvedTheme}>
            <TabsList className="w-full">
              <TabsTrigger value="condition">Milestone Condition</TabsTrigger>
              <TabsTrigger value="effect">Permanent Effect</TabsTrigger>
            </TabsList>

            <TabsContent value="condition">
              <MDEditor
                value={milestoneCondition}
                onChange={(val) => setMilestoneCondition(val ?? '')}
                height={300}
                preview="edit"
              />
            </TabsContent>

            <TabsContent value="effect">
              <MDEditor
                value={permanentEffect}
                onChange={(val) => setPermanentEffect(val ?? '')}
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
