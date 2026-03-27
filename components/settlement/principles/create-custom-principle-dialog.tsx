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
import { ReactElement, useCallback, useState } from 'react'

/**
 * Create Custom Principle Dialog Properties
 */
interface CreateCustomPrincipleDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when custom principle is created */
  onCreate: (data: {
    principle_name: string
    option_1_name: string
    option_2_name: string
  }) => void
  /** Whether the create operation is in progress */
  creating: boolean
  /** Initial name to pre-fill */
  initialName?: string
}

/**
 * Create Custom Principle Dialog Component
 *
 * Dialog form for creating a new custom principle with a name and two option
 * names.
 *
 * @param props Component Properties
 * @returns Create Custom Principle Dialog Component
 */
export function CreateCustomPrincipleDialog({
  open,
  onOpenChange,
  onCreate,
  creating,
  initialName = ''
}: CreateCustomPrincipleDialogProps): ReactElement {
  const [name, setName] = useState(initialName)
  const [option1, setOption1] = useState('')
  const [option2, setOption2] = useState('')

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim()
    const trimmedOption1 = option1.trim()
    const trimmedOption2 = option2.trim()
    if (!trimmedName || !trimmedOption1 || !trimmedOption2 || creating) return

    onCreate({
      principle_name: trimmedName,
      option_1_name: trimmedOption1,
      option_2_name: trimmedOption2
    })
  }, [name, option1, option2, creating, onCreate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Custom Principle</DialogTitle>
          <DialogDescription>
            A new principle guides the settlement.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="principle-name">Principle Name</Label>
            <Input
              id="principle-name"
              name="principle-name"
              placeholder="Enter principle name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="option-1">Option 1 Name</Label>
            <Input
              id="option-1"
              name="option-1"
              placeholder="Enter option 1 name"
              value={option1}
              onChange={(e) => setOption1(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="option-2">Option 2 Name</Label>
            <Input
              id="option-2"
              name="option-2"
              placeholder="Enter option 2 name"
              value={option2}
              onChange={(e) => setOption2(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={creating}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !name.trim() || !option1.trim() || !option2.trim() || creating
            }>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
