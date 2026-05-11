import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

const useLocalMock = vi.fn()

vi.mock('@/contexts/local-context', () => ({
  useLocal: () => useLocalMock()
}))

vi.mock('@/lib/dal/hunt', () => ({
  removeHunt: vi.fn()
}))

vi.mock('@/lib/dal/settlement', () => ({
  removeSettlement: vi.fn(),
  updateSettlement: vi.fn()
}))

vi.mock('@/lib/dal/showdown', () => ({
  removeShowdown: vi.fn()
}))

vi.mock('@/lib/seed', () => ({
  generateSeedData: vi.fn()
}))

vi.mock('@/components/update-password-form', () => ({
  UpdatePasswordForm: () => <div data-test="update-password-form" />
}))

vi.mock('@/components/update-username-form', () => ({
  UpdateUsernameForm: () => <div data-test="update-username-form" />
}))

import { SettingsCard } from '@/components/settings/settings-card'

type SettingsCardProps = Parameters<typeof SettingsCard>[0]

/**
 * Build Base Props
 *
 * Produces a settings-card prop bag with all required setters as no-ops and
 * the supplied {@link selectedSettlement} / {@link selectedHunt} /
 * {@link selectedShowdown}. Tests vary the local-context return value via
 * {@link useLocalMock} to drive the `<OwnerOnly>` gate.
 */
function buildBaseProps(
  overrides?: Partial<SettingsCardProps>
): SettingsCardProps {
  return {
    local: { disableToasts: false } as SettingsCardProps['local'],
    selectedHunt: null,
    selectedSettlement: null,
    selectedShowdown: null,
    setSelectedHunt: vi.fn(),
    setSelectedHuntId: vi.fn(),
    setSelectedSettlement: vi.fn(),
    setSelectedSettlementId: vi.fn(),
    setSelectedShowdown: vi.fn(),
    setSelectedShowdownId: vi.fn(),
    setSelectedSurvivorId: vi.fn(),
    setUserSettings: vi.fn(),
    updateLocal: vi.fn(),
    userSettings: null,
    ...overrides
  }
}

const ownerSettlement = {
  id: 'settlement-1',
  role: 'owner',
  settlement_name: 'Lantern Hold',
  uses_scouts: false
} as unknown as SettingsCardProps['selectedSettlement']

const collaboratorSettlement = {
  id: 'settlement-1',
  role: 'collaborator',
  settlement_name: 'Lantern Hold',
  uses_scouts: false
} as unknown as SettingsCardProps['selectedSettlement']

afterEach(() => {
  useLocalMock.mockReset()
})

describe('SettingsCard owner-only gating', () => {
  it('renders the Settlement Settings (Uses Scouts) and Danger Zone cards for the owner', () => {
    useLocalMock.mockReturnValue({
      selectedSettlementId: 'settlement-1',
      selectedSettlement: ownerSettlement
    })

    const html = renderToStaticMarkup(
      <SettingsCard
        {...buildBaseProps({ selectedSettlement: ownerSettlement })}
      />
    )

    expect(html).toContain('Settlement Settings')
    expect(html).toContain('Uses Scouts')
    expect(html).toContain('Danger Zone')
    expect(html).toContain('Permanently delete this settlement')
    expect(html).toContain('Delete Lantern Hold')
  })

  it('hides Settlement Settings and Danger Zone from collaborators', () => {
    useLocalMock.mockReturnValue({
      selectedSettlementId: 'settlement-1',
      selectedSettlement: collaboratorSettlement
    })

    const html = renderToStaticMarkup(
      <SettingsCard
        {...buildBaseProps({ selectedSettlement: collaboratorSettlement })}
      />
    )

    expect(html).not.toContain('Settlement Settings')
    expect(html).not.toContain('Uses Scouts')
    expect(html).not.toContain('Danger Zone')
    expect(html).not.toContain('Permanently delete this settlement')
    expect(html).not.toContain('Delete Lantern Hold')
  })

  it('still renders the user-account section (username, password, notifications) for collaborators', () => {
    useLocalMock.mockReturnValue({
      selectedSettlementId: 'settlement-1',
      selectedSettlement: collaboratorSettlement
    })

    const html = renderToStaticMarkup(
      <SettingsCard
        {...buildBaseProps({ selectedSettlement: collaboratorSettlement })}
      />
    )

    expect(html).toContain('update-username-form')
    expect(html).toContain('update-password-form')
    expect(html).toContain('Disable Notifications')
  })

  it('hides Settlement Settings and Danger Zone while the selected settlement is still loading (id but no settlement object)', () => {
    // Transition window: selectedSettlementId is restored from local storage
    // but getSettlement() has not resolved yet. Owner-only controls must NOT
    // be revealed during this brief stale window — see
    // __tests__/components/generic/owner-only.test.ts for the underlying
    // guarantee from <OwnerOnly>.
    useLocalMock.mockReturnValue({
      selectedSettlementId: 'settlement-1',
      selectedSettlement: null
    })

    const html = renderToStaticMarkup(
      <SettingsCard {...buildBaseProps({ selectedSettlement: null })} />
    )

    expect(html).not.toContain('Settlement Settings')
    expect(html).not.toContain('Danger Zone')
  })

  it('hides Settlement Settings and Danger Zone when the local-context role disagrees with the synchronized id (stale-settlement window)', () => {
    // Caller switched to a new settlement (selectedSettlementId === 's2') but
    // selectedSettlement still references the previous settlement (id 's1').
    // The wrapper must not trust the stale 'owner' role.
    useLocalMock.mockReturnValue({
      selectedSettlementId: 'settlement-2',
      selectedSettlement: ownerSettlement
    })

    const html = renderToStaticMarkup(
      <SettingsCard
        {...buildBaseProps({ selectedSettlement: ownerSettlement })}
      />
    )

    expect(html).not.toContain('Settlement Settings')
    expect(html).not.toContain('Danger Zone')
  })
})
