/**
 * Avatar Upload Constants and Helpers
 *
 * Shared by the user-avatar settings UI and the upload API route to keep file
 * restrictions and storage-path logic consistent.
 */

import { AVATAR_OBJECT_NAME, SUPPORTED_AVATAR_MIME_TYPES } from '@/lib/common'

/** Avatar Image Dimensions */
export interface AvatarImageDimensions {
  /** Image Width */
  width: number
  /** Image Height */
  height: number
}

const JPEG_START_OF_FRAME_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf
])

/**
 * Read UInt16 Big Endian
 *
 * @param bytes Source Bytes
 * @param offset Byte Offset
 * @returns Parsed Value
 */
function readUInt16BigEndian(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1]
}

/**
 * Read UInt16 Little Endian
 *
 * @param bytes Source Bytes
 * @param offset Byte Offset
 * @returns Parsed Value
 */
function readUInt16LittleEndian(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8)
}

/**
 * Read UInt24 Little Endian
 *
 * @param bytes Source Bytes
 * @param offset Byte Offset
 * @returns Parsed Value
 */
function readUInt24LittleEndian(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16)
}

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
 * Detect Avatar Dimensions From Bytes
 *
 * Reads dimensions from supported image headers without fully decoding the
 * image. This mirrors the client-side dimension check on the trusted upload
 * boundary so direct POST callers cannot bypass the avatar size contract.
 *
 * @param bytes Image Bytes
 * @param mimeType Detected MIME Type
 * @returns Image Dimensions Or Null When The Header Cannot Be Parsed
 */
export function detectAvatarDimensionsFromBytes(
  bytes: Uint8Array,
  mimeType: (typeof SUPPORTED_AVATAR_MIME_TYPES)[number]
): AvatarImageDimensions | null {
  switch (mimeType) {
    case 'image/png':
      return detectPngDimensions(bytes)
    case 'image/gif':
      return detectGifDimensions(bytes)
    case 'image/jpeg':
      return detectJpegDimensions(bytes)
    case 'image/webp':
      return detectWebpDimensions(bytes)
  }

  return null
}

/**
 * Detect PNG Dimensions
 *
 * @param bytes Image Bytes
 * @returns PNG Dimensions Or Null
 */
function detectPngDimensions(bytes: Uint8Array): AvatarImageDimensions | null {
  if (bytes.length < 24) return null

  return {
    width: (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19],
    height: (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23]
  }
}

/**
 * Detect GIF Dimensions
 *
 * @param bytes Image Bytes
 * @returns GIF Dimensions Or Null
 */
function detectGifDimensions(bytes: Uint8Array): AvatarImageDimensions | null {
  if (bytes.length < 10) return null

  return {
    width: readUInt16LittleEndian(bytes, 6),
    height: readUInt16LittleEndian(bytes, 8)
  }
}

/**
 * Detect JPEG Dimensions
 *
 * @param bytes Image Bytes
 * @returns JPEG Dimensions Or Null
 */
function detectJpegDimensions(bytes: Uint8Array): AvatarImageDimensions | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null

  let offset = 2

  while (offset < bytes.length) {
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1
    if (offset >= bytes.length) return null

    const marker = bytes[offset]
    offset += 1

    if (marker === 0xd9 || marker === 0xda) return null
    if (marker >= 0xd0 && marker <= 0xd7) continue
    if (marker === 0x01) continue

    if (offset + 1 >= bytes.length) return null

    const segmentLength = readUInt16BigEndian(bytes, offset)

    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null

    if (JPEG_START_OF_FRAME_MARKERS.has(marker)) {
      if (segmentLength < 7) return null

      return {
        height: readUInt16BigEndian(bytes, offset + 3),
        width: readUInt16BigEndian(bytes, offset + 5)
      }
    }

    offset += segmentLength
  }

  return null
}

/**
 * Detect WebP Dimensions
 *
 * @param bytes Image Bytes
 * @returns WebP Dimensions Or Null
 */
function detectWebpDimensions(bytes: Uint8Array): AvatarImageDimensions | null {
  if (bytes.length < 20) return null

  let offset = 12

  while (offset + 8 <= bytes.length) {
    const chunkType = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3]
    )
    const chunkSize =
      bytes[offset + 4] |
      (bytes[offset + 5] << 8) |
      (bytes[offset + 6] << 16) |
      (bytes[offset + 7] << 24)
    const payloadOffset = offset + 8

    if (chunkSize < 0 || payloadOffset + chunkSize > bytes.length) return null

    if (chunkType === 'VP8X' && chunkSize >= 10)
      return {
        width: readUInt24LittleEndian(bytes, payloadOffset + 4) + 1,
        height: readUInt24LittleEndian(bytes, payloadOffset + 7) + 1
      }

    if (
      chunkType === 'VP8L' &&
      chunkSize >= 5 &&
      bytes[payloadOffset] === 0x2f
    ) {
      const firstDimensionByte = bytes[payloadOffset + 1]
      const secondDimensionByte = bytes[payloadOffset + 2]
      const thirdDimensionByte = bytes[payloadOffset + 3]
      const fourthDimensionByte = bytes[payloadOffset + 4]

      return {
        width: 1 + (((secondDimensionByte & 0x3f) << 8) | firstDimensionByte),
        height:
          1 +
          (((fourthDimensionByte & 0x0f) << 10) |
            (thirdDimensionByte << 2) |
            ((secondDimensionByte & 0xc0) >> 6))
      }
    }

    if (
      chunkType === 'VP8 ' &&
      chunkSize >= 10 &&
      bytes[payloadOffset + 3] === 0x9d &&
      bytes[payloadOffset + 4] === 0x01 &&
      bytes[payloadOffset + 5] === 0x2a
    )
      return {
        width: readUInt16LittleEndian(bytes, payloadOffset + 6) & 0x3fff,
        height: readUInt16LittleEndian(bytes, payloadOffset + 8) & 0x3fff
      }

    offset = payloadOffset + chunkSize + (chunkSize % 2)
  }

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
