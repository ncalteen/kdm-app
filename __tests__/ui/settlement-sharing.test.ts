import {
  assertLoginPage,
  createAuthAccount,
  createConfirmedAuthAccount,
  logIn
} from '@/__tests__/ui/helpers/auth'
import {
  createAttachedCustomKnowledgeFixture,
  createSettlementFixture,
  setSubscriptionPlanFixture,
  settlementShareExists,
  shareSettlementFixture,
  waitForSettlementNotes
} from '@/__tests__/ui/helpers/settlement'
import { deleteUsersByEmail } from '@/__tests__/ui/helpers/supabase'
import { LOCAL_STORAGE_KEY } from '@/lib/common'
import { TabType } from '@/lib/enums'
import {
  SETTLEMENT_SHARE_DUPLICATE_INVITE_MESSAGE,
  SETTLEMENT_SHARE_REVOKE_BLOCKED_MESSAGE,
  SETTLEMENT_SHARE_SELF_INVITE_MESSAGE,
  SETTLEMENT_SHARE_USERNAME_NOT_FOUND_MESSAGE,
  USERNAME_INVALID_FORMAT_MESSAGE
} from '@/lib/messages'
import { expect, test, type Page } from '@playwright/test'
import { type User } from '@supabase/supabase-js'

test.describe('settlement sharing flow', () => {
  const emailsToDelete = new Set<string>()

  test.afterEach(async () => {
    await deleteUsersByEmail(emailsToDelete)
    emailsToDelete.clear()
  })

  test('paid owner invites a collaborator who sees the shared settlement without reload', async ({
    browser,
    page
  }) => {
    const {
      collaborator,
      collaboratorAccount,
      owner,
      ownerAccount,
      settlementId
    } = await createSharingFixture('invite')
    emailsToDelete.add(ownerAccount.email)
    emailsToDelete.add(collaboratorAccount.email)

    const collaboratorContext = await browser.newContext()
    const collaboratorPage = await collaboratorContext.newPage()

    try {
      await logIn(collaboratorPage, collaboratorAccount)
      await expect(collaboratorPage.getByText('E2E Shared invite')).toBeHidden()

      await openSharingTab(page, ownerAccount, settlementId)
      await inviteCollaborator(page, collaboratorAccount.username)

      await expect(
        page.getByText(`@${collaboratorAccount.username}`)
      ).toBeVisible()
      await expect
        .poll(() =>
          settlementShareExists({
            settlementId,
            ownerId: owner.id,
            sharedUserId: collaborator.id
          })
        )
        .toBe(true)

      await openSettlementSwitcher(collaboratorPage)
      await expect(
        collaboratorPage.getByRole('menuitem', { name: /E2E Shared invite/ })
      ).toBeVisible()
    } finally {
      await collaboratorContext.close()
    }
  })

  test('surfaces sharing negative paths and paywall affordance', async ({
    page
  }) => {
    const { collaborator, collaboratorAccount, ownerAccount, settlementId } =
      await createSharingFixture('negative')
    emailsToDelete.add(ownerAccount.email)
    emailsToDelete.add(collaboratorAccount.email)

    await openSharingTab(page, ownerAccount, settlementId)
    await inviteCollaborator(page, 'bad name')
    await expect(
      page.getByText(USERNAME_INVALID_FORMAT_MESSAGE())
    ).toBeVisible()

    await inviteCollaborator(page, 'missing_user')
    await expect(
      page.getByText(SETTLEMENT_SHARE_USERNAME_NOT_FOUND_MESSAGE())
    ).toBeVisible()

    await inviteCollaborator(page, ownerAccount.username)
    await expect(
      page.getByText(SETTLEMENT_SHARE_SELF_INVITE_MESSAGE())
    ).toBeVisible()

    await inviteCollaborator(page, collaboratorAccount.username)
    await expect(
      page.getByText(`@${collaboratorAccount.username}`)
    ).toBeVisible()
    await expect
      .poll(() =>
        settlementShareExists({ settlementId, sharedUserId: collaborator.id })
      )
      .toBe(true)

    await inviteCollaborator(page, collaboratorAccount.username)
    await expect(
      page.getByText(SETTLEMENT_SHARE_DUPLICATE_INVITE_MESSAGE())
    ).toBeVisible()

    const freeAccount = createAuthAccount('share_free')
    emailsToDelete.add(freeAccount.email)
    const freeOwner = await createConfirmedAuthAccount(freeAccount)
    const freeSettlementId = await createSettlementFixture({
      name: 'E2E Shared free',
      userId: freeOwner.id
    })

    await openSharingTab(page, freeAccount, freeSettlementId)
    await expect(page.getByText('Your lantern burns alone.')).toBeVisible()
    await expect(page.getByLabel('Username')).toBeHidden()
    await page
      .getByRole('button', { name: /^Invite$/ })
      .last()
      .click()
    await expect(
      page.getByText('Sharing this settlement requires lighting a new lantern.')
    ).toBeVisible()
  })

  test('revokes collaborators and blocks revokes with attached custom content', async ({
    page
  }) => {
    const {
      collaborator,
      collaboratorAccount,
      owner,
      ownerAccount,
      settlementId
    } = await createSharingFixture('revoke')
    emailsToDelete.add(ownerAccount.email)
    emailsToDelete.add(collaboratorAccount.email)
    await shareSettlementFixture({
      settlementId,
      ownerId: owner.id,
      sharedUserId: collaborator.id
    })

    await openSharingTab(page, ownerAccount, settlementId)
    await expect(
      page.getByText(`@${collaboratorAccount.username}`)
    ).toBeVisible()

    await page
      .getByRole('button', {
        name: `Revoke share with @${collaboratorAccount.username}`
      })
      .click()
    await expect(
      page.getByText(`@${collaboratorAccount.username}`)
    ).toBeHidden()
    await expect
      .poll(() =>
        settlementShareExists({ settlementId, sharedUserId: collaborator.id })
      )
      .toBe(false)

    await shareSettlementFixture({
      settlementId,
      ownerId: owner.id,
      sharedUserId: collaborator.id
    })
    await createAttachedCustomKnowledgeFixture({
      settlementId,
      authorUserId: collaborator.id,
      name: 'E2E Shared Knowledge'
    })

    await page.reload()
    await expect(
      page.getByText(`@${collaboratorAccount.username}`)
    ).toBeVisible()
    await page
      .getByRole('button', {
        name: `Revoke share with @${collaboratorAccount.username}`
      })
      .click()

    await expect(
      page.getByRole('heading', {
        name: SETTLEMENT_SHARE_REVOKE_BLOCKED_MESSAGE()
      })
    ).toBeVisible()
    await expect(page.getByText('E2E Shared Knowledge')).toBeVisible()
    await expect
      .poll(() =>
        settlementShareExists({ settlementId, sharedUserId: collaborator.id })
      )
      .toBe(true)
  })

  test('collaborators can edit gameplay notes but cannot manage owner-only sharing or settings', async ({
    page
  }) => {
    const {
      collaborator,
      collaboratorAccount,
      owner,
      ownerAccount,
      settlementId
    } = await createSharingFixture('permissions')
    emailsToDelete.add(ownerAccount.email)
    emailsToDelete.add(collaboratorAccount.email)
    await shareSettlementFixture({
      settlementId,
      ownerId: owner.id,
      sharedUserId: collaborator.id
    })

    await openTab(page, collaboratorAccount, settlementId, TabType.NOTES)
    const note = `A shared note ${crypto.randomUUID().slice(0, 8)}`
    await page.getByPlaceholder('Add notes about your settlement...').fill(note)
    await page.getByRole('button', { name: 'Save Notes' }).click()
    await waitForSettlementNotes(settlementId, note)

    await openTab(
      page,
      collaboratorAccount,
      settlementId,
      TabType.SETTLEMENT_SETTINGS
    )
    await expect(page.getByText('Settlement Settings')).toBeHidden()
    await expect(page.getByText('Danger Zone')).toBeHidden()

    await openTab(page, collaboratorAccount, settlementId, TabType.SHARING)
    await expect(page.getByText('Light another lantern')).toBeHidden()
  })
})

async function createSharingFixture(prefix: string): Promise<{
  collaborator: User
  collaboratorAccount: { email: string; password: string; username: string }
  owner: User
  ownerAccount: { email: string; password: string; username: string }
  settlementId: string
}> {
  const ownerAccount = createAuthAccount(`share_owner_${prefix}`.slice(0, 20))
  const collaboratorAccount = createAuthAccount(
    `share_guest_${prefix}`.slice(0, 20)
  )
  const owner = await createConfirmedAuthAccount(ownerAccount)
  const collaborator = await createConfirmedAuthAccount(collaboratorAccount)
  await setSubscriptionPlanFixture(owner.id, 'lantern_hoard')
  const settlementId = await createSettlementFixture({
    name: `E2E Shared ${prefix}`,
    userId: owner.id
  })

  return {
    ownerAccount,
    owner,
    collaboratorAccount,
    collaborator,
    settlementId
  }
}

async function openSharingTab(
  page: Page,
  account: { email: string; password: string; username: string },
  settlementId: string
): Promise<void> {
  await openTab(page, account, settlementId, TabType.SHARING)
  await expect(page.getByText('Light another lantern')).toBeVisible()
}

async function openTab(
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

async function inviteCollaborator(page: Page, username: string): Promise<void> {
  await page.getByLabel('Username').fill(username)
  await page
    .locator('form')
    .getByRole('button', { name: /^Invite$/ })
    .click()
}

async function openSettlementSwitcher(page: Page): Promise<void> {
  const mobileSidebarIsClosed =
    (page.viewportSize()?.width ?? 0) < 768 &&
    (await page.getByRole('dialog').count()) === 0

  if (mobileSidebarIsClosed) await page.locator('header button').first().click()

  await page
    .locator('[data-slot="sidebar-header"]')
    .getByRole('button')
    .first()
    .click()
}
