import {
  admin,
  createTestUser,
  deleteTestUser,
  seedSettlement,
  shareSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * RLS — Custom-Content Visibility Under Transitive Sharing ([E2.11])
 *
 * The legacy `*_shared_user` matrix is gone (migrations
 * `20260514000000`..`20260520000000`). A custom catalog row is now visible
 * to a non-author iff it is attached, directly or transitively, to a
 * settlement that the non-author is a member of. Author write privilege is
 * unchanged — only the author may UPDATE or DELETE.
 *
 * This suite is the canonical permission-matrix lock for that posture.
 * Per-catalog smoke coverage lives in the four `catalog-*.test.ts`
 * neighbors; the four scenarios pinned here are intentionally repeated
 * across every distinct attachment chain so a regression that breaks one
 * chain is caught in one place:
 *
 *  1. **Stranger gets nothing** — no settlement membership, no SELECT.
 *  2. **Collaborator on attached settlement gets the row** — settlement
 *     owner (non-author) reads the collaborator-authored row through the
 *     attachment.
 *  3. **Author always gets the row** — the author reads their own row via
 *     `Allow select for owner and custom`, regardless of attachment.
 *  4. **Non-author cannot UPDATE** — only the author may modify the row;
 *     transitive SELECT never escalates to UPDATE.
 *
 * Attachment chains covered (issue #151):
 *   * `settlement_*` junction              — `knowledge` ↔ `settlement_knowledge`
 *   * `survivor_*` junction                — `disorder`  ↔ `survivor_disorder`
 *   * `survivor.<col>` direct reference    — `philosophy` ↔ `survivor.philosophy_id`
 *   * `hunt_monster_*` junction            — `trait`     ↔ `hunt_monster_trait`
 *   * `showdown_monster_*` junction        — `mood`      ↔ `showdown_monster_mood`
 *   * `armor_set` via `gear_grid`          — `armor_set` ↔ `gear_grid.selected_armor_set_id`
 *
 * Architecture: `local/sharing-architecture.md` §5.2 Decision 2, §10
 * Phase 2, Appendix A.
 */

interface ScenarioContext {
  /** Catalog table under test (e.g. `knowledge`) */
  catalog: string
  /** Custom row ID created by the collaborator */
  rowId: string
  /** Display-name column used to verify SELECT payload */
  nameCol: string
  /** Display-name value asserted on SELECT */
  nameValue: string
}

describe('RLS: custom-content visibility under transitive sharing', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let settlementId: string
  let survivorId: string

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()

    settlementId = await seedSettlement(
      owner.id,
      'Custom-Content Permission Matrix Settlement'
    )
    await shareSettlement(settlementId, collaborator.id, owner.id)

    const { data: sv, error: svErr } = await admin
      .from('survivor')
      .insert({
        settlement_id: settlementId,
        gender: 'FEMALE',
        survivor_name: 'Custom-Content Permission Matrix Survivor'
      })
      .select('id')
      .single()
    if (svErr || !sv) throw new Error(`seed survivor: ${svErr?.message}`)
    survivorId = sv.id
  })

  afterAll(async () => {
    await deleteTestUser(owner.id)
    await deleteTestUser(collaborator.id)
    await deleteTestUser(stranger.id)
  })

  /**
   * Run Scenario Matrix
   *
   * Pins the four canonical scenarios — stranger denied, non-author
   * collaborator allowed, author allowed, non-author UPDATE no-op —
   * against a single attached custom row.
   *
   * @param ctx Scenario Context
   */
  function runScenarioMatrix(getCtx: () => ScenarioContext): void {
    it('stranger gets nothing', async () => {
      const ctx = getCtx()
      const { data, error } = await stranger.client
        .from(ctx.catalog)
        .select('id')
        .eq('id', ctx.rowId)
        .maybeSingle()

      expect(error).toBeNull()
      expect(data).toBeNull()
    })

    it('collaborator on attached settlement gets the row', async () => {
      const ctx = getCtx()
      // The settlement owner is the "non-author collaborator" here — they
      // own the settlement but did not author the catalog row.
      const { data, error } = await owner.client
        .from(ctx.catalog)
        .select(`id, ${ctx.nameCol}`)
        .eq('id', ctx.rowId)
        .maybeSingle()

      expect(error).toBeNull()
      expect(data).not.toBeNull()
      expect((data as never)[ctx.nameCol]).toBe(ctx.nameValue)
    })

    it('author always gets the row', async () => {
      const ctx = getCtx()
      const { data, error } = await collaborator.client
        .from(ctx.catalog)
        .select(`id, ${ctx.nameCol}`)
        .eq('id', ctx.rowId)
        .maybeSingle()

      expect(error).toBeNull()
      expect(data).not.toBeNull()
      expect((data as never)[ctx.nameCol]).toBe(ctx.nameValue)
    })

    it('non-author cannot UPDATE the row', async () => {
      const ctx = getCtx()
      // RLS may surface this as PGRST116 (row not found by the UPDATE
      // policy) or as a 42501 policy violation, or silently affect zero
      // rows. The contract here is "the persisted row is unchanged"; we
      // verify that via the admin client.
      await owner.client
        .from(ctx.catalog)
        .update({ [ctx.nameCol]: 'HACKED BY NON-AUTHOR' })
        .eq('id', ctx.rowId)

      const { data: check, error: checkErr } = await admin
        .from(ctx.catalog)
        .select(ctx.nameCol)
        .eq('id', ctx.rowId)
        .single()

      expect(checkErr).toBeNull()
      expect((check as never)[ctx.nameCol]).toBe(ctx.nameValue)
    })
  }

  /* ------------------------------------------------------------------ */
  /* 1. Settlement junction (settlement_knowledge → knowledge)          */
  /* ------------------------------------------------------------------ */
  describe('attached via settlement junction', () => {
    const ctx: ScenarioContext = {
      catalog: 'knowledge',
      rowId: '',
      nameCol: 'knowledge_name',
      nameValue: ''
    }

    beforeAll(async () => {
      ctx.nameValue = `Whispered Truth ${Date.now()}-${Math.random()}`
      const { data: row, error: rowErr } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: ctx.nameValue,
          custom: true,
          user_id: collaborator.id,
          rules: 'A truth only the dark remembers.'
        })
        .select('id')
        .single()
      if (rowErr || !row) throw new Error(`seed knowledge: ${rowErr?.message}`)
      ctx.rowId = row.id

      const { error: linkErr } = await admin
        .from('settlement_knowledge')
        .insert({ settlement_id: settlementId, knowledge_id: row.id })
      if (linkErr)
        throw new Error(`attach settlement_knowledge: ${linkErr.message}`)
    })

    runScenarioMatrix(() => ctx)
  })

  /* ------------------------------------------------------------------ */
  /* 2. Survivor junction (survivor_disorder → disorder)                */
  /* ------------------------------------------------------------------ */
  describe('attached via survivor junction', () => {
    const ctx: ScenarioContext = {
      catalog: 'disorder',
      rowId: '',
      nameCol: 'disorder_name',
      nameValue: ''
    }

    beforeAll(async () => {
      ctx.nameValue = `Hollow Quiet ${Date.now()}-${Math.random()}`
      const { data: row, error: rowErr } = await admin
        .from('disorder')
        .insert({
          disorder_name: ctx.nameValue,
          custom: true,
          user_id: collaborator.id,
          rules: 'Despair gnaws at the edges of memory.'
        })
        .select('id')
        .single()
      if (rowErr || !row) throw new Error(`seed disorder: ${rowErr?.message}`)
      ctx.rowId = row.id

      const { error: linkErr } = await admin
        .from('survivor_disorder')
        .insert({ survivor_id: survivorId, disorder_id: row.id })
      if (linkErr)
        throw new Error(`attach survivor_disorder: ${linkErr.message}`)
    })

    runScenarioMatrix(() => ctx)
  })

  /* ------------------------------------------------------------------ */
  /* 3. Survivor column reference (survivor.philosophy_id → philosophy) */
  /* ------------------------------------------------------------------ */
  describe('referenced by survivor column', () => {
    const ctx: ScenarioContext = {
      catalog: 'philosophy',
      rowId: '',
      nameCol: 'philosophy_name',
      nameValue: ''
    }

    beforeAll(async () => {
      ctx.nameValue = `Lantern Philosophy ${Date.now()}-${Math.random()}`
      const { data: row, error: rowErr } = await admin
        .from('philosophy')
        .insert({
          philosophy_name: ctx.nameValue,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (rowErr || !row) throw new Error(`seed philosophy: ${rowErr?.message}`)
      ctx.rowId = row.id

      const { error: linkErr } = await admin
        .from('survivor')
        .update({ philosophy_id: row.id })
        .eq('id', survivorId)
      if (linkErr)
        throw new Error(`link survivor.philosophy_id: ${linkErr.message}`)
    })

    afterAll(async () => {
      // Detach so other matrix groups operating on the shared survivor
      // start with a clean slate.
      await admin
        .from('survivor')
        .update({ philosophy_id: null })
        .eq('id', survivorId)
    })

    runScenarioMatrix(() => ctx)
  })

  /* ------------------------------------------------------------------ */
  /* 4. Hunt monster junction (hunt_monster_trait → trait)              */
  /* ------------------------------------------------------------------ */
  describe('attached via hunt_monster junction', () => {
    const ctx: ScenarioContext = {
      catalog: 'trait',
      rowId: '',
      nameCol: 'trait_name',
      nameValue: ''
    }
    let huntSettlementId: string

    beforeAll(async () => {
      // `hunt.settlement_id` is unique, so spin up a fresh shared settlement
      // dedicated to the hunt chain.
      huntSettlementId = await seedSettlement(
        owner.id,
        `Custom-Content Hunt Test ${Date.now()}`
      )
      await shareSettlement(huntSettlementId, collaborator.id, owner.id)

      ctx.nameValue = `Hunt Trait ${Date.now()}-${Math.random()}`
      const { data: row, error: rowErr } = await admin
        .from('trait')
        .insert({
          trait_name: ctx.nameValue,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (rowErr || !row) throw new Error(`seed trait: ${rowErr?.message}`)
      ctx.rowId = row.id

      const { data: hunt, error: huntErr } = await admin
        .from('hunt')
        .insert({ settlement_id: huntSettlementId, monster_level: 1 })
        .select('id')
        .single()
      if (huntErr || !hunt) throw new Error(`seed hunt: ${huntErr?.message}`)

      const { data: ad, error: adErr } = await admin
        .from('hunt_ai_deck')
        .insert({ hunt_id: hunt.id, settlement_id: huntSettlementId })
        .select('id')
        .single()
      if (adErr || !ad) throw new Error(`seed hunt_ai_deck: ${adErr?.message}`)

      const { data: hm, error: hmErr } = await admin
        .from('hunt_monster')
        .insert({
          ai_deck_id: ad.id,
          hunt_id: hunt.id,
          settlement_id: huntSettlementId
        })
        .select('id')
        .single()
      if (hmErr || !hm) throw new Error(`seed hunt_monster: ${hmErr?.message}`)

      const { error: linkErr } = await admin
        .from('hunt_monster_trait')
        .insert({ hunt_monster_id: hm.id, trait_id: row.id })
      if (linkErr)
        throw new Error(`attach hunt_monster_trait: ${linkErr.message}`)
    })

    runScenarioMatrix(() => ctx)
  })

  /* ------------------------------------------------------------------ */
  /* 5. Showdown monster junction (showdown_monster_mood → mood)        */
  /* ------------------------------------------------------------------ */
  describe('attached via showdown_monster junction', () => {
    const ctx: ScenarioContext = {
      catalog: 'mood',
      rowId: '',
      nameCol: 'mood_name',
      nameValue: ''
    }
    let showdownSettlementId: string

    beforeAll(async () => {
      // `showdown.settlement_id` is unique, so spin up a fresh shared
      // settlement dedicated to the showdown chain.
      showdownSettlementId = await seedSettlement(
        owner.id,
        `Custom-Content Showdown Test ${Date.now()}`
      )
      await shareSettlement(showdownSettlementId, collaborator.id, owner.id)

      ctx.nameValue = `Showdown Mood ${Date.now()}-${Math.random()}`
      const { data: row, error: rowErr } = await admin
        .from('mood')
        .insert({
          mood_name: ctx.nameValue,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (rowErr || !row) throw new Error(`seed mood: ${rowErr?.message}`)
      ctx.rowId = row.id

      const { data: showdown, error: showdownErr } = await admin
        .from('showdown')
        .insert({ settlement_id: showdownSettlementId, monster_level: 1 })
        .select('id')
        .single()
      if (showdownErr || !showdown)
        throw new Error(`seed showdown: ${showdownErr?.message}`)

      const { data: ad, error: adErr } = await admin
        .from('showdown_ai_deck')
        .insert({
          showdown_id: showdown.id,
          settlement_id: showdownSettlementId
        })
        .select('id')
        .single()
      if (adErr || !ad)
        throw new Error(`seed showdown_ai_deck: ${adErr?.message}`)

      const { data: sm, error: smErr } = await admin
        .from('showdown_monster')
        .insert({
          ai_deck_id: ad.id,
          showdown_id: showdown.id,
          settlement_id: showdownSettlementId
        })
        .select('id')
        .single()
      if (smErr || !sm)
        throw new Error(`seed showdown_monster: ${smErr?.message}`)

      const { error: linkErr } = await admin
        .from('showdown_monster_mood')
        .insert({ showdown_monster_id: sm.id, mood_id: row.id })
      if (linkErr)
        throw new Error(`attach showdown_monster_mood: ${linkErr.message}`)
    })

    runScenarioMatrix(() => ctx)
  })

  /* ------------------------------------------------------------------ */
  /* 6. Armor chain (gear_grid.selected_armor_set_id → armor_set)       */
  /* ------------------------------------------------------------------ */
  describe('attached via gear_grid armor selection', () => {
    const ctx: ScenarioContext = {
      catalog: 'armor_set',
      rowId: '',
      nameCol: 'armor_set_name',
      nameValue: ''
    }

    beforeAll(async () => {
      ctx.nameValue = `Lantern Armor ${Date.now()}-${Math.random()}`
      const { data: row, error: rowErr } = await admin
        .from('armor_set')
        .insert({
          armor_set_name: ctx.nameValue,
          custom: true,
          user_id: collaborator.id
        })
        .select('id')
        .single()
      if (rowErr || !row) throw new Error(`seed armor_set: ${rowErr?.message}`)
      ctx.rowId = row.id

      // A single non-required slot keeps `armor_set_qualifies` true so the
      // gear_grid BEFORE trigger doesn't clear our selection.
      const { error: slotErr } = await admin.from('armor_set_slot').insert({
        armor_set_id: row.id,
        slot_name: 'Head',
        slot_order: 0,
        required: false
      })
      if (slotErr) throw new Error(`seed armor_set_slot: ${slotErr.message}`)

      const { data: gg, error: ggErr } = await admin
        .from('gear_grid')
        .insert({
          survivor_id: survivorId,
          selected_armor_set_id: row.id
        })
        .select('id, selected_armor_set_id')
        .single()
      if (ggErr || !gg) throw new Error(`seed gear_grid: ${ggErr?.message}`)
      if (gg.selected_armor_set_id !== row.id)
        throw new Error(
          'gear_grid.selected_armor_set_id was cleared by the unqualified-armor-set trigger — test setup is incorrect.'
        )
    })

    runScenarioMatrix(() => ctx)
  })

  /* ------------------------------------------------------------------ */
  /* Negative: unattached custom rows stay author-only                  */
  /* ------------------------------------------------------------------ */
  describe('unattached custom rows', () => {
    it('non-author cannot SELECT a custom row that no attachment references', async () => {
      const { data: row, error: rowErr } = await admin
        .from('knowledge')
        .insert({
          knowledge_name: `Orphan Knowledge ${Date.now()}-${Math.random()}`,
          custom: true,
          user_id: collaborator.id,
          rules: 'No settlement claims this knowledge.'
        })
        .select('id')
        .single()
      if (rowErr || !row) throw new Error(`seed knowledge: ${rowErr?.message}`)

      const { data: ownerRead, error: ownerErr } = await owner.client
        .from('knowledge')
        .select('id')
        .eq('id', row.id)
        .maybeSingle()
      expect(ownerErr).toBeNull()
      expect(ownerRead).toBeNull()

      const { data: strangerRead } = await stranger.client
        .from('knowledge')
        .select('id')
        .eq('id', row.id)
        .maybeSingle()
      expect(strangerRead).toBeNull()

      // Author still sees their own row regardless of attachment.
      const { data: authorRead, error: authorErr } = await collaborator.client
        .from('knowledge')
        .select('id')
        .eq('id', row.id)
        .maybeSingle()
      expect(authorErr).toBeNull()
      expect(authorRead).not.toBeNull()
    })
  })
})
