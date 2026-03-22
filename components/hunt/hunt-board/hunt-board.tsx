'use client'

import { HuntBoardSpace } from '@/components/hunt/hunt-board/hunt-board-space'
import { HuntBoardToken } from '@/components/hunt/hunt-board/hunt-board-token'
import { Card, CardContent } from '@/components/ui/card'
import { HuntEventType } from '@/lib/enums'
import { HuntDetail } from '@/lib/types'
import { getOverwhelmingDarknessLabel } from '@/lib/utils'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { BadgeIcon, BadgeInfoIcon, BrainIcon, SkullIcon } from 'lucide-react'
import { ReactElement, useMemo } from 'react'

/**
 * Hunt Board Component Properties
 */
interface HuntBoardProps {
  /** On Hunt Board Update */
  onHuntBoardUpdate: (
    position: number,
    eventType: HuntEventType | undefined
  ) => void
  /** On Position Update */
  onPositionUpdate: (survivorPosition: number, quarryPosition: number) => void
  /** Selected Hunt */
  selectedHunt: HuntDetail | null
}

/**
 * Hunt Board Component
 *
 * Displays the 13-space hunt board where survivors and quarry can be positioned.
 * Tokens can be dragged between spaces. Clicking a space cycles its event type.
 *
 * @param props Hunt Board Component Properties
 * @returns Hunt Board Component
 */
export function HuntBoard({
  onHuntBoardUpdate,
  onPositionUpdate,
  selectedHunt
}: HuntBoardProps): ReactElement {
  /** First monster name for the overwhelming darkness label */
  const firstMonsterName = useMemo(() => {
    if (!selectedHunt?.hunt_monsters) return undefined
    const monsters = Object.values(selectedHunt.hunt_monsters)
    return monsters[0]?.monster_name ?? undefined
  }, [selectedHunt])

  const board = selectedHunt?.hunt_board

  // Define hunt board spaces
  const spaces = [
    { index: 0, label: 'Start', isStart: true },
    { index: 1, label: board?.pos_1 ?? null },
    { index: 2, label: board?.pos_2 ?? null },
    { index: 3, label: board?.pos_3 ?? null },
    { index: 4, label: board?.pos_4 ?? null },
    { index: 5, label: board?.pos_5 ?? null },
    { index: 6, label: getOverwhelmingDarknessLabel(firstMonsterName) },
    { index: 7, label: board?.pos_7 ?? null },
    { index: 8, label: board?.pos_8 ?? null },
    { index: 9, label: board?.pos_9 ?? null },
    { index: 10, label: board?.pos_10 ?? null },
    { index: 11, label: board?.pos_11 ?? null },
    { index: 12, label: 'Starvation', isStarvation: true }
  ]

  /**
   * Handle Drag End Event
   *
   * @param event Drag End Event
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over) {
      const spaceId = over.id as string
      const newPosition = parseInt(spaceId.replace('space-', ''))

      if (newPosition >= 0 && newPosition <= 12)
        if (active.id === 'survivors-token')
          onPositionUpdate(newPosition, selectedHunt?.monster_position ?? 6)
        else if (active.id === 'quarry-token')
          onPositionUpdate(selectedHunt?.survivor_position ?? 0, newPosition)
    }
  }

  /**
   * Handle Space Click
   *
   * Cycles through event types: empty -> BASIC -> MONSTER -> empty.
   *
   * @param pos Space Position
   */
  const handleSpaceClick = (pos: number) => {
    if (pos === 0 || pos === 6 || pos === 12) return

    const posKey = `pos_${pos}` as keyof typeof board
    const current = board?.[posKey] as string | null | undefined

    let newEventType: HuntEventType | undefined
    if (!current || current === 'BASIC') newEventType = HuntEventType.MONSTER
    else newEventType = undefined

    onHuntBoardUpdate(pos, newEventType)
  }

  /**
   * Get Icon for Hunt Board Space
   *
   * @param label Space Label
   * @returns Label Element or String
   */
  const getLabelOrIcon = (label: string | null | undefined) => {
    switch (label) {
      case 'Start':
        return 'Start'
      case 'Starvation':
        return 'Starvation'
      case 'ARC':
        return <BrainIcon className="size-6" />
      case 'BASIC':
        return <BadgeIcon className="size-6" />
      case 'MONSTER':
        return <SkullIcon className="size-6" />
      case 'SCOUT':
        return <BadgeInfoIcon className="size-6" />
      default:
        return label
    }
  }

  return (
    <Card className="p-0 w-full min-w-[430px]">
      <CardContent className="p-0 w-full overflow-x-auto">
        <DndContext onDragEnd={handleDragEnd}>
          <div className="w-full overflow-x-auto gap-1 p-2 bg-muted/30 rounded-lg relative flex flex-row flex-wrap items-center justify-center">
            {spaces.map((space) => (
              <div
                key={space.index}
                className="relative w-[75px] sm:w-[85px] md:w-[90px] h-[75px] sm:h-[85px] md:h-[90px] flex-shrink-0 flex items-center justify-center">
                <HuntBoardSpace
                  onClick={() => handleSpaceClick(space.index)}
                  className={
                    space.isStart || space.isStarvation || space.index === 6
                      ? ''
                      : 'cursor-pointer'
                  }
                  index={space.index}
                  label={getLabelOrIcon(space.label)}
                  isStart={space.isStart}
                  isStarvation={space.isStarvation}
                />

                {selectedHunt?.survivor_position === space.index && (
                  <HuntBoardToken
                    overlap={
                      selectedHunt?.survivor_position ===
                      selectedHunt?.monster_position
                    }
                    tokenType="survivors"
                  />
                )}

                {selectedHunt?.monster_position === space.index && (
                  <HuntBoardToken
                    overlap={
                      selectedHunt?.survivor_position ===
                      selectedHunt?.monster_position
                    }
                    tokenType="quarry"
                  />
                )}
              </div>
            ))}
          </div>
        </DndContext>
      </CardContent>
    </Card>
  )
}
