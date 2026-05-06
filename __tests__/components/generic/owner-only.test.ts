import { beforeEach, describe, expect, it, vi } from 'vitest'

const useLocalMock = vi.fn()

vi.mock('@/contexts/local-context', () => ({
  useLocal: () => useLocalMock()
}))

import { OwnerOnly } from '@/components/generic/owner-only'

describe('OwnerOnly', () => {
  beforeEach(() => {
    useLocalMock.mockReset()
  })

  it('renders children when the active settlement role is owner', () => {
    useLocalMock.mockReturnValue({
      selectedSettlement: { id: 's1', role: 'owner' },
      selectedSettlementId: 's1'
    })

    const result = OwnerOnly({ children: 'lit-lantern' })

    expect(result).toBe('lit-lantern')
  })

  it('renders children for the owner even when a fallback is provided', () => {
    useLocalMock.mockReturnValue({
      selectedSettlement: { id: 's1', role: 'owner' },
      selectedSettlementId: 's1'
    })

    const result = OwnerOnly({
      children: 'lit-lantern',
      fallback: 'dim-lantern'
    })

    expect(result).toBe('lit-lantern')
  })

  it('renders the fallback when the role is collaborator and a fallback is provided', () => {
    useLocalMock.mockReturnValue({
      selectedSettlement: { id: 's1', role: 'collaborator' },
      selectedSettlementId: 's1'
    })

    const result = OwnerOnly({
      children: 'lit-lantern',
      fallback: 'dim-lantern'
    })

    expect(result).toBe('dim-lantern')
  })

  it('renders null when the role is collaborator and no fallback is provided', () => {
    useLocalMock.mockReturnValue({
      selectedSettlement: { id: 's1', role: 'collaborator' },
      selectedSettlementId: 's1'
    })

    const result = OwnerOnly({ children: 'lit-lantern' })

    expect(result).toBeNull()
  })

  it('renders the fallback when no settlement is selected', () => {
    useLocalMock.mockReturnValue({
      selectedSettlement: null,
      selectedSettlementId: null
    })

    const result = OwnerOnly({
      children: 'lit-lantern',
      fallback: 'dim-lantern'
    })

    expect(result).toBe('dim-lantern')
  })

  it('renders null when no settlement is selected and no fallback is provided', () => {
    useLocalMock.mockReturnValue({
      selectedSettlement: null,
      selectedSettlementId: null
    })

    const result = OwnerOnly({ children: 'lit-lantern' })

    expect(result).toBeNull()
  })

  it('renders the fallback while the active settlement id is changing but the resolved settlement is still stale', () => {
    // selectedSettlementId has been updated (the user picked a new
    // settlement) but selectedSettlement still references the previous one
    // because getSettlement() has not resolved yet. The gate must NOT trust
    // the stale role during this transition window — otherwise an
    // owner-only control could briefly render for a settlement the caller
    // does not actually own.
    useLocalMock.mockReturnValue({
      selectedSettlement: { id: 's1', role: 'owner' },
      selectedSettlementId: 's2'
    })

    const result = OwnerOnly({
      children: 'lit-lantern',
      fallback: 'dim-lantern'
    })

    expect(result).toBe('dim-lantern')
  })

  it('renders the fallback when an id is selected but the settlement has not loaded yet', () => {
    // Initial fetch from local storage on cold start: an id is restored
    // synchronously, but the resolved settlement is null until the first
    // load completes.
    useLocalMock.mockReturnValue({
      selectedSettlement: null,
      selectedSettlementId: 's1'
    })

    const result = OwnerOnly({ children: 'lit-lantern' })

    expect(result).toBeNull()
  })
})
