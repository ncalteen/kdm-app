'use client'

import { SelectInnovation } from '@/components/menu/select-innovation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInnovations } from '@/lib/dal/innovation'
import {
  addSettlementInnovations,
  removeSettlementInnovation
} from '@/lib/dal/settlement-innovation'
import {
  ERROR_MESSAGE,
  INNOVATION_REMOVED_MESSAGE,
  INNOVATION_UPDATED_MESSAGE
} from '@/lib/messages'
import { InnovationDetail, SettlementDetail } from '@/lib/types'
import { LightbulbIcon, PlusIcon, TrashIcon } from 'lucide-react'
import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { toast } from 'sonner'

/** Settlement innovation item with junction table and innovation details */
type InnovationItem = {
  id: string
  innovation_id: string
  innovation_name: string
}

/**
 * Innovations Card Properties
 */
interface InnovationsCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
  /** Set Selected Settlement */
  setSelectedSettlement: (settlement: SettlementDetail | null) => void
}

/**
 * Innovations Card Component
 *
 * Displays the innovations for a settlement. Users can add innovations from a
 * searchable dropdown and remove existing ones.
 *
 * @param props Innovations Card Properties
 * @returns Innovations Card Component
 */
export function InnovationsCard({
  selectedSettlement,
  setSelectedSettlement
}: InnovationsCardProps): ReactElement {
  const settlementIdRef = useRef<string | undefined>(undefined)

  const [availableInnovations, setAvailableInnovations] = useState<{
    [key: string]: InnovationDetail
  }>({})
  const [innovations, setInnovations] = useState<InnovationItem[]>(
    selectedSettlement?.innovations ?? []
  )
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false)

  if (settlementIdRef.current !== selectedSettlement?.id) {
    settlementIdRef.current = selectedSettlement?.id
    setInnovations(selectedSettlement?.innovations ?? [])
  }

  /**
   * Sorted Innovations
   *
   * Alphabetically sorted view of the settlement's innovations, preserving
   * original indices so handlers operate on the correct source array element.
   */
  const sortedInnovations = useMemo(
    () =>
      innovations
        .map((item, originalIndex) => ({
          item,
          originalIndex
        }))
        .sort((a, b) =>
          a.item.innovation_name.localeCompare(b.item.innovation_name)
        ),
    [innovations]
  )

  useEffect(() => {
    getInnovations()
      .then((data) => setAvailableInnovations(data))
      .catch((error) => {
        console.error('Innovations Fetch Error:', error)
      })
  }, [])

  /**
   * Handle Add Innovation
   *
   * @param innovationId Innovation ID
   */
  const handleAdd = useCallback(
    (innovationId: string) => {
      if (!selectedSettlement?.id || !innovationId) {
        setIsAddingNew(false)
        return
      }

      const detail = availableInnovations[innovationId]
      if (!detail) {
        setIsAddingNew(false)
        return
      }

      // Optimistic placeholder — the real junction ID comes from the DB.
      const optimisticItem: InnovationItem = {
        id: `temp-${Date.now()}`,
        innovation_id: innovationId,
        innovation_name: detail.innovation_name
      }
      const oldInnovations = [...innovations]

      setInnovations([...innovations, optimisticItem])
      setIsAddingNew(false)

      addSettlementInnovations([innovationId], selectedSettlement.id)
        .then(() => {
          toast.success(INNOVATION_UPDATED_MESSAGE())

          // Refresh the settlement to get the real junction table ID.
          if (selectedSettlement) {
            setSelectedSettlement({
              ...selectedSettlement,
              innovations: [...oldInnovations, optimisticItem]
            })
          }
        })
        .catch((error: unknown) => {
          setInnovations(oldInnovations)

          console.error('Innovation Add Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [
      availableInnovations,
      innovations,
      selectedSettlement,
      setSelectedSettlement
    ]
  )

  /**
   * Handle Remove Innovation
   *
   * @param index Innovation Index
   */
  const handleRemove = useCallback(
    (index: number) => {
      if (!selectedSettlement?.id) return

      const removed = innovations[index]
      if (!removed) return

      const oldInnovations = [...innovations]
      const updated = innovations.filter((_, i) => i !== index)

      setInnovations(updated)

      removeSettlementInnovation(removed.id)
        .then(() => {
          toast.success(INNOVATION_REMOVED_MESSAGE())

          if (selectedSettlement) {
            setSelectedSettlement({
              ...selectedSettlement,
              innovations: updated
            })
          }
        })
        .catch((error: unknown) => {
          setInnovations(oldInnovations)

          console.error('Innovation Remove Error:', error)
          toast.error(ERROR_MESSAGE())
        })
    },
    [innovations, selectedSettlement, setSelectedSettlement]
  )

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-0">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <LightbulbIcon className="h-4 w-4" />
          Innovations
          {!isAddingNew && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsAddingNew(true)}
              className="border-0 h-8 w-8"
              disabled={isAddingNew}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-1 pb-0">
        <div className="flex flex-col h-[400px]">
          <div className="flex-1 overflow-y-auto">
            {sortedInnovations.map(({ item, originalIndex }) => (
              <div
                key={`${item.id}-${originalIndex}`}
                className="flex items-center gap-2">
                <span className="text-sm ml-1 flex-grow">
                  {item.innovation_name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => handleRemove(originalIndex)}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {isAddingNew && (
              <div className="flex items-center justify-between gap-2">
                <SelectInnovation
                  innovations={availableInnovations}
                  onChange={handleAdd}
                  excludeIds={innovations.map((i) => i.innovation_id)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setIsAddingNew(false)}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
