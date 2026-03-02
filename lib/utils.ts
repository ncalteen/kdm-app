import { ColorChoice, MonsterNode, MonsterType } from '@/lib/enums'
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

// /**
//  * Get Campaign
//  *
//  * @returns Campaign
//  */
// export function getCampaign() {
//   return JSON.parse(
//     localStorage.getItem('campaign') ?? JSON.stringify(newCampaign)
//   )
// }

// /**
//  * Check if Settlement Can Encourage
//  *
//  * This is true if the settlement has the Language innovation.
//  *
//  * @param campaign Campaign
//  * @param settlementId Settlement ID
//  * @returns Settlement Can Encourage
//  */
// export function canEncourage(
//   campaign: Campaign,
//   settlementId: number
// ): boolean {
//   const settlement = campaign.settlements.find(
//     (settlement) => settlement.id === settlementId
//   )

//   if (!settlement) return false

//   return (
//     settlement.innovations.find((innovation) =>
//       innovation.toLowerCase().includes('language')
//     ) !== undefined
//   )
// }

// /**
//  * Check if Settlement Can Surge
//  *
//  * This is true if the settlement has the Inner Lantern innovation.
//  *
//  * @param campaign Campaign
//  * @param settlementId Settlement ID
//  * @returns Settlement Can Surge
//  */
// export function canSurge(campaign: Campaign, settlementId: number): boolean {
//   const settlement = campaign.settlements.find(
//     (settlement) => settlement.id === settlementId
//   )

//   if (!settlement) return false

//   return (
//     settlement.innovations.find((innovation) =>
//       innovation.toLowerCase().includes('inner lantern')
//     ) !== undefined
//   )
// }

// /**
//  * Check if Settlement Can Dash
//  *
//  * This is true if the settlement has the Paint innovation.
//  *
//  * @param campaign Campaign
//  * @param settlementId Settlement ID
//  * @returns Settlement Can Dash
//  */
// export function canDash(campaign: Campaign, settlementId: number): boolean {
//   const settlement = campaign.settlements.find(
//     (settlement) => settlement.id === settlementId
//   )

//   if (!settlement) return false

//   return (
//     settlement.innovations.find(
//       (innovation) => innovation.toLowerCase() === 'paint'
//     ) !== undefined
//   )
// }

// /**
//  * Check if Settlement Can Fist Pump
//  *
//  * This is true if the settlement has the Silent Dialect innovation.
//  *
//  * @param campaign Campaign
//  * @param settlementId Settlement ID
//  * @returns Settlement Can Fist Pump
//  */
// export function canFistPump(campaign: Campaign, settlementId: number): boolean {
//   const settlement = campaign.settlements.find(
//     (settlement) => settlement.id === settlementId
//   )

//   if (!settlement) return false

//   return (
//     settlement.innovations.find((innovation) =>
//       innovation.toLowerCase().includes('silent dialect')
//     ) !== undefined
//   )
// }

// /**
//  * Check if Settlement Can Endure
//  *
//  * This is true if the settlement has the Destiny innovation.
//  *
//  * @param campaign Campaign
//  * @param settlementId Settlement ID
//  * @returns Settlement Can Endure
//  */
// export function canEndure(campaign: Campaign, settlementId: number): boolean {
//   const settlement = campaign.settlements.find(
//     (settlement) => settlement.id === settlementId
//   )

//   if (!settlement) return false

//   return (
//     settlement.innovations.find((innovation) =>
//       innovation.toLowerCase().includes('destiny')
//     ) !== undefined
//   )
// }

// /**
//  * Check if Settlement Survivors are Born with +1 Understanding
//  *
//  * This is true if the settlement has the Graves innovation.
//  *
//  * @param campaign Campaign
//  * @param settlementId Settlement ID
//  * @returns Settlement Survivors Born with Understanding
//  */
// export function bornWithUnderstanding(
//   campaign: Campaign,
//   settlementId: number
// ): boolean {
//   const settlement = campaign.settlements.find(
//     (settlement) => settlement.id === settlementId
//   )

//   if (!settlement) return false

//   return (
//     settlement.innovations.find((innovation) =>
//       innovation.toLowerCase().includes('graves')
//     ) !== undefined
//   )
// }

/**
 * Get Color Style for Display
 *
 * @param color Color Choice
 * @param type Style Type
 * @returns Color Style String
 */
export function getColorStyle(
  color: ColorChoice,
  type: 'bg' | 'border' | 'border-hover' | 'header' = 'bg'
): string {
  const colorMap: Record<ColorChoice, Record<string, string>> = {
    [ColorChoice.NEUTRAL]: {
      bg: 'bg-neutral-500',
      border: 'border-neutral-300/50',
      'border-hover': 'border-neutral-400/70',
      header: 'bg-neutral-100/30 border-neutral-300/40'
    },
    [ColorChoice.STONE]: {
      bg: 'bg-stone-500',
      border: 'border-stone-300/50',
      'border-hover': 'border-stone-400/70',
      header: 'bg-stone-100/30 border-stone-300/40'
    },
    [ColorChoice.ZINC]: {
      bg: 'bg-zinc-500',
      border: 'border-zinc-300/50',
      'border-hover': 'border-zinc-400/70',
      header: 'bg-zinc-100/30 border-zinc-300/40'
    },
    [ColorChoice.SLATE]: {
      bg: 'bg-slate-500',
      border: 'border-slate-300/50',
      'border-hover': 'border-slate-400/70',
      header: 'bg-slate-100/30 border-slate-300/40'
    },
    [ColorChoice.GRAY]: {
      bg: 'bg-gray-500',
      border: 'border-gray-300/50',
      'border-hover': 'border-gray-400/70',
      header: 'bg-gray-100/30 border-gray-300/40'
    },
    [ColorChoice.RED]: {
      bg: 'bg-red-500',
      border: 'border-red-300/50',
      'border-hover': 'border-red-400/70',
      header: 'bg-red-100/30 border-red-300/40'
    },
    [ColorChoice.ORANGE]: {
      bg: 'bg-orange-500',
      border: 'border-orange-300/50',
      'border-hover': 'border-orange-400/70',
      header: 'bg-orange-100/30 border-orange-300/40'
    },
    [ColorChoice.AMBER]: {
      bg: 'bg-amber-500',
      border: 'border-amber-300/50',
      'border-hover': 'border-amber-400/70',
      header: 'bg-amber-100/30 border-amber-300/40'
    },
    [ColorChoice.YELLOW]: {
      bg: 'bg-yellow-500',
      border: 'border-yellow-300/50',
      'border-hover': 'border-yellow-400/70',
      header: 'bg-yellow-100/30 border-yellow-300/40'
    },
    [ColorChoice.LIME]: {
      bg: 'bg-lime-500',
      border: 'border-lime-300/50',
      'border-hover': 'border-lime-400/70',
      header: 'bg-lime-100/30 border-lime-300/40'
    },
    [ColorChoice.GREEN]: {
      bg: 'bg-green-500',
      border: 'border-green-300/50',
      'border-hover': 'border-green-400/70',
      header: 'bg-green-100/30 border-green-300/40'
    },
    [ColorChoice.EMERALD]: {
      bg: 'bg-emerald-500',
      border: 'border-emerald-300/50',
      'border-hover': 'border-emerald-400/70',
      header: 'bg-emerald-100/30 border-emerald-300/40'
    },
    [ColorChoice.TEAL]: {
      bg: 'bg-teal-500',
      border: 'border-teal-300/50',
      'border-hover': 'border-teal-400/70',
      header: 'bg-teal-100/30 border-teal-300/40'
    },
    [ColorChoice.CYAN]: {
      bg: 'bg-cyan-500',
      border: 'border-cyan-300/50',
      'border-hover': 'border-cyan-400/70',
      header: 'bg-cyan-100/30 border-cyan-300/40'
    },
    [ColorChoice.SKY]: {
      bg: 'bg-sky-500',
      border: 'border-sky-300/50',
      'border-hover': 'border-sky-400/70',
      header: 'bg-sky-100/30 border-sky-300/40'
    },
    [ColorChoice.BLUE]: {
      bg: 'bg-blue-500',
      border: 'border-blue-300/50',
      'border-hover': 'border-blue-400/70',
      header: 'bg-blue-100/30 border-blue-300/40'
    },
    [ColorChoice.INDIGO]: {
      bg: 'bg-indigo-500',
      border: 'border-indigo-300/50',
      'border-hover': 'border-indigo-400/70',
      header: 'bg-indigo-100/30 border-indigo-300/40'
    },
    [ColorChoice.VIOLET]: {
      bg: 'bg-violet-500',
      border: 'border-violet-300/50',
      'border-hover': 'border-violet-400/70',
      header: 'bg-violet-100/30 border-violet-300/40'
    },
    [ColorChoice.PURPLE]: {
      bg: 'bg-purple-500',
      border: 'border-purple-300/50',
      'border-hover': 'border-purple-400/70',
      header: 'bg-purple-100/30 border-purple-300/40'
    },
    [ColorChoice.FUCHSIA]: {
      bg: 'bg-fuchsia-500',
      border: 'border-fuchsia-300/50',
      'border-hover': 'border-fuchsia-400/70',
      header: 'bg-fuchsia-100/30 border-fuchsia-300/40'
    },
    [ColorChoice.PINK]: {
      bg: 'bg-pink-500',
      border: 'border-pink-300/50',
      'border-hover': 'border-pink-400/70',
      header: 'bg-pink-100/30 border-pink-300/40'
    },
    [ColorChoice.ROSE]: {
      bg: 'bg-rose-500',
      border: 'border-rose-300/50',
      'border-hover': 'border-rose-400/70',
      header: 'bg-rose-100/30 border-rose-300/40'
    }
  }

  return (
    colorMap[color]?.[type] ??
    colorMap[ColorChoice.SLATE][type] ??
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
 * When hunting the Flower Knight, Overwhelming Darkness is replaced with The
 * Forest Wants What it Wants.
 *
 * @param monsterName Monster Name
 * @returns Overwhelming Darkness Label
 */
export function getOverwhelmingDarknessLabel(
  monsterName: string | undefined
): string {
  return monsterName && monsterName.toLowerCase() === 'flower knight'
    ? 'The Forest Wants What it Wants'
    : 'Overwhelming Darkness'
}

// /**
//  * Get the Survivors Color Choice
//  *
//  * @param campaign Campaign Data
//  * @param survivorId Survivor ID
//  * @returns Color Choice
//  */
// export function getSurvivorColorChoice(
//   campaign: Campaign,
//   survivorId: number | undefined
// ): ColorChoice {
//   if (!survivorId) return ColorChoice.SLATE

//   return (
//     campaign.survivors.find((survivor) => survivorId === survivor.id)?.color ??
//     ColorChoice.SLATE
//   )
// }

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

// /**
//  * Create Settlement Nemesis from Nemesis Data
//  *
//  * @param data Nemesis Data
//  * @returns Settlement Nemesis
//  */
// export const createSettlementNemesisFromData = (
//   selectedSettlement: Tables<'settlement'> | null,
//   data: Tables<'nemesis'>
// ): Tables<'settlement_nemesis'> => {
//   const nemesis: Tables<'settlement_nemesis'> = {
//     collective_cognition_level_1: false,
//     collective_cognition_level_2: false,
//     collective_cognition_level_3: false,
//     monster_name: data.monster_name,
//     monster_node: data.node,
//     unlocked: false
//   }

//   if (data.level1) {
//     nemesis.level1 = data.level1
//     nemesis.level1Defeated = false
//   }
//   if (data.level2) {
//     nemesis.level2 = data.level2
//     nemesis.level2Defeated = false
//   }
//   if (data.level3) {
//     nemesis.level3 = data.level3
//     nemesis.level3Defeated = false
//   }
//   if (data.level4) {
//     nemesis.level4 = data.level4
//     nemesis.level4Defeated = false
//   }
//   if (data.vignette) nemesis.vignette = data.vignette

//   // If the campaign is People of the Dream Keeper and the nemesis is The Hand,
//   // add the Suspicious trait to all levels.
//   if (
//     selectedSettlement &&
//     selectedSettlement.campaignType ===
//       CampaignType.PEOPLE_OF_THE_DREAM_KEEPER &&
//     data.name.toLowerCase() === 'the hand'
//   ) {
//     if (data.level1) nemesis.level1?.[0].traits.push('Suspicious')
//     if (data.level2) nemesis.level2?.[0].traits.push('Suspicious')
//     if (data.level3) nemesis.level3?.[0].traits.push('Suspicious')
//     if (data.level4) nemesis.level4?.[0].traits.push('Suspicious')
//   }

//   return nemesis
// }

// /**
//  * Create Settlement Quarry from Quarry Data
//  *
//  * @param data Quarry Data
//  * @returns Settlement Quarry
//  */
// export const createSettlementQuarryFromData = (
//   data: QuarryMonsterData
// ): SettlementQuarry => {
//   const quarry: SettlementQuarry = {
//     ccLevel1: false,
//     ccLevel2: [false, false],
//     ccLevel3: [false, false, false],
//     ccPrologue: false,
//     huntBoard: data.huntBoard,
//     name: data.name,
//     node: data.node,
//     unlocked: false
//   }

//   if (data.alternate) quarry.alternate = data.alternate
//   if (data.level1) quarry.level1 = data.level1
//   if (data.level2) quarry.level2 = data.level2
//   if (data.level3) quarry.level3 = data.level3
//   if (data.level4) quarry.level4 = data.level4
//   if (data.vignette) quarry.vignette = data.vignette

//   return quarry
// }

// /**
//  * Check if Vignette Monster is Unlocked
//  *
//  * Checks the campaign data to confirm if a vignette monster has been unlocked.
//  *
//  * @param campaign Campaign
//  * @param monsterName Vignette Monster Name
//  * @returns Vignette Monster is Unlocked
//  */
// export const isVignetteMonsterUnlocked = (
//   campaign: Campaign,
//   monsterName: string | undefined
// ): boolean => {
//   if (!monsterName) return false

//   // Killenium Butcher
//   if (
//     monsterName === KILLENIUM_BUTCHER.name &&
//     campaign.settings.unlockedMonsters.killeniumButcher
//   )
//     return true

//   // Screaming Nukalope
//   if (
//     monsterName === SCREAMING_NUKALOPE.name &&
//     campaign.settings.unlockedMonsters.screamingNukalope
//   )
//     return true

//   // White Gigalion
//   if (
//     monsterName === WHITE_GIGALION.name &&
//     campaign.settings.unlockedMonsters.whiteGigalion
//   )
//     return true

//   return false
// }

/**
 * Save to Local Storage
 *
 * @param local Data to Save
 */
export function saveToLocalStorage(local: unknown) {
  localStorage.setItem('kdm-recordkeeper-local', JSON.stringify(local))
}
