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
import { Minus, Plus } from 'lucide-react'
import { useTheme } from 'next-themes'
import { KeyboardEvent, ReactElement, useCallback, useState } from 'react'

/**
 * Collective Cognition Reward Dialog Properties
 */
interface CollectiveCognitionRewardDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when reward is saved */
  onSave: (data: {
    reward_name: string
    collective_cognition: number
    rules: string
  }) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Initial reward name (for editing) */
  initialName?: string
  /** Initial collective cognition value (for editing) */
  initialCollectiveCognition?: number
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
 * Collective Cognition Reward Dialog Component
 *
 * Dialog form for creating or editing a custom collective cognition reward
 * with a name, collective cognition value, and markdown rules field.
 *
 * @param props Component Properties
 * @returns Collective Cognition Reward Dialog Component
 */
export function CollectiveCognitionRewardDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  initialName = '',
  initialCollectiveCognition = 0,
  initialRules = '',
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: CollectiveCognitionRewardDialogProps): ReactElement {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useState(initialName)
  const [collectiveCognition, setCollectiveCognition] = useState(
    initialCollectiveCognition
  )
  const [rules, setRules] = useState(initialRules)

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || saving) return

    onSave({
      reward_name: trimmed,
      collective_cognition: collectiveCognition,
      rules: rules.trim()
    })
  }, [name, collectiveCognition, rules, saving, onSave])

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
            <Label htmlFor="ccr-name">Reward Name</Label>
            <Input
              id="ccr-name"
              name="ccr-name"
              placeholder="Enter reward name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleNameKeyDown}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Collective Cognition</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setCollectiveCognition((prev) => Math.max(0, prev - 1))
                }
                disabled={collectiveCognition <= 0}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={collectiveCognition}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10)
                  setCollectiveCognition(isNaN(val) ? 0 : Math.max(0, val))
                }}
                className="w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={0}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCollectiveCognition((prev) => prev + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2" data-color-mode={resolvedTheme}>
            <Label htmlFor="ccr-rules">Rules</Label>
            <MDEditor
              id="ccr-rules"
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
