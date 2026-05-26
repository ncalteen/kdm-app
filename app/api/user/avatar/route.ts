import 'server-only'

import {
  buildAvatarObjectPath,
  detectAvatarDimensionsFromBytes,
  detectAvatarMimeTypeFromBytes,
  isSupportedAvatarMimeType,
  stripAvatarVersionQuery
} from '@/lib/avatar-upload'
import {
  AVATAR_BUCKET,
  AVATAR_OBJECT_NAME,
  MAX_AVATAR_FILE_SIZE_BYTES,
  MAX_AVATAR_HEIGHT_PX,
  MAX_AVATAR_WIDTH_PX
} from '@/lib/common'
import { ERROR_MESSAGE } from '@/lib/messages'
import { createClient } from '@/lib/supabase/server'
import { AvatarSource } from '@/lib/types'
import { User } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

/** Force Node Runtime */
export const runtime = 'nodejs'

/**
 * Avatar API Response
 */
interface AvatarState {
  /** Currently Selected Avatar URL */
  avatarUrl: string | null
  /** OAuth Provider Avatar URL */
  providerAvatarUrl: string | null
  /** Uploaded Avatar URL */
  uploadedAvatarUrl: string | null
  /** Currently Selected Source */
  selectedSource: AvatarSource
}

/**
 * Read Provider Avatar URL
 *
 * @param user Authenticated User
 * @returns Provider Avatar URL
 */
function readProviderAvatarUrl(user: User): string | null {
  const raw = user.user_metadata?.avatar_url

  return typeof raw === 'string' && raw.trim().length > 0 ? raw : null
}

/**
 * Build Public Avatar URL
 *
 * @param supabase Supabase Client
 * @param objectPath Storage Object Path
 * @param version Optional Cache-Buster
 * @returns Public URL
 */
function buildPublicAvatarUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  objectPath: string,
  version?: string
): string {
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath)

  return version
    ? `${data.publicUrl}?v=${encodeURIComponent(version)}`
    : data.publicUrl
}

/**
 * Read Uploaded Avatar URL
 *
 * @param supabase Supabase Client
 * @param userId Authenticated User ID
 * @returns Uploaded Avatar URL
 */
async function readUploadedAvatarUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(userId, { limit: 20 })

  if (error) throw new Error(`Avatar Upload Lookup Error: ${error.message}`)

  const avatarObject = (data ?? []).find(
    (entry) => entry.name === AVATAR_OBJECT_NAME
  )
  if (!avatarObject) return null

  const version =
    avatarObject.updated_at ?? avatarObject.created_at ?? undefined

  return buildPublicAvatarUrl(supabase, buildAvatarObjectPath(userId), version)
}

/**
 * Resolve Selected Avatar Source
 *
 * @param currentAvatarUrl Current Avatar URL
 * @param providerAvatarUrl Provider Avatar URL
 * @param uploadedAvatarUrl Uploaded Avatar URL
 * @returns Selected Source
 */
function resolveSelectedAvatarSource(
  currentAvatarUrl: string | null,
  providerAvatarUrl: string | null,
  uploadedAvatarUrl: string | null
): AvatarSource {
  if (!currentAvatarUrl) return 'none'

  const normalizedCurrent = stripAvatarVersionQuery(currentAvatarUrl)

  if (
    providerAvatarUrl &&
    normalizedCurrent === stripAvatarVersionQuery(providerAvatarUrl)
  )
    return 'provider'

  if (
    uploadedAvatarUrl &&
    normalizedCurrent === stripAvatarVersionQuery(uploadedAvatarUrl)
  )
    return 'uploaded'

  return 'none'
}

/**
 * Get Current Avatar URL
 *
 * @param supabase Supabase Client
 * @param userId Authenticated User ID
 * @returns Current Avatar URL
 */
async function getCurrentAvatarUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('avatar_url')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(`Avatar Settings Fetch Error: ${error.message}`)

  return data?.avatar_url ?? null
}

/**
 * Set Current Avatar URL
 *
 * @param supabase Supabase Client
 * @param userId Authenticated User ID
 * @param avatarUrl Avatar URL
 * @returns Updated Avatar URL
 */
async function setCurrentAvatarUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  avatarUrl: string
): Promise<string> {
  const { data, error } = await supabase
    .from('user_settings')
    .update({ avatar_url: avatarUrl })
    .eq('user_id', userId)
    .select('avatar_url')
    .single()

  if (error) throw new Error(`Avatar Settings Update Error: ${error.message}`)

  return data.avatar_url
}

/**
 * Build Avatar State
 *
 * @param supabase Supabase Client
 * @param user Authenticated User
 * @param currentAvatarUrl Optional Current Avatar URL Override
 * @returns Avatar State
 */
async function buildAvatarState(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: User,
  currentAvatarUrl?: string
): Promise<AvatarState> {
  const providerAvatarUrl = readProviderAvatarUrl(user)
  const uploadedAvatarUrl = await readUploadedAvatarUrl(supabase, user.id)
  const avatarUrl =
    currentAvatarUrl !== undefined
      ? currentAvatarUrl
      : await getCurrentAvatarUrl(supabase, user.id)

  return {
    avatarUrl,
    providerAvatarUrl,
    uploadedAvatarUrl,
    selectedSource: resolveSelectedAvatarSource(
      avatarUrl,
      providerAvatarUrl,
      uploadedAvatarUrl
    )
  }
}

/**
 * Get Avatar Configuration
 *
 * Returns provider/uploaded avatar availability plus the currently selected
 * source so the settings UI can render toggle controls without duplicating
 * Supabase Auth/storage logic client-side.
 *
 * @returns Avatar State JSON
 */
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user)
    return NextResponse.json({ error: 'Not Authenticated' }, { status: 401 })

  try {
    return NextResponse.json(await buildAvatarState(supabase, user))
  } catch (error) {
    console.error('Avatar Settings GET Error:', error)

    return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
  }
}

/**
 * Update Avatar
 *
 * Handles two operations:
 *  - `action=upload` with `avatar=<File>` to validate + upload a new avatar.
 *  - `action=select` with `source=provider|uploaded` to switch source.
 *
 * @param request Next Request
 * @returns Avatar State JSON
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user)
    return NextResponse.json({ error: 'Not Authenticated' }, { status: 401 })

  try {
    const formData = await request.formData()
    const action = formData.get('action')

    if (action !== 'upload' && action !== 'select')
      return NextResponse.json(
        { code: 'invalid-action', error: 'Invalid avatar action.' },
        { status: 400 }
      )

    if (action === 'upload') {
      const avatar = formData.get('avatar')

      if (!(avatar instanceof File) || avatar.size === 0)
        return NextResponse.json(
          { code: 'missing-file', error: 'No avatar image was provided.' },
          { status: 400 }
        )

      if (avatar.size > MAX_AVATAR_FILE_SIZE_BYTES)
        return NextResponse.json(
          { code: 'invalid-size', error: 'Avatar image is too large.' },
          { status: 400 }
        )

      if (!isSupportedAvatarMimeType(avatar.type))
        return NextResponse.json(
          { code: 'invalid-type', error: 'Unsupported avatar image format.' },
          { status: 400 }
        )

      const bytes = new Uint8Array(await avatar.arrayBuffer())
      const detectedMimeType = detectAvatarMimeTypeFromBytes(bytes)

      if (!detectedMimeType)
        return NextResponse.json(
          { code: 'invalid-type', error: 'Unsupported avatar image format.' },
          { status: 400 }
        )

      const dimensions = detectAvatarDimensionsFromBytes(
        bytes,
        detectedMimeType
      )

      if (
        !dimensions ||
        dimensions.width > MAX_AVATAR_WIDTH_PX ||
        dimensions.height > MAX_AVATAR_HEIGHT_PX
      )
        return NextResponse.json(
          {
            code: 'invalid-dimensions',
            error: 'Avatar image dimensions are too large.'
          },
          { status: 400 }
        )

      const objectPath = buildAvatarObjectPath(user.id)

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(objectPath, avatar, {
          upsert: true,
          contentType: detectedMimeType,
          cacheControl: '3600'
        })

      if (uploadError)
        throw new Error(`Avatar Upload Error: ${uploadError.message}`)

      const uploadedAvatarUrl = buildPublicAvatarUrl(
        supabase,
        objectPath,
        Date.now().toString()
      )

      const avatarUrl = await setCurrentAvatarUrl(
        supabase,
        user.id,
        uploadedAvatarUrl
      )

      const nextState = await buildAvatarState(supabase, user, avatarUrl)

      return NextResponse.json({
        ...nextState,
        selectedSource: 'uploaded' as AvatarSource
      })
    }

    const source = formData.get('source')

    if (source !== 'provider' && source !== 'uploaded')
      return NextResponse.json(
        { code: 'invalid-source', error: 'Invalid avatar source.' },
        { status: 400 }
      )

    if (source === 'provider') {
      const providerAvatarUrl = readProviderAvatarUrl(user)

      if (!providerAvatarUrl)
        return NextResponse.json(
          {
            code: 'provider-missing',
            error: 'No provider avatar is currently available.'
          },
          { status: 400 }
        )

      const avatarUrl = await setCurrentAvatarUrl(
        supabase,
        user.id,
        providerAvatarUrl
      )

      const nextState = await buildAvatarState(supabase, user, avatarUrl)

      return NextResponse.json({
        ...nextState,
        selectedSource: 'provider' as AvatarSource
      })
    }

    const uploadedAvatarUrl = await readUploadedAvatarUrl(supabase, user.id)

    if (!uploadedAvatarUrl)
      return NextResponse.json(
        {
          code: 'uploaded-missing',
          error: 'No uploaded avatar is currently available.'
        },
        { status: 400 }
      )

    const avatarUrl = await setCurrentAvatarUrl(
      supabase,
      user.id,
      uploadedAvatarUrl
    )

    const nextState = await buildAvatarState(supabase, user, avatarUrl)

    return NextResponse.json({
      ...nextState,
      selectedSource: 'uploaded' as AvatarSource
    })
  } catch (error) {
    console.error('Avatar Settings POST Error:', error)

    return NextResponse.json({ error: ERROR_MESSAGE() }, { status: 500 })
  }
}
