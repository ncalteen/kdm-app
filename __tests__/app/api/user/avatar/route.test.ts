import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const { mockGetUser, mockFrom, mockStorageFrom, mockCreateClient } = vi.hoisted(
  () => ({
    mockGetUser: vi.fn(),
    mockFrom: vi.fn(),
    mockStorageFrom: vi.fn(),
    mockCreateClient: vi.fn()
  })
)

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient
}))

import { MAX_AVATAR_WIDTH_PX } from '@/lib/common'
import { NextRequest } from 'next/server'

const { GET, POST } = await import('@/app/api/user/avatar/route')

function buildPngBytes(width: number, height: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(24))
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

function buildClient() {
  return {
    auth: { getUser: mockGetUser },
    from: mockFrom,
    storage: { from: mockStorageFrom }
  }
}

function setupAuth(options: {
  user: {
    id: string
    user_metadata?: Record<string, unknown>
  } | null
  authError?: { message: string } | null
}) {
  mockGetUser.mockResolvedValue({
    data: { user: options.user },
    error: options.authError ?? null
  })
}

function setupUserSettingsRead(avatarUrl: string | null) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: { avatar_url: avatarUrl },
    error: null
  })
  const eq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq })

  mockFrom.mockReturnValue({ select })

  return { select, eq, maybeSingle }
}

function setupStorage(options?: {
  listData?: Array<{ name: string; updated_at?: string; created_at?: string }>
  uploadError?: { message: string } | null
}) {
  const list = vi.fn().mockResolvedValue({
    data: options?.listData ?? [],
    error: null
  })
  const upload = vi.fn().mockResolvedValue({
    error: options?.uploadError ?? null
  })
  const getPublicUrl = vi.fn().mockReturnValue({
    data: {
      publicUrl:
        'https://supabase.example/storage/v1/object/public/avatars/user-1/avatar'
    }
  })

  mockStorageFrom.mockReturnValue({ list, upload, getPublicUrl })

  return { list, upload, getPublicUrl }
}

function buildFormRequest(formData: FormData): NextRequest {
  return new NextRequest('https://archivist.test/api/user/avatar', {
    method: 'POST',
    body: formData
  })
}

describe('GET /api/user/avatar', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockCreateClient.mockResolvedValue(buildClient())
  })

  it('returns 401 when unauthenticated', async () => {
    setupAuth({ user: null })

    const response = await GET()

    expect(response.status).toBe(401)
  })

  it('returns provider/uploaded state when authenticated', async () => {
    setupAuth({
      user: {
        id: 'user-1',
        user_metadata: {
          avatar_url: 'https://cdn.discordapp.com/avatars/1/a.png'
        }
      }
    })
    setupUserSettingsRead(
      'https://supabase.example/storage/v1/object/public/avatars/user-1/avatar?v=123'
    )
    setupStorage({
      listData: [
        {
          name: 'avatar',
          updated_at: '2026-05-26T00:00:00.000Z'
        }
      ]
    })

    const response = await GET()
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.providerAvatarUrl).toBe(
      'https://cdn.discordapp.com/avatars/1/a.png'
    )
    expect(json.uploadedAvatarUrl).toContain('/avatars/user-1/avatar?v=')
    expect(json.selectedSource).toBe('uploaded')
  })
})

describe('POST /api/user/avatar', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockCreateClient.mockResolvedValue(buildClient())
  })

  it('returns 400 on invalid action', async () => {
    setupAuth({ user: { id: 'user-1', user_metadata: {} } })

    const formData = new FormData()
    formData.append('action', 'dance')

    const response = await POST(buildFormRequest(formData))

    expect(response.status).toBe(400)
  })

  it('switches to provider avatar when requested', async () => {
    setupAuth({
      user: {
        id: 'user-1',
        user_metadata: {
          avatar_url: 'https://cdn.discordapp.com/avatars/1/a.png'
        }
      }
    })

    setupStorage({
      listData: [{ name: 'avatar', updated_at: '2026-05-26T00:00:00.000Z' }]
    })

    const readMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        avatar_url:
          'https://supabase.example/storage/v1/object/public/avatars/user-1/avatar?v=123'
      },
      error: null
    })
    const readEq = vi.fn().mockReturnValue({ maybeSingle: readMaybeSingle })
    const readSelect = vi.fn().mockReturnValue({ eq: readEq })

    const updateSingle = vi.fn().mockResolvedValue({
      data: { avatar_url: 'https://cdn.discordapp.com/avatars/1/a.png' },
      error: null
    })
    const updateSelect = vi.fn().mockReturnValue({ single: updateSingle })
    const updateEq = vi.fn().mockReturnValue({ select: updateSelect })
    const update = vi.fn().mockReturnValue({ eq: updateEq })

    mockFrom
      .mockReturnValueOnce({ update })
      .mockReturnValueOnce({ select: readSelect })

    const formData = new FormData()
    formData.append('action', 'select')
    formData.append('source', 'provider')

    const response = await POST(buildFormRequest(formData))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.selectedSource).toBe('provider')
    expect(update).toHaveBeenCalledWith({
      avatar_url: 'https://cdn.discordapp.com/avatars/1/a.png'
    })
  })

  it('rejects non-image uploads', async () => {
    setupAuth({ user: { id: 'user-1', user_metadata: {} } })

    const formData = new FormData()
    formData.append('action', 'upload')
    formData.append(
      'avatar',
      new File([new TextEncoder().encode('console.log(1)')], 'bad.js', {
        type: 'text/javascript'
      })
    )

    const response = await POST(buildFormRequest(formData))
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.code).toBe('invalid-type')
  })

  it('rejects oversized uploads', async () => {
    setupAuth({ user: { id: 'user-1', user_metadata: {} } })

    const bigBuffer = new Uint8Array(2 * 1024 * 1024 + 1)
    bigBuffer[0] = 0xff
    bigBuffer[1] = 0xd8
    bigBuffer[2] = 0xff

    const formData = new FormData()
    formData.append('action', 'upload')
    formData.append(
      'avatar',
      new File([bigBuffer], 'too-big.jpg', { type: 'image/jpeg' })
    )

    const response = await POST(buildFormRequest(formData))
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.code).toBe('invalid-size')
  })

  it('rejects uploads with oversized image dimensions', async () => {
    setupAuth({ user: { id: 'user-1', user_metadata: {} } })

    const formData = new FormData()
    formData.append('action', 'upload')
    formData.append(
      'avatar',
      new File([buildPngBytes(MAX_AVATAR_WIDTH_PX + 1, 512)], 'wide.png', {
        type: 'image/png'
      })
    )

    const response = await POST(buildFormRequest(formData))
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.code).toBe('invalid-dimensions')
  })

  it('uploads a valid image and selects uploaded avatar', async () => {
    setupAuth({ user: { id: 'user-1', user_metadata: {} } })

    const storage = setupStorage({
      listData: [{ name: 'avatar', updated_at: '2026-05-26T00:00:00.000Z' }]
    })

    const readMaybeSingle = vi.fn().mockResolvedValue({
      data: { avatar_url: null },
      error: null
    })
    const readEq = vi.fn().mockReturnValue({ maybeSingle: readMaybeSingle })
    const readSelect = vi.fn().mockReturnValue({ eq: readEq })

    const updatedAvatarUrl =
      'https://supabase.example/storage/v1/object/public/avatars/user-1/avatar?v=999'
    const updateSingle = vi.fn().mockResolvedValue({
      data: { avatar_url: updatedAvatarUrl },
      error: null
    })
    const updateSelect = vi.fn().mockReturnValue({ single: updateSingle })
    const updateEq = vi.fn().mockReturnValue({ select: updateSelect })
    const update = vi.fn().mockReturnValue({ eq: updateEq })

    mockFrom
      .mockReturnValueOnce({ update })
      .mockReturnValueOnce({ select: readSelect })

    const pngBytes = buildPngBytes(512, 512)

    const formData = new FormData()
    formData.append('action', 'upload')
    formData.append(
      'avatar',
      new File([pngBytes], 'avatar.png', { type: 'image/png' })
    )

    const response = await POST(buildFormRequest(formData))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(storage.upload).toHaveBeenCalled()
    expect(json.selectedSource).toBe('uploaded')
    expect(json.avatarUrl).toContain('/avatars/user-1/avatar?v=')
  })
})
