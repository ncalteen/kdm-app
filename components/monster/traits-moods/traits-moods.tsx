'use client'

import {
  MoodItem,
  NewMoodItem
} from '@/components/monster/traits-moods/moods/mood-item'
import {
  NewTraitItem,
  TraitItem
} from '@/components/monster/traits-moods/traits/trait-item'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { HuntMonsterDetail, ShowdownMonsterDetail } from '@/lib/types'
import { PlusIcon } from 'lucide-react'
import { ReactElement } from 'react'

/**
 * Monster Traits Moods Component Properties
 */
interface TraitsMoodsProps {
  /** Disabled Moods */
  disabledMoods: { [key: number]: boolean }
  /** Disabled Traits */
  disabledTraits: { [key: number]: boolean }
  /** Is Adding Mood */
  isAddingMood: boolean
  /** Is Adding Trait */
  isAddingTrait: boolean
  /** Monster data */
  monster: HuntMonsterDetail | ShowdownMonsterDetail
  /** On Edit Mood */
  onEditMood: (index: number) => void
  /** On Edit Trait */
  onEditTrait: (index: number) => void
  /** On Remove Mood */
  onRemoveMood: (index: number) => void
  /** On Remove Trait */
  onRemoveTrait: (index: number) => void
  /** On Save Mood */
  onSaveMood: (value?: string, index?: number) => void
  /** On Save Trait */
  onSaveTrait: (value?: string, index?: number) => void
  /** Set Is Adding Mood */
  setIsAddingMood: (value: boolean) => void
  /** Set Is Adding Trait */
  setIsAddingTrait: (value: boolean) => void
}

/**
 * Monster Traits Moods Component
 *
 * Displays and manages the monster's traits and moods using a card-based layout
 * similar to the disorders component.
 *
 * @param props Monster Traits Moods Properties
 * @returns Monster Traits Moods Component
 */
export function TraitsMoods({
  disabledMoods,
  disabledTraits,
  isAddingMood,
  isAddingTrait,
  monster,
  onEditMood,
  onEditTrait,
  onRemoveMood,
  onRemoveTrait,
  onSaveMood,
  onSaveTrait,
  setIsAddingMood,
  setIsAddingTrait
}: TraitsMoodsProps): ReactElement {
  return (
    <>
      {/* Traits */}
      <div className="mb-2 lg:mt-2">
        <h3 className="text-sm font-semibold text-muted-foreground text-center">
          Traits
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsAddingTrait(true)}
            className="border-0 h-6 w-6 ml-2 align-middle"
            disabled={
              isAddingTrait ||
              Object.values(disabledTraits).some((v) => v === false)
            }>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </h3>
      </div>

      <div className="flex flex-col">
        <div className="flex-1">
          {monster.traits.map((trait, index) => (
            <TraitItem
              key={index}
              trait={trait}
              index={index}
              isDisabled={!!disabledTraits[index]}
              onEdit={onEditTrait}
              onRemove={onRemoveTrait}
              onSave={onSaveTrait}
            />
          ))}
          {isAddingTrait && (
            <NewTraitItem
              onSave={onSaveTrait}
              onCancel={() => setIsAddingTrait(false)}
            />
          )}
        </div>
      </div>

      <Separator className="my-2" />

      {/* Moods */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-muted-foreground text-center">
          Moods
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsAddingMood(true)}
            className="border-0 h-6 w-6 ml-2 align-middle"
            disabled={
              isAddingMood ||
              Object.values(disabledMoods).some((v) => v === false)
            }>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </h3>
      </div>

      <div className="flex flex-col pb-2">
        <div className="flex-1">
          {monster.moods.map((mood, index) => (
            <MoodItem
              key={index}
              mood={mood}
              index={index}
              isDisabled={!!disabledMoods[index]}
              onEdit={onEditMood}
              onRemove={onRemoveMood}
              onSave={onSaveMood}
            />
          ))}
          {isAddingMood && (
            <NewMoodItem
              onSave={onSaveMood}
              onCancel={() => setIsAddingMood(false)}
            />
          )}
        </div>
      </div>
    </>
  )
}
