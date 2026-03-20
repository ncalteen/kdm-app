import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { updateSurvivor } from '@/lib/dal/survivor'
import { SURVIVOR_FACES_IN_THE_SKY_TRAIT_UPDATED_MESSAGE } from '@/lib/messages'
import { SurvivorDetail } from '@/lib/types'
import { BookOpenIcon } from 'lucide-react'
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useCallback,
  useRef,
  useState
} from 'react'
import { toast } from 'sonner'

/**
 * Faces In The Sky Properties
 */
interface FacesInTheSkyProps {
  /** Selected Survivor */
  selectedSurvivor: SurvivorDetail | null
  /** Set Survivors */
  setSurvivors: (survivors: SurvivorDetail[]) => void
  /** Survivors */
  survivors: SurvivorDetail[]
}

/**
 * Faces in the Sky Component
 *
 * This component displays the Faces in the Sky table for People of the Stars
 * survivors.
 *
 * @param props Faces In The Sky Properties
 * @returns Faces in the Sky Component
 */
export function FacesInTheSky({
  selectedSurvivor,
  setSurvivors,
  survivors
}: FacesInTheSkyProps): ReactElement {
  const survivorIdRef = useRef<string | undefined>(undefined)

  const [gamblerWitch, setGamblerWitch] = useState(
    selectedSurvivor?.gambler_witch ?? false
  )
  const [gamblerRust, setGamblerRust] = useState(
    selectedSurvivor?.gambler_rust ?? false
  )
  const [gamblerStorm, setGamblerStorm] = useState(
    selectedSurvivor?.gambler_storm ?? false
  )
  const [gamblerReaper, setGamblerReaper] = useState(
    selectedSurvivor?.gambler_reaper ?? false
  )
  const [absoluteWitch, setAbsoluteWitch] = useState(
    selectedSurvivor?.absolute_witch ?? false
  )
  const [absoluteRust, setAbsoluteRust] = useState(
    selectedSurvivor?.absolute_rust ?? false
  )
  const [absoluteStorm, setAbsoluteStorm] = useState(
    selectedSurvivor?.absolute_storm ?? false
  )
  const [absoluteReaper, setAbsoluteReaper] = useState(
    selectedSurvivor?.absolute_reaper ?? false
  )
  const [sculptorWitch, setSculptorWitch] = useState(
    selectedSurvivor?.sculptor_witch ?? false
  )
  const [sculptorRust, setSculptorRust] = useState(
    selectedSurvivor?.sculptor_rust ?? false
  )
  const [sculptorStorm, setSculptorStorm] = useState(
    selectedSurvivor?.sculptor_storm ?? false
  )
  const [sculptorReaper, setSculptorReaper] = useState(
    selectedSurvivor?.sculptor_reaper ?? false
  )
  const [goblinWitch, setGoblinWitch] = useState(
    selectedSurvivor?.goblin_witch ?? false
  )
  const [goblinRust, setGoblinRust] = useState(
    selectedSurvivor?.goblin_rust ?? false
  )
  const [goblinStorm, setGoblinStorm] = useState(
    selectedSurvivor?.goblin_storm ?? false
  )
  const [goblinReaper, setGoblinReaper] = useState(
    selectedSurvivor?.goblin_reaper ?? false
  )

  // Reset local state when switching survivors
  if (survivorIdRef.current !== selectedSurvivor?.id) {
    survivorIdRef.current = selectedSurvivor?.id

    setGamblerWitch(selectedSurvivor?.gambler_witch ?? false)
    setGamblerRust(selectedSurvivor?.gambler_rust ?? false)
    setGamblerStorm(selectedSurvivor?.gambler_storm ?? false)
    setGamblerReaper(selectedSurvivor?.gambler_reaper ?? false)
    setAbsoluteWitch(selectedSurvivor?.absolute_witch ?? false)
    setAbsoluteRust(selectedSurvivor?.absolute_rust ?? false)
    setAbsoluteStorm(selectedSurvivor?.absolute_storm ?? false)
    setAbsoluteReaper(selectedSurvivor?.absolute_reaper ?? false)
    setSculptorWitch(selectedSurvivor?.sculptor_witch ?? false)
    setSculptorRust(selectedSurvivor?.sculptor_rust ?? false)
    setSculptorStorm(selectedSurvivor?.sculptor_storm ?? false)
    setSculptorReaper(selectedSurvivor?.sculptor_reaper ?? false)
    setGoblinWitch(selectedSurvivor?.goblin_witch ?? false)
    setGoblinRust(selectedSurvivor?.goblin_rust ?? false)
    setGoblinStorm(selectedSurvivor?.goblin_storm ?? false)
    setGoblinReaper(selectedSurvivor?.goblin_reaper ?? false)
  }

  /**
   * Handle Toggle
   *
   * Toggles a boolean field, optimistically updates local state and the
   * survivors array, then persists to the database. Rolls back on error.
   *
   * @param field Database Field Name
   * @param currentValue Current Boolean Value
   * @param setter State Setter Function
   */
  const handleToggle = useCallback(
    (
      field: keyof SurvivorDetail,
      currentValue: boolean,
      setter: Dispatch<SetStateAction<boolean>>
    ) => {
      const newValue = !currentValue
      const oldSurvivors = [...survivors]

      setter(newValue)
      setSurvivors(
        survivors.map((s) =>
          s.id === selectedSurvivor?.id ? { ...s, [field]: newValue } : s
        )
      )

      updateSurvivor(selectedSurvivor?.id, { [field]: newValue })
        .then(() =>
          toast.success(SURVIVOR_FACES_IN_THE_SKY_TRAIT_UPDATED_MESSAGE())
        )
        .catch((error) => {
          setter(currentValue)
          setSurvivors(oldSurvivors)
          console.error('Error Updating Faces in the Sky Trait:', error)
        })
    },
    [selectedSurvivor?.id, setSurvivors, survivors]
  )

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-8 text-xs text-left font-bold"></TableHead>
            <TableHead className="h-8 text-xs text-left font-bold">
              Witch
            </TableHead>
            <TableHead className="h-8 text-xs text-left font-bold">
              Rust
            </TableHead>
            <TableHead className="h-8 text-xs text-left font-bold">
              Storm
            </TableHead>
            <TableHead className="h-8 text-xs text-left font-bold">
              Reaper
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y">
          {/* Gambler Row */}
          <TableRow>
            <TableCell className="py-1 text-xs text-center font-bold">
              Gambler
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${gamblerWitch ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('gambler_witch', gamblerWitch, setGamblerWitch)
              }>
              9+ UND
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${gamblerRust ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('gambler_rust', gamblerRust, setGamblerRust)
              }>
              Destined Disorder
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${gamblerStorm ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('gambler_storm', gamblerStorm, setGamblerStorm)
              }>
              Fated Blow FA
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${gamblerReaper ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('gambler_reaper', gamblerReaper, setGamblerReaper)
              }>
              Pristine Ability
            </TableCell>
          </TableRow>

          {/* Absolute Row */}
          <TableRow>
            <TableCell className="py-1 text-xs text-center font-bold">
              Absolute
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${absoluteWitch ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('absolute_witch', absoluteWitch, setAbsoluteWitch)
              }>
              Reincarnated
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${absoluteRust ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('absolute_rust', absoluteRust, setAbsoluteRust)
              }>
              Frozen Star FA
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${absoluteStorm ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('absolute_storm', absoluteStorm, setAbsoluteStorm)
              }>
              Irid. Hide Abil.
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${absoluteReaper ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle(
                  'absolute_reaper',
                  absoluteReaper,
                  setAbsoluteReaper
                )
              }>
              Champion&apos;s Rite FA
            </TableCell>
          </TableRow>

          {/* Sculptor Row */}
          <TableRow>
            <TableCell className="py-1 text-xs text-center font-bold">
              Sculptor
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${sculptorWitch ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('sculptor_witch', sculptorWitch, setSculptorWitch)
              }>
              Scar
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${sculptorRust ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('sculptor_rust', sculptorRust, setSculptorRust)
              }>
              Noble
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${sculptorStorm ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('sculptor_storm', sculptorStorm, setSculptorStorm)
              }>
              Weapon Master
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${sculptorReaper ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle(
                  'sculptor_reaper',
                  sculptorReaper,
                  setSculptorReaper
                )
              }>
              1+ Base ACC
            </TableCell>
          </TableRow>

          {/* Goblin Row */}
          <TableRow>
            <TableCell className="py-1 text-xs text-center font-bold">
              Goblin
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${goblinWitch ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('goblin_witch', goblinWitch, setGoblinWitch)
              }>
              Oracle&apos;s Eye
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${goblinRust ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('goblin_rust', goblinRust, setGoblinRust)
              }>
              Unbreakable FA
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${goblinStorm ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('goblin_storm', goblinStorm, setGoblinStorm)
              }>
              3+ Base STR
            </TableCell>
            <TableCell
              className={`py-1 text-xs text-left cursor-pointer ${goblinReaper ? 'bg-gray-200 text-gray-700' : ''}`}
              onClick={() =>
                handleToggle('goblin_reaper', goblinReaper, setGoblinReaper)
              }>
              9+ COU
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="text-xs text-muted-foreground flex flex-row items-center justify-center gap-1 pt-2">
        If marked traits complete a horizontal or vertical line,
        <BookOpenIcon className="h-4 w-4" />
        <strong>Faces in the Sky.</strong>
      </div>
    </div>
  )
}
