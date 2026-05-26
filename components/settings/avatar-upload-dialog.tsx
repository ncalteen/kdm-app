'use client'

import { UserAvatar } from '@/components/generic/user-avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isSupportedAvatarMimeType } from '@/lib/avatar-upload'
import {
  MAX_AVATAR_FILE_SIZE_BYTES,
  MAX_AVATAR_HEIGHT_PX,
  MAX_AVATAR_WIDTH_PX,
  SUPPORTED_AVATAR_FILE_LABEL
} from '@/lib/common'
import {
  AVATAR_INVALID_DIMENSIONS_MESSAGE,
  AVATAR_INVALID_SIZE_MESSAGE,
  AVATAR_INVALID_TYPE_MESSAGE,
  AVATAR_UPLOAD_SUCCESS_MESSAGE,
  ERROR_MESSAGE
} from '@/lib/messages'
import { UserSettingsDetail } from '@/lib/types'
import { TriangleAlertIcon, UploadIcon } from 'lucide-react'
import { ChangeEvent, ReactElement, useEffect, useMemo, useState } from 'react'
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
  selectedSource: 'provider' | 'uploaded' | 'none'
}

/**
 * Avatar Upload Dialog Properties
 */
interface AvatarUploadDialogProps {
  /** Current User Settings */
  userSettings: UserSettingsDetail | null
  /** Upload Disabled State */
  disabled?: boolean
  /** Handle Successful Upload */
  onUploadComplete: (nextState: AvatarStatePayload) => void
}

/**
 * Read Image Dimensions
 *
 * @param file Image File
 * @returns Image Dimensions
 */
async function readImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = new Image()

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()

      image.onerror = () =>
        reject(new Error('Failed to decode image dimensions.'))

      image.src = objectUrl
    })

    return {
      width: image.naturalWidth,
      height: image.naturalHeight
    }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

/**
 * Avatar Upload Dialog
 *
 * Handles avatar file selection, preview, validation, and upload confirmation
 * in a dedicated dialog.
 *
 * @param props Avatar Upload Dialog Properties
 * @returns Avatar Upload Dialog Component
 */
export function AvatarUploadDialog({
  userSettings,
  disabled = false,
  onUploadComplete
}: AvatarUploadDialogProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const maxFileSizeMB = useMemo(
    () => Math.floor(MAX_AVATAR_FILE_SIZE_BYTES / (1024 * 1024)),
    []
  )

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const resetDialogState = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setPreviewFile(null)
    setError(null)
    setIsUploading(false)
  }

  /**
   * Handle Dialog Open Change
   *
   * @param nextOpen Next Open State
   */
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetDialogState()
    setOpen(nextOpen)
  }

  /**
   * Handle Avatar File Selection
   *
   * @param event React Change Event
   */
  const handleAvatarSelection = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const candidate = event.target.files?.[0] ?? null

    setError(null)

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }

    setPreviewFile(null)

    if (!candidate) return

    if (!isSupportedAvatarMimeType(candidate.type)) {
      setError(AVATAR_INVALID_TYPE_MESSAGE())
      return
    }

    if (candidate.size > MAX_AVATAR_FILE_SIZE_BYTES) {
      setError(AVATAR_INVALID_SIZE_MESSAGE(maxFileSizeMB))
      return
    }

    try {
      const { width, height } = await readImageDimensions(candidate)

      if (width > MAX_AVATAR_WIDTH_PX || height > MAX_AVATAR_HEIGHT_PX) {
        setError(
          AVATAR_INVALID_DIMENSIONS_MESSAGE(
            MAX_AVATAR_WIDTH_PX,
            MAX_AVATAR_HEIGHT_PX
          )
        )
        return
      }

      setPreviewFile(candidate)
      setPreviewUrl(URL.createObjectURL(candidate))
    } catch {
      setError(AVATAR_INVALID_TYPE_MESSAGE())
    }
  }

  /**
   * Confirm Avatar Upload
   */
  const handleConfirmUpload = async () => {
    if (!previewFile || !userSettings) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('action', 'upload')
      formData.append('avatar', previewFile)

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

      onUploadComplete(payload as AvatarStatePayload)
      toast.success(AVATAR_UPLOAD_SUCCESS_MESSAGE())
      handleOpenChange(false)
    } catch (uploadError: unknown) {
      console.error('Avatar Upload Request Error:', uploadError)
      setError(ERROR_MESSAGE())
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || !userSettings}>
          <UploadIcon className="size-4" aria-hidden="true" />
          Upload custom avatar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload custom avatar</DialogTitle>
          <DialogDescription>
            Offer a new face to the lantern light, then confirm before it is
            bound.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="avatar-upload">Choose image</Label>
            <Input
              id="avatar-upload"
              name="avatar-upload"
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              disabled={disabled || isUploading || !userSettings}
              onChange={handleAvatarSelection}
            />
            <p className="text-xs text-muted-foreground">
              {SUPPORTED_AVATAR_FILE_LABEL} up to {maxFileSizeMB} MB and up to{' '}
              {MAX_AVATAR_WIDTH_PX}x{MAX_AVATAR_HEIGHT_PX}px.
            </p>
          </div>

          {previewUrl && (
            <div className="flex flex-col gap-3 rounded-md border p-3">
              <p className="text-sm font-medium">Preview new avatar</p>
              <div className="flex items-center gap-3">
                <UserAvatar
                  avatarUrl={previewUrl}
                  username={userSettings?.username}
                  userId={userSettings?.user_id}
                  className="size-12"
                />
                <p className="text-xs text-muted-foreground">
                  Confirm before this image is uploaded.
                </p>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <TriangleAlertIcon className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmUpload}
            disabled={isUploading || !previewFile}>
            {isUploading ? 'Binding your sigil...' : 'Confirm and upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
