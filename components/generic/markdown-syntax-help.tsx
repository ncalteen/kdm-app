'use client'

import { MARKDOWN_SYNTAX_URL } from '@/lib/common'
import { ReactElement } from 'react'

/**
 * Markdown Syntax Help Component
 *
 * Renders a small inline link to the basic markdown syntax reference. Intended
 * to be displayed beneath every markdown editor across the app so users have
 * quick access to formatting documentation.
 *
 * @returns Markdown Syntax Help Component
 */
export function MarkdownSyntaxHelp(): ReactElement {
  return (
    <p className="text-xs text-muted-foreground">
      Need help with formatting? See the{' '}
      <a
        href={MARKDOWN_SYNTAX_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-foreground">
        basic markdown syntax guide
      </a>
      .
    </p>
  )
}
