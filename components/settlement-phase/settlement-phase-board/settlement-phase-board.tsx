'use client'

import { SettlementPhaseBoardSpace } from '@/components/settlement-phase/settlement-phase-board/settlement-phase-board-space'
import { SettlementPhaseBoardToken } from '@/components/settlement-phase/settlement-phase-board/settlement-phase-board-token'
import { Card, CardContent } from '@/components/ui/card'
import { settlementPhaseSteps } from '@/lib/common'
import { DatabaseSettlementPhaseStep } from '@/lib/enums'
import { SettlementPhaseDetail } from '@/lib/types'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { ReactElement } from 'react'

/**
 * Settlement Phase Board Component Properties
 */
interface SettlementPhaseBoardProps {
  /** On Position Update */
  onPositionUpdate: (tokenPosition: number) => void
  /** Selected Settlement Phase */
  selectedSettlementPhase: SettlementPhaseDetail | null
}

/**
 * Settlement Phase Board Component
 *
 * Displays the 11-space settlement phase board where a token can be positioned.
 * Dragging the token between spaces updates the settlement phase step and
 * triggers any related logic.
 *
 * @param props Settlement Phase Board Component Properties
 * @returns Settlement Phase Board Component
 */
export function SettlementPhaseBoard({
  onPositionUpdate,
  selectedSettlementPhase
}: SettlementPhaseBoardProps): ReactElement {
  /**
   * Handle Drag End Event
   *
   * @param event Drag End Event
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event

    if (over) {
      const spaceId = over.id as string
      const newPosition = parseInt(spaceId.replace('space-', ''))

      if (newPosition >= 0 && newPosition <= 10) onPositionUpdate(newPosition)
    }
  }

  /**
   * Handle Click Event
   *
   * @param event Click Event
   */
  const handleClick = (index: number) => {
    if (index >= 0 && index <= 10) onPositionUpdate(index)
  }

  return (
    <Card className="p-0 w-full min-w-[430px]">
      <CardContent className="p-0 w-full overflow-x-auto">
        <DndContext onDragEnd={handleDragEnd}>
          {/* Hunt Board Grid */}
          <div className="w-full overflow-x-auto gap-1 p-2 bg-muted/30 rounded-lg relative flex flex-row flex-wrap items-center justify-center">
            {settlementPhaseSteps.map((space) => (
              <div
                key={space.index}
                className="relative w-[75px] sm:w-[85px] md:w-[90px] h-[75px] sm:h-[85px] md:h-[90px] flex-shrink-0 flex items-center justify-center">
                <SettlementPhaseBoardSpace
                  index={space.index}
                  label={space.step}
                  onClick={() => handleClick(space.index)}>
                  {space.icon && <space.icon className="w-4 h-4 mt-1" />}
                </SettlementPhaseBoardSpace>

                {DatabaseSettlementPhaseStep[
                  selectedSettlementPhase?.step ?? ''
                ] === space.step && <SettlementPhaseBoardToken />}
              </div>
            ))}
          </div>
        </DndContext>
      </CardContent>
    </Card>
  )
}
