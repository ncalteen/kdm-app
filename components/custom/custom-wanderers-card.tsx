'use client'

import { WandererForm } from '@/components/custom/forms/wanderer-form'
import { Badge } from '@/components/ui/badge'
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
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import { getAbilityImpairments } from '@/lib/dal/ability-impairment'
import { getFightingArts } from '@/lib/dal/fighting-art'
import { getGear } from '@/lib/dal/gear'
import { getCustomWanderers, removeWanderer } from '@/lib/dal/wanderer'
import { ERROR_MESSAGE, WANDERER_REMOVED_MESSAGE } from '@/lib/messages'
import {
  AbilityImpairmentDetail,
  FightingArtDetail,
  GearDetail,
  WandererDetail
} from '@/lib/types'
import { getCatalogDeleteGuardMessage } from '@/lib/utils'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'

/**
 * Custom Wanderers Card Component Properties
 */
interface CustomWanderersCardProps {
  /** Local State */
  local: LocalStateType
}

/**
 * Custom Wanderers Card Component
 *
 * Lists user's custom wanderers with options to create, edit, and delete.
 * Each wanderer has extensive attributes including stats, fighting arts,
 * rare gear, and timeline events. Uses a list/create/edit view pattern
 * similar to the custom monsters card.
 *
 * @param props Custom Wanderers Card Properties
 * @returns Custom Wanderers Card Component
 */
export function CustomWanderersCard({
  local
}: CustomWanderersCardProps): ReactElement {
  const { toast } = useToast(local)

  const [wanderers, setWanderers] = useState<WandererDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingWandererId, setEditingWandererId] = useState<string | null>(
    null
  )

  // Reference data
  const [availableFightingArts, setAvailableFightingArts] = useState<{
    [key: string]: FightingArtDetail
  }>({})
  const [availableGear, setAvailableGear] = useState<{
    [key: string]: GearDetail
  }>({})
  const [availableAbilityImpairments, setAvailableAbilityImpairments] =
    useState<{ [key: string]: AbilityImpairmentDetail }>({})

  /** Load wanderers and reference data */
  const loadData = useCallback(async () => {
    setIsLoading(true)

    try {
      const [wandererData, fightingArtData, gearData, abilityImpairmentData] =
        await Promise.all([
          // Only get the wanderers created by the user, not the default ones
          getCustomWanderers(),
          // Get all the available fighting arts and gear
          getFightingArts(),
          getGear(),
          getAbilityImpairments()
        ])

      setWanderers(
        Object.values(wandererData).sort((a, b) =>
          a.wanderer_name.localeCompare(b.wanderer_name)
        )
      )
      setAvailableFightingArts(fightingArtData)
      setAvailableGear(gearData)
      setAvailableAbilityImpairments(abilityImpairmentData)
    } catch (err: unknown) {
      console.error('Load Wanderers Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  /** Handle Delete Wanderer */
  const handleDelete = useCallback(
    (wanderer: WandererDetail) => {
      const previous = [...wanderers]
      setWanderers(wanderers.filter((w) => w.id !== wanderer.id))

      removeWanderer(wanderer.id)
        .then(() => toast.success(WANDERER_REMOVED_MESSAGE()))
        .catch((err: unknown) => {
          setWanderers(previous)
          const guard = getCatalogDeleteGuardMessage(err)
          if (!guard) console.error('Delete Wanderer Error:', err)
          toast.error(guard ?? ERROR_MESSAGE())
        })
    },
    [wanderers, toast]
  )

  /** Enter create mode */
  const handleStartCreate = useCallback(() => setMode('create'), [])

  /** Enter edit mode */
  const handleStartEdit = useCallback((wanderer: WandererDetail) => {
    setEditingWandererId(wanderer.id)
    setMode('edit')
  }, [])

  /** Return to list and reload */
  const handleDone = useCallback(() => {
    setMode('list')
    setEditingWandererId(null)
    loadData()
  }, [loadData])

  /** Cancel and return to list */
  const handleCancel = useCallback(() => {
    setMode('list')
    setEditingWandererId(null)
  }, [])

  // Show create/edit form
  if (mode === 'create' || mode === 'edit') {
    return (
      <WandererForm
        local={local}
        mode={mode}
        wandererId={editingWandererId}
        availableFightingArts={availableFightingArts}
        availableGear={availableGear}
        availableAbilityImpairments={availableAbilityImpairments}
        onDone={handleDone}
        onCancel={handleCancel}
      />
    )
  }

  // List view
  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Wanderers</span>
          <Button variant="outline" size="sm" onClick={handleStartCreate}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Wanderer
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
        ) : wanderers.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                No wanderers have emerged from the darkness yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Create a wanderer to see them appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-h-100 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell w-20 text-center">
                    Gender
                  </TableHead>
                  <TableHead className="hidden sm:table-cell w-15 text-center">
                    Arc
                  </TableHead>
                  <TableHead className="w-25 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wanderers.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      <div className="font-medium">{w.wanderer_name}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">
                        {w.gender === 'FEMALE' ? 'Female' : 'Male'}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground text-center">
                      {w.gender === 'FEMALE' ? 'F' : 'M'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                      {w.arc && (
                        <Badge variant="secondary" className="text-xs">
                          Arc
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStartEdit(w)}
                          title={`Edit ${w.wanderer_name}`}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(w)}
                          title={`Delete ${w.wanderer_name}`}>
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
