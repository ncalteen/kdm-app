'use client'

import { LanternMark } from '@/components/generic/lantern-mark'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GITHUB_ISSUES_URL, SUPPORT_EMAIL } from '@/lib/common'
import { MailIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ReactElement } from 'react'

/**
 * Help Card Component
 *
 * Displays support information for users, directing them to the GitHub Issues
 * page or to email support if they do not have a GitHub account.
 *
 * @returns Help Card Component
 */
export function HelpCard(): ReactElement {
  return (
    <div className="flex flex-col gap-2 pt-12 px-2">
      {/* Support Overview */}
      <Card className="p-0">
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <LanternMark className="h-5 w-5 text-amber-400/90" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex flex-row gap-4">
          <div className="flex flex-col justify-between">
            <p className="text-sm text-muted-foreground">
              In the plain of stone faces, only survivors who band together
              persist. If the darkness has swallowed your progress or you wish
              to share a discovery, call for aid below.
            </p>

            <p className="text-sm text-muted-foreground">
              If you like this project, consider supporting it on{' '}
              <Link
                href="https://github.com/sponsors/ncalteen"
                className="underline"
                target="_blank"
                rel="noopener noreferrer">
                GitHub Sponsors
              </Link>{' '}
              or by{' '}
              <Link
                href="https://github.com/sponsors/ncalteen"
                className="underline"
                target="_blank"
                rel="noopener noreferrer">
                buying me a coffee
              </Link>
              . Your support fuels development and keeps the lantern burning
              bright in the darkest nights. Thank you for being a part of this
              journey!
            </p>
          </div>

          <Image
            src="/bmc_qr.png"
            alt=""
            width={200}
            height={200}
            aria-hidden="true"
          />
        </CardContent>
      </Card>

      {/* GitHub Issues */}
      <Card className="p-0">
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <Image
              src="/github.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
              className="h-5 w-5 dark:invert"
            />
            Report an Issue on GitHub
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <p className="text-sm text-muted-foreground">
            The preferred way to request support, report bugs, or suggest new
            features is through the GitHub Issues page. Your reports light the
            way for future improvements.
          </p>
          <Button asChild variant="outline" id="help-github-link">
            <a
              href={GITHUB_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open GitHub Issues page in a new tab">
              <Image
                src="/github.svg"
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
                className="h-4 w-4 dark:invert"
              />
              Open GitHub Issues
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Email Support */}
      <Card className="p-0">
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <MailIcon className="h-5 w-5" />
            No GitHub Account?
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <p className="text-sm text-muted-foreground">
            If you do not have a GitHub account, you can still call out into the
            darkness. Send a message to the address below and we will answer
            when time allows.
          </p>
          <Button asChild variant="outline" id="help-email-link">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              aria-label={`Send a support email to ${SUPPORT_EMAIL}`}>
              <MailIcon className="h-4 w-4" />
              {SUPPORT_EMAIL}
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
