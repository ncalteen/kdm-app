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

vi.mock('@/lib/dal/settlement-phase', () => ({
  removeSettlementPhase: vi.fn()
}))

vi.mock('@/lib/dal/showdown', () => ({
  removeShowdown: vi.fn()
}))

vi.mock('@/components/update-password-form', () => ({
  UpdatePasswordForm: () => <div data-test="update-password-form" />
}))

vi.mock('@/components/update-username-form', () => ({
  UpdateUsernameForm: () => <div data-test="update-username-form" />
}))

import { SettlementSettingsCard } from '@/components/settings/settlement-settings-card'
import { UserSettingsCard } from '@/components/settings/user-settings-card'

type SettlementSettingsCardProps = Parameters<typeof SettlementSettingsCard>[0]
type UserSettingsCardProps = Parameters<typeof UserSettingsCard>[0]

/**
 * Build Settlement Settings Props
 *
 * Produces a settlement-settings prop bag with all required setters as no-ops and
 * the supplied {@link selectedSettlement} / {@link selectedHunt} /
 * {@link selectedSettlementPhase} / {@link selectedShowdown}. Tests vary the
 * local-context return value via {@link useLocalMock} to drive the
 * `<OwnerOnly>` gate.
 */
function buildSettlementSettingsProps(
  overrides?: Partial<SettlementSettingsCardProps>
): SettlementSettingsCardProps {
  return {
    selectedHunt: null,
    selectedSettlement: null,
    selectedSettlementPhase: null,
    selectedShowdown: null,
    setSelectedHunt: vi.fn(),
    setSelectedHuntId: vi.fn(),
    setSelectedSettlement: vi.fn(),
    setSelectedSettlementId: vi.fn(),
    setSelectedSettlementPhase: vi.fn(),
    setSelectedSettlementPhaseId: vi.fn(),
    setSelectedShowdown: vi.fn(),
    setSelectedShowdownId: vi.fn(),
    setSelectedSurvivorId: vi.fn(),
    ...overrides
  }
}

/**
 * Build User Settings Props
 *
 * Produces a user-settings prop bag with no-op setters.
 */
function buildUserSettingsProps(
  overrides?: Partial<UserSettingsCardProps>
): UserSettingsCardProps {
  return {
    setUserSettings: vi.fn(),
    userSettings: null,
    ...overrides
  }
}

const ownerSettlement = {
  id: 'settlement-1',
  role: 'owner',
  settlement_name: 'Lantern Hold',
  uses_scouts: false
} as unknown as SettlementSettingsCardProps['selectedSettlement']

const collaboratorSettlement = {
  id: 'settlement-1',
  role: 'collaborator',
  settlement_name: 'Lantern Hold',
  uses_scouts: false
} as unknown as SettlementSettingsCardProps['selectedSettlement']

const selectedSettlementPhase = {
  id: 'settlement-phase-1',
  endeavors: 1,
  returning_scout_id: null,
  returning_survivor_ids: [],
  settlement_id: 'settlement-1',
  step: 1
} as unknown as SettlementSettingsCardProps['selectedSettlementPhase']

afterEach(() => {
  useLocalMock.mockReset()
})

describe('SettlementSettingsCard owner-only gating', () => {
  it('renders the Settlement Settings (Uses Scouts) and Danger Zone cards for the owner', () => {
    useLocalMock.mockReturnValue({
      selectedSettlementId: 'settlement-1',
      selectedSettlement: ownerSettlement
    })

    const html = renderToStaticMarkup(
      <SettlementSettingsCard
        {...buildSettlementSettingsProps({
          selectedSettlement: ownerSettlement
        })}
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
      <SettlementSettingsCard
        {...buildSettlementSettingsProps({
          selectedSettlement: collaboratorSettlement
        })}
      />
    )

    expect(html).not.toContain('Settlement Settings')
    expect(html).not.toContain('Uses Scouts')
    expect(html).not.toContain('Danger Zone')
    expect(html).not.toContain('Permanently delete this settlement')
    expect(html).not.toContain('Delete Lantern Hold')
  })

  it('renders the active settlement phase delete action when a phase exists', () => {
    useLocalMock.mockReturnValue({
      selectedSettlementId: 'settlement-1',
      selectedSettlement: collaboratorSettlement
    })

    const html = renderToStaticMarkup(
      <SettlementSettingsCard
        {...buildSettlementSettingsProps({
          selectedSettlementPhase
        })}
      />
    )

    expect(html).toContain('Active Settlement Phase')
    expect(html).toContain('Delete Current Settlement Phase')
    expect(html).toContain('Delete Settlement Phase')
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
      <SettlementSettingsCard
        {...buildSettlementSettingsProps({ selectedSettlement: null })}
      />
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
      <SettlementSettingsCard
        {...buildSettlementSettingsProps({
          selectedSettlement: ownerSettlement
        })}
      />
    )

    expect(html).not.toContain('Settlement Settings')
    expect(html).not.toContain('Danger Zone')
  })
})

describe('UserSettingsCard', () => {
  it('renders account settings without settlement settings', () => {
    const html = renderToStaticMarkup(
      <UserSettingsCard {...buildUserSettingsProps()} />
    )

    expect(html).toContain('update-username-form')
    expect(html).toContain('update-password-form')
    expect(html).not.toContain('Settlement Settings')
    expect(html).not.toContain('Danger Zone')
  })
})
