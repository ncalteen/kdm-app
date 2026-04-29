'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { ReactElement, useState } from 'react'

/**
 * Discord OAuth Button
 *
 * Initiates a Supabase OAuth sign-in with Discord as the provider. Used by both
 * the login and sign-up forms so that returning and first-time users share a
 * single, consistent entry point.
 *
 * @param props Discord Button Properties
 * @returns Discord Button Component
 */
export function DiscordButton({
  onError,
  label = 'Continue with Discord'
}: {
  onError?: (message: string) => void
  label?: string
}): ReactElement {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    const supabase = createClient()

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      // On success the browser is redirected away to Discord, so this code only
      // runs when an error prevents that redirect.
      if (error) throw error
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to start the Discord sign-in flow'
      onError?.(message)
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
      disabled={isLoading}>
      <Image
        src="/discord.svg"
        alt=""
        width={21}
        height={16}
        aria-hidden="true"
        className="mr-2"
        style={{ height: 'auto' }}
      />
      {isLoading ? 'Redirecting...' : label}
    </Button>
  )
}
