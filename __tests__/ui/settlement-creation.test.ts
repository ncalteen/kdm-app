import {
  assertAuthenticatedShell,
  createAuthAccount,
  createConfirmedAuthAccount,
  logIn
} from '@/__tests__/ui/helpers/auth'
import {
  countSettlementsForUser,
  waitForSettlementCreationSummary
} from '@/__tests__/ui/helpers/settlement'
import { deleteUsersByEmail } from '@/__tests__/ui/helpers/supabase'
import {
  CampaignType,
  DatabaseCampaignType,
  DatabaseSurvivorType,
  SurvivorType
} from '@/lib/enums'
import { expect, type Locator, type Page, test } from '@playwright/test'

interface SettlementCreationScenario {
  campaign: CampaignType
  expectedNemeses: string[]
  expectedQuarries: string[]
  expectedSurvivorCount?: number
  expectedSurvivorType: SurvivorType
  expectedTimelineEntries?: Record<number, string[]>
  locksMonsterSelection?: boolean
  locksScoutSelection?: boolean
  locksSurvivorType?: boolean
  name: string
  usesScouts: boolean
}

const SETTLEMENT_CREATION_SCENARIOS: SettlementCreationScenario[] = [
  {
    campaign: CampaignType.PEOPLE_OF_THE_LANTERN,
    expectedNemeses: [
      'Butcher',
      'Gold Smoke Knight',
      "King's Man",
      'The Hand',
      'Watcher'
    ],
    expectedQuarries: ['Phoenix', 'Screaming Antelope', 'White Lion'],
    expectedSurvivorType: SurvivorType.CORE,
    name: 'lantern',
    usesScouts: false
  },
  {
    campaign: CampaignType.PEOPLE_OF_THE_SUN,
    expectedNemeses: [
      'Butcher',
      "King's Man",
      'The Great Devourer (Sunstalker)',
      'The Hand'
    ],
    expectedQuarries: ['Phoenix', 'Screaming Antelope', 'White Lion'],
    expectedSurvivorType: SurvivorType.CORE,
    name: 'sun',
    usesScouts: false
  },
  {
    campaign: CampaignType.PEOPLE_OF_THE_STARS,
    expectedNemeses: [
      'Butcher',
      'Dying God (Dragon King)',
      "King's Man",
      'The Hand',
      'The Tyrant'
    ],
    expectedQuarries: ['Phoenix', 'Screaming Antelope', 'White Lion'],
    expectedSurvivorType: SurvivorType.CORE,
    name: 'stars',
    usesScouts: false
  },
  {
    campaign: CampaignType.PEOPLE_OF_THE_DREAM_KEEPER,
    expectedNemeses: [
      'Atnas the Child Eater',
      'Butcher',
      'Gambler',
      'Godhand',
      'The Hand'
    ],
    expectedQuarries: ['Crimson Crocodile', 'King', 'Smog Singers'],
    expectedSurvivorType: SurvivorType.ARC,
    expectedTimelineEntries: { 23: ['Wanderer - Luck'] },
    locksScoutSelection: true,
    locksSurvivorType: true,
    name: 'dream',
    usesScouts: true
  },
  {
    campaign: CampaignType.SQUIRES_OF_THE_CITADEL,
    expectedNemeses: [],
    expectedQuarries: [],
    expectedSurvivorCount: 4,
    expectedSurvivorType: SurvivorType.CORE,
    locksMonsterSelection: true,
    locksScoutSelection: true,
    locksSurvivorType: true,
    name: 'squires',
    usesScouts: false
  },
  {
    campaign: CampaignType.CUSTOM,
    expectedNemeses: [],
    expectedQuarries: [],
    expectedSurvivorType: SurvivorType.CORE,
    name: 'custom',
    usesScouts: false
  }
]

test.describe('settlement creation flow', () => {
  const emailsToDelete = new Set<string>()

  test.afterEach(async () => {
    await deleteUsersByEmail(emailsToDelete)
    emailsToDelete.clear()
  })

  for (const scenario of SETTLEMENT_CREATION_SCENARIOS) {
    test(`creates a ${scenario.campaign} settlement with campaign defaults`, async ({
      page
    }) => {
      const { account, user } = await createTestUser(scenario.name)
      emailsToDelete.add(account.email)
      const settlementName = `E2E ${scenario.name} ${crypto.randomUUID().slice(0, 8)}`

      await logIn(page, account)
      await openSettlementForm(page)
      await selectCampaign(page, scenario.campaign)
      await assertCampaignFormState(page, scenario)

      await page.getByPlaceholder('Settlement Name').fill(settlementName)
      await page.getByRole('button', { name: 'Light the lantern' }).click()

      const summary = await waitForSettlementCreationSummary(
        user.id,
        settlementName
      )
      await expect(page.getByText('Choose the campaign')).toBeHidden()

      expect(summary.campaign_type).toBe(
        DatabaseCampaignType[scenario.campaign]
      )
      expect(summary.survivor_type).toBe(
        DatabaseSurvivorType[scenario.expectedSurvivorType]
      )
      expect(summary.uses_scouts).toBe(scenario.usesScouts)
      expect(summary.quarryNames).toEqual([...scenario.expectedQuarries].sort())
      expect(summary.nemesisNames).toEqual([...scenario.expectedNemeses].sort())

      if (scenario.expectedSurvivorCount !== undefined)
        expect(summary.survivorCount).toBe(scenario.expectedSurvivorCount)

      for (const [year, expectedEntries] of Object.entries(
        scenario.expectedTimelineEntries ?? {}
      ))
        expect(summary.timelineEntriesByYear[Number(year)]).toEqual(
          expect.arrayContaining(expectedEntries)
        )
    })
  }

  test('surfaces validation feedback for a nameless settlement', async ({
    page
  }) => {
    const { account, user } = await createTestUser('nameless')
    emailsToDelete.add(account.email)

    await logIn(page, account)
    await openSettlementForm(page)
    await page.getByRole('button', { name: 'Light the lantern' }).click()

    await expect(
      page.getByText('A nameless settlement cannot be recorded.')
    ).toBeVisible()
    await expect(page.getByText('Found a settlement').first()).toBeVisible()
    await expect.poll(() => countSettlementsForUser(user.id)).toBe(0)
  })
})

async function createTestUser(prefix: string) {
  const account = createAuthAccount(`settle_${prefix}`.slice(0, 20))
  const user = await createConfirmedAuthAccount(account)
  return { account, user }
}

async function openSettlementForm(page: Page): Promise<void> {
  await assertAuthenticatedShell(page)
  await page.getByRole('button', { name: 'Found a settlement' }).click()
  await expect(page.getByText('Choose the campaign')).toBeVisible()
}

async function selectCampaign(
  page: Page,
  campaign: CampaignType
): Promise<void> {
  const campaignCombobox = settlementForm(page).getByRole('combobox').nth(0)

  await campaignCombobox.click()
  await page
    .locator('[data-slot="command-item"]')
    .filter({ hasText: campaign })
    .click()
  await expect(campaignCombobox).toContainText(campaign)
}

async function assertCampaignFormState(
  page: Page,
  scenario: SettlementCreationScenario
): Promise<void> {
  const form = settlementForm(page)
  const survivorTypeCombobox = form.getByRole('combobox').nth(1)
  const wanderersCombobox = form.getByRole('combobox').nth(2)
  const firstMonsterNodeCombobox = form.getByRole('combobox').nth(3)
  const scoutsSwitch = form.getByRole('switch')

  await expect(survivorTypeCombobox).toContainText(
    scenario.expectedSurvivorType
  )
  await expect(scoutsSwitch).toHaveAttribute(
    'data-state',
    scenario.usesScouts ? 'checked' : 'unchecked'
  )

  await assertDisabledState(
    survivorTypeCombobox,
    scenario.locksSurvivorType ?? false
  )
  await assertDisabledState(scoutsSwitch, scenario.locksScoutSelection ?? false)
  await assertDisabledState(
    wanderersCombobox,
    scenario.locksMonsterSelection ?? false
  )
  await assertDisabledState(
    firstMonsterNodeCombobox,
    scenario.locksMonsterSelection ?? false
  )
}

async function assertDisabledState(
  locator: Locator,
  disabled: boolean
): Promise<void> {
  if (disabled) await expect(locator).toBeDisabled()
  else await expect(locator).toBeEnabled()
}

function settlementForm(page: Page): Locator {
  return page.locator('form')
}
