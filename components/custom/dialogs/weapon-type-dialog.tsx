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
 * Weapon Type Dialog Properties
 */
interface WeaponTypeDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when weapon type is saved */
  onSave: (data: {
    weapon_type_name: string
    specialist_proficiency_rules: string
    master_proficiency_rules: string
  }) => void
  /** Whether the save operation is in progress */
  saving: boolean
  /** Initial weapon type name (for editing) */
  initialName?: string
  /** Initial specialist proficiency rules (for editing) */
  initialSpecialistRules?: string
  /** Initial master proficiency rules (for editing) */
  initialMasterRules?: string
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
 * Weapon Type Dialog Component
 *
 * Dialog form for creating or editing a custom weapon type with a name and
 * two tabbed markdown fields: specialist proficiency rules and master
 * proficiency rules.
 *
 * @param props Component Properties
 * @returns Weapon Type Dialog Component
 */
export function WeaponTypeDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  initialName = '',
  initialSpecialistRules = '',
  initialMasterRules = '',
  title,
  description,
  saveLabel = 'Save',
  savingLabel = 'Saving...'
}: WeaponTypeDialogProps): ReactElement {
  const { resolvedTheme } = useTheme()

  const [name, setName] = useState(initialName)
  const [specialistRules, setSpecialistRules] = useState(initialSpecialistRules)
  const [masterRules, setMasterRules] = useState(initialMasterRules)

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || saving) return

    onSave({
      weapon_type_name: trimmed,
      specialist_proficiency_rules: specialistRules.trim(),
      master_proficiency_rules: masterRules.trim()
    })
  }, [name, specialistRules, masterRules, saving, onSave])

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
            <Label htmlFor="weapon-type-name">Weapon Type Name</Label>
            <Input
              id="weapon-type-name"
              name="weapon-type-name"
              placeholder="Enter weapon type name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleNameKeyDown}
            />
          </div>

          <Tabs defaultValue="specialist" data-color-mode={resolvedTheme}>
            <TabsList className="w-full">
              <TabsTrigger value="specialist">
                Specialist Proficiency
              </TabsTrigger>
              <TabsTrigger value="master">Master Proficiency</TabsTrigger>
            </TabsList>

            <TabsContent value="specialist">
              <SafeMarkdownEditor
                value={specialistRules}
                onChange={(val) => setSpecialistRules(val ?? '')}
                height={300}
                preview="edit"
              />
            </TabsContent>

            <TabsContent value="master">
              <SafeMarkdownEditor
                value={masterRules}
                onChange={(val) => setMasterRules(val ?? '')}
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
