import { admin } from '@/__tests__/ui/helpers/supabase'

/** Survivor Fixture Options */
export interface SurvivorFixtureOptions {
  /** Settlement ID */
  settlementId: string
  /** Survivor Name */
  name: string
  /** Gender */
  gender?: 'MALE' | 'FEMALE'
  /** Survival */
  survival?: number
}

/** Create Survivor Fixture */
export async function createSurvivorFixture(
  options: SurvivorFixtureOptions
): Promise<string> {
  const { data, error } = await admin
    .from('survivor')
    .insert({
      gender: options.gender ?? 'FEMALE',
      settlement_id: options.settlementId,
      survivor_name: options.name,
      survival: options.survival ?? 1
    })
    .select('id')
    .single()

  if (error) throw new Error(`create survivor failed: ${error.message}`)

  return data.id
}

/** Find Survivor By Name */
export async function findSurvivorByName(
  settlementId: string,
  survivorName: string
) {
  const { data, error } = await admin
    .from('survivor')
    .select('*')
    .eq('settlement_id', settlementId)
    .eq('survivor_name', survivorName)
    .maybeSingle()

  if (error) throw new Error(`survivor lookup failed: ${error.message}`)

  return data
}

/** Wait For Survivor By Name */
export async function waitForSurvivorByName(
  settlementId: string,
  survivorName: string
) {
  const timeoutAt = Date.now() + 10_000

  while (Date.now() < timeoutAt) {
    const survivor = await findSurvivorByName(settlementId, survivorName)
    if (survivor) return survivor
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for survivor ${survivorName}`)
}

/** Get Survivor Row */
export async function getSurvivorRow(survivorId: string) {
  const { data, error } = await admin
    .from('survivor')
    .select('*')
    .eq('id', survivorId)
    .single()

  if (error) throw new Error(`survivor row lookup failed: ${error.message}`)

  return data
}

/** Wait For Survivor Field */
export async function waitForSurvivorField<T>(
  survivorId: string,
  field: string,
  expected: T
): Promise<void> {
  const timeoutAt = Date.now() + 10_000

  while (Date.now() < timeoutAt) {
    const survivor = await getSurvivorRow(survivorId)
    if ((survivor as Record<string, unknown>)[field] === expected) return
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for survivor ${field}=${String(expected)}`)
}

/** Add Settlement Gear Fixture */
export async function addSettlementGearFixture(
  settlementId: string,
  gearName: string,
  quantity = 1
): Promise<string> {
  const { data: gear, error: gearError } = await admin
    .from('gear')
    .select('id')
    .eq('gear_name', gearName)
    .eq('custom', false)
    .limit(1)
    .single()

  if (gearError) throw new Error(`gear lookup failed: ${gearError.message}`)

  const { error } = await admin.from('settlement_gear').insert({
    gear_id: gear.id,
    quantity,
    settlement_id: settlementId
  })

  if (error) throw new Error(`settlement gear insert failed: ${error.message}`)

  return gear.id
}

/** Get Survivor Gear Grid */
export async function getSurvivorGearGrid(survivorId: string) {
  const { data, error } = await admin
    .from('gear_grid')
    .select('*')
    .eq('survivor_id', survivorId)
    .maybeSingle()

  if (error) throw new Error(`gear grid lookup failed: ${error.message}`)

  return data
}

/** Wait For Gear Grid Slot */
export async function waitForGearGridSlot(
  survivorId: string,
  slotColumn: string,
  expectedGearId: string | null
): Promise<void> {
  const timeoutAt = Date.now() + 10_000

  while (Date.now() < timeoutAt) {
    const grid = await getSurvivorGearGrid(survivorId)
    if (
      ((grid as Record<string, unknown> | null)?.[slotColumn] ?? null) ===
      expectedGearId
    )
      return
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for ${slotColumn}=${expectedGearId}`)
}
