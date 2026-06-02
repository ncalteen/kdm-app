import {
  assertLoginPage,
  createAuthAccount,
  createConfirmedAuthAccount
} from '@/__tests__/ui/helpers/auth'
import {
  addSurvivorGearGridFixture,
  countHuntsForSettlement,
  countReturningSurvivors,
  createActiveHuntFixture,
  createEncounterMonsterFixture,
  createGameplaySurvivorsFixture,
  createSettlementPhaseAtStepFixture,
  findEncounterSurvivorWithBleedingTokens,
  getEncounterSummary,
  getHuntBoardSpace,
  getHuntSummary,
  getHuntSurvivorBleedingTokens,
  getSettlementPhaseStep,
  getShowdownSummary,
  getShowdownSurvivorBleedingTokens,
  getShowdownTurn,
  unlockNemesisFixture,
  unlockQuarryFixture,
  waitForActiveEncounter,
  waitForActiveHunt,
  waitForActiveSettlementPhase,
  waitForActiveShowdown,
  waitForNoActiveEncounter,
  waitForNoActiveHunt,
  waitForNoActiveShowdown,
  type GameplaySurvivorFixture
} from '@/__tests__/ui/helpers/gameplay'
import {
  createSettlementFixture,
  createShowdownFixture,
  showdownExists
} from '@/__tests__/ui/helpers/settlement'
import { deleteUsersByEmail } from '@/__tests__/ui/helpers/supabase'
import { LOCAL_STORAGE_KEY } from '@/lib/common'
import { TabType } from '@/lib/enums'
import {
  EMBARK_GEAR_SHORTAGE_ERROR_MESSAGE,
  ERROR_MESSAGE,
  SHOWDOWN_ALREADY_ACTIVE_ERROR_MESSAGE
} from '@/lib/messages'
import { expect, test, type Page } from '@playwright/test'

test.describe('gameplay loop flow', () => {
  const emailsToDelete = new Set<string>()

  test.afterEach(async () => {
    await deleteUsersByEmail(emailsToDelete)
    emailsToDelete.clear()
  })

  test('carries a hunt through showdown and settlement phase', async ({
    page
  }) => {
    test.slow()

    const { account, settlementId, survivors } = await createGameplayScenario(
      'happy',
      { survivorCount: 4 }
    )
    emailsToDelete.add(account.email)

    await openGameplayTab(page, account, settlementId, TabType.HUNT)
    await configureHunt(page, survivors.slice(0, 4))
    await page.getByRole('button', { name: 'Begin Hunt' }).click()

    const hunt = await waitForActiveHunt(settlementId)
    await expect
      .poll(() => getHuntSummary(hunt.id as string))
      .toEqual({
        aiDeckCount: 1,
        boardCount: 1,
        monsterCount: 1,
        survivorCount: 4
      })
    await expect(
      page.getByRole('button', { name: 'Begin Showdown' })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Begin Showdown' }).click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Proceed' })
      .click()

    await waitForNoActiveHunt(settlementId)
    const showdown = await waitForActiveShowdown(settlementId)
    const showdownSummary = await getShowdownSummary(showdown.id as string)
    expect(showdownSummary).toEqual({
      aiDeckCount: 1,
      monsterCount: 1,
      survivorCount: 4
    })

    await expect(
      page.getByRole('button', { name: 'Begin Settlement Phase' })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Begin Settlement Phase' }).click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Proceed' })
      .click()

    await waitForNoActiveShowdown(settlementId)
    const settlementPhase = await waitForActiveSettlementPhase(settlementId)
    expect(settlementPhase.step).toBe('SET_UP_SETTLEMENT')
    await expect
      .poll(() => countReturningSurvivors(settlementPhase.id as string))
      .toBe(4)
    await expect(page.getByText('Set Up Settlement')).toBeVisible()
  })

  test('validates hunt party constraints and gear shortages', async ({
    page
  }) => {
    const { account, settlementId, survivors } = await createGameplayScenario(
      'validation',
      { survivorCount: 5, usesScouts: true }
    )
    emailsToDelete.add(account.email)
    await addSurvivorGearGridFixture({
      gearName: 'Founding Stone',
      settlementId,
      survivorId: survivors[0].id
    })

    await openGameplayTab(page, account, settlementId, TabType.HUNT)
    await selectOption(page, 'Quarry', 'White Lion')

    const beginHuntButton = page.getByRole('button', { name: 'Begin Hunt' })
    await expect(beginHuntButton).toBeDisabled()

    await selectSurvivorParty(page, survivors.slice(0, 4))
    await expect(beginHuntButton).toBeDisabled()

    await page.getByRole('button', { name: 'Select scout...' }).click()
    const scoutDrawer = page.getByRole('dialog')
    await expect(
      scoutDrawer.getByRole('button', { name: new RegExp(survivors[0].name) })
    ).toBeDisabled()
    await scoutDrawer
      .getByRole('button', { name: new RegExp(survivors[4].name) })
      .click()
    await scoutDrawer.getByRole('button', { name: 'Confirm Selection' }).click()

    await expect(page.getByRole('button', { name: '1 scout' })).toBeVisible()
    await expect(beginHuntButton).toBeEnabled()

    await beginHuntButton.click()
    await expect(
      page.getByText(
        EMBARK_GEAR_SHORTAGE_ERROR_MESSAGE([
          { available: 0, gear_name: 'Founding Stone', needed: 1 }
        ])
      )
    ).toBeVisible()
    await expect.poll(() => countHuntsForSettlement(settlementId)).toBe(0)
  })

  test('pauses a hunt for an encounter and carries bleeding into showdown', async ({
    page
  }) => {
    test.slow()

    const { account, settlementId, survivors, userId } =
      await createGameplayScenario('encounter', { survivorCount: 4 })
    emailsToDelete.add(account.email)

    const encounterMonsterName = `E2E Encounter ${Date.now()}`
    await createEncounterMonsterFixture({
      monsterName: encounterMonsterName,
      subMonsterNames: ['E2E Lantern Mite', 'E2E Bone Mite'],
      userId
    })

    await openGameplayTab(page, account, settlementId, TabType.HUNT)
    await configureHunt(page, survivors.slice(0, 4))
    await page.getByRole('button', { name: 'Begin Hunt' }).click()

    const hunt = await waitForActiveHunt(settlementId)
    const huntId = hunt.id as string

    await page.getByRole('button', { name: 'Begin Encounter' }).click()
    const encounterDialog = page.getByRole('alertdialog')
    await expect(
      encounterDialog.getByRole('heading', { name: 'Begin Encounter' })
    ).toBeVisible()
    await selectOption(page, 'Encounter Monster', encounterMonsterName)
    await selectOption(page, 'Encounter Level', 'Level 1 (2 monsters)')
    await encounterDialog
      .getByRole('button', { name: 'Begin Encounter' })
      .click()

    const encounter = await waitForActiveEncounter(settlementId)
    const encounterId = encounter.id as string
    await expect
      .poll(() => getEncounterSummary(encounterId))
      .toEqual({
        monsterCount: 2,
        survivorCount: 4
      })
    await expect(page.getByText('E2E Lantern Mite')).toBeVisible()
    await page.getByRole('button', { name: 'Next encounter monster' }).click()
    await expect(page.getByText('E2E Bone Mite')).toBeVisible()

    await page.getByLabel('Bleeding Tokens', { exact: true }).click()
    const numericDialog = page.getByRole('dialog')
    await numericDialog
      .getByRole('button', { name: 'Increase Bleeding Tokens' })
      .click()
    await numericDialog
      .getByRole('button', { name: 'Increase Bleeding Tokens' })
      .click()
    await numericDialog.getByRole('button', { name: 'Save' }).click()
    let bleedingSurvivorId: string | null = null
    await expect
      .poll(async () => {
        bleedingSurvivorId = await findEncounterSurvivorWithBleedingTokens(
          encounterId,
          2
        )
        return bleedingSurvivorId
      })
      .not.toBeNull()

    if (!bleedingSurvivorId)
      throw new Error('Expected an encounter survivor with bleeding tokens')
    const editedSurvivorId = bleedingSurvivorId

    await page.getByRole('button', { name: 'Resume Hunt' }).click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Resume Hunt' })
      .click()

    await waitForNoActiveEncounter(settlementId)
    await expect
      .poll(() => getHuntSurvivorBleedingTokens(huntId, editedSurvivorId))
      .toBe(2)
    await expect(
      page.getByRole('button', { name: 'Begin Showdown' })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Begin Showdown' }).click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Proceed' })
      .click()

    await waitForNoActiveHunt(settlementId)
    const showdown = await waitForActiveShowdown(settlementId)
    await expect
      .poll(() =>
        getShowdownSurvivorBleedingTokens(
          showdown.id as string,
          editedSurvivorId
        )
      )
      .toBe(2)
  })

  test('blocks hunts while a showdown is already active', async ({ page }) => {
    const { account, settlementId, survivors } = await createGameplayScenario(
      'conflict',
      { survivorCount: 4 }
    )
    emailsToDelete.add(account.email)
    const showdownId = await createShowdownFixture(settlementId)

    await openGameplayTab(page, account, settlementId, TabType.HUNT)
    await configureHunt(page, survivors.slice(0, 4))
    await page.getByRole('button', { name: 'Begin Hunt' }).click()

    await expect(
      page.getByText(SHOWDOWN_ALREADY_ACTIVE_ERROR_MESSAGE())
    ).toBeVisible()
    await expect.poll(() => countHuntsForSettlement(settlementId)).toBe(0)
    await expect.poll(() => showdownExists(showdownId)).toBe(true)
  })

  test('persists and rolls back active hunt board edits', async ({ page }) => {
    const { account, settlementId, survivors } = await createGameplayScenario(
      'board',
      { survivorCount: 4 }
    )
    emailsToDelete.add(account.email)
    const { huntId } = await createActiveHuntFixture({
      settlementId,
      survivorIds: survivors.slice(0, 4).map((survivor) => survivor.id)
    })

    await openGameplayTab(page, account, settlementId, TabType.HUNT)
    await page
      .getByRole('button', { name: 'Hunt board space 1: BASIC' })
      .click()
    await expect.poll(() => getHuntBoardSpace(huntId, 1)).toBe('MONSTER')
    await expect(
      page.getByRole('button', { name: 'Hunt board space 1: MONSTER' })
    ).toBeVisible()

    await failNextRestPatch(page, '**/rest/v1/hunt_hunt_board*')
    await page
      .getByRole('button', { name: 'Hunt board space 1: MONSTER' })
      .click()

    await expect(getErrorToast(page)).toBeVisible()
    await expect.poll(() => getHuntBoardSpace(huntId, 1)).toBe('MONSTER')
    await expect(
      page.getByRole('button', { name: 'Hunt board space 1: MONSTER' })
    ).toBeVisible()
  })

  test('creates a regular showdown and rolls back failed turn updates', async ({
    page
  }) => {
    test.slow()

    const { account, settlementId, survivors } = await createGameplayScenario(
      'showdown',
      { survivorCount: 4 }
    )
    emailsToDelete.add(account.email)

    await openGameplayTab(page, account, settlementId, TabType.SHOWDOWN)
    await configureShowdown(page, {
      monsterName: 'White Lion',
      survivors: survivors.slice(0, 4),
      firstTurn: 'Survivors'
    })
    await page.getByRole('button', { name: 'Begin Showdown' }).click()

    const showdown = await waitForActiveShowdown(settlementId)
    const showdownId = showdown.id as string
    expect(showdown.showdown_type).toBe('REGULAR')
    expect(showdown.turn).toBe('SURVIVOR')
    await expect
      .poll(() => getShowdownSummary(showdownId))
      .toEqual({
        aiDeckCount: 1,
        monsterCount: 1,
        survivorCount: 4
      })

    await expect(page.getByText("Survivors' Turn")).toBeVisible()
    await expect(page.getByText('White Lion')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Move' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Activate' })).toBeVisible()

    await page.getByRole('button', { name: 'End Survivor Turn' }).click()
    await expect.poll(() => getShowdownTurn(showdownId)).toBe('MONSTER')
    await expect(
      page.getByRole('button', { name: 'End Monster Turn' })
    ).toBeVisible()

    await failNextRestPatch(page, '**/rest/v1/showdown*')
    await page.getByRole('button', { name: 'End Monster Turn' }).click()
    await expect(getErrorToast(page)).toBeVisible()
    await expect.poll(() => getShowdownTurn(showdownId)).toBe('MONSTER')
    await expect(
      page.getByRole('button', { name: 'End Monster Turn' })
    ).toBeVisible()

    await page.getByRole('button', { name: 'End Showdown' }).click()
    const dialog = page.getByRole('alertdialog')
    await expect(
      dialog.getByRole('heading', { name: 'End Showdown' })
    ).toBeVisible()
    await dialog.getByRole('button', { name: 'Go Back' }).click()
    await expect.poll(() => getShowdownTurn(showdownId)).toBe('MONSTER')
  })

  test('creates a special nemesis showdown from settlement phase and returns', async ({
    page
  }) => {
    test.slow()

    const { account, settlementId, survivors } = await createGameplayScenario(
      'special',
      { survivorCount: 4 }
    )
    emailsToDelete.add(account.email)
    const settlementPhaseId = await createSettlementPhaseAtStepFixture({
      returningSurvivorIds: survivors
        .slice(0, 4)
        .map((survivor) => survivor.id),
      settlementId,
      step: 'SPECIAL_SHOWDOWN'
    })

    await openGameplayTab(page, account, settlementId, TabType.SETTLEMENT_PHASE)
    await page
      .getByRole('button', { name: 'Proceed to Special Showdown' })
      .click()
    await expect(page.getByRole('combobox', { name: 'Monster' })).toBeVisible()
    await expect(
      page.getByRole('checkbox', { name: 'Special Showdown' })
    ).toBeChecked()

    await configureShowdown(page, {
      ambush: 'Monster',
      monsterName: 'Butcher',
      survivors: survivors.slice(0, 4)
    })
    await page.getByRole('button', { name: 'Begin Showdown' }).click()

    const showdown = await waitForActiveShowdown(settlementId)
    expect(showdown.showdown_type).toBe('SPECIAL')
    expect(showdown.ambush).toBe('MONSTER')
    expect(showdown.turn).toBe('MONSTER')

    await page
      .getByRole('button', { name: 'Return to Settlement Phase' })
      .click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Proceed' })
      .click()

    await waitForNoActiveShowdown(settlementId)
    await expect
      .poll(() => getSettlementPhaseStep(settlementPhaseId))
      .toBe('UPDATE_DEATH_COUNT')
    await expect(page.getByText('Update Death Count')).toBeVisible()
  })
})

async function createGameplayScenario(
  prefix: string,
  options: { survivorCount: number; usesScouts?: boolean }
) {
  const account = createAuthAccount(`gameplay_${prefix}`.slice(0, 20))
  const user = await createConfirmedAuthAccount(account)
  const settlementId = await createSettlementFixture({
    name: `E2E Gameplay ${prefix}`,
    usesScouts: options.usesScouts ?? false,
    userId: user.id
  })
  await Promise.all([
    unlockQuarryFixture(settlementId, 'White Lion'),
    unlockNemesisFixture(settlementId, 'Butcher')
  ])
  const survivors = await createGameplaySurvivorsFixture({
    count: options.survivorCount,
    prefix: `E2E ${prefix}`,
    settlementId
  })

  return { account, settlementId, survivors, userId: user.id }
}

async function openGameplayTab(
  page: Page,
  account: { email: string; password: string; username: string },
  settlementId: string,
  selectedTab: TabType
): Promise<void> {
  await page.goto('/auth/login')
  await page.evaluate(
    (storageKey) => localStorage.removeItem(storageKey),
    LOCAL_STORAGE_KEY
  )
  await assertLoginPage(page)
  await page.getByLabel('Email').fill(account.email)
  await page.getByLabel('Password').fill(account.password)
  await page.getByRole('button', { name: /^Login$/ }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.evaluate(
    ({ selectedSettlementId, selectedTab, storageKey }) => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          selectedHuntId: null,
          selectedHuntMonsterIndex: 0,
          selectedSettlementId,
          selectedSettlementPhaseId: null,
          selectedShowdownId: null,
          selectedShowdownMonsterIndex: 0,
          selectedSurvivorId: null,
          selectedTab
        })
      )
    },
    {
      selectedSettlementId: settlementId,
      selectedTab,
      storageKey: LOCAL_STORAGE_KEY
    }
  )
  await page.goto('/')
}

async function configureHunt(
  page: Page,
  survivors: GameplaySurvivorFixture[]
): Promise<void> {
  await selectOption(page, 'Quarry', 'White Lion')
  await selectSurvivorParty(page, survivors)
}

async function configureShowdown(
  page: Page,
  options: {
    ambush?: 'Monster' | 'None' | 'Survivors'
    firstTurn?: 'Monster' | 'Survivors'
    monsterName: string
    survivors: GameplaySurvivorFixture[]
  }
): Promise<void> {
  await selectOption(page, 'Monster', options.monsterName)
  if (options.ambush) await selectOption(page, 'Ambush', options.ambush)
  if (options.firstTurn)
    await selectOption(page, 'First Turn', options.firstTurn)
  await selectSurvivorParty(page, options.survivors)
}

async function selectSurvivorParty(
  page: Page,
  survivors: GameplaySurvivorFixture[]
): Promise<void> {
  await page.getByRole('button', { name: 'Select survivors...' }).click()
  const drawer = page.getByRole('dialog')

  for (const survivor of survivors)
    await drawer
      .getByRole('button', { name: new RegExp(escapeRegExp(survivor.name)) })
      .click()

  await drawer
    .getByRole('button', {
      name: new RegExp(`Confirm Selection \\(${survivors.length}/4\\)`)
    })
    .click()

  await expect(
    page.getByRole('button', { name: `${survivors.length} survivor(s)` })
  ).toBeVisible()
}

async function selectOption(
  page: Page,
  comboboxName: string,
  optionName: string
): Promise<void> {
  await page.getByRole('combobox', { name: comboboxName }).click()
  await page.getByRole('option', { exact: true, name: optionName }).click()
}

function getErrorToast(page: Page): ReturnType<Page['locator']> {
  return page
    .locator('[data-sonner-toast][data-type="error"]', {
      hasText: ERROR_MESSAGE()
    })
    .first()
}

async function failNextRestPatch(page: Page, url: string): Promise<void> {
  let failed = false

  await page.route(url, async (route) => {
    if (!failed && route.request().method() === 'PATCH') {
      failed = true
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'E2E gameplay mutation failure' })
      })
      return
    }

    await route.continue()
  })
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
