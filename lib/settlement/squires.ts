import { Tables } from '@/lib/database.types'

/**
 * Calculate Total Suspicion Level
 *
 * Sums the individual suspicion levels of all survivors to get a total
 * suspicion level for the settlement.
 *
 * @param survivors Array of Survivors
 * @return Total Suspicion Level
 */
export function calculateTotalSuspicion(
  survivors: Tables<'survivor'>[]
): number {
  return survivors.reduce((total, survivor) => {
    let suspicionLevel = 0

    if (survivor.squire_suspicion_level_1) suspicionLevel += 1
    if (survivor.squire_suspicion_level_2) suspicionLevel += 1
    if (survivor.squire_suspicion_level_3) suspicionLevel += 1
    if (survivor.squire_suspicion_level_4) suspicionLevel += 1

    return total + suspicionLevel
  }, 0)
}

/**
 * Calculate Suspicion Levels
 *
 * Computes a consistent set of suspicion levels based on cascading rules:
 * checking a higher level also checks all lower levels, and unchecking a
 * lower level also unchecks all higher levels.
 *
 * @param survivor Survivor Record
 * @param level Suspicion Level Being Changed
 * @param checked New Checked State
 * @returns Updated Suspicion Levels
 */
export function calculateSuspicionLevels(
  survivor: Tables<'survivor'>,
  level: number,
  checked: boolean
): {
  squire_suspicion_level_1: boolean
  squire_suspicion_level_2: boolean
  squire_suspicion_level_3: boolean
  squire_suspicion_level_4: boolean
} {
  let level1 = survivor.squire_suspicion_level_1
  let level2 = survivor.squire_suspicion_level_2
  let level3 = survivor.squire_suspicion_level_3
  let level4 = survivor.squire_suspicion_level_4

  // Update the specified level
  if (level === 1) level1 = checked
  if (level === 2) level2 = checked
  if (level === 3) level3 = checked
  if (level === 4) level4 = checked

  // If checking a higher level, also check all lower levels
  if (checked) {
    if (level >= 2) level1 = true
    if (level >= 3) level2 = true
    if (level >= 4) level3 = true
  }

  // If unchecking a lower level, also uncheck all higher levels
  if (!checked) {
    if (level <= 1) level2 = false
    if (level <= 2) level3 = false
    if (level <= 3) level4 = false
  }

  return {
    squire_suspicion_level_1: level1,
    squire_suspicion_level_2: level2,
    squire_suspicion_level_3: level3,
    squire_suspicion_level_4: level4
  }
}
