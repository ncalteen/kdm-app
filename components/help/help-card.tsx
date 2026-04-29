'use client'

import { LanternMark } from '@/components/generic/lantern-mark'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GITHUB_ISSUES_URL, SUPPORT_EMAIL } from '@/lib/common'
import { GithubIcon, MailIcon } from 'lucide-react'
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
    <div className="flex flex-col gap-4 pt-2">
      {/* Support Overview */}
      <Card className="p-0">
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <LanternMark className="h-5 w-5 text-amber-400/90" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className="text-sm text-muted-foreground">
            In the plain of stone faces, only survivors who band together
            persist. If the darkness has swallowed your progress or you wish to
            share a discovery, call for aid below.
          </p>
        </CardContent>
      </Card>

      {/* GitHub Issues */}
      <Card className="p-0">
        <CardHeader className="px-4 pt-3 pb-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <GithubIcon className="h-5 w-5" />
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
              <GithubIcon className="h-4 w-4" />
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
