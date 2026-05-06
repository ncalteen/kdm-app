'use client'

import { useLocal } from '@/contexts/local-context'
import { ReactNode } from 'react'

/**
 * Owner Only Properties
 */
interface OwnerOnlyProps {
  /** Content rendered when the active settlement's role is `owner`. */
  children: ReactNode
  /**
   * Optional content rendered when the active settlement's role is not `owner`
   * — typically a `collaborator`, or no settlement is selected. When omitted,
   * nothing is rendered for non-owners.
   */
  fallback?: ReactNode
}

/**
 * Owner Only Component
 *
 * Conditionally renders content based on the caller's relationship to the
 * currently selected settlement. Only the owner of the settlement (the `owner`)
 * sees the children; collaborators — and consumers without an active settlement
 * — see the `fallback` if provided, or nothing at all.
 *
 * Wrap destructive or owner-only controls in this component so that
 * collaborators do not see — and cannot accidentally trigger — actions reserved
 * for the owner of the settlement. Pair with a tooltip (or other disabled
 * affordance) in the `fallback` slot when the user benefits from knowing why a
 * control is unavailable; otherwise omit `fallback` and the control disappears
 * entirely for non-owners.
 *
 * @param props Owner Only Properties
 * @returns Owner Only Component
 */
export function OwnerOnly({
  children,
  fallback = null
}: OwnerOnlyProps): ReactNode {
  const { selectedSettlement } = useLocal()

  if (selectedSettlement?.role === 'owner') return children

  return fallback
}
