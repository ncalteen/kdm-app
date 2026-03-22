'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { updateSurvivor } from '@/lib/dal/survivor'
import { ColorChoice, DatabaseGender, Gender } from '@/lib/enums'
import {
  SURVIVOR_COLOR_CHANGED_MESSAGE,
  SURVIVOR_DEAD_STATUS_UPDATED_MESSAGE,
  SURVIVOR_GENDER_UPDATED_MESSAGE,
  SURVIVOR_NAME_UPDATED_MESSAGE,
  SURVIVOR_RETIRED_STATUS_UPDATED_MESSAGE
} from '@/lib/messages'
import { SurvivorDetail } from '@/lib/types'
import { getCardColorStyles, getColorStyle } from '@/lib/utils'
import { SkullIcon, UserXIcon } from 'lucide-react'
import {
  KeyboardEvent,
  ReactElement,
  useCallback,
  useRef,
  useState
} from 'react'
import { toast } from 'sonner'

/**
 * Status Card Props
 */
interface StatusCardProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[] | null
}

/**
 * Survivor Name, Gender, and Status Card Component
 *
 * This component allows the user to set the name, gender, and status of a survivor.
 * The form includes a text input for the name, checkboxes for male/female gender
 * selection, and checkboxes for dead/retired status. When a survivor is named,
 * they gain +1 survival.
 *
 * @param props Status Card Properties
 * @returns Status Card Component
 */
export function StatusCard({
  selectedSurvivor,
  setSurvivors,
  survivors
}: StatusCardProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [survivorName, setSurvivorName] = useState(
    selectedSurvivor?.survivor_name ?? ''
  )
  const [survivorColor, setSurvivorColor] = useState<ColorChoice>(
    (selectedSurvivor?.color as ColorChoice) ?? ColorChoice.SLATE
  )
  const [survivorGender, setSurvivorGender] = useState<string>(
    selectedSurvivor?.gender ?? ''
  )
  const [survivorDead, setSurvivorDead] = useState(
    selectedSurvivor?.dead ?? false
  )
  const [survivorRetired, setSurvivorRetired] = useState(
    selectedSurvivor?.retired ?? false
  )
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id

    setSurvivorName(selectedSurvivor?.survivor_name ?? '')
    setSurvivorColor(
      (selectedSurvivor?.color as ColorChoice) ?? ColorChoice.SLATE
    )
    setSurvivorGender(selectedSurvivor?.gender ?? '')
    setSurvivorDead(selectedSurvivor?.dead ?? false)
    setSurvivorRetired(selectedSurvivor?.retired ?? false)
  }

  /**
   * Handle Name Input Changes
   *
   * Saves on Enter key press.
   *
   * @param e Keyboard Event
   * @param value Current Input Value
   */
  const handleNameKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    value: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      const oldName = survivorName
      const oldSurvivors = [...(survivors ?? [])]

      setSurvivorName(value)
      setSurvivors(
        survivors?.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, survivor_name: value } : s
        ) ?? []
      )

      updateSurvivor(selectedSurvivor?.id, { survivor_name: value })
        .then(() => toast.success(SURVIVOR_NAME_UPDATED_MESSAGE()))
        .catch((error) => {
          setSurvivorName(oldName)
          setSurvivors(oldSurvivors)
          console.error('Error Updating Survivor Name:', error)
        })
    }
  }

  /**
   * Handle Gender Selection Changes
   *
   * @param gender Selected Gender
   */
  const handleGenderChange = useCallback(
    (gender: Gender) => {
      const oldGender = survivorGender
      const dbGender = DatabaseGender[gender]
      const oldSurvivors = [...(survivors ?? [])]

      setSurvivorGender(dbGender)
      setSurvivors(
        (survivors ?? []).map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, gender: dbGender } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { gender: dbGender })
        .then(() => toast.success(SURVIVOR_GENDER_UPDATED_MESSAGE()))
        .catch((error) => {
          setSurvivorGender(oldGender)
          setSurvivors(oldSurvivors)
          console.error('Error Updating Survivor Gender:', error)
        })
    },
    [selectedSurvivor?.id, survivorGender, survivors, setSurvivors]
  )

  /**
   * Handle Dead Toggle
   *
   * @param checked Checked State
   */
  const handleDeadToggle = useCallback(
    (checked: boolean) => {
      const oldDead = survivorDead
      const oldSurvivors = [...(survivors ?? [])]

      setSurvivorDead(checked)
      setSurvivors(
        (survivors ?? []).map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, dead: checked } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { dead: checked })
        .then(() =>
          toast.success(SURVIVOR_DEAD_STATUS_UPDATED_MESSAGE(checked))
        )
        .catch((error) => {
          setSurvivorDead(oldDead)
          setSurvivors(oldSurvivors)
          console.error('Error Updating Survivor Dead Status:', error)
        })
    },
    [selectedSurvivor?.id, survivorDead, survivors, setSurvivors]
  )

  /**
   * Handle Retired Toggle
   *
   * @param checked Checked State
   */
  const handleRetiredToggle = useCallback(
    (checked: boolean) => {
      const oldRetired = survivorRetired
      const oldSurvivors = [...(survivors ?? [])]

      setSurvivorRetired(checked)
      setSurvivors(
        (survivors ?? []).map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, retired: checked } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { retired: checked })
        .then(() =>
          toast.success(SURVIVOR_RETIRED_STATUS_UPDATED_MESSAGE(checked))
        )
        .catch((error) => {
          setSurvivorRetired(oldRetired)
          setSurvivors(oldSurvivors)
          console.error('Error Updating Survivor Retired Status:', error)
        })
    },
    [selectedSurvivor?.id, survivorRetired, survivors, setSurvivors]
  )

  /**
   * Handle Color Change
   *
   * @param color Selected Color
   */
  const handleColorChange = useCallback(
    (color: ColorChoice) => {
      const oldColor = survivorColor
      const oldSurvivors = [...(survivors ?? [])]

      setSurvivorColor(color)
      setIsColorPickerOpen(false)
      setSurvivors(
        (survivors ?? []).map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, color } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { color })
        .then(() => toast.success(SURVIVOR_COLOR_CHANGED_MESSAGE(color)))
        .catch((error) => {
          setSurvivorColor(oldColor)
          setSurvivors(oldSurvivors)
          console.error('Error Updating Survivor Color:', error)
        })
    },
    [selectedSurvivor?.id, survivorColor, survivors, setSurvivors]
  )

  return (
    <Card
      className="p-2 border-0"
      style={{
        ...getCardColorStyles(
          (selectedSurvivor?.color as ColorChoice) ?? ColorChoice.SLATE
        ),
        borderColor: 'var(--card-border-color)'
      }}>
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Popover
              open={isColorPickerOpen}
              onOpenChange={setIsColorPickerOpen}>
              <PopoverTrigger asChild>
                <Avatar
                  className={`h-8 w-8 ${getColorStyle(survivorColor, 'bg')} items-center justify-center cursor-pointer`}
                  onClick={() => setIsColorPickerOpen(true)}
                  onContextMenu={(e) => {
                    e.preventDefault() // Prevent default right-click menu
                    setIsColorPickerOpen(true)
                  }}>
                  <AvatarFallback className="bg-transparent">
                    {(survivorDead && <SkullIcon className="h-4 w-4" />) ||
                      (survivorRetired && !survivorDead && (
                        <UserXIcon className="h-4 w-4" />
                      ))}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="grid grid-cols-6 gap-1">
                  {Object.values(ColorChoice).map((color) => {
                    const isSelected = survivorColor === color
                    return (
                      <button
                        key={color}
                        className={`h-8 w-8 rounded-full border-2 ${getColorStyle(color, 'bg')} ${
                          isSelected
                            ? 'border-white ring-2 ring-black'
                            : 'border-gray-300 hover:border-white'
                        } transition-all duration-200`}
                        onClick={() => handleColorChange(color)}
                        title={color.charAt(0).toUpperCase() + color.slice(1)}
                      />
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
            {/* Survivor Name */}
            <div className="flex-1 flex items-center gap-2">
              <Label className="font-bold text-left">Name</Label>
              <Input
                placeholder="Survivor name..."
                value={survivorName}
                onChange={(e) => setSurvivorName(e.target.value)}
                onKeyDown={(e) => handleNameKeyDown(e, e.currentTarget.value)}
              />
            </div>

            {/* Gender */}
            <div className="ml-4 flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="male-checkbox" className="text-xs">
                  M
                </Label>
                <Checkbox
                  id="male-checkbox"
                  checked={survivorGender === 'MALE'}
                  onCheckedChange={(checked) => {
                    if (checked) handleGenderChange(Gender.MALE)
                  }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="female-checkbox" className="text-xs">
                  F
                </Label>
                <Checkbox
                  id="female-checkbox"
                  checked={survivorGender === 'FEMALE'}
                  onCheckedChange={(checked) => {
                    if (checked) handleGenderChange(Gender.FEMALE)
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="my-2" />

        {/* Status Section */}
        <div className="flex justify-between items-center">
          <p className="text-[10px] lg:text-xs text-muted-foreground">
            When you name your survivor, gain +1 <strong>survival</strong>.
          </p>

          <div className="flex items-center gap-2">
            {/* Dead Status */}
            <div className="flex flex-row items-center gap-1 space-y-0">
              <Checkbox
                id={`dead-checkbox-${selectedSurvivor?.id}`}
                checked={survivorDead}
                onCheckedChange={handleDeadToggle}
                className="h-4 w-4 rounded-sm"
              />
              <SkullIcon className="h-3 w-3 text-muted-foreground" />
              <Label
                className="text-xs text-muted-foreground cursor-pointer"
                htmlFor={`dead-checkbox-${selectedSurvivor?.id}`}>
                Dead
              </Label>
            </div>

            {/* Retired Status */}
            <div className="flex flex-row items-center gap-1 space-y-0">
              <Checkbox
                id={`retired-checkbox-${selectedSurvivor?.id}`}
                checked={survivorRetired}
                onCheckedChange={handleRetiredToggle}
                className="h-4 w-4 rounded-sm"
              />
              <UserXIcon className="h-3 w-3 text-muted-foreground" />
              <Label
                className="text-xs text-muted-foreground cursor-pointer"
                htmlFor={`retired-checkbox-${selectedSurvivor?.id}`}>
                Retired
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
