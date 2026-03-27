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
 * Create Custom Milestone Dialog Properties
 */
interface CreateCustomMilestoneDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when custom milestone is created */
  onCreate: (data: { milestone_name: string; event_name: string }) => void
  /** Whether the create operation is in progress */
  creating: boolean
  /** Initial name to pre-fill */
  initialName?: string
}

/**
 * Create Custom Milestone Dialog Component
 *
 * Dialog form for creating a new custom milestone with a name and associated
 * event name.
 *
 * @param props Component Properties
 * @returns Create Custom Milestone Dialog Component
 */
export function CreateCustomMilestoneDialog({
  open,
  onOpenChange,
  onCreate,
  creating,
  initialName = ''
}: CreateCustomMilestoneDialogProps): ReactElement {
  const [name, setName] = useState(initialName)
  const [eventName, setEventName] = useState('')

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim()
    const trimmedEvent = eventName.trim()
    if (!trimmedName || !trimmedEvent || creating) return

    onCreate({
      milestone_name: trimmedName,
      event_name: trimmedEvent
    })
  }, [name, eventName, creating, onCreate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Custom Milestone</DialogTitle>
          <DialogDescription>
            A new milestone looms on the horizon.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="milestone-name">Milestone Name</Label>
            <Input
              id="milestone-name"
              name="milestone-name"
              placeholder="Enter milestone name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              name="event-name"
              placeholder="Enter event name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
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
            disabled={!name.trim() || !eventName.trim() || creating}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
