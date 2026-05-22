const [name, url] = process.argv.slice(2)
const timeoutMs = Number(process.env.UI_TEST_ENDPOINT_TIMEOUT_MS ?? 10_000)

if (!name || !url) {
  console.error('Usage: node scripts/ui-test-verify-endpoint.mjs <name> <url>')
  process.exit(1)
}

if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
  console.error('UI_TEST_ENDPOINT_TIMEOUT_MS must be a positive number')
  process.exit(1)
}

const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), timeoutMs)

try {
  const response = await fetch(url, { signal: controller.signal })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
} catch (error) {
  const timedOut = error instanceof Error && error.name === 'AbortError'
  const message = timedOut
    ? `timed out after ${timeoutMs}ms`
    : error instanceof Error
      ? error.message
      : String(error)
  console.error(`${name} is not reachable at ${url}: ${message}`)
  process.exit(1)
} finally {
  clearTimeout(timeout)
}
