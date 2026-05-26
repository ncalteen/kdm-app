/**
 * Avatar Upload Constants and Helpers
 *
 * Shared by the user-avatar settings UI and the upload API route to keep file
 * restrictions and storage-path logic consistent.
 */

import { AVATAR_OBJECT_NAME, SUPPORTED_AVATAR_MIME_TYPES } from '@/lib/common'

/**
 * Build Avatar Object Path
 *
 * @param userId Authenticated User ID
 * @returns Storage Object Path
 */
export function buildAvatarObjectPath(userId: string): string {
  return `${userId}/${AVATAR_OBJECT_NAME}`
}

/**
 * Check Supported Avatar MIME Type
 *
 * @param mimeType MIME Type
 * @returns Whether MIME Type Is Supported
 */
export function isSupportedAvatarMimeType(mimeType: string): boolean {
  return SUPPORTED_AVATAR_MIME_TYPES.includes(mimeType.toLowerCase())
}

/**
 * Detect Avatar MIME Type From Signature Bytes
 *
 * Performs a lightweight magic-byte check so renamed non-image files are
 * rejected server-side.
 *
 * @param bytes File Header Bytes
 * @returns Detected MIME Type
 */
export function detectAvatarMimeTypeFromBytes(
  bytes: Uint8Array
): (typeof SUPPORTED_AVATAR_MIME_TYPES)[number] | null {
  // JPEG: FF D8 FF
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
    return 'image/jpeg'

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  )
    return 'image/png'

  // GIF87a / GIF89a
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  )
    return 'image/gif'

  // WEBP: RIFF....WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return 'image/webp'

  return null
}

/**
 * Strip Avatar Cache-Buster Query
 *
 * @param avatarUrl Avatar URL
 * @returns Avatar URL Without `v` Search Parameter
 */
export function stripAvatarVersionQuery(avatarUrl: string): string {
  try {
    const url = new URL(avatarUrl)

    url.searchParams.delete('v')

    return url.toString()
  } catch {
    return avatarUrl
  }
}
