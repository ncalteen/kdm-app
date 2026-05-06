'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LocalStateType } from '@/contexts/local-context'
import { useToast } from '@/hooks/use-toast'
import { renameUsername, USERNAME_PATTERN } from '@/lib/dal/user'
import {
  ERROR_MESSAGE,
  USERNAME_INVALID_FORMAT_MESSAGE,
  USERNAME_RENAME_COLLISION_MESSAGE,
  USERNAME_RENAME_RATE_LIMITED_MESSAGE,
  USERNAME_RENAME_SUCCESS_MESSAGE
} from '@/lib/messages'
import { createClient } from '@/lib/supabase/client'
import { UserSettingsDetail } from '@/lib/types'
import { cn } from '@/lib/utils'
import { TriangleAlertIcon } from 'lucide-react'
import {
  ComponentPropsWithoutRef,
  FormEvent,
  ReactElement,
  useEffect,
  useState
} from 'react'

/**
 * Update Username Form Properties
 */
interface UpdateUsernameFormProps extends ComponentPropsWithoutRef<'div'> {
  /** Local State */
  local: LocalStateType
  /** Set User Settings */
  setUserSettings: (settings: UserSettingsDetail | null) => void
  /** User Settings */
  userSettings: UserSettingsDetail | null
}

/**
 * Username Availability State
 *
 * Tracks the asynchronous availability check that runs after the user pauses
 * typing. `idle` covers both the initial render and the case where the input
 * matches the current handle (renaming to yourself is a no-op).
 */
type AvailabilityState =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken'
  | 'invalid-format'

/**
 * Update Username Form
 *
 * Lets the authenticated user rename their handle. OAuth-derived placeholder
 * usernames (e.g. `u_abc12345`) cannot be invited by a friend, so this form
 * is the only path from "anonymous lantern-bearer" to "named survivor."
 *
 * Mirrors the sign-up form's debounced `check_username_available` probe so
 * users see availability feedback before submitting. The actual rename goes
 * through the `rename_username` RPC, which enforces format, collision, and
 * a 10-minute throttle on the server.
 *
 * @param props Update Username Form Properties
 * @returns Update Username Form Component
 */
export function UpdateUsernameForm({
  className,
  local,
  setUserSettings,
  userSettings,
  ...props
}: UpdateUsernameFormProps): ReactElement {
  const { toast } = useToast(local)
  const currentUsername = userSettings?.username ?? ''
  const [username, setUsername] = useState(currentUsername)
  const [availability, setAvailability] = useState<AvailabilityState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Sync the input back to the latest user-settings handle whenever it
  // changes (e.g. after a successful rename or a sign-in elsewhere).
  useEffect(() => {
    setUsername(currentUsername)
  }, [currentUsername])

  // Debounced availability probe. `check_username_available` is the same RPC
  // sign-up uses; reusing it keeps the two flows consistent. The probe is
  // skipped when the input matches the current handle (no-op rename).
  useEffect(() => {
    setError(null)

    if (username === currentUsername) {
      setAvailability('idle')
      return
    }

    if (!USERNAME_PATTERN.test(username)) {
      setAvailability(username.length === 0 ? 'idle' : 'invalid-format')
      return
    }

    setAvailability('checking')

    let cancelled = false
    const handle = setTimeout(async () => {
      const supabase = createClient()
      const { data, error: rpcError } = await supabase.rpc(
        'check_username_available',
        { desired_username: username }
      )
      if (cancelled) return
      if (rpcError) {
        console.error('Username Availability Check Error:', rpcError)
        setAvailability('idle')
        return
      }
      setAvailability(data ? 'available' : 'taken')
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [username, currentUsername])

  /**
   * Handle Update Username Form Submission
   *
   * @param e React Form Event
   */
  const handleUpdateUsername = async (e: FormEvent) => {
    e.preventDefault()

    if (!userSettings) return
    if (username === currentUsername) return

    setIsSaving(true)
    setError(null)

    try {
      const result = await renameUsername(username)

      if (result === 'success') {
        setUserSettings({ ...userSettings, username })
        toast.success(USERNAME_RENAME_SUCCESS_MESSAGE())
        return
      }

      if (result === 'collision') {
        setAvailability('taken')
        toast.error(USERNAME_RENAME_COLLISION_MESSAGE())
        return
      }

      if (result === 'rate-limited') {
        toast.error(USERNAME_RENAME_RATE_LIMITED_MESSAGE())
        return
      }

      // invalid-format
      setAvailability('invalid-format')
      setError(USERNAME_INVALID_FORMAT_MESSAGE())
      toast.error(USERNAME_INVALID_FORMAT_MESSAGE())
    } catch (err: unknown) {
      console.error('Username Rename Error:', err)
      toast.error(ERROR_MESSAGE())
    } finally {
      setIsSaving(false)
    }
  }

  const isLoadingSettings = userSettings === null
  const submitDisabled =
    isLoadingSettings ||
    isSaving ||
    username === currentUsername ||
    availability === 'checking' ||
    availability === 'taken' ||
    availability === 'invalid-format'

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="p-0 pb-4 h-full">
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-lg">Choose your name</CardTitle>
          <CardDescription className="text-sm">
            The handle other survivors use to invite you to their lanterns.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpdateUsername}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  pattern="[a-zA-Z0-9_]{3,20}"
                  minLength={3}
                  maxLength={20}
                  required
                  disabled={isLoadingSettings || isSaving}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <UsernameAvailabilityHint
                  state={availability}
                  isUnchanged={username === currentUsername}
                  isLoading={isLoadingSettings}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <TriangleAlertIcon className="h-4 w-4" aria-hidden="true" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={submitDisabled}>
                {isSaving ? 'Speaking the name...' : 'Save new name'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Username Availability Hint Properties
 */
interface UsernameAvailabilityHintProps {
  /** Availability State */
  state: AvailabilityState
  /** Username Matches the Current Handle */
  isUnchanged: boolean
  /** User Settings Are Still Loading */
  isLoading: boolean
}

/**
 * Username Availability Hint
 *
 * Renders a single line of hint text under the username input describing
 * the current availability check state.
 *
 * @param props Username Availability Hint Properties
 * @returns Hint Element
 */
function UsernameAvailabilityHint({
  state,
  isUnchanged,
  isLoading
}: UsernameAvailabilityHintProps): ReactElement {
  if (isLoading)
    return (
      <p className="text-xs text-muted-foreground">
        The lantern hoard is recalling your name...
      </p>
    )

  if (isUnchanged)
    return (
      <p className="text-xs text-muted-foreground">
        Your name as the lantern hoard already knows it.
      </p>
    )

  if (state === 'checking')
    return (
      <p className="text-xs text-muted-foreground">Listening for echoes...</p>
    )

  if (state === 'available')
    return (
      <p className="text-xs text-emerald-600">This name is yours to take.</p>
    )

  if (state === 'taken')
    return (
      <p className="text-xs text-destructive">
        Another survivor already answers to this name.
      </p>
    )

  if (state === 'invalid-format')
    return (
      <p className="text-xs text-destructive">
        {USERNAME_INVALID_FORMAT_MESSAGE()}
      </p>
    )

  return (
    <p className="text-xs text-muted-foreground">
      3-20 letters, numbers, or underscores.
    </p>
  )
}
