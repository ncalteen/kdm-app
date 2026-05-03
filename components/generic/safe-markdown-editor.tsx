'use client'

import MDEditor, { MDEditorProps } from '@uiw/react-md-editor'
import { ComponentProps, ReactElement } from 'react'
import rehypeSanitize from 'rehype-sanitize'

/**
 * Markdown Preview Props
 *
 * Derived from `MDEditor.Markdown` so we don't have to depend on the transitive
 * `@uiw/react-markdown-preview` package directly.
 */
type MarkdownPreviewProps = ComponentProps<typeof MDEditor.Markdown>

/**
 * Default Rehype Plugins
 *
 * Applied to every markdown render path used by this app to neutralize
 * potentially malicious content authored by users (e.g. `<script>` tags or
 * `javascript:` URLs in custom rules text). Centralizing the configuration
 * here keeps every call site safe by default.
 *
 * @see https://github.com/uiwjs/react-md-editor#security
 */
const DEFAULT_REHYPE_PLUGINS = [[rehypeSanitize]]

/**
 * Safe Markdown Editor
 *
 * Drop-in replacement for `@uiw/react-md-editor`'s default export that wires
 * `rehype-sanitize` into the live preview by default. Any
 * `previewOptions.rehypePlugins` provided by the caller are appended after the
 * sanitizer so additional plugins can still be layered on without losing the
 * security guarantee.
 *
 * @param props MDEditor Properties
 * @returns Sanitized Markdown Editor
 */
export function SafeMarkdownEditor({
  previewOptions,
  ...props
}: MDEditorProps): ReactElement {
  const callerPlugins = previewOptions?.rehypePlugins ?? []

  return (
    <MDEditor
      {...props}
      previewOptions={{
        ...previewOptions,
        rehypePlugins: [
          ...DEFAULT_REHYPE_PLUGINS,
          ...callerPlugins
        ] as MarkdownPreviewProps['rehypePlugins']
      }}
    />
  )
}

/**
 * Safe Markdown Preview
 *
 * Drop-in replacement for `MDEditor.Markdown` that wires `rehype-sanitize` into
 * the render pipeline by default. Caller-provided `rehypePlugins` are appended
 * after the sanitizer.
 *
 * @param props Markdown Preview Properties
 * @returns Sanitized Markdown Preview
 */
export function SafeMarkdownPreview({
  rehypePlugins,
  ...props
}: MarkdownPreviewProps): ReactElement {
  const callerPlugins = rehypePlugins ?? []

  return (
    <MDEditor.Markdown
      {...props}
      rehypePlugins={
        [
          ...DEFAULT_REHYPE_PLUGINS,
          ...callerPlugins
        ] as MarkdownPreviewProps['rehypePlugins']
      }
    />
  )
}
