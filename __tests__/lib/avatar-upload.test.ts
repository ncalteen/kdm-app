import {
  buildAvatarObjectPath,
  detectAvatarDimensionsFromBytes,
  detectAvatarMimeTypeFromBytes,
  isSupportedAvatarMimeType,
  stripAvatarVersionQuery
} from '@/lib/avatar-upload'
import { AVATAR_OBJECT_NAME } from '@/lib/common'
import { describe, expect, it } from 'vitest'

function buildPngBytes(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24)
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  bytes[16] = (width >>> 24) & 0xff
  bytes[17] = (width >>> 16) & 0xff
  bytes[18] = (width >>> 8) & 0xff
  bytes[19] = width & 0xff
  bytes[20] = (height >>> 24) & 0xff
  bytes[21] = (height >>> 16) & 0xff
  bytes[22] = (height >>> 8) & 0xff
  bytes[23] = height & 0xff

  return bytes
}

function buildGifBytes(width: number, height: number): Uint8Array {
  return new Uint8Array([
    0x47,
    0x49,
    0x46,
    0x38,
    0x39,
    0x61,
    width & 0xff,
    (width >>> 8) & 0xff,
    height & 0xff,
    (height >>> 8) & 0xff
  ])
}

function buildJpegBytes(width: number, height: number): Uint8Array {
  return new Uint8Array([
    0xff,
    0xd8,
    0xff,
    0xe0,
    0x00,
    0x04,
    0x00,
    0x00,
    0xff,
    0xc0,
    0x00,
    0x0b,
    0x08,
    (height >>> 8) & 0xff,
    height & 0xff,
    (width >>> 8) & 0xff,
    width & 0xff,
    0x01,
    0x01,
    0x11,
    0x00
  ])
}

function buildWebpBytes(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(30)
  bytes.set([0x52, 0x49, 0x46, 0x46])
  bytes.set([0x57, 0x45, 0x42, 0x50], 8)
  bytes.set([0x56, 0x50, 0x38, 0x58], 12)
  bytes[16] = 0x0a
  bytes[24] = (width - 1) & 0xff
  bytes[25] = ((width - 1) >>> 8) & 0xff
  bytes[26] = ((width - 1) >>> 16) & 0xff
  bytes[27] = (height - 1) & 0xff
  bytes[28] = ((height - 1) >>> 8) & 0xff
  bytes[29] = ((height - 1) >>> 16) & 0xff

  return bytes
}

describe('avatar-upload helpers', () => {
  it('builds deterministic avatar object paths', () => {
    expect(buildAvatarObjectPath('user-123')).toBe(
      `user-123/${AVATAR_OBJECT_NAME}`
    )
  })

  it('accepts only supported MIME types', () => {
    expect(isSupportedAvatarMimeType('image/jpeg')).toBe(true)
    expect(isSupportedAvatarMimeType('image/png')).toBe(true)
    expect(isSupportedAvatarMimeType('image/webp')).toBe(true)
    expect(isSupportedAvatarMimeType('text/javascript')).toBe(false)
  })

  it('detects jpeg signatures', () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xaa])
    expect(detectAvatarMimeTypeFromBytes(bytes)).toBe('image/jpeg')
  })

  it('detects png signatures', () => {
    const bytes = buildPngBytes(16, 24)
    expect(detectAvatarMimeTypeFromBytes(bytes)).toBe('image/png')
  })

  it('detects gif signatures', () => {
    const bytes = buildGifBytes(16, 24)
    expect(detectAvatarMimeTypeFromBytes(bytes)).toBe('image/gif')
  })

  it('detects webp signatures', () => {
    const bytes = buildWebpBytes(16, 24)
    expect(detectAvatarMimeTypeFromBytes(bytes)).toBe('image/webp')
  })

  it('detects png dimensions', () => {
    expect(
      detectAvatarDimensionsFromBytes(buildPngBytes(512, 256), 'image/png')
    ).toEqual({ width: 512, height: 256 })
  })

  it('detects gif dimensions', () => {
    expect(
      detectAvatarDimensionsFromBytes(buildGifBytes(320, 240), 'image/gif')
    ).toEqual({ width: 320, height: 240 })
  })

  it('detects jpeg dimensions', () => {
    expect(
      detectAvatarDimensionsFromBytes(buildJpegBytes(1024, 768), 'image/jpeg')
    ).toEqual({ width: 1024, height: 768 })
  })

  it('detects webp dimensions', () => {
    expect(
      detectAvatarDimensionsFromBytes(buildWebpBytes(640, 480), 'image/webp')
    ).toEqual({ width: 640, height: 480 })
  })

  it('returns null for incomplete dimension headers', () => {
    expect(
      detectAvatarDimensionsFromBytes(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
        'image/png'
      )
    ).toBeNull()
  })

  it('rejects unknown signatures', () => {
    const bytes = new Uint8Array([
      0x23, 0x21, 0x2f, 0x62, 0x69, 0x6e, 0x2f, 0x7a, 0x73, 0x68
    ])
    expect(detectAvatarMimeTypeFromBytes(bytes)).toBeNull()
  })

  it('strips cache-buster query parameters from avatar URLs', () => {
    expect(
      stripAvatarVersionQuery(
        'https://cdn.example.com/avatar.png?v=123&foo=bar'
      )
    ).toBe('https://cdn.example.com/avatar.png?foo=bar')
  })
})
