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
 * Principle Dialog Properties
 */
interface PrincipleDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when principle is saved */
  onSave: (data: {
    principle_name: string
    option_1_name: string
    option_2_name: string
    option_1_rules: string
    option_2_rules: string
  }) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Initial principle name (for editing) */
  initialName?: string
  /** Initial option 1 name (for editing) */
  initialOption1Name?: string
  /** Initial option 2 name (for editing) */
  initialOption2Name?: string
  /** Initial option 1 rules (for editing) */
  initialOption1Rules?: string
  /** Initial option 2 rules (for editing) */
  initialOption2Rules?: string
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
 * Principle Dialog Component
 *
 * Dialog form for creating or editing a custom principle with a name and two
 * tabbed options. Each tab contains the option name and a markdown rules field.
 *
 * @param props Component Properties
 * @returns Principle Dialog Component
 */
export function PrincipleDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  initialName = '',
  initialOption1Name = '',
  initialOption2Name = '',
  initialOption1Rules = '',
  initialOption2Rules = '',
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: PrincipleDialogProps): ReactElement {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useState(initialName)
  const [option1Name, setOption1Name] = useState(initialOption1Name)
  const [option2Name, setOption2Name] = useState(initialOption2Name)
  const [option1Rules, setOption1Rules] = useState(initialOption1Rules)
  const [option2Rules, setOption2Rules] = useState(initialOption2Rules)

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || saving) return

    onSave({
      principle_name: trimmed,
      option_1_name: option1Name.trim(),
      option_2_name: option2Name.trim(),
      option_1_rules: option1Rules.trim(),
      option_2_rules: option2Rules.trim()
    })
  }, [
    name,
    option1Name,
    option2Name,
    option1Rules,
    option2Rules,
    saving,
    onSave
  ])

  /** Save on Enter in input fields */
  const handleKeyDown = useCallback(
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
            <Label htmlFor="principle-name">Principle Name</Label>
            <Input
              id="principle-name"
              name="principle-name"
              placeholder="Enter principle name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <Tabs defaultValue="option1" data-color-mode={resolvedTheme}>
            <TabsList className="w-full">
              <TabsTrigger value="option1">Option 1</TabsTrigger>
              <TabsTrigger value="option2">Option 2</TabsTrigger>
            </TabsList>

            <TabsContent value="option1">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="principle-option1-name">Option 1 Name</Label>
                  <Input
                    id="principle-option1-name"
                    name="principle-option1-name"
                    placeholder="Enter option 1 name"
                    value={option1Name}
                    onChange={(e) => setOption1Name(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <MDEditor
                  value={option1Rules}
                  onChange={(val) => setOption1Rules(val ?? '')}
                  height={250}
                  preview="edit"
                />
              </div>
            </TabsContent>

            <TabsContent value="option2">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="principle-option2-name">Option 2 Name</Label>
                  <Input
                    id="principle-option2-name"
                    name="principle-option2-name"
                    placeholder="Enter option 2 name"
                    value={option2Name}
                    onChange={(e) => setOption2Name(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <MDEditor
                  value={option2Rules}
                  onChange={(val) => setOption2Rules(val ?? '')}
                  height={250}
                  preview="edit"
                />
              </div>
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
