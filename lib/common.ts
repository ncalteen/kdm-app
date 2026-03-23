import { HuntEventType, SettlementPhaseStep } from '@/lib/enums'
import {
  BanIcon,
  LuggageIcon,
  NotebookPenIcon,
  PlayIcon,
  SkullIcon,
  SparkleIcon,
  SquareCheckBigIcon,
  SwordsIcon,
  TimerIcon,
  Undo2Icon,
  WrenchIcon
} from 'lucide-react'

/**
 * Local Storage Key
 */
export const LOCAL_STORAGE_KEY = 'kdm-archivist-local'

/**
 * Basic Hunt Board Configuration
 */
export const basicHuntBoard = {
  0: undefined,
  1: HuntEventType.BASIC,
  2: HuntEventType.BASIC,
  3: HuntEventType.BASIC,
  4: HuntEventType.BASIC,
  5: HuntEventType.BASIC,
  6: undefined,
  7: HuntEventType.BASIC,
  8: HuntEventType.BASIC,
  9: HuntEventType.BASIC,
  10: HuntEventType.BASIC,
  11: HuntEventType.BASIC,
  12: undefined
}

/**
 * Settlement Phase Steps and Icons
 */
export const settlementPhaseSteps = [
  { index: 0, step: SettlementPhaseStep.SET_UP_SETTLEMENT, icon: PlayIcon },
  { index: 1, step: SettlementPhaseStep.SURVIVORS_RETURN, icon: Undo2Icon },
  { index: 2, step: SettlementPhaseStep.GAIN_ENDEAVORS, icon: SparkleIcon },
  { index: 3, step: SettlementPhaseStep.UPDATE_TIMELINE, icon: TimerIcon },
  { index: 4, step: SettlementPhaseStep.UPDATE_DEATH_COUNT, icon: SkullIcon },
  {
    index: 5,
    step: SettlementPhaseStep.CHECK_MILESTONES,
    icon: SquareCheckBigIcon
  },
  { index: 6, step: SettlementPhaseStep.DEVELOP, icon: WrenchIcon },
  {
    index: 7,
    step: SettlementPhaseStep.PREPARE_DEPARTING_SURVIVORS,
    icon: LuggageIcon
  },
  { index: 8, step: SettlementPhaseStep.SPECIAL_SHOWDOWN, icon: SwordsIcon },
  {
    index: 9,
    step: SettlementPhaseStep.RECORD_AND_ARCHIVE_RESOURCES,
    icon: NotebookPenIcon
  },
  { index: 10, step: SettlementPhaseStep.END_SETTLEMENT_PHASE, icon: BanIcon }
]

/**
 * Vignette Unlock Map
 *
 * Vignette monster names that require user setting unlocks.
 */
export const vignetteUnlockMap: Record<string, string> = {
  'Killenium Butcher': 'unlocked_killenium_butcher',
  'Screaming Nukalope': 'unlocked_screaming_nukalope',
  'White Gigalion': 'unlocked_white_gigalion'
}
