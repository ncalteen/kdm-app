import {
  buildAvatarObjectPath,
  detectAvatarMimeTypeFromBytes,
  isSupportedAvatarMimeType,
  stripAvatarVersionQuery
} from '@/lib/avatar-upload'
import { AVATAR_OBJECT_NAME } from '@/lib/common'
import { describe, expect, it } from 'vitest'

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
    const bytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
    ])
    expect(detectAvatarMimeTypeFromBytes(bytes)).toBe('image/png')
  })

  it('detects gif signatures', () => {
    const bytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
    expect(detectAvatarMimeTypeFromBytes(bytes)).toBe('image/gif')
  })

  it('detects webp signatures', () => {
    const bytes = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50
    ])
    expect(detectAvatarMimeTypeFromBytes(bytes)).toBe('image/webp')
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
