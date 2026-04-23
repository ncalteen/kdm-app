import {
  admin,
  createTestUser,
  deleteTestUser,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — `*_shared_user` Tables
 *
 * Each shared-user join table lets the OWNER of the content grant access to
 * a second user. A share row must not be creatable or destructible by anyone
 * other than the owner (and, for deletes, potentially the shared user
 * themselves — tested per policy intent).
 *
 * The review focus is that **an unrelated attacker cannot manipulate share
 * rows** to escalate access. This spec verifies that invariant for every
 * `*_shared_user` table.
 */

interface ShareSpec {
  /** Parent catalog table */
  parent: string
  /** Share join table */
  share: string
  /** FK column from share → parent */
  fkCol: string
  /** Name column on the parent (for seeding) */
  nameCol: string
  /** Extra required columns on the parent */
  extras?: Record<string, unknown>
}

const SHARE_SPECS: ShareSpec[] = [
  {
    parent: 'ability_impairment',
    share: 'ability_impairment_shared_user',
    fkCol: 'ability_impairment_id',
    nameCol: 'ability_impairment_name'
  },
  {
    parent: 'character',
    share: 'character_shared_user',
    fkCol: 'character_id',
    nameCol: 'character_name'
  },
  {
    parent: 'collective_cognition_reward',
    share: 'collective_cognition_reward_shared_user',
    fkCol: 'collective_cognition_reward_id',
    nameCol: 'reward_name',
    extras: { collective_cognition: 1 }
  },
  {
    parent: 'disorder',
    share: 'disorder_shared_user',
    fkCol: 'disorder_id',
    nameCol: 'disorder_name'
  },
  {
    parent: 'fighting_art',
    share: 'fighting_art_shared_user',
    fkCol: 'fighting_art_id',
    nameCol: 'fighting_art_name'
  },
  {
    parent: 'gear',
    share: 'gear_shared_user',
    fkCol: 'gear_id',
    nameCol: 'gear_name'
  },
  {
    parent: 'innovation',
    share: 'innovation_shared_user',
    fkCol: 'innovation_id',
    nameCol: 'innovation_name'
  },
  {
    parent: 'knowledge',
    share: 'knowledge_shared_user',
    fkCol: 'knowledge_id',
    nameCol: 'knowledge_name'
  },
  {
    parent: 'location',
    share: 'location_shared_user',
    fkCol: 'location_id',
    nameCol: 'location_name'
  },
  {
    parent: 'milestone',
    share: 'milestone_shared_user',
    fkCol: 'milestone_id',
    nameCol: 'event_name',
    extras: { milestone_name: 'RLS-share-milestone-name' }
  },
  {
    parent: 'nemesis',
    share: 'nemesis_shared_user',
    fkCol: 'nemesis_id',
    nameCol: 'monster_name',
    extras: { node: 'NN1' }
  },
  {
    parent: 'neurosis',
    share: 'neurosis_shared_user',
    fkCol: 'neurosis_id',
    nameCol: 'neurosis_name'
  },
  {
    parent: 'pattern',
    share: 'pattern_shared_user',
    fkCol: 'pattern_id',
    nameCol: 'pattern_name'
  },
  {
    parent: 'philosophy',
    share: 'philosophy_shared_user',
    fkCol: 'philosophy_id',
    nameCol: 'philosophy_name'
  },
  {
    parent: 'principle',
    share: 'principle_shared_user',
    fkCol: 'principle_id',
    nameCol: 'principle_name',
    extras: { option_1_name: 'Opt 1', option_2_name: 'Opt 2' }
  },
  {
    parent: 'quarry',
    share: 'quarry_shared_user',
    fkCol: 'quarry_id',
    nameCol: 'monster_name',
    extras: { node: 'NQ1' }
  },
  {
    parent: 'resource',
    share: 'resource_shared_user',
    fkCol: 'resource_id',
    nameCol: 'resource_name',
    extras: { category: 'BASIC' }
  },
  {
    parent: 'secret_fighting_art',
    share: 'secret_fighting_art_shared_user',
    fkCol: 'secret_fighting_art_id',
    nameCol: 'secret_fighting_art_name'
  },
  {
    parent: 'seed_pattern',
    share: 'seed_pattern_shared_user',
    fkCol: 'seed_pattern_id',
    nameCol: 'seed_pattern_name'
  },
  {
    parent: 'strain_milestone',
    share: 'strain_milestone_shared_user',
    fkCol: 'strain_milestone_id',
    nameCol: 'strain_milestone_name'
  },
  {
    parent: 'settlement',
    share: 'settlement_shared_user',
    fkCol: 'settlement_id',
    nameCol: 'settlement_name',
    extras: {
      campaign_type: 'PEOPLE_OF_THE_LANTERN',
      survivor_type: 'CORE',
      current_year: 0,
      survival_limit: 1,
      uses_scouts: false,
      arrival_bonuses: [],
      departing_bonuses: [],
      monster_volumes: [],
      lantern_research: 0,
      notes: ''
    }
  },
  {
    parent: 'wanderer',
    share: 'wanderer_shared_user',
    fkCol: 'wanderer_id',
    nameCol: 'wanderer_name',
    extras: { gender: 'FEMALE' }
  },
  {
    parent: 'weapon_type',
    share: 'weapon_type_shared_user',
    fkCol: 'weapon_type_id',
    nameCol: 'weapon_type_name'
  }
]

describe('RLS: shared-user join tables', () => {
  let owner: TestUser
  let attacker: TestUser
  let guest: TestUser
  const parentIds = new Map<string, string>()

  beforeAll(async () => {
    owner = await createTestUser()
    attacker = await createTestUser()
    guest = await createTestUser()

    for (const spec of SHARE_SPECS) {
      const base = {
        [spec.nameCol]: `RLS-share-${spec.parent}`,
        ...spec.extras
      }
      const row =
        spec.parent === 'settlement'
          ? { ...base, user_id: owner.id }
          : { ...base, custom: true, user_id: owner.id }

      const { data, error } = await admin
        .from(spec.parent)
        .insert(row)
        .select('id')
        .single()
      if (error || !data)
        throw new Error(`seed ${spec.parent}: ${error?.message}`)
      parentIds.set(spec.parent, data.id)

      // Owner shares with `guest`.
      const { error: shareErr } = await admin.from(spec.share).insert({
        [spec.fkCol]: data.id,
        shared_user_id: guest.id,
        user_id: owner.id
      })
      if (shareErr) throw new Error(`share ${spec.share}: ${shareErr.message}`)
    }
  })

  afterAll(async () => {
    for (const spec of SHARE_SPECS) {
      const id = parentIds.get(spec.parent)
      if (id) await admin.from(spec.parent).delete().eq('id', id)
    }
    await deleteTestUser(owner.id)
    await deleteTestUser(attacker.id)
    await deleteTestUser(guest.id)
  })

  it.each(SHARE_SPECS)(
    '[$share] attacker cannot INSERT a share impersonating the owner',
    async (spec) => {
      const parentId = parentIds.get(spec.parent)!
      const { data, error } = await attacker.client
        .from(spec.share)
        .insert({
          [spec.fkCol]: parentId,
          shared_user_id: attacker.id, // try to grant themselves access
          user_id: owner.id
        })
        .select(spec.fkCol)
      expect(data ?? []).toEqual([])
      expect(error?.code).toMatch(/PGRST|42501/)
    }
  )

  it.each(SHARE_SPECS)(
    '[$share] attacker cannot DELETE an existing share they do not own',
    async (spec) => {
      const parentId = parentIds.get(spec.parent)!
      const { data } = await attacker.client
        .from(spec.share)
        .delete()
        .eq(spec.fkCol, parentId)
        .select(spec.fkCol)
      expect(data ?? []).toEqual([])

      // Confirm share still exists.
      const { data: check } = await admin
        .from(spec.share)
        .select(spec.fkCol)
        .eq(spec.fkCol, parentId)
      expect(check ?? []).toHaveLength(1)
    }
  )
})
