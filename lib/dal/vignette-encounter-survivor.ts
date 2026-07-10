import { createClient } from '@/lib/supabase/client'
import { VignetteEncounterSurvivorDetail } from '@/lib/types'
import { TablesUpdate } from '../database.types'

/**
 * Get Vignette Encounter Survivors
 *
 * Retrieves all survivors assigned to a vignette encounter.
 *
 * @param vignetteEncounterId Vignette Encounter ID
 * @returns Vignette Encounter Survivors
 */
export async function getVignetteEncounterSurvivors(
  vignetteEncounterId: string | null | undefined
): Promise<{ [key: string]: VignetteEncounterSurvivorDetail } | null> {
  if (!vignetteEncounterId) return null

  const supabase = createClient()

  const { data, error } = await supabase
    .from('vignette_encounter_survivor')
    .select(
      `
      id,
      vignette_encounter_id,
      accuracy,
      accuracy_tokens,
      activation_used,
      arm_armor,
      arm_light_damage,
      arm_heavy_damage,
      bleeding_tokens,
      block_tokens,
      body_armor,
      body_light_damage,
      body_heavy_damage, 
      brain_light_damage,
      courage,
      dead,
      deflect_tokens,
      evasion,
      evasion_tokens,
      gender,
      head_armor,
      head_heavy_damage,
      insanity,
      insanity_tokens,
      knocked_down,
      leg_armor,
      leg_light_damage,
      leg_heavy_damage,
      luck,
      luck_tokens,
      movement,
      movement_tokens,
      movement_used,
      notes,
      priority_target,
      retired,
      scout,
      speed,
      speed_tokens,
      strength,
      strength_tokens,
      survival,
      survival_tokens,
      survivor_name,
      survivor_type,
      understanding,
      waist_armor,
      waist_light_damage,
      waist_heavy_damage,
      weapon_proficiency,
      weapon_type_id,
      abilities_impairments:vignette_encounter_survivor_ability_impairment(
        id,
        vignette_encounter_survivor_id,
        ability_impairment_id,
        ability_impairment(
          id,
          custom,
          ability_impairment_name,
          rules
        )
      ),
      disorders:vignette_encounter_survivor_disorder(
        id,
        vignette_encounter_survivor_id,
        disorder_id,
        disorder(
          id,
          custom,
          disorder_name,
          rules
        )
      ),
      fighting_arts:vignette_encounter_survivor_fighting_art(
        id,
        vignette_encounter_survivor_id,
        fighting_art_id,
        fighting_art(
          id,
          custom,
          fighting_art_name,
          rules
        )
      ),
      secret_fighting_arts:vignette_encounter_survivor_secret_fighting_art(
        id,
        vignette_encounter_survivor_id,
        secret_fighting_art_id,
        secret_fighting_art(
          id,
          custom,
          secret_fighting_art_name,
          rules
        )
      ),
      gear_grid:vignette_encounter_survivor_gear_grid(
        id,
        vignette_encounter_survivor_id,
        pos_top_left,
        pos_top_center,
        pos_top_right,
        pos_mid_left,
        pos_mid_center,
        pos_mid_right,
        pos_bottom_left,
        pos_bottom_center,
        pos_bottom_right,
        selected_armor_set_id
      ),
      weapon_type(
        id,
        custom,
        weapon_type_name,
        master_proficiency_rules,
        specialist_proficiency_rules
      )
      `
    )
    .eq('vignette_encounter_id', vignetteEncounterId)

  if (error)
    throw new Error(
      `Error Fetching Vignette Encounter Survivors: ${error.message}`
    )
  if (!data) return null

  const vignetteEncounterSurvivorMap: {
    [key: string]: VignetteEncounterSurvivorDetail
  } = {}

  for (const s of data ?? []) {
    const {
      accuracy_tokens,
      activation_used,
      arm_heavy_damage,
      arm_light_damage,
      bleeding_tokens,
      block_tokens,
      body_heavy_damage,
      body_light_damage,
      brain_light_damage,
      dead,
      deflect_tokens,
      evasion_tokens,
      head_heavy_damage,
      insanity_tokens,
      knocked_down,
      leg_heavy_damage,
      leg_light_damage,
      luck_tokens,
      movement_tokens,
      movement_used,
      notes,
      priority_target,
      retired,
      scout,
      speed_tokens,
      strength_tokens,
      survival,
      survival_tokens,
      waist_heavy_damage,
      waist_light_damage,
      ...survivor
    } = s

    vignetteEncounterSurvivorMap[s.id] = {
      ...survivor,
      live_state: {
        accuracy_tokens,
        activation_used,
        arm_heavy_damage,
        arm_light_damage,
        bleeding_tokens,
        block_tokens,
        body_heavy_damage,
        body_light_damage,
        brain_light_damage,
        dead,
        deflect_tokens,
        evasion_tokens,
        head_heavy_damage,
        insanity_tokens,
        knocked_down,
        leg_heavy_damage,
        leg_light_damage,
        luck_tokens,
        movement_tokens,
        movement_used,
        notes,
        priority_target,
        retired,
        scout,
        speed_tokens,
        strength_tokens,
        survival,
        survival_tokens,
        waist_heavy_damage,
        waist_light_damage
      }
    } as unknown as VignetteEncounterSurvivorDetail
  }

  return vignetteEncounterSurvivorMap
}

/**
 * Update Vignette Encounter Survivor
 *
 * Updates a vignette encounter survivor's data.
 *
 * @param survivorId Survivor ID
 * @param updateData Data to update
 * @returns Updated Vignette Encounter Survivor Data
 */
export async function updateVignetteEncounterSurvivor(
  survivorId: string,
  updateData: Omit<
    TablesUpdate<'vignette_encounter_survivor'>,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<void> {
  const supabase = createClient()
  const survivorUpdateData: TablesUpdate<'vignette_encounter_survivor'> = {
    ...updateData
  }

  delete survivorUpdateData.id

  const { error } = await supabase
    .from('vignette_encounter_survivor')
    .update(survivorUpdateData)
    .eq('id', survivorId)

  if (error)
    throw new Error(
      `Error Updating Vignette Encounter Survivor: ${error.message}`
    )
}
