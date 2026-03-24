'use client'

import { CreateMonsterCard } from '@/components/monster/create-monster-card'
import { EditMonsterCard } from '@/components/monster/edit-monster-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { getUserCustomNemeses, removeNemesis } from '@/lib/dal/nemesis'
import { getUserCustomQuarries, removeQuarry } from '@/lib/dal/quarry'
import { MonsterType } from '@/lib/enums'
import { CUSTOM_MONSTER_DELETED_MESSAGE, ERROR_MESSAGE } from '@/lib/messages'
import { NemesisDetail, QuarryDetail } from '@/lib/types'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

/** Combined monster entry for display */
interface MonsterEntry {
  /** Monster ID */
  id: string
  /** Monster Detail */
  detail: QuarryDetail | NemesisDetail
  /** Monster Type */
  type: MonsterType
}

/**
 * Custom Monsters Card Component
 *
 * Lists user's custom quarry and nemesis monsters with options to create,
 * edit, and delete.
 *
 * @returns Custom Monsters Card Component
 */
export function CustomMonstersCard(): ReactElement {
  const [monsters, setMonsters] = useState<MonsterEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingMonsterId, setEditingMonsterId] = useState<string | null>(null)
  const [editingMonsterType, setEditingMonsterType] =
    useState<MonsterType | null>(null)

  /**
   * Load Custom Monsters
   *
   * Fetches all custom quarries and nemeses belonging to the current user.
   */
  const loadMonsters = useCallback(async () => {
    setIsLoading(true)

    try {
      const [quarries, nemeses] = await Promise.all([
        getUserCustomQuarries(),
        getUserCustomNemeses()
      ])

      const entries: MonsterEntry[] = []

      for (const [id, detail] of Object.entries(quarries))
        entries.push({ id, detail, type: MonsterType.QUARRY })

      for (const [id, detail] of Object.entries(nemeses))
        entries.push({ id, detail, type: MonsterType.NEMESIS })

      entries.sort((a, b) =>
        a.detail.monster_name.localeCompare(b.detail.monster_name)
      )

      setMonsters(entries)
    } catch (err: unknown) {
      console.error('Load Monsters Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMonsters()
  }, [loadMonsters])

  /**
   * Handle Delete Monster
   *
   * Optimistically removes the monster from the list, then deletes from DB.
   *
   * @param entry Monster Entry to Delete
   */
  const handleDelete = useCallback(
    (entry: MonsterEntry) => {
      const previousMonsters = [...monsters]

      // Optimistic removal
      setMonsters(monsters.filter((m) => m.id !== entry.id))

      const deletePromise =
        entry.type === MonsterType.QUARRY
          ? removeQuarry(entry.id)
          : removeNemesis(entry.id)

      deletePromise
        .then(() =>
          toast.success(
            CUSTOM_MONSTER_DELETED_MESSAGE(entry.detail.monster_name)
          )
        )
        .catch((err: unknown) => {
          // Rollback
          setMonsters(previousMonsters)
          console.error('Delete Monster Error:', err)
          toast.error(ERROR_MESSAGE())
        })
    },
    [monsters]
  )

  /**
   * Handle Edit Monster
   *
   * @param entry Monster Entry to Edit
   */
  const handleEdit = useCallback((entry: MonsterEntry) => {
    setEditingMonsterId(entry.id)
    setEditingMonsterType(entry.type)
  }, [])

  /**
   * Handle Monster Saved (create or edit complete)
   */
  const handleMonsterSaved = useCallback(() => {
    setIsCreating(false)
    setEditingMonsterId(null)
    setEditingMonsterType(null)
    loadMonsters()
  }, [loadMonsters])

  /**
   * Handle Cancel
   */
  const handleCancel = useCallback(() => {
    setIsCreating(false)
    setEditingMonsterId(null)
    setEditingMonsterType(null)
  }, [])

  // Show create form
  if (isCreating)
    return (
      <CreateMonsterCard
        onCancel={handleCancel}
        onMonsterCreated={handleMonsterSaved}
      />
    )

  // Show edit form
  if (editingMonsterId && editingMonsterType)
    return (
      <EditMonsterCard
        monsterId={editingMonsterId}
        monsterType={editingMonsterType}
        onCancel={handleCancel}
        onMonsterUpdated={handleMonsterSaved}
      />
    )

  // Show monster list
  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Custom Monsters</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Monster
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Peering into the darkness...
            </p>
          </div>
        ) : monsters.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                No custom monsters have been forged yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a custom monster to see it appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead className="w-[20%]">Type</TableHead>
                  <TableHead className="w-[20%]">Node</TableHead>
                  <TableHead className="w-[20%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monsters.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.detail.monster_name}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          entry.type === MonsterType.QUARRY
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {entry.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {entry.detail.node}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry)}
                          title={`Edit ${entry.detail.monster_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry)}
                          title={`Delete ${entry.detail.monster_name}`}>
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
