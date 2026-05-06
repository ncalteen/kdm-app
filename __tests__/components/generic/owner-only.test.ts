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
      selectedSettlement: { role: 'owner' }
    })

    const result = OwnerOnly({ children: 'lit-lantern' })

    expect(result).toBe('lit-lantern')
  })

  it('renders children for the owner even when a fallback is provided', () => {
    useLocalMock.mockReturnValue({
      selectedSettlement: { role: 'owner' }
    })

    const result = OwnerOnly({
      children: 'lit-lantern',
      fallback: 'dim-lantern'
    })

    expect(result).toBe('lit-lantern')
  })

  it('renders the fallback when the role is collaborator and a fallback is provided', () => {
    useLocalMock.mockReturnValue({
      selectedSettlement: { role: 'collaborator' }
    })

    const result = OwnerOnly({
      children: 'lit-lantern',
      fallback: 'dim-lantern'
    })

    expect(result).toBe('dim-lantern')
  })

  it('renders null when the role is collaborator and no fallback is provided', () => {
    useLocalMock.mockReturnValue({
      selectedSettlement: { role: 'collaborator' }
    })

    const result = OwnerOnly({ children: 'lit-lantern' })

    expect(result).toBeNull()
  })

  it('renders the fallback when no settlement is selected', () => {
    useLocalMock.mockReturnValue({ selectedSettlement: null })

    const result = OwnerOnly({
      children: 'lit-lantern',
      fallback: 'dim-lantern'
    })

    expect(result).toBe('dim-lantern')
  })

  it('renders null when no settlement is selected and no fallback is provided', () => {
    useLocalMock.mockReturnValue({ selectedSettlement: null })

    const result = OwnerOnly({ children: 'lit-lantern' })

    expect(result).toBeNull()
  })
})
