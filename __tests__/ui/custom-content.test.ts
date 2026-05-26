import {
  assertLoginPage,
  createAuthAccount,
  createConfirmedAuthAccount
} from '@/__tests__/ui/helpers/auth'
import {
  attachDisorderToSurvivorFixture,
  countGearResourceCosts,
  findCustomDisorderByName,
  getCustomDisorderById,
  getWeaponTypeId,
  waitForCustomDisorderByName,
  waitForCustomGearByName,
  waitForMissingCustomGear
} from '@/__tests__/ui/helpers/custom-content'
import { createSettlementFixture } from '@/__tests__/ui/helpers/settlement'
import { deleteUsersByEmail } from '@/__tests__/ui/helpers/supabase'
import { createSurvivorFixture } from '@/__tests__/ui/helpers/survivor'
import { LOCAL_STORAGE_KEY } from '@/lib/common'
import { TabType } from '@/lib/enums'
import { CATALOG_PERMANENT_DELETE_BLOCKED_MESSAGE } from '@/lib/messages'
import { expect, type Page, test } from '@playwright/test'

test.describe('custom content flow', () => {
  const emailsToDelete = new Set<string>()

  test.afterEach(async () => {
    await deleteUsersByEmail(emailsToDelete)
    emailsToDelete.clear()
  })

  test('creates, edits, attaches, archives, and guards custom disorder content', async ({
    page
  }) => {
    test.slow()

    const { account, settlementId, survivorId, userId } =
      await createCustomScenario('disorder')
    emailsToDelete.add(account.email)
    const baseName = `E2E Flickering Dread ${crypto.randomUUID().slice(0, 8)}`
    const editedName = `${baseName} Revised`

    await openUserContent(page, account, settlementId)
    await selectCustomContentCategory(page, 'Survivors')

    await page.getByRole('button', { name: 'Add disorder' }).click()
    let dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'Create Custom Disorder' })
    ).toBeVisible()
    await dialog.getByLabel('Disorder Name').fill(baseName)
    await dialog
      .locator('textarea')
      .fill(
        '<script>alert("lantern")</script>\n\n**When departing**, gain +1 courage.'
      )
    await dialog.getByRole('button', { name: 'Create' }).click()

    const created = await waitForCustomDisorderByName(userId, baseName)
    expect(created.rules).toContain('When departing')

    await page.getByRole('button', { name: `Edit ${baseName}` }).click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'Edit Disorder' })
    ).toBeVisible()
    await dialog.getByLabel('Disorder Name').fill(editedName)
    await dialog
      .locator('textarea')
      .fill('**When departing**, gain +2 courage. Keep the lantern close.')
    await dialog.getByRole('button', { name: 'Save' }).click()

    await expect
      .poll(() => findCustomDisorderByName(userId, editedName))
      .not.toBeNull()

    const edited = await waitForCustomDisorderByName(userId, editedName)
    const blockerAccount = createAuthAccount('custom_blocker')
    emailsToDelete.add(blockerAccount.email)
    const blockerUser = await createConfirmedAuthAccount(blockerAccount)
    const blockerSettlementId = await createSettlementFixture({
      name: `E2E Custom blocker ${crypto.randomUUID().slice(0, 8)}`,
      userId: blockerUser.id
    })
    const blockerSurvivorId = await createSurvivorFixture({
      settlementId: blockerSettlementId,
      name: 'E2E Blocker Survivor'
    })
    await attachDisorderToSurvivorFixture({
      disorderId: edited.id,
      settlementId: blockerSettlementId,
      survivorId: blockerSurvivorId
    })

    await attachDisorderToSurvivorFixture({
      disorderId: edited.id,
      settlementId,
      survivorId
    })

    await selectAppTab(page, settlementId, TabType.SURVIVORS, survivorId)
    await expect(page.getByRole('button', { name: editedName })).toBeVisible()
    await page.getByRole('button', { name: editedName }).click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: editedName })
    ).toBeVisible()
    await expect(dialog.getByText('gain +2 courage')).toBeVisible()
    await expect(dialog).not.toContainText('alert("lantern")')
    await page.keyboard.press('Escape')

    await selectAppTab(page, settlementId, TabType.USER)
    await selectCustomContentCategory(page, 'Survivors')
    await page.getByRole('button', { name: `Delete ${editedName}` }).click()
    await expect
      .poll(async () =>
        Boolean((await getCustomDisorderById(edited.id))?.archived_at)
      )
      .toBe(true)

    await selectAppTab(page, settlementId, TabType.USER)
    await selectCustomContentCategory(page, 'Archived')
    await expect(page.getByText(editedName)).toBeVisible()
    await page
      .getByRole('button', { name: `Permanently delete ${editedName}` })
      .click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Delete forever' })
      .click()
    await expect(
      page.getByText(CATALOG_PERMANENT_DELETE_BLOCKED_MESSAGE())
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: `Permanently delete ${editedName}` })
    ).toBeVisible()
  })

  test('creates, edits, and deletes custom gear with nested cost fields', async ({
    page
  }) => {
    test.slow()

    const { account, settlementId, userId } = await createCustomScenario('gear')
    emailsToDelete.add(account.email)
    const gearName = `E2E Lantern Cutter ${crypto.randomUUID().slice(0, 8)}`
    const editedGearName = `${gearName} Tempered`
    const swordWeaponTypeId = await getWeaponTypeId('Sword')

    await openUserContent(page, account, settlementId)
    await selectCustomContentCategory(page, 'Crafting')

    await page.getByRole('button', { name: 'Add custom gear' }).click()
    let dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'Create Custom Gear' })
    ).toBeVisible()
    await selectOption(page, 'Gear type selector', 'Weapon')
    await dialog.getByPlaceholder('Gear Name').fill(gearName)
    await setNumericValue(page, 'Speed', 2)
    await setNumericValue(page, 'Accuracy', 7)
    await setNumericValue(page, 'Strength', 3)
    await selectCommandItem(page, 'Weapon type selector', 'Sword')
    await dialog
      .getByPlaceholder('Special rules text.')
      .fill('After attack, **archive one wound** in the dark.')
    await dialog.getByRole('button', { name: 'Add resource cost' }).click()
    await selectCommandItem(page, 'Cost resource 1 selector', 'Monster Bone')
    await dialog.getByRole('button', { name: 'Create' }).click()

    const createdGear = await waitForCustomGearByName(userId, gearName)
    expect(createdGear.speed).toBe(2)
    expect(createdGear.accuracy).toBe(7)
    expect(createdGear.strength).toBe(3)
    expect(createdGear.weapon_type_id).toBe(swordWeaponTypeId)
    await expect.poll(() => countGearResourceCosts(createdGear.id)).toBe(1)

    await page.getByRole('button', { name: `Edit ${gearName}` }).click()
    dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'Edit Gear' })
    ).toBeVisible()
    await dialog.getByPlaceholder('Gear Name').fill(editedGearName)
    await setNumericValue(page, 'Strength', 4)
    await dialog.getByRole('button', { name: 'Save' }).click()

    const editedGear = await waitForCustomGearByName(userId, editedGearName)
    expect(editedGear.strength).toBe(4)
    await expect.poll(() => countGearResourceCosts(editedGear.id)).toBe(1)

    await page.getByRole('button', { name: `Delete ${editedGearName}` }).click()
    await waitForMissingCustomGear(userId, editedGearName)
  })
})

async function createCustomScenario(prefix: string) {
  const account = createAuthAccount(`custom_${prefix}`.slice(0, 20))
  const user = await createConfirmedAuthAccount(account)
  const settlementId = await createSettlementFixture({
    name: `E2E Custom ${prefix}`,
    userId: user.id
  })
  const survivorId = await createSurvivorFixture({
    settlementId,
    name: `E2E Custom ${prefix} Survivor`
  })

  return { account, settlementId, survivorId, userId: user.id }
}

async function openUserContent(
  page: Page,
  account: { email: string; password: string; username: string },
  settlementId: string
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
  await selectAppTab(page, settlementId, TabType.USER)
  await expect(page.getByText('Custom Content')).toBeVisible()
}

async function selectAppTab(
  page: Page,
  settlementId: string,
  selectedTab: TabType,
  selectedSurvivorId: string | null = null
): Promise<void> {
  await page.evaluate(
    ({ selectedSettlementId, selectedSurvivorId, selectedTab, storageKey }) => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          selectedHuntId: null,
          selectedHuntMonsterIndex: 0,
          selectedSettlementId,
          selectedSettlementPhaseId: null,
          selectedShowdownId: null,
          selectedShowdownMonsterIndex: 0,
          selectedSurvivorId,
          selectedTab
        })
      )
    },
    {
      selectedSettlementId: settlementId,
      selectedSurvivorId,
      selectedTab,
      storageKey: LOCAL_STORAGE_KEY
    }
  )
  await page.reload()
}

async function selectCustomContentCategory(
  page: Page,
  category: string
): Promise<void> {
  await expect(page.getByText('Custom Content')).toBeVisible()

  const tab = page.getByRole('tab', { exact: true, name: category })
  if (await tab.isVisible({ timeout: 1_000 })) {
    await tab.click()
    return
  }

  await page.getByRole('combobox', { name: 'Custom content category' }).click()
  await page.getByRole('option', { exact: true, name: category }).click()
}

async function selectOption(
  page: Page,
  comboboxName: string,
  optionName: string
): Promise<void> {
  await page.getByRole('combobox', { name: comboboxName }).click()
  await page.getByRole('option', { exact: true, name: optionName }).click()
}

async function selectCommandItem(
  page: Page,
  triggerName: string,
  itemName: string
): Promise<void> {
  await page.getByRole('combobox', { name: triggerName }).click()
  await page.getByPlaceholder(/^Search/).fill(itemName)
  await page
    .locator('[data-slot="command-item"]')
    .filter({ hasText: itemName })
    .first()
    .click()
}

async function setNumericValue(
  page: Page,
  label: string,
  desiredValue: number
): Promise<void> {
  await page.getByRole('spinbutton', { exact: true, name: label }).click()
  const dialog = page.getByRole('dialog').last()
  await expect(dialog.getByRole('heading', { name: label })).toBeVisible()

  const value = dialog.getByRole('spinbutton', { name: `${label} value` })
  while (Number(await value.inputValue()) < desiredValue)
    await dialog.getByRole('button', { name: `Increase ${label}` }).click()
  while (Number(await value.inputValue()) > desiredValue)
    await dialog.getByRole('button', { name: `Decrease ${label}` }).click()

  await dialog.getByRole('button', { name: 'Save' }).click()
}
