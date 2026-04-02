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
 * Create Custom Philosophy Dialog Properties
 */
interface CreateCustomPhilosophyDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when custom philosophy is created */
  onCreate: (data: {
    philosophy_name: string
    neurosis_name: string | null
  }) => void
  /** Whether the create operation is in progress */
  creating: boolean
  /** Initial name to pre-fill */
  initialName?: string
}

/**
 * Create Custom Philosophy Dialog Component
 *
 * Dialog form for creating a new custom philosophy with a name and an optional
 * neurosis name.
 *
 * @param props Component Properties
 * @returns Create Custom Philosophy Dialog Component
 */
export function CreateCustomPhilosophyDialog({
  open,
  onOpenChange,
  onCreate,
  creating,
  initialName = ''
}: CreateCustomPhilosophyDialogProps): ReactElement {
  const [name, setName] = useState(initialName)
  const [neurosisName, setNeurosisName] = useState('')

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || creating) return

    const trimmedNeurosis = neurosisName.trim()
    onCreate({
      philosophy_name: trimmed,
      neurosis_name: trimmedNeurosis || null
    })
  }, [name, neurosisName, creating, onCreate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Custom Philosophy</DialogTitle>
          <DialogDescription>
            A new philosophy emerges to guide the settlement.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="neurosis-name">Neurosis Name (Optional)</Label>
            <Input
              id="neurosis-name"
              name="neurosis-name"
              placeholder="Enter neurosis name"
              value={neurosisName}
              onChange={(e) => setNeurosisName(e.target.value)}
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
          <Button onClick={handleSubmit} disabled={!name.trim() || creating}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
