const MAILPIT_URL = process.env.MAILPIT_URL ?? 'http://127.0.0.1:54324'

/** Captured Mail Message */
export interface CapturedMailMessage {
  /** Summary From The Mailpit List Endpoint */
  summary: unknown
  /** Full Message Detail When Mailpit Provides An ID */
  detail: unknown
}

/**
 * Clear Mailpit Message
 *
 * Clears all messages from Mailpit.
 */
export async function clearMailpitMessages(): Promise<void> {
  const response = await fetch(`${MAILPIT_URL}/api/v1/messages`, {
    method: 'DELETE'
  })

  if (!response.ok)
    throw new Error(`Mailpit clear failed with HTTP ${response.status}`)
}

/**
 * Wait For Message To
 *
 * Polls Mailpit until a message addressed to the supplied email appears.
 *
 * @param email Recipient Email
 * @param options Match Options
 * @returns Captured Message
 */
export async function waitForMessageTo(
  email: string,
  options: { subjectIncludes?: string } = {}
): Promise<CapturedMailMessage> {
  const timeoutAt = Date.now() + 10_000

  while (Date.now() < timeoutAt) {
    const summaries = await listMessages()
    const summary = summaries.find((candidate) =>
      messageMatches(candidate, email, options.subjectIncludes)
    )

    if (summary) {
      const messageId = getStringField(summary, ['ID', 'Id', 'id'])
      const detail = messageId ? await getMessage(messageId) : summary
      return { summary, detail }
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for Mailpit message to ${email}`)
}

/**
 * Extract Confirmation URL
 *
 * @param message Captured Mail Message
 * @returns Supabase Confirmation URL
 */
export function extractConfirmationUrl(message: unknown): string {
  const content = JSON.stringify(message).replaceAll('&amp;', '&')
  const urls = content.match(/https?:\/\/[^"'<>\\\s]+/g) ?? []
  const confirmationUrl = urls.find(
    (url) => url.includes('/auth/v1/verify') || url.includes('/auth/confirm')
  )

  if (!confirmationUrl) throw new Error('Confirmation URL not found in email')

  return confirmationUrl
}

/**
 * List Mailpit Messages
 *
 * Fetches a list of all messages from Mailpit.
 *
 * @returns Array of captured messages
 */
async function listMessages(): Promise<unknown[]> {
  const response = await fetch(`${MAILPIT_URL}/api/v1/messages`)
  if (!response.ok)
    throw new Error(`Mailpit list failed with HTTP ${response.status}`)

  const body = await response.json()
  const record = asRecord(body)
  const messages = record?.messages ?? record?.Messages

  return Array.isArray(messages) ? messages : []
}

/**
 * Get Mailpit Message
 *
 * Fetches a specific message from Mailpit by its ID.
 *
 * @param id Message ID
 * @returns Captured message
 */
async function getMessage(id: string): Promise<unknown> {
  const response = await fetch(`${MAILPIT_URL}/api/v1/message/${id}`)
  if (!response.ok)
    throw new Error(`Mailpit message ${id} failed with HTTP ${response.status}`)

  return response.json()
}

/**
 * Message Matches
 *
 * Checks if a message matches the specified criteria.
 *
 * @param message The message to check
 * @param email The email to check for
 * @param subjectIncludes The subject to check for
 * @returns True if the message matches, false otherwise
 */
function messageMatches(
  message: unknown,
  email: string,
  subjectIncludes: string | undefined
): boolean {
  const serialized = JSON.stringify(message).toLowerCase()
  if (!serialized.includes(email.toLowerCase())) return false

  if (!subjectIncludes) return true

  const subject = getStringField(message, ['Subject', 'subject'])
  return subject.toLowerCase().includes(subjectIncludes.toLowerCase())
}

/**
 * Get String Field
 *
 * Extracts a string field from a record, checking multiple possible key names.
 *
 * @param value The value to extract the field from
 * @param keys The possible key names to check
 * @returns The value of the field, or an empty string if not found
 */
function getStringField(value: unknown, keys: string[]): string {
  const record = asRecord(value)
  if (!record) return ''

  for (const key of keys) {
    const field = record[key]
    if (typeof field === 'string') return field
  }

  return ''
}

/**
 * As Record
 *
 * Converts a value to a record, if possible.
 *
 * @param value The value to convert
 * @returns The value as a record, or null if not possible
 */
function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}
