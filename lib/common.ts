import { HuntEventType, SettlementPhaseStep } from '@/lib/enums'
import { MonsterLevelData, PlanSlug } from '@/lib/types'
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
 * Free-Tier Settlement Limit
 *
 * Maximum number of settlements a free-tier user may own. Settlements that a
 * user only collaborates on (via the sharing flow) do not count toward this
 * cap — only rows in `settlement` whose `user_id` matches the caller are
 * included. The limit is enforced in the application layer (the
 * `createSettlement` DAL) rather than at the database so that direct
 * admin / service-role traffic — Supabase Studio, integration tests, ad-hoc
 * SQL — naturally bypasses it for testing purposes. Active paid settlement
 * tiers skip this cap via `canCreateUnlimitedSettlements`.
 */
export const FREE_TIER_SETTLEMENT_LIMIT = 5

/**
 * GitHub Issues URL for the Application
 */
export const GITHUB_ISSUES_URL = 'https://github.com/ncalteen/kdm-app/issues'

/**
 * Local Storage Key
 */
export const LOCAL_STORAGE_KEY = 'kdm-archivist-local'

/**
 * Markdown Syntax Reference URL
 *
 * Linked beneath every markdown editor as a quick reference for users.
 */
export const MARKDOWN_SYNTAX_URL = 'https://www.markdownguide.org/basic-syntax/'

/**
 * Plan Order
 *
 * Rendering order for the plan grid. Free is shown first as a reference
 * baseline; the paid tiers ascend by price.
 */
export const PLAN_ORDER: ReadonlyArray<PlanSlug> = [
  'free',
  'lantern',
  'lantern_hoard'
]

/**
 * Support Email Address
 */
export const SUPPORT_EMAIL = 'ncalteen@archivist.monster'

/**
 * Stripe API Version
 *
 * Pinned in code so that the route's contract with Stripe does not silently
 * change when the account's Dashboard-pinned version is rolled. Keep in sync
 * with the checkout + webhook handlers; update them together when intentionally
 * upgrading.
 */
export const STRIPE_API_VERSION = '2026-04-22.dahlia'

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
 * Base Monster Level Data
 */
export const baseMonsterLevelData: MonsterLevelData = {
  sub_monster_name: '',
  basic_cards: 0,
  advanced_cards: 0,
  legendary_cards: 0,
  overtone_cards: 0,
  accuracy: 0,
  accuracy_tokens: 0,
  damage: 0,
  damage_tokens: 0,
  evasion: 0,
  evasion_tokens: 0,
  luck: 0,
  luck_tokens: 0,
  movement: 1,
  movement_tokens: 0,
  speed: 0,
  speed_tokens: 0,
  strength: 0,
  strength_tokens: 0,
  toughness: 0,
  toughness_tokens: 0,
  life: 0,
  traits: [],
  moods: [],
  survivor_statuses: []
}

/**
 * Monster Attribute/Token Map
 *
 * Used for mapping monster attributes to their corresponding token counts.
 */
export const monsterAttributeTokenMap = [
  { key: 'movement', tokenKey: 'movement_tokens', label: 'Movement' },
  { key: 'accuracy', tokenKey: 'accuracy_tokens', label: 'Accuracy' },
  { key: 'damage', tokenKey: 'damage_tokens', label: 'Damage' },
  { key: 'strength', tokenKey: 'strength_tokens', label: 'Strength' },
  { key: 'evasion', tokenKey: 'evasion_tokens', label: 'Evasion' },
  { key: 'luck', tokenKey: 'luck_tokens', label: 'Luck' },
  { key: 'speed', tokenKey: 'speed_tokens', label: 'Speed' },
  { key: 'toughness', tokenKey: 'toughness_tokens', label: 'Toughness' }
]

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
