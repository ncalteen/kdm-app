'use client'

import { NumericInput } from '@/components/menu/numeric-input'
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
 * Create Custom CC Reward Dialog Properties
 */
interface CreateCustomCCRewardDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when custom reward is created */
  onCreate: (data: {
    reward_name: string
    collective_cognition: number
  }) => void
  /** Whether the create operation is in progress */
  creating: boolean
  /** Initial name to pre-fill */
  initialName?: string
}

/**
 * Create Custom Collective Cognition Reward Dialog Component
 *
 * Dialog form for creating a new custom collective cognition reward with a
 * name and cognition level.
 *
 * @param props Component Properties
 * @returns Create Custom CC Reward Dialog Component
 */
export function CreateCustomCCRewardDialog({
  open,
  onOpenChange,
  onCreate,
  creating,
  initialName = ''
}: CreateCustomCCRewardDialogProps): ReactElement {
  const [name, setName] = useState(initialName)
  const [cognition, setCognition] = useState(0)

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || creating) return

    onCreate({
      reward_name: trimmed,
      collective_cognition: cognition
    })
  }, [name, cognition, creating, onCreate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Custom Reward</DialogTitle>
          <DialogDescription>
            A new collective cognition reward is forged.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="reward-name">Reward Name</Label>
            <Input
              id="reward-name"
              name="reward-name"
              placeholder="Enter reward name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <NumericInput
              label="Collective Cognition"
              value={cognition}
              min={0}
              onChange={setCognition}
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
