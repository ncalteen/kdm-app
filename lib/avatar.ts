/**
 * Avatar Helpers
 *
 * Shared pure helpers for the `<UserAvatar>` component (see
 * `components/generic/user-avatar.tsx`). Kept in `lib/` so they can be unit
 * tested in the node test environment without pulling React/Radix DOM
 * primitives.
 */

/**
 * Initials Palette
 *
 * Curated set of background colours for the colored-initials fallback. Picked
 * from Tailwind's saturated-but-readable hues so white text on the swatch
 * stays legible. The selected entry is derived deterministically from the
 * `user_id` so the same user always shows the same colour.
 */
export const INITIALS_PALETTE = [
  'bg-amber-500',
  'bg-orange-500',
  'bg-rose-500',
  'bg-fuchsia-500',
  'bg-violet-500',
  'bg-indigo-500',
  'bg-sky-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-lime-500'
] as const

/**
 * Derive Initials From Name
 *
 * Splits on whitespace, takes up to the first two non-empty tokens, and
 * uppercases their leading character. Falls back to the first 2 characters
 * of the input (or `?` for empty input) so the avatar always shows
 * something legible.
 *
 * @param name Source Name
 * @returns Up to 2 Uppercase Characters
 */
export function getInitialsFromName(name: string | null | undefined): string {
  if (!name) return '?'

  const trimmed = name.trim()
  if (trimmed.length === 0) return '?'

  const tokens = trimmed.split(/\s+/).filter(Boolean)
  if (tokens.length >= 2) return (tokens[0][0] + tokens[1][0]).toUpperCase()

  // Single token: use the first two characters so handles like `ncalteen`
  // render as `NC` rather than just `N`.
  return trimmed.slice(0, 2).toUpperCase()
}

/**
 * Hash A String To An Unsigned 32-Bit Integer
 *
 * Uses the djb2 variant. We do not need cryptographic strength — just
 * stable bucketing of arbitrary keys to palette entries.
 *
 * @param value Source String
 * @returns Unsigned 32-Bit Hash
 */
function hashString(value: string): number {
  let hash = 5381
  for (let i = 0; i < value.length; i++)
    hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0

  return hash
}

/**
 * Pick Initials Color
 *
 * Deterministically maps an arbitrary key (typically a `user_id`) to one
 * of the initials palette entries. Returns the same class for the same
 * key on every call.
 *
 * @param key Hash Source
 * @returns Tailwind Background Class
 */
export function pickInitialsColor(key: string | null | undefined): string {
  if (!key) return INITIALS_PALETTE[0]

  return INITIALS_PALETTE[hashString(key) % INITIALS_PALETTE.length]
}
