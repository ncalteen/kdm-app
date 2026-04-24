import { LOCAL_STORAGE_KEY } from '@/lib/common'
import { ColorChoice, MonsterNode, MonsterType } from '@/lib/enums'
import { SettlementDetail } from '@/lib/types'
import { clsx, type ClassValue } from 'clsx'
import { CSSProperties } from 'react'
import { twMerge } from 'tailwind-merge'

/**
 * Class Names Utility
 *
 * @param inputs Class Values
 * @returns Merged Class Names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if Settlement Can Encourage
 *
 * This is true if the settlement has the Language innovation.
 *
 * @param innovations Innovations
 * @returns Settlement Can Encourage
 */
export function canEncourage(
  innovations: SettlementDetail['innovations']
): boolean {
  return (
    innovations.filter(
      (innovation) => innovation.innovation_name === 'Language'
    ).length > 0
  )
}

/**
 * Check if Settlement Can Surge
 *
 * This is true if the settlement has the Inner Lantern innovation.
 *
 * @param innovations Innovations
 * @returns Settlement Can Surge
 */
export function canSurge(
  innovations: SettlementDetail['innovations']
): boolean {
  return (
    innovations.filter(
      (innovation) => innovation.innovation_name === 'Inner Lantern'
    ).length > 0
  )
}

/**
 * Check if Settlement Can Dash
 *
 * This is true if the settlement has the Paint innovation.
 *
 * @param innovations Innovations
 * @returns Settlement Can Dash
 */
export function canDash(innovations: SettlementDetail['innovations']): boolean {
  return (
    innovations.filter((innovation) => innovation.innovation_name === 'Paint')
      .length > 0
  )
}

/**
 * Check if Settlement Can Fist Pump
 *
 * This is true if the settlement has the Silent Dialect innovation.
 *
 * @param innovations Innovations
 * @returns Settlement Can Fist Pump
 */
export function canFistPump(
  innovations: SettlementDetail['innovations']
): boolean {
  return (
    innovations.filter(
      (innovation) => innovation.innovation_name === 'Silent Dialect'
    ).length > 0
  )
}

/**
 * Check if Settlement Can Endure
 *
 * This is true if the settlement has the Destiny innovation.
 *
 * @param innovations Innovations
 * @returns Settlement Can Endure
 */
export function canEndure(
  innovations: SettlementDetail['innovations']
): boolean {
  return (
    innovations.filter((innovation) => innovation.innovation_name === 'Destiny')
      .length > 0
  )
}

/**
 * Check if Settlement Survivors are Born with +1 Understanding
 *
 * This is true if the settlement has the Graves innovation.
 *
 * @param innovations Innovations
 * @returns Settlement Survivors Born with +1 Understanding
 */
export function survivorsBornWithUnderstanding(
  innovations: SettlementDetail['innovations']
): boolean {
  return (
    innovations.filter((innovation) => innovation.innovation_name === 'Graves')
      .length > 0
  )
}

/** Style types supported by {@link getColorStyle}. */
type ColorStyleType = 'bg' | 'border' | 'border-hover' | 'header'

/**
 * Color style class strings for each {@link ColorChoice}, keyed by style type.
 *
 * Built once at module load by mapping over {@link ColorChoice}'s values
 * (whose values are intentionally the matching Tailwind palette names). The
 * literal class strings emitted here are NOT scanned by Tailwind because they
 * use template interpolation; the corresponding utilities are kept in the
 * compiled CSS via `@source inline(...)` directives in `app/globals.css`.
 */
const COLOR_STYLE_MAP: Record<
  ColorChoice,
  Record<ColorStyleType, string>
> = Object.fromEntries(
  Object.values(ColorChoice).map((c) => [
    c,
    {
      bg: `bg-${c}-500`,
      border: `border-${c}-300/50`,
      'border-hover': `border-${c}-400/70`,
      header: `bg-${c}-100/30 border-${c}-300/40`
    }
  ])
) as Record<ColorChoice, Record<ColorStyleType, string>>

/**
 * Get Color Style for Display
 *
 * Falls back to slate when an unknown {@link ColorChoice} is supplied so
 * callers always receive a usable Tailwind class.
 *
 * @param color Color Choice
 * @param type Style Type
 * @returns Color Style String
 */
export function getColorStyle(
  color: ColorChoice,
  type: ColorStyleType = 'bg'
): string {
  return (
    COLOR_STYLE_MAP[color]?.[type] ??
    COLOR_STYLE_MAP[ColorChoice.SLATE][type] ??
    'bg-slate-500'
  )
}

/**
 * Get Color-specific CSS Variables for a Card
 *
 * @param color Color Choice
 * @returns CSS Properties for Card Colors
 */
export function getCardColorStyles(color: ColorChoice): CSSProperties {
  const colorMap: Record<
    ColorChoice,
    { border: string; borderHover: string; header: string }
  > = {
    [ColorChoice.NEUTRAL]: {
      border: 'rgb(163 163 163 / 0.5)',
      borderHover: 'rgb(163 163 163 / 0.7)',
      header: 'rgb(245 245 245 / 0.3)'
    },
    [ColorChoice.STONE]: {
      border: 'rgb(168 162 158 / 0.5)',
      borderHover: 'rgb(168 162 158 / 0.7)',
      header: 'rgb(245 245 244 / 0.3)'
    },
    [ColorChoice.ZINC]: {
      border: 'rgb(161 161 170 / 0.5)',
      borderHover: 'rgb(161 161 170 / 0.7)',
      header: 'rgb(244 244 245 / 0.3)'
    },
    [ColorChoice.SLATE]: {
      border: 'rgb(148 163 184 / 0.5)',
      borderHover: 'rgb(148 163 184 / 0.7)',
      header: 'rgb(241 245 249 / 0.3)'
    },
    [ColorChoice.GRAY]: {
      border: 'rgb(156 163 175 / 0.5)',
      borderHover: 'rgb(156 163 175 / 0.7)',
      header: 'rgb(243 244 246 / 0.3)'
    },
    [ColorChoice.RED]: {
      border: 'rgb(252 165 165 / 0.5)',
      borderHover: 'rgb(248 113 113 / 0.7)',
      header: 'rgb(254 226 226 / 0.3)'
    },
    [ColorChoice.ORANGE]: {
      border: 'rgb(253 186 116 / 0.5)',
      borderHover: 'rgb(251 146 60 / 0.7)',
      header: 'rgb(255 237 213 / 0.3)'
    },
    [ColorChoice.AMBER]: {
      border: 'rgb(252 211 77 / 0.5)',
      borderHover: 'rgb(245 158 11 / 0.7)',
      header: 'rgb(254 243 199 / 0.3)'
    },
    [ColorChoice.YELLOW]: {
      border: 'rgb(254 240 138 / 0.5)',
      borderHover: 'rgb(250 204 21 / 0.7)',
      header: 'rgb(254 249 195 / 0.3)'
    },
    [ColorChoice.LIME]: {
      border: 'rgb(190 242 100 / 0.5)',
      borderHover: 'rgb(163 230 53 / 0.7)',
      header: 'rgb(236 252 203 / 0.3)'
    },
    [ColorChoice.GREEN]: {
      border: 'rgb(134 239 172 / 0.5)',
      borderHover: 'rgb(74 222 128 / 0.7)',
      header: 'rgb(220 252 231 / 0.3)'
    },
    [ColorChoice.EMERALD]: {
      border: 'rgb(110 231 183 / 0.5)',
      borderHover: 'rgb(52 211 153 / 0.7)',
      header: 'rgb(209 250 229 / 0.3)'
    },
    [ColorChoice.TEAL]: {
      border: 'rgb(94 234 212 / 0.5)',
      borderHover: 'rgb(45 212 191 / 0.7)',
      header: 'rgb(204 251 241 / 0.3)'
    },
    [ColorChoice.CYAN]: {
      border: 'rgb(103 232 249 / 0.5)',
      borderHover: 'rgb(34 211 238 / 0.7)',
      header: 'rgb(207 250 254 / 0.3)'
    },
    [ColorChoice.SKY]: {
      border: 'rgb(125 211 252 / 0.5)',
      borderHover: 'rgb(56 189 248 / 0.7)',
      header: 'rgb(224 242 254 / 0.3)'
    },
    [ColorChoice.BLUE]: {
      border: 'rgb(147 197 253 / 0.5)',
      borderHover: 'rgb(96 165 250 / 0.7)',
      header: 'rgb(219 234 254 / 0.3)'
    },
    [ColorChoice.INDIGO]: {
      border: 'rgb(165 180 252 / 0.5)',
      borderHover: 'rgb(129 140 248 / 0.7)',
      header: 'rgb(224 231 255 / 0.3)'
    },
    [ColorChoice.VIOLET]: {
      border: 'rgb(196 181 253 / 0.5)',
      borderHover: 'rgb(167 139 250 / 0.7)',
      header: 'rgb(237 233 254 / 0.3)'
    },
    [ColorChoice.PURPLE]: {
      border: 'rgb(196 181 253 / 0.5)',
      borderHover: 'rgb(167 139 250 / 0.7)',
      header: 'rgb(243 232 255 / 0.3)'
    },
    [ColorChoice.FUCHSIA]: {
      border: 'rgb(240 171 252 / 0.5)',
      borderHover: 'rgb(232 121 249 / 0.7)',
      header: 'rgb(253 244 255 / 0.3)'
    },
    [ColorChoice.PINK]: {
      border: 'rgb(244 164 196 / 0.5)',
      borderHover: 'rgb(236 72 153 / 0.7)',
      header: 'rgb(252 231 243 / 0.3)'
    },
    [ColorChoice.ROSE]: {
      border: 'rgb(251 113 133 / 0.5)',
      borderHover: 'rgb(244 63 94 / 0.7)',
      header: 'rgb(255 228 230 / 0.3)'
    }
  }

  const colors = colorMap[color] ?? colorMap[ColorChoice.SLATE]
  return {
    '--card-border-color': colors.border,
    '--card-border-hover-color': colors.borderHover,
    '--card-header-bg': colors.header
  } as CSSProperties
}

/**
 * Get the Overwhelming Darkness Label
 *
 * When hunting the Flower Knight or Spidicules, Overwhelming Darkness is
 * replaced with The Forest Wants What it Wants.
 *
 * @param monsterName Monster Name
 * @returns Overwhelming Darkness Label
 */
export function getOverwhelmingDarknessLabel(
  monsterName: string | undefined
): string {
  return monsterName &&
    (monsterName.toLowerCase() === 'flower knight' ||
      monsterName.toLowerCase() === 'spidicules')
    ? 'The Forest Wants What it Wants'
    : 'Overwhelming Darkness'
}

/**
 * Get Available Monster Nodes
 *
 * @param type Monster Type
 * @returns Available Monster Nodes
 */
export const getAvailableNodes = (type: MonsterType): MonsterNode[] => {
  return type === MonsterType.NEMESIS
    ? [
        MonsterNode.NN1,
        MonsterNode.NN2,
        MonsterNode.NN3,
        MonsterNode.CO,
        MonsterNode.FI
      ]
    : [MonsterNode.NQ1, MonsterNode.NQ2, MonsterNode.NQ3, MonsterNode.NQ4]
}

/**
 * Save to Local Storage
 *
 * @param local Data to Save
 */
export function saveToLocalStorage(local: unknown) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local))
}

/**
 * Calculate Settlement Collective Cognition
 *
 * @param selectedSettlement Selected Settlement
 * @returns Collective Cognition Total
 */
export function calculateSettlementCollectiveCognition(
  selectedSettlement: SettlementDetail | null
): number {
  if (!selectedSettlement) return 0

  let total = 0

  for (const nemesis of selectedSettlement.nemeses ?? []) {
    if (nemesis.collective_cognition_level_1) total += 3
    if (nemesis.collective_cognition_level_2) total += 3
    if (nemesis.collective_cognition_level_3) total += 3
  }

  for (const quarry of selectedSettlement.quarries ?? []) {
    if (quarry.collective_cognition_prologue) total += 1
    if (quarry.collective_cognition_level_1) total += 1
    for (const v of quarry.collective_cognition_level_2) if (v) total += 2
    for (const v of quarry.collective_cognition_level_3) if (v) total += 3
  }

  return total
}
