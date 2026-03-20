import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { updateSurvivor } from '@/lib/dal/survivor'
import {
  ERROR_MESSAGE,
  SURVIVOR_COURAGE_UNDERSTANDING_ABILITY_UPDATED_MESSAGE
} from '@/lib/messages'
import { SurvivorDetail } from '@/lib/types'
import { ReactElement, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * Courage Understanding Abilities Properties
 */
interface CourageUnderstandingAbilitiesProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Courage/Understanding Abilities Component
 *
 * Displays the abilities that a survivor has based on their courage and
 * understanding.
 *
 * @param props Courage Understanding Abilities Properties
 * @returns Courage/Understanding Abilities Component
 */
export function CourageUnderstandingAbilities({
  selectedSurvivor,
  setSurvivors,
  survivors
}: CourageUnderstandingAbilitiesProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [courageAbility, setCourageAbility] = useState(
    selectedSurvivor?.has_stalwart
      ? 'stalwart'
      : selectedSurvivor?.has_prepared
        ? 'prepared'
        : selectedSurvivor?.has_matchmaker
          ? 'matchmaker'
          : ''
  )
  const [understandingAbility, setUnderstandingAbility] = useState(
    selectedSurvivor?.has_analyze
      ? 'analyze'
      : selectedSurvivor?.has_explore
        ? 'explore'
        : selectedSurvivor?.has_tinker
          ? 'tinker'
          : ''
  )

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id
    setCourageAbility(
      selectedSurvivor?.has_stalwart
        ? 'stalwart'
        : selectedSurvivor?.has_prepared
          ? 'prepared'
          : selectedSurvivor?.has_matchmaker
            ? 'matchmaker'
            : ''
    )
    setUnderstandingAbility(
      selectedSurvivor?.has_analyze
        ? 'analyze'
        : selectedSurvivor?.has_explore
          ? 'explore'
          : selectedSurvivor?.has_tinker
            ? 'tinker'
            : ''
    )
  }

  /**
   * Handle Ability Change
   *
   * Updates the survivor's abilities based on their courage and understanding.
   *
   * @param updates Partial Survivor Detail with updated abilities
   */
  const handleAbilityChange = useCallback(
    (updates: Partial<SurvivorDetail>, type: 'courage' | 'understanding') => {
      const oldCourageAbility = courageAbility
      const oldUnderstandingAbility = understandingAbility

      if (type === 'courage') {
        const newVal = updates.has_stalwart
          ? 'stalwart'
          : updates.has_prepared
            ? 'prepared'
            : updates.has_matchmaker
              ? 'matchmaker'
              : ''
        setCourageAbility(newVal)
      } else {
        const newVal = updates.has_analyze
          ? 'analyze'
          : updates.has_explore
            ? 'explore'
            : updates.has_tinker
              ? 'tinker'
              : ''
        setUnderstandingAbility(newVal)
      }

      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, ...updates } : s
        )
      )
      updateSurvivor(selectedSurvivor?.id, updates)
        .then(() =>
          toast.success(
            SURVIVOR_COURAGE_UNDERSTANDING_ABILITY_UPDATED_MESSAGE()
          )
        )
        .catch((error) => {
          console.error('Courage/Understanding Ability Update Error:', error)
          setCourageAbility(oldCourageAbility)
          setUnderstandingAbility(oldUnderstandingAbility)
          setSurvivors(
            survivors.map((s) =>
              s.id === selectedSurvivor?.id
                ? {
                    ...s,
                    has_stalwart: oldCourageAbility === 'stalwart',
                    has_prepared: oldCourageAbility === 'prepared',
                    has_matchmaker: oldCourageAbility === 'matchmaker',
                    has_analyze: oldUnderstandingAbility === 'analyze',
                    has_explore: oldUnderstandingAbility === 'explore',
                    has_tinker: oldUnderstandingAbility === 'tinker'
                  }
                : s
            )
          )
          toast.error(ERROR_MESSAGE())
        })
    },
    [
      courageAbility,
      understandingAbility,
      selectedSurvivor?.id,
      setSurvivors,
      survivors
    ]
  )

  // Ability descriptions
  const courageAbilities = {
    stalwart: "Can't be knocked down by brain trauma or intimidate.",
    prepared: 'Add Hunt XP to your roll when determining a straggler.',
    matchmaker: 'Spend 1 endeavour to trigger Intimacy story event.'
  }

  const understandingAbilities = {
    analyze: 'Look at the top AI card and return it to the top of the deck.',
    explore: 'Add +2 to your Investigate roll results.',
    tinker: '+1 endeavour when a returning survivor.'
  }

  return (
    <div className="pb-2">
      <div className="flex flex-row justify-between">
        {/* Courage Ability */}
        <div className="flex flex-col w-[45%] gap-2 pt-2">
          <Select
            value={courageAbility}
            onValueChange={(value) =>
              handleAbilityChange(
                {
                  has_stalwart: value === 'stalwart',
                  has_prepared: value === 'prepared',
                  has_matchmaker: value === 'matchmaker'
                },
                'courage'
              )
            }>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a courage ability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stalwart">Stalwart</SelectItem>
              <SelectItem value="prepared">Prepared</SelectItem>
              <SelectItem value="matchmaker">Matchmaker</SelectItem>
            </SelectContent>
          </Select>
          {courageAbility && (
            <div className="text-[10px] p-2 rounded border">
              {
                courageAbilities[
                  courageAbility as keyof typeof courageAbilities
                ]
              }
            </div>
          )}
        </div>

        {/* Understanding Ability */}
        <div className="flex flex-col w-[45%] gap-2 pt-2">
          <Select
            value={understandingAbility}
            onValueChange={(value) =>
              handleAbilityChange(
                {
                  has_analyze: value === 'analyze',
                  has_explore: value === 'explore',
                  has_tinker: value === 'tinker'
                },
                'understanding'
              )
            }>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an understanding ability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="analyze">Analyze</SelectItem>
              <SelectItem value="explore">Explore</SelectItem>
              <SelectItem value="tinker">Tinker</SelectItem>
            </SelectContent>
          </Select>
          {understandingAbility && (
            <div className="text-[10px] p-2 rounded border">
              {
                understandingAbilities[
                  understandingAbility as keyof typeof understandingAbilities
                ]
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
