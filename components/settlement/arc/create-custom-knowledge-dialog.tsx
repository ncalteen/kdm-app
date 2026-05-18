'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { getPhilosophies } from '@/lib/dal/philosophy'
import { PhilosophyDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Create Custom Knowledge Dialog Properties
 */
interface CreateCustomKnowledgeDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback to close the dialog */
  onOpenChange: (open: boolean) => void
  /** Callback when custom knowledge is created */
  onCreate: (data: {
    knowledge_name: string
    philosophy_id: string | null
  }) => void
  /** Whether the create operation is in progress */
  creating: boolean
  /** Initial name to pre-fill */
  initialName?: string
}

/**
 * Create Custom Knowledge Dialog Component
 *
 * Dialog form for creating a new custom knowledge with a name and optional
 * associated philosophy.
 *
 * @param props Component Properties
 * @returns Create Custom Knowledge Dialog Component
 */
export function CreateCustomKnowledgeDialog({
  open,
  onOpenChange,
  onCreate,
  creating,
  initialName = ''
}: CreateCustomKnowledgeDialogProps): ReactElement {
  const [name, setName] = useState(initialName)
  const [philosophyId, setPhilosophyId] = useState<string | null>(null)
  const [philosophyOpen, setPhilosophyOpen] = useState(false)
  const [philosophies, setPhilosophies] = useState<{
    [key: string]: PhilosophyDetail
  }>({})

  useEffect(() => {
    if (!open) return

    getPhilosophies()
      .then(setPhilosophies)
      .catch((err) => console.error('Philosophies Fetch Error:', err))
  }, [open])

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed || creating) return

    onCreate({ knowledge_name: trimmed, philosophy_id: philosophyId })
  }, [name, philosophyId, creating, onCreate])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Custom Knowledge</DialogTitle>
          <DialogDescription>
            New knowledge illuminates the settlement.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="knowledge-name">Knowledge Name</Label>
            <Input
              id="knowledge-name"
              name="knowledge-name"
              placeholder="Enter knowledge name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Philosophy (Optional)</Label>
            <Popover open={philosophyOpen} onOpenChange={setPhilosophyOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={philosophyOpen}
                  className="justify-between">
                  {philosophyId && philosophies[philosophyId]
                    ? philosophies[philosophyId].philosophy_name
                    : 'Select philosophy...'}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search philosophies..." />
                  <CommandList>
                    <CommandEmpty>No philosophies found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="__none__"
                        onSelect={() => {
                          setPhilosophyId(null)
                          setPhilosophyOpen(false)
                        }}>
                        <Check
                          className={cn(
                            'h-4 w-4',
                            philosophyId === null ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        None
                      </CommandItem>
                      {Object.values(philosophies).map((phil) => (
                        <CommandItem
                          key={phil.id}
                          value={phil.id}
                          keywords={[phil.philosophy_name]}
                          onSelect={() => {
                            setPhilosophyId(phil.id)
                            setPhilosophyOpen(false)
                          }}>
                          <Check
                            className={cn(
                              'h-4 w-4',
                              philosophyId === phil.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {phil.philosophy_name}
                          {phil.custom && (
                            <Badge
                              variant="outline"
                              className="ml-auto text-xs">
                              Custom
                            </Badge>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
