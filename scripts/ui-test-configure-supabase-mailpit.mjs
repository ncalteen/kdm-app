import { readFileSync, writeFileSync } from 'node:fs'

const configPath = process.argv[2]

if (!configPath) {
  console.error(
    'Usage: node scripts/ui-test-configure-supabase-mailpit.mjs <config-path>'
  )
  process.exit(1)
}

const mailpitSmtpBlock = [
  '[auth.email.smtp]',
  'enabled = true',
  'host = "inbucket"',
  'port = 1025',
  'user = "mailpit"',
  'pass = "mailpit"',
  'admin_email = "noreply@archivist.monster"',
  'sender_name = "No Reply - KD:M Archivist"'
]

const lines = readFileSync(configPath, 'utf8').split('\n')
const start = lines.findIndex((line) => line.trim() === '[auth.email.smtp]')

if (start === -1) throw new Error(`Missing [auth.email.smtp] in ${configPath}`)

let end = start + 1

while (
  end < lines.length &&
  lines[end].trim() !== '' &&
  !lines[end].startsWith('[')
)
  end += 1

lines.splice(start, end - start, ...mailpitSmtpBlock)

writeFileSync(configPath, lines.join('\n'))
