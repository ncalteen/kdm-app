import { admin } from '@/__tests__/ui/helpers/supabase'
import { type Database } from '@/lib/database.types'

type SettlementPhaseStep = Database['public']['Enums']['settlement_phase_step']

/** Economy Catalog Fixture */
export interface EconomyCatalogFixture {
  /** Butcher Settlement Nemesis ID */
  butcherSettlementNemesisId: string
  /** Death Settlement Principle ID */
  deathSettlementPrincipleId: string
  /** First Death Settlement Milestone ID */
  firstDeathSettlementMilestoneId: string
  /** Hovel Settlement Innovation ID */
  hovelSettlementInnovationId: string
  /** Lantern Hoard Settlement Location ID */
  lanternHoardSettlementLocationId: string
  /** White Lion Settlement Quarry ID */
  whiteLionSettlementQuarryId: string
}

/** Crafting Fixture */
export interface CraftingFixture {
  /** Crafted Gear ID */
  gearId: string
  /** Crafted Gear Name */
  gearName: string
  /** Resource ID */
  resourceId: string
  /** Resource Name */
  resourceName: string
}

/** Create Economy Survivor Fixture */
export async function createEconomySurvivorFixture(
  settlementId: string,
  name: string
): Promise<string> {
  const { data, error } = await admin
    .from('survivor')
    .insert({
      arm_armor: 2,
      arm_light_damage: true,
      body_armor: 2,
      body_light_damage: true,
      gender: 'FEMALE',
      head_armor: 2,
      head_heavy_damage: true,
      settlement_id: settlementId,
      survivor_name: name,
      survival: 1
    })
    .select('id')
    .single()

  if (error) throw new Error(`create survivor failed: ${error.message}`)

  return data.id
}

/** Create Settlement Phase Fixture */
export async function createEconomySettlementPhaseFixture({
  endeavors = 0,
  returningSurvivorIds = [],
  settlementId,
  step
}: {
  endeavors?: number
  returningSurvivorIds?: string[]
  settlementId: string
  step: SettlementPhaseStep
}): Promise<string> {
  const { data, error } = await admin
    .from('settlement_phase')
    .insert({ endeavors, settlement_id: settlementId, step })
    .select('id')
    .single()

  if (error) throw new Error(`create settlement phase failed: ${error.message}`)

  if (returningSurvivorIds.length > 0) {
    const { error: returningError } = await admin
      .from('settlement_phase_returning_survivor')
      .insert(
        returningSurvivorIds.map((survivorId) => ({
          settlement_id: settlementId,
          settlement_phase_id: data.id,
          survivor_id: survivorId
        }))
      )

    if (returningError)
      throw new Error(
        `create returning survivors failed: ${returningError.message}`
      )
  }

  return data.id
}

/** Get Settlement Phase Step */
export async function getSettlementPhaseStep(
  settlementPhaseId: string
): Promise<SettlementPhaseStep | null> {
  const { data, error } = await admin
    .from('settlement_phase')
    .select('step')
    .eq('id', settlementPhaseId)
    .maybeSingle()

  if (error) throw new Error(`settlement phase lookup failed: ${error.message}`)

  return data?.step ?? null
}

/** Settlement Phase Exists */
export async function economySettlementPhaseExists(
  settlementPhaseId: string
): Promise<boolean> {
  return (await getSettlementPhaseStep(settlementPhaseId)) !== null
}

/** Get Survivor Heal Fields */
export async function getSurvivorHealFields(survivorId: string) {
  const { data, error } = await admin
    .from('survivor')
    .select(
      'arm_armor, arm_light_damage, body_armor, body_light_damage, head_armor, head_heavy_damage'
    )
    .eq('id', survivorId)
    .single()

  if (error) throw new Error(`survivor lookup failed: ${error.message}`)

  return data
}

/** Create Crafting Fixture */
export async function createCraftingFixture({
  gearName,
  resourceName,
  resourceQuantity,
  userId,
  settlementId
}: {
  gearName: string
  resourceName: string
  resourceQuantity: number
  settlementId: string
  userId: string
}): Promise<CraftingFixture> {
  const resourceId = await getResourceId(resourceName)

  const { data: gear, error: gearError } = await admin
    .from('gear')
    .insert({ custom: true, gear_name: gearName, user_id: userId })
    .select('id')
    .single()

  if (gearError)
    throw new Error(`create custom gear failed: ${gearError.message}`)

  const { error: costError } = await admin.from('gear_resource_cost').insert({
    gear_id: gear.id,
    quantity: 1,
    resource_id: resourceId
  })

  if (costError)
    throw new Error(`create gear cost failed: ${costError.message}`)

  await addSettlementResourceFixture({
    quantity: resourceQuantity,
    resourceName,
    settlementId
  })

  return { gearId: gear.id, gearName, resourceId, resourceName }
}

/** Create Expensive Gear Fixture */
export async function createExpensiveGearFixture({
  gearName,
  quantity,
  resourceName,
  userId
}: {
  gearName: string
  quantity: number
  resourceName: string
  userId: string
}): Promise<string> {
  const resourceId = await getResourceId(resourceName)
  const { data: gear, error: gearError } = await admin
    .from('gear')
    .insert({ custom: true, gear_name: gearName, user_id: userId })
    .select('id')
    .single()

  if (gearError)
    throw new Error(`create expensive gear failed: ${gearError.message}`)

  const { error: costError } = await admin.from('gear_resource_cost').insert({
    gear_id: gear.id,
    quantity,
    resource_id: resourceId
  })

  if (costError)
    throw new Error(`create expensive gear cost failed: ${costError.message}`)

  return gear.id
}

/** Add Settlement Resource Fixture */
export async function addSettlementResourceFixture({
  quantity,
  resourceName,
  settlementId
}: {
  quantity: number
  resourceName: string
  settlementId: string
}): Promise<string> {
  const resourceId = await getResourceId(resourceName)
  const { data, error } = await admin
    .from('settlement_resource')
    .insert({ quantity, resource_id: resourceId, settlement_id: settlementId })
    .select('id')
    .single()

  if (error) throw new Error(`add settlement resource failed: ${error.message}`)

  return data.id
}

/** Get Settlement Resource Quantity */
export async function getSettlementResourceQuantity(
  settlementId: string,
  resourceName: string
): Promise<number | null> {
  const resourceId = await getResourceId(resourceName)
  const { data, error } = await admin
    .from('settlement_resource')
    .select('quantity')
    .eq('settlement_id', settlementId)
    .eq('resource_id', resourceId)
    .maybeSingle()

  if (error)
    throw new Error(`resource quantity lookup failed: ${error.message}`)

  return data?.quantity ?? null
}

/** Get Settlement Gear Quantity */
export async function getSettlementGearQuantity(
  settlementId: string,
  gearId: string
): Promise<number | null> {
  const { data, error } = await admin
    .from('settlement_gear')
    .select('quantity')
    .eq('settlement_id', settlementId)
    .eq('gear_id', gearId)
    .maybeSingle()

  if (error) throw new Error(`gear quantity lookup failed: ${error.message}`)

  return data?.quantity ?? null
}

/** Create Timeline Year Fixture */
export async function createTimelineYearFixture(
  settlementId: string,
  yearNumber = 0
): Promise<string> {
  const { data, error } = await admin
    .from('settlement_timeline_year')
    .insert({
      entries: [],
      settlement_id: settlementId,
      year_number: yearNumber
    })
    .select('id')
    .single()

  if (error) throw new Error(`create timeline year failed: ${error.message}`)

  return data.id
}

/** Get Timeline Entries */
export async function getTimelineEntries(
  settlementId: string,
  yearNumber = 0
): Promise<string[]> {
  const { data, error } = await admin
    .from('settlement_timeline_year')
    .select('entries')
    .eq('settlement_id', settlementId)
    .eq('year_number', yearNumber)
    .single()

  if (error) throw new Error(`timeline lookup failed: ${error.message}`)

  return data.entries ?? []
}

/** Create Catalog Junction Fixtures */
export async function createEconomyCatalogFixture(
  settlementId: string
): Promise<EconomyCatalogFixture> {
  const [
    milestoneId,
    principleId,
    innovationId,
    locationId,
    quarryId,
    nemesisId
  ] = await Promise.all([
    getCatalogId(
      'milestone',
      'milestone_name',
      'First time death count is updated'
    ),
    getCatalogId('principle', 'principle_name', 'Death'),
    getCatalogId('innovation', 'innovation_name', 'Hovel'),
    getCatalogId('location', 'location_name', 'Lantern Hoard'),
    getCatalogId('quarry', 'monster_name', 'White Lion'),
    getCatalogId('nemesis', 'monster_name', 'Butcher')
  ])

  const [milestone, principle, innovation, location, quarry, nemesis] =
    await Promise.all([
      insertJunction('settlement_milestone', {
        milestone_id: milestoneId,
        settlement_id: settlementId
      }),
      insertJunction('settlement_principle', {
        principle_id: principleId,
        settlement_id: settlementId
      }),
      insertJunction('settlement_innovation', {
        innovation_id: innovationId,
        settlement_id: settlementId
      }),
      insertJunction('settlement_location', {
        location_id: locationId,
        settlement_id: settlementId,
        unlocked: false
      }),
      insertJunction('settlement_quarry', {
        quarry_id: quarryId,
        settlement_id: settlementId,
        unlocked: false
      }),
      insertJunction('settlement_nemesis', {
        nemesis_id: nemesisId,
        settlement_id: settlementId,
        unlocked: false
      })
    ])

  return {
    butcherSettlementNemesisId: nemesis,
    deathSettlementPrincipleId: principle,
    firstDeathSettlementMilestoneId: milestone,
    hovelSettlementInnovationId: innovation,
    lanternHoardSettlementLocationId: location,
    whiteLionSettlementQuarryId: quarry
  }
}

/** Get Settlement Notes */
export async function getEconomySettlementNotes(
  settlementId: string
): Promise<string> {
  const { data, error } = await admin
    .from('settlement')
    .select('notes')
    .eq('id', settlementId)
    .single()

  if (error) throw new Error(`notes lookup failed: ${error.message}`)

  return data.notes
}

/** Get Milestone Complete */
export async function getMilestoneComplete(id: string): Promise<boolean> {
  const { data, error } = await admin
    .from('settlement_milestone')
    .select('complete')
    .eq('id', id)
    .single()

  if (error) throw new Error(`milestone lookup failed: ${error.message}`)

  return data.complete
}

/** Get Principle Options */
export async function getPrincipleOptions(id: string) {
  const { data, error } = await admin
    .from('settlement_principle')
    .select('option_1_selected, option_2_selected')
    .eq('id', id)
    .single()

  if (error) throw new Error(`principle lookup failed: ${error.message}`)

  return data
}

/** Get Location Unlocked */
export async function getLocationUnlocked(id: string): Promise<boolean> {
  const { data, error } = await admin
    .from('settlement_location')
    .select('unlocked')
    .eq('id', id)
    .single()

  if (error) throw new Error(`location lookup failed: ${error.message}`)

  return data.unlocked
}

/** Innovation Exists */
export async function economyInnovationExists(id: string): Promise<boolean> {
  const { data, error } = await admin
    .from('settlement_innovation')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(`innovation lookup failed: ${error.message}`)

  return Boolean(data)
}

/** Get Quarry Unlocked */
export async function getQuarryUnlocked(id: string): Promise<boolean> {
  const { data, error } = await admin
    .from('settlement_quarry')
    .select('unlocked')
    .eq('id', id)
    .single()

  if (error) throw new Error(`quarry lookup failed: ${error.message}`)

  return data.unlocked
}

/** Get Nemesis State */
export async function getNemesisState(id: string) {
  const { data, error } = await admin
    .from('settlement_nemesis')
    .select('unlocked, level_1_defeated')
    .eq('id', id)
    .single()

  if (error) throw new Error(`nemesis lookup failed: ${error.message}`)

  return data
}

async function getResourceId(resourceName: string): Promise<string> {
  return getCatalogId('resource', 'resource_name', resourceName)
}

async function getCatalogId(
  table:
    | 'innovation'
    | 'location'
    | 'milestone'
    | 'nemesis'
    | 'principle'
    | 'quarry'
    | 'resource',
  column:
    | 'innovation_name'
    | 'location_name'
    | 'milestone_name'
    | 'monster_name'
    | 'principle_name'
    | 'resource_name',
  value: string
): Promise<string> {
  const { data, error } = await admin
    .from(table)
    .select('id')
    .eq(column, value)
    .single()

  if (error) throw new Error(`${table} lookup failed: ${error.message}`)

  return data.id
}

async function insertJunction(
  table:
    | 'settlement_innovation'
    | 'settlement_location'
    | 'settlement_milestone'
    | 'settlement_nemesis'
    | 'settlement_principle'
    | 'settlement_quarry',
  values: Record<string, unknown>
): Promise<string> {
  const { data, error } = await admin
    .from(table)
    .insert(values)
    .select('id')
    .single()

  if (error) throw new Error(`${table} insert failed: ${error.message}`)

  return data.id
}
