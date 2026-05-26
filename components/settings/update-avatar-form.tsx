'use client'

import { UserAvatar } from '@/components/generic/user-avatar'
import { AvatarUploadDialog } from '@/components/settings/avatar-upload-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AVATAR_SOURCE_UPDATED_MESSAGE, ERROR_MESSAGE } from '@/lib/messages'
import { AvatarSource, UserSettingsDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { TriangleAlertIcon } from 'lucide-react'
import {
  ComponentPropsWithoutRef,
  ReactElement,
  useEffect,
  useState
} from 'react'
import { toast } from 'sonner'

/**
 * Avatar State Payload
 */
interface AvatarStatePayload {
  /** Current Avatar URL */
  avatarUrl: string | null
  /** Provider Avatar URL */
  providerAvatarUrl: string | null
  /** Uploaded Avatar URL */
  uploadedAvatarUrl: string | null
  /** Selected Source */
  selectedSource: AvatarSource
}

/**
 * Update Avatar Form Properties
 */
interface UpdateAvatarFormProps extends ComponentPropsWithoutRef<'div'> {
  /** Set User Settings */
  setUserSettings: (settings: UserSettingsDetail | null) => void
  /** User Settings */
  userSettings: UserSettingsDetail | null
}

/**
 * Update Avatar Form
 *
 * Allows the user to either upload a custom avatar image or switch between
 * their available avatar sources (OAuth provider avatar and uploaded avatar).
 *
 * @param props Update Avatar Form Properties
 * @returns Update Avatar Form Component
 */
export function UpdateAvatarForm({
  className,
  setUserSettings,
  userSettings,
  ...props
}: UpdateAvatarFormProps): ReactElement {
  const [avatarState, setAvatarState] = useState<AvatarStatePayload | null>(
    null
  )
  const [selectedSource, setSelectedSource] = useState<AvatarSource>('none')
  const [error, setError] = useState<string | null>(null)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isSavingSource, setIsSavingSource] = useState(false)

  /**
   * Resolve Display Avatar URL
   *
   * @param source Avatar Source
   * @returns Avatar URL For Header Display
   */
  const resolveDisplayAvatarUrl = (source: AvatarSource): string | null => {
    if (!avatarState) return userSettings?.avatar_url ?? null

    switch (source) {
      case 'provider':
        return avatarState.providerAvatarUrl
      case 'uploaded':
        return avatarState.uploadedAvatarUrl
      default:
        return avatarState.avatarUrl ?? userSettings?.avatar_url ?? null
    }
  }

  useEffect(() => {
    let cancelled = false

    fetch('/api/user/avatar', { method: 'GET' })
      .then(async (response) => {
        const json = (await response.json()) as
          | AvatarStatePayload
          | { error?: string }

        if (!response.ok)
          throw new Error((json as { error?: string }).error ?? ERROR_MESSAGE())

        if (cancelled) return

        setAvatarState(json as AvatarStatePayload)
        setSelectedSource((json as AvatarStatePayload).selectedSource)
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return

        console.error('Avatar Settings Fetch Error:', fetchError)
        setError(
          fetchError instanceof Error ? fetchError.message : ERROR_MESSAGE()
        )
      })
      .finally(() => {
        if (!cancelled) setIsLoadingOptions(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  /**
   * Save Avatar Source Selection
   */
  const handleSaveSource = async () => {
    if (!userSettings) return
    if (!avatarState) return
    if (
      selectedSource === avatarState.selectedSource ||
      selectedSource === 'none'
    )
      return

    setIsSavingSource(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('action', 'select')
      formData.append('source', selectedSource)

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      })

      const payload = (await response.json()) as
        | AvatarStatePayload
        | { error?: string }

      if (!response.ok) {
        setError((payload as { error?: string }).error ?? ERROR_MESSAGE())
        return
      }

      const nextState = payload as AvatarStatePayload
      setAvatarState(nextState)
      setSelectedSource(nextState.selectedSource)
      setUserSettings({
        ...userSettings,
        avatar_url: nextState.avatarUrl
      })
      toast.success(AVATAR_SOURCE_UPDATED_MESSAGE())
    } catch (saveError: unknown) {
      console.error('Avatar Source Save Error:', saveError)
      setError(ERROR_MESSAGE())
    } finally {
      setIsSavingSource(false)
    }
  }

  const currentAvatarUrl = resolveDisplayAvatarUrl(selectedSource)
  const hasProviderAvatar = !!avatarState?.providerAvatarUrl
  const hasUploadedAvatar = !!avatarState?.uploadedAvatarUrl

  /**
   * Handle Upload Completion
   *
   * @param nextState Next Avatar State
   */
  const handleUploadComplete = (nextState: AvatarStatePayload) => {
    if (!userSettings) return

    setError(null)
    setAvatarState(nextState)
    setSelectedSource(nextState.selectedSource)
    setUserSettings({
      ...userSettings,
      avatar_url: nextState.avatarUrl
    })
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="h-full p-0 pb-4">
        <CardHeader className="flex flex-row items-start gap-3 px-4 pt-3 pb-0">
          <UserAvatar
            avatarUrl={currentAvatarUrl}
            username={userSettings?.username}
            userId={userSettings?.user_id}
            className="mt-0.5 size-12"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="text-lg">Mark yourself</CardTitle>
            <CardDescription className="text-sm">
              Choose which face other survivors see beside your edits.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6">
            {(hasProviderAvatar || hasUploadedAvatar) && (
              <div className="flex flex-col gap-6">
                <div className="grid min-h-21 gap-2">
                  <Label>Active avatar source</Label>
                  {isLoadingOptions ? (
                    <p className="text-xs text-muted-foreground">
                      Reading the echoes...
                    </p>
                  ) : (
                    <>
                      <RadioGroup
                        className="gap-3"
                        value={selectedSource}
                        onValueChange={(value) =>
                          setSelectedSource((value as AvatarSource) ?? 'none')
                        }>
                        {hasProviderAvatar && (
                          <label className="flex items-center gap-2 text-sm">
                            <RadioGroupItem
                              value="provider"
                              id="avatar-source-provider"
                            />
                            <span>Use Discord avatar</span>
                          </label>
                        )}
                        {hasUploadedAvatar && (
                          <label className="flex items-center gap-2 text-sm">
                            <RadioGroupItem
                              value="uploaded"
                              id="avatar-source-uploaded"
                            />
                            <span>Use uploaded avatar</span>
                          </label>
                        )}
                      </RadioGroup>
                    </>
                  )}
                </div>

                <Button
                  type="button"
                  className="w-full"
                  disabled={
                    isSavingSource ||
                    !avatarState ||
                    selectedSource === 'none' ||
                    selectedSource === avatarState.selectedSource
                  }
                  onClick={handleSaveSource}>
                  {isSavingSource ? 'Rekindling...' : 'Save avatar choice'}
                </Button>
              </div>
            )}

            <AvatarUploadDialog
              userSettings={userSettings}
              disabled={isSavingSource}
              onUploadComplete={handleUploadComplete}
            />

            {error && (
              <Alert variant="destructive">
                <TriangleAlertIcon className="h-4 w-4" aria-hidden="true" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
