const [name, url] = process.argv.slice(2)

if (!name || !url) {
  console.error('Usage: node scripts/ui-test-verify-endpoint.mjs <name> <url>')
  process.exit(1)
}

try {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`${name} is not reachable at ${url}: ${message}`)
  process.exit(1)
}
