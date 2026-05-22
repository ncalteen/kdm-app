import { readFileSync, writeFileSync } from 'node:fs'

const [configPath, backupPath] = process.argv.slice(2)

if (!configPath || !backupPath) {
  console.error(
    'Usage: node scripts/ui-test-restore-supabase-smtp.mjs <config-path> <backup-path>'
  )
  process.exit(1)
}

function smtpBlockRange(lines) {
  const start = lines.findIndex((line) => line.trim() === '[auth.email.smtp]')
  if (start === -1) throw new Error('Missing [auth.email.smtp] block')

  let end = start + 1

  while (
    end < lines.length &&
    lines[end].trim() !== '' &&
    !lines[end].startsWith('[')
  )
    end += 1

  return { start, end }
}

const currentLines = readFileSync(configPath, 'utf8').split('\n')
const backupLines = readFileSync(backupPath, 'utf8').split('\n')
const currentRange = smtpBlockRange(currentLines)
const backupRange = smtpBlockRange(backupLines)
const backupBlock = backupLines.slice(backupRange.start, backupRange.end)

currentLines.splice(
  currentRange.start,
  currentRange.end - currentRange.start,
  ...backupBlock
)

writeFileSync(configPath, currentLines.join('\n'))
