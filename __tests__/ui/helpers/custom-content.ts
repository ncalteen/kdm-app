import { admin } from '@/__tests__/ui/helpers/supabase'

/** Custom Disorder Row */
export interface CustomDisorderRow {
  /** Archive Timestamp */
  archived_at: string | null
  /** Custom Flag */
  custom: boolean
  /** Disorder ID */
  id: string
  /** Disorder Name */
  disorder_name: string
  /** Rules */
  rules: string | null
  /** User ID */
  user_id: string | null
}

/** Custom Gear Row */
export interface CustomGearRow {
  /** Accuracy */
  accuracy: number | null
  /** Archive Timestamp */
  archived_at: string | null
  /** Custom Flag */
  custom: boolean
  /** Gear ID */
  id: string
  /** Gear Name */
  gear_name: string
  /** Rules */
  rules: string | null
  /** Speed */
  speed: number | null
  /** Strength */
  strength: number | null
  /** User ID */
  user_id: string | null
  /** Weapon Type ID */
  weapon_type_id: string | null
}

/** Find Custom Disorder By Name */
export async function findCustomDisorderByName(
  userId: string,
  disorderName: string
): Promise<CustomDisorderRow | null> {
  const { data, error } = await admin
    .from('disorder')
    .select('id, custom, disorder_name, rules, archived_at, user_id')
    .eq('user_id', userId)
    .eq('custom', true)
    .eq('disorder_name', disorderName)
    .maybeSingle()

  if (error) throw new Error(`custom disorder lookup failed: ${error.message}`)

  return data
}

/** Wait For Custom Disorder By Name */
export async function waitForCustomDisorderByName(
  userId: string,
  disorderName: string
): Promise<CustomDisorderRow> {
  const timeoutAt = Date.now() + 10_000

  while (Date.now() < timeoutAt) {
    const disorder = await findCustomDisorderByName(userId, disorderName)
    if (disorder) return disorder
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for custom disorder ${disorderName}`)
}

/** Find Custom Gear By Name */
export async function findCustomGearByName(
  userId: string,
  gearName: string
): Promise<CustomGearRow | null> {
  const { data, error } = await admin
    .from('gear')
    .select(
      'id, custom, gear_name, rules, archived_at, user_id, speed, accuracy, strength, weapon_type_id'
    )
    .eq('user_id', userId)
    .eq('custom', true)
    .eq('gear_name', gearName)
    .maybeSingle()

  if (error) throw new Error(`custom gear lookup failed: ${error.message}`)

  return data
}

/** Wait For Custom Gear By Name */
export async function waitForCustomGearByName(
  userId: string,
  gearName: string
): Promise<CustomGearRow> {
  const timeoutAt = Date.now() + 10_000

  while (Date.now() < timeoutAt) {
    const gear = await findCustomGearByName(userId, gearName)
    if (gear) return gear
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for custom gear ${gearName}`)
}

/** Wait For Missing Custom Gear */
export async function waitForMissingCustomGear(
  userId: string,
  gearName: string
): Promise<void> {
  const timeoutAt = Date.now() + 10_000

  while (Date.now() < timeoutAt) {
    const gear = await findCustomGearByName(userId, gearName)
    if (!gear) return
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for custom gear ${gearName} to disappear`)
}

/** Attach Disorder To Survivor Fixture */
export async function attachDisorderToSurvivorFixture({
  disorderId,
  settlementId,
  survivorId
}: {
  disorderId: string
  settlementId: string
  survivorId: string
}): Promise<void> {
  const { error } = await admin.from('survivor_disorder').insert({
    disorder_id: disorderId,
    settlement_id: settlementId,
    survivor_id: survivorId
  })

  if (error) throw new Error(`attach disorder failed: ${error.message}`)
}

/** Add Settlement Gear Fixture */
export async function addCustomGearToSettlementFixture({
  gearId,
  settlementId,
  quantity = 1
}: {
  gearId: string
  quantity?: number
  settlementId: string
}): Promise<string> {
  const { data, error } = await admin
    .from('settlement_gear')
    .insert({ gear_id: gearId, quantity, settlement_id: settlementId })
    .select('id')
    .single()

  if (error) throw new Error(`settlement gear insert failed: ${error.message}`)

  return data.id
}

/** Get Disorder By ID */
export async function getCustomDisorderById(
  disorderId: string
): Promise<CustomDisorderRow | null> {
  const { data, error } = await admin
    .from('disorder')
    .select('id, custom, disorder_name, rules, archived_at, user_id')
    .eq('id', disorderId)
    .maybeSingle()

  if (error) throw new Error(`custom disorder by id failed: ${error.message}`)

  return data
}

/** Count Gear Resource Costs */
export async function countGearResourceCosts(gearId: string): Promise<number> {
  const { count, error } = await admin
    .from('gear_resource_cost')
    .select('gear_id', { count: 'exact', head: true })
    .eq('gear_id', gearId)

  if (error)
    throw new Error(`gear resource cost count failed: ${error.message}`)

  return count ?? 0
}

/** Get Weapon Type ID */
export async function getWeaponTypeId(
  weaponTypeName = 'Sword'
): Promise<string> {
  const { data, error } = await admin
    .from('weapon_type')
    .select('id')
    .eq('weapon_type_name', weaponTypeName)
    .single()

  if (error) throw new Error(`weapon type lookup failed: ${error.message}`)

  return data.id
}
