#!/usr/bin/env node
/**
 * RLS Policy Coverage Report
 *
 * Produces a coverage matrix for the RLS integration test suite by
 * statically cross-referencing two sources:
 *
 *   1. `supabase/migrations/*.sql` — every `create policy` (minus any
 *      subsequent `drop policy`) defines the canonical inventory of
 *      Row Level Security policies that should be enforced.
 *
 *   2. `__tests__/integration/rls/*.test.ts` — every `.from('<table>')`
 *      call followed (within a short window) by `.select`, `.insert`,
 *      `.update`, or `.delete` records that the test suite exercises
 *      that (table, command) cell.
 *
 * The script reports:
 *   - Total user-facing policies (excluding `Allow all for admin`,
 *     which is `is_admin()`-gated and bypassed by service_role; not
 *     reachable through anon-key clients).
 *   - Tables with **zero** test touch (hard gaps).
 *   - (table, command) cells with policies but no test exercise
 *     (per-command gaps).
 *   - Per-test-file table footprint (informational).
 *
 * This script does NOT require a running database — it reads the SQL
 * migrations directly. RLS policy execution itself is verified at
 * runtime by the integration tests; this script verifies the test
 * suite covers the matrix.
 *
 * Limitations:
 *   - Branch-level coverage (e.g. distinguishing "Allow select for
 *     owner" vs "Allow select for member" on the same table) is NOT
 *     measured here. Both attach to the same (table, SELECT) cell.
 *     Branch coverage can be added in a future phase via tagged tests
 *     and a manifest. See docs/integration-tests.md.
 *
 * Usage:
 *   node scripts/rls-coverage.mjs              # human-readable report
 *                                              # also writes the badge
 *   node scripts/rls-coverage.mjs --json       # JSON output (CI)
 *   node scripts/rls-coverage.mjs --strict     # exit 1 on any gap
 *   node scripts/rls-coverage.mjs --no-badge   # skip badge emission
 */
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const MIGRATIONS_DIR = join(REPO_ROOT, 'supabase', 'migrations')
const RLS_TEST_DIR = join(REPO_ROOT, '__tests__', 'integration', 'rls')
const BADGE_PATH = join(REPO_ROOT, 'badges', 'rls-coverage.svg')

const ARGS = new Set(process.argv.slice(2))
const JSON_OUTPUT = ARGS.has('--json')
const STRICT = ARGS.has('--strict')
const NO_BADGE = ARGS.has('--no-badge')

/**
 * Strip SQL line comments (`-- ...`) so policy keywords inside comments
 * don't trip the parser. Block comments `/* ... *\/` are not used in
 * this codebase's migrations.
 *
 * @param {string} sql Raw SQL text.
 * @returns {string} SQL with line comments removed.
 */
function stripSqlComments(sql) {
  return sql
    .split('\n')
    .map((line) => line.replace(/--.*$/, ''))
    .join('\n')
}

/**
 * Extract the bare identifiers from a Postgres `text[] := array [...]`
 * literal. We use this to mine the dynamic `do $$ ... drop ... end $$`
 * blocks in `20260520000000_drop_catalog_shared_user_tables.sql` and
 * any similar future migration.
 *
 * Example input fragment (multiline):
 *   array [
 *     'foo',
 *     'bar'
 *   ]
 *
 * @param {string} block A snippet expected to contain an `array [...]` literal.
 * @returns {string[]} Quoted-string entries, with quotes stripped.
 */
function extractArrayLiteral(block) {
  const arrMatch = block.match(/array\s*\[([\s\S]*?)\]/i)
  if (!arrMatch) return []
  return [...arrMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
}

/**
 * Parse `create policy`, `drop policy`, and `drop table` statements
 * out of every migration in lexical (= chronological) order. A policy
 * is in the net set if its last touch was a `create`. A `drop table`
 * removes every policy attached to that table (Postgres semantics).
 *
 * Two dynamic-SQL patterns are handled because they appear in real
 * migrations:
 *   1. `do $$ ... foreach t in array [...] loop execute format(
 *        'drop table if exists public.%I', t) ...` — mass drop tables.
 *   2. `do $$ ... foreach t in array [...] loop execute format(
 *        'drop policy if exists "X" on public.%I', t) ...` — mass drop
 *        the same-named policy across many tables.
 *
 * Migrations in this repo reference tables as bare identifiers on
 * `create policy` (no `public.` qualifier), so the regex accepts both
 * forms defensively.
 *
 * @returns {Array<{table: string, policy: string, cmd: string, file: string}>}
 *   Net policy inventory after applying all migrations in order.
 */
function parsePolicies() {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  // key = `${table}::${policyName}` — Postgres allows the same policy
  // name on different tables, but not two policies with the same name
  // on the same table.
  const policies = new Map()

  const createRe =
    /^\s*create\s+policy\s+"([^"]+)"\s+on\s+(?:public\.)?([a-z_][a-z0-9_]*)\s+for\s+(select|insert|update|delete|all)\b/gim
  const dropPolicyRe =
    /^\s*drop\s+policy\s+(?:if\s+exists\s+)?"([^"]+)"\s+on\s+(?:public\.)?([a-z_][a-z0-9_]*)\b/gim
  const dropTableRe =
    /^\s*drop\s+table\s+(?:if\s+exists\s+)?(?:public\.)?([a-z_][a-z0-9_]*)\b/gim
  // Dynamic block: capture the do-block body so we can mine arrays + execs.
  const doBlockRe = /\bdo\s*\$\$([\s\S]*?)\$\$\s*;/gi

  /**
   * Apply a `drop table <name>` by removing every policy whose key is
   * scoped to that table.
   *
   * @param {string} table
   */
  function dropTable(table) {
    for (const key of [...policies.keys()]) {
      if (key.startsWith(`${table}::`)) policies.delete(key)
    }
  }

  for (const f of files) {
    const sql = stripSqlComments(readFileSync(join(MIGRATIONS_DIR, f), 'utf-8'))

    let m

    // Static `create policy`.
    createRe.lastIndex = 0
    while ((m = createRe.exec(sql))) {
      const [, name, table, cmd] = m
      policies.set(`${table}::${name}`, {
        table,
        policy: name,
        cmd: cmd.toUpperCase(),
        file: f
      })
    }

    // Static `drop policy`.
    dropPolicyRe.lastIndex = 0
    while ((m = dropPolicyRe.exec(sql))) {
      const [, name, table] = m
      policies.delete(`${table}::${name}`)
    }

    // Static `drop table` (outside do-blocks).
    dropTableRe.lastIndex = 0
    while ((m = dropTableRe.exec(sql))) {
      const [, table] = m
      dropTable(table)
    }

    // Dynamic `do $$ ... $$` blocks: look for `drop table` / `drop
    // policy` execute-format patterns paired with array literals.
    doBlockRe.lastIndex = 0
    while ((m = doBlockRe.exec(sql))) {
      const body = m[1]
      const tableNames = extractArrayLiteral(body)
      if (tableNames.length === 0) continue

      if (/drop\s+table[^;]*%I/i.test(body)) {
        for (const t of tableNames) dropTable(t)
      }
      const policyExec = body.match(
        /drop\s+policy\s+if\s+exists\s+"([^"]+)"\s+on\s+public\.%I/i
      )
      if (policyExec) {
        const policyName = policyExec[1]
        for (const t of tableNames) policies.delete(`${t}::${policyName}`)
      }
    }
  }

  return [...policies.values()]
}

/**
 * Recursively walk a directory and return absolute paths to every
 * file whose name matches `predicate`.
 *
 * @param {string} dir Root directory.
 * @param {(name: string) => boolean} predicate Filename filter.
 * @returns {string[]} Absolute file paths.
 */
function walk(dir, predicate) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walk(full, predicate))
    else if (predicate(entry)) out.push(full)
  }
  return out
}

/**
 * Scan RLS integration tests for table references. Two detection
 * passes run per file:
 *
 *   1. Exact `.from('<literal>').<op>` matches — these give precise
 *      (table, cmd) coverage and are the strongest signal.
 *
 *   2. Table-name string literals appearing anywhere in the file —
 *      catches the common pattern where a test holds an array of
 *      table names and loops `.from(tbl)`. The cmd is then unknown
 *      (recorded as `'*'`), but the test undeniably exercises the
 *      table. Without this pass, ~half the suite shows as false
 *      "untouched" gaps because the array-driven tests are missed.
 *
 * Both passes require the canonical table set (`knownTables`) so the
 * indirect pass only counts known tables (not random words that
 * happen to look table-shaped).
 *
 * @param {Set<string>} knownTables Canonical inventory from migrations.
 * @returns {{
 *   tableCommands: Map<string, Map<string, Set<string>>>,
 *   rpcCalls: Map<string, Set<string>>,
 *   filesScanned: number
 * }}
 *   - tableCommands: table → cmd ('SELECT'|'INSERT'|'UPDATE'|'DELETE'|'*')
 *                    → set of test files
 *   - rpcCalls: rpc fn name → set of test files
 *   - filesScanned: total test files scanned
 */
function scanTests(knownTables) {
  const files = walk(RLS_TEST_DIR, (n) => n.endsWith('.test.ts'))

  /** @type {Map<string, Map<string, Set<string>>>} */
  const tableCommands = new Map()
  /** @type {Map<string, Set<string>>} */
  const rpcCalls = new Map()

  // Pass 1 — exact `.from('table').<op>`. `upsert` registers as both
  // INSERT and UPDATE because Postgres evaluates both policy sets.
  const fromOpRe =
    /\.from\(\s*['"`]([a-z_][a-z0-9_]*)['"`]\s*\)[\s\S]{0,400}?\.(select|insert|update|upsert|delete)\b/g
  // Pass 2 — any `'literal'` (or `"literal"` / template-literal) whose
  // value is a known table name. Comments are stripped first so
  // doc-references don't inflate coverage.
  const stringLiteralRe = /['"`]([a-z_][a-z0-9_]*)['"`]/g
  const rpcRe = /\.rpc\(\s*['"`]([a-z_][a-z0-9_]*)['"`]/g

  /**
   * Strip TypeScript line + block comments so referenced table names
   * inside JSDoc / `//` notes don't get scored as test coverage.
   *
   * @param {string} code
   * @returns {string}
   */
  function stripTsComments(code) {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1')
  }

  for (const fp of files) {
    const raw = readFileSync(fp, 'utf-8')
    const code = stripTsComments(raw)
    const rel = fp.slice(REPO_ROOT.length + 1)

    let m

    // Pass 1.
    fromOpRe.lastIndex = 0
    while ((m = fromOpRe.exec(code))) {
      const [, table, op] = m
      const cmds = op === 'upsert' ? ['INSERT', 'UPDATE'] : [op.toUpperCase()]
      for (const cmd of cmds) {
        if (!tableCommands.has(table)) tableCommands.set(table, new Map())
        const tCmds = tableCommands.get(table)
        if (!tCmds.has(cmd)) tCmds.set(cmd, new Set())
        tCmds.get(cmd).add(rel)
      }
    }

    // Pass 2 — only register `'*'` (unknown cmd) where we don't
    // already have an exact match. A table found in Pass 1 doesn't
    // need a Pass-2 entry, and we don't want to double-count.
    stringLiteralRe.lastIndex = 0
    while ((m = stringLiteralRe.exec(code))) {
      const [, name] = m
      if (!knownTables.has(name)) continue
      if (!tableCommands.has(name)) tableCommands.set(name, new Map())
      const tCmds = tableCommands.get(name)
      if (!tCmds.has('*')) tCmds.set('*', new Set())
      tCmds.get('*').add(rel)
    }

    rpcRe.lastIndex = 0
    while ((m = rpcRe.exec(code))) {
      const [, fn] = m
      if (!rpcCalls.has(fn)) rpcCalls.set(fn, new Set())
      rpcCalls.get(fn).add(rel)
    }
  }

  return { tableCommands, rpcCalls, filesScanned: files.length }
}

/**
 * Build the coverage matrix. For every user-facing policy in the
 * inventory, determine whether the (table, cmd) cell is exercised
 * by at least one test file.
 *
 * A cell is considered:
 *   - "covered exact"    — at least one `.from('<table>').<cmd>` match.
 *   - "covered indirect" — the table appears as a string literal in
 *      some test (typical of array-driven loops). The cmd is unknown
 *      but the table is exercised; downgrades to "loose" coverage.
 *   - "uncovered"        — neither signal present.
 *
 * The `ALL` policy `Allow all for admin` is `is_admin()`-gated;
 * service_role bypasses RLS entirely and integration tests do not
 * authenticate as admin. These policies are excluded from coverage
 * accounting.
 *
 * @param {ReturnType<typeof parsePolicies>} policies
 * @param {ReturnType<typeof scanTests>['tableCommands']} usage
 * @returns {{
 *   total: number,
 *   coveredExact: number,
 *   coveredIndirect: number,
 *   uncovered: number,
 *   excluded: number,
 *   uncoveredCells: Array<{ table: string, cmd: string, policies: string[] }>,
 *   indirectCells: Array<{ table: string, cmd: string, policies: string[], files: string[] }>,
 *   coveredCells: Array<{ table: string, cmd: string, policies: string[], files: string[] }>,
 *   tablesNotTouched: string[]
 * }}
 */
function buildMatrix(policies, usage) {
  // Group policies into (table, cmd) cells.
  /** @type {Map<string, Array<{policy: string}>>} */
  const cells = new Map()
  let excluded = 0
  for (const p of policies) {
    if (p.policy === 'Allow all for admin') {
      excluded += 1
      continue
    }
    const key = `${p.table}::${p.cmd}`
    if (!cells.has(key)) cells.set(key, [])
    cells.get(key).push({ policy: p.policy })
  }

  const coveredCells = []
  const indirectCells = []
  const uncoveredCells = []
  for (const [key, ps] of cells) {
    const [table, cmd] = key.split('::')
    const tableUsage = usage.get(table)
    const exactFiles = tableUsage?.get(cmd)
    const indirectFiles = tableUsage?.get('*')
    const policyNames = ps.map((p) => p.policy).sort()
    if (exactFiles && exactFiles.size > 0) {
      coveredCells.push({
        table,
        cmd,
        policies: policyNames,
        files: [...exactFiles].sort()
      })
    } else if (indirectFiles && indirectFiles.size > 0) {
      indirectCells.push({
        table,
        cmd,
        policies: policyNames,
        files: [...indirectFiles].sort()
      })
    } else {
      uncoveredCells.push({ table, cmd, policies: policyNames })
    }
  }

  // Tables with at least one policy and zero references of any kind.
  const tablesWithPolicies = new Set(
    [...cells.keys()].map((k) => k.split('::')[0])
  )
  const tablesNotTouched = [...tablesWithPolicies]
    .filter((t) => !usage.has(t))
    .sort()

  const sortCells = (a, b) =>
    a.table.localeCompare(b.table) || a.cmd.localeCompare(b.cmd)

  return {
    total: coveredCells.length + indirectCells.length + uncoveredCells.length,
    coveredExact: coveredCells.length,
    coveredIndirect: indirectCells.length,
    uncovered: uncoveredCells.length,
    excluded,
    uncoveredCells: uncoveredCells.sort(sortCells),
    indirectCells: indirectCells.sort(sortCells),
    coveredCells: coveredCells.sort(sortCells),
    tablesNotTouched
  }
}

/**
 * Format the matrix as a human-readable text report.
 *
 * @param {ReturnType<typeof buildMatrix>} matrix
 * @param {ReturnType<typeof scanTests>} scan
 * @returns {string}
 */
function formatTextReport(matrix, scan) {
  const lines = []
  const exactPct =
    matrix.total === 0
      ? 100
      : ((matrix.coveredExact / matrix.total) * 100).toFixed(1)
  const totalPct =
    matrix.total === 0
      ? 100
      : (
          ((matrix.coveredExact + matrix.coveredIndirect) / matrix.total) *
          100
        ).toFixed(1)

  lines.push('═══════════════════════════════════════════════════════════════')
  lines.push('  RLS Policy Coverage Report (Static Cross-Reference)')
  lines.push('═══════════════════════════════════════════════════════════════')
  lines.push('')
  lines.push(`  Test files scanned          : ${scan.filesScanned}`)
  lines.push(`  (table × command) cells     : ${matrix.total}`)
  lines.push(`  Covered exact (.from + cmd) : ${matrix.coveredExact}`)
  lines.push(`  Covered indirect (loops)    : ${matrix.coveredIndirect}`)
  lines.push(`  Uncovered                   : ${matrix.uncovered}`)
  lines.push(`  Excluded (admin)            : ${matrix.excluded} policies`)
  lines.push(`  Exact coverage              : ${exactPct}%`)
  lines.push(`  Total coverage (exact+loop) : ${totalPct}%`)
  lines.push('')

  if (matrix.tablesNotTouched.length > 0) {
    lines.push(
      '───────────────────────────────────────────────────────────────'
    )
    lines.push(
      `  Tables NEVER touched by any test (${matrix.tablesNotTouched.length})`
    )
    lines.push(
      '───────────────────────────────────────────────────────────────'
    )
    for (const t of matrix.tablesNotTouched) lines.push(`    • ${t}`)
    lines.push('')
  }

  if (matrix.uncoveredCells.length > 0) {
    lines.push(
      '───────────────────────────────────────────────────────────────'
    )
    lines.push(
      `  Uncovered (table, command) cells (${matrix.uncoveredCells.length})`
    )
    lines.push(
      '───────────────────────────────────────────────────────────────'
    )
    let lastTable = ''
    for (const c of matrix.uncoveredCells) {
      if (c.table !== lastTable) {
        lines.push(`    ${c.table}`)
        lastTable = c.table
      }
      lines.push(`      ${c.cmd.padEnd(7)} → ${c.policies.join(' | ')}`)
    }
    lines.push('')
  } else {
    lines.push('  ✓ Every user-facing (table × command) cell is exercised.')
    lines.push('')
  }

  if (matrix.indirectCells.length > 0) {
    lines.push(
      '───────────────────────────────────────────────────────────────'
    )
    lines.push(
      `  Indirect-only cells (loop or array-driven) (${matrix.indirectCells.length})`
    )
    lines.push(
      '───────────────────────────────────────────────────────────────'
    )
    let lastTable = ''
    for (const c of matrix.indirectCells) {
      if (c.table !== lastTable) {
        lines.push(`    ${c.table}`)
        lastTable = c.table
      }
      lines.push(`      ${c.cmd.padEnd(7)} → ${c.policies.join(' | ')}`)
    }
    lines.push('')
  }

  if (scan.rpcCalls.size > 0) {
    lines.push(
      '───────────────────────────────────────────────────────────────'
    )
    lines.push('  RPC functions exercised (informational)')
    lines.push(
      '───────────────────────────────────────────────────────────────'
    )
    const rpcs = [...scan.rpcCalls.keys()].sort()
    for (const fn of rpcs) {
      const files = [...scan.rpcCalls.get(fn)].sort()
      lines.push(
        `    ${fn}  (${files.length} file${files.length === 1 ? '' : 's'})`
      )
    }
    lines.push('')
  }

  lines.push('───────────────────────────────────────────────────────────────')
  lines.push('  Notes')
  lines.push('───────────────────────────────────────────────────────────────')
  lines.push(
    '    - "Exact" coverage detects `.from(\'<table>\').<cmd>` literally.'
  )
  lines.push(
    '    - "Indirect" coverage means the table name appears as a string'
  )
  lines.push(
    '      literal in the test file but the .from() target is a variable'
  )
  lines.push(
    '      (array-driven loop). The cmd cannot be statically determined.'
  )
  lines.push('    - "Allow all for admin" policies are gated by is_admin() and')
  lines.push('      bypassed by service_role; integration tests deliberately')
  lines.push('      run as authenticated anon-key clients, so these policies')
  lines.push('      are unreachable through the tested surface and excluded.')
  lines.push('    - Cell coverage does NOT prove every distinct policy branch')
  lines.push('      was hit. For per-branch coverage, add a manifest of')
  lines.push(
    '      (table::policy) → test files and reconcile against pg_policies.'
  )
  lines.push('')

  return lines.join('\n')
}

/**
 * Pick A Shields-style Color For A Coverage Percentage
 *
 * Thresholds mirror shields.io's standard scale so the badge reads
 * consistently next to the existing `code-coverage.svg` badge.
 *
 * @param {number} pct Total coverage percent (0-100).
 * @returns {string} Hex color (no leading `#`-prefix variants).
 */
function pickColor(pct) {
  if (pct >= 100) return '#4c1'
  if (pct >= 95) return '#97ca00'
  if (pct >= 80) return '#dfb317'
  if (pct >= 60) return '#fe7d37'
  return '#e05d44'
}

/**
 * Render A Shields-style Coverage Badge SVG
 *
 * Hand-rolled to avoid pulling in a dependency. The geometry tracks
 * the same Verdana 11px metric as `badges/code-coverage.svg`, with
 * widths computed from char counts (≈7px per char + 10px padding) so
 * different label/value lengths render correctly.
 *
 * @param {string} label Left-side text (e.g. `'RLS Coverage'`).
 * @param {string} value Right-side text (e.g. `'100%'`).
 * @param {string} color Right-side fill (hex).
 * @returns {string} SVG markup.
 */
function renderBadge(label, value, color) {
  // Approx Verdana 11px char width = ~7px. Pad each side by 5px.
  const labelW = label.length * 7 + 10
  const valueW = value.length * 7 + 10
  const totalW = labelW + valueW
  // Text geometry: render at 110px font, scaled to 0.1 (= 11px on screen).
  // Centre x in scaled coords = 10 * boxCentre.
  const labelCenter = (labelW / 2) * 10
  const valueCenter = (labelW + valueW / 2) * 10
  // Approx text length (excluding padding) in scaled units.
  const labelTextLen = (labelW - 10) * 10
  const valueTextLen = (valueW - 10) * 10
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="20" role="img" aria-label="${label}: ${value}"><title>${label}: ${value}</title><filter id="blur"><feGaussianBlur in="SourceGraphic" stdDeviation="16"/></filter><linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient><clipPath id="r"><rect width="${totalW}" height="20" rx="3" fill="#fff"/></clipPath><g clip-path="url(#r)"><rect width="${labelW}" height="20" fill="#555"/><rect x="${labelW}" width="${valueW}" height="20" fill="${color}"/><rect width="${totalW}" height="20" fill="url(#s)"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110"><text aria-hidden="true" x="${labelCenter}" y="150" fill="#010101" fill-opacity=".80" filter="url(#blur)" transform="scale(.1)" textLength="${labelTextLen}">${label}</text><text aria-hidden="true" x="${labelCenter}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${labelTextLen}">${label}</text><text x="${labelCenter}" y="140" transform="scale(.1)" fill="#fff" textLength="${labelTextLen}">${label}</text><text aria-hidden="true" x="${valueCenter}" y="150" fill="#010101" fill-opacity=".80" filter="url(#blur)" transform="scale(.1)" textLength="${valueTextLen}">${value}</text><text aria-hidden="true" x="${valueCenter}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${valueTextLen}">${value}</text><text x="${valueCenter}" y="140" transform="scale(.1)" fill="#fff" textLength="${valueTextLen}">${value}</text></g></svg>`
}

/**
 * Write The RLS Coverage Badge SVG
 *
 * Total coverage (exact + indirect) is the published metric: it
 * matches what the human-readable report headlines as "Total
 * coverage", and what an operator would want to glance at on the
 * README.
 *
 * @param {ReturnType<typeof buildMatrix>} matrix
 */
function writeBadge(matrix) {
  const totalPct =
    matrix.total === 0
      ? 100
      : ((matrix.coveredExact + matrix.coveredIndirect) / matrix.total) * 100
  // Render whole numbers without a decimal (e.g. `100%`), otherwise
  // one decimal place (e.g. `91.0%`) to match the text report.
  const valueText =
    Number.isInteger(totalPct) || totalPct === 100
      ? `${Math.round(totalPct)}%`
      : `${totalPct.toFixed(1)}%`
  const svg = renderBadge('RLS Coverage', valueText, pickColor(totalPct))
  mkdirSync(dirname(BADGE_PATH), { recursive: true })
  writeFileSync(BADGE_PATH, svg + '\n')
}

// ─── main ──────────────────────────────────────────────────────────────
const policies = parsePolicies()
const knownTables = new Set(policies.map((p) => p.table))
const scan = scanTests(knownTables)
const matrix = buildMatrix(policies, scan.tableCommands)

if (!NO_BADGE) writeBadge(matrix)

if (JSON_OUTPUT) {
  process.stdout.write(
    JSON.stringify(
      {
        summary: {
          filesScanned: scan.filesScanned,
          totalCells: matrix.total,
          coveredExactCells: matrix.coveredExact,
          coveredIndirectCells: matrix.coveredIndirect,
          uncoveredCells: matrix.uncovered,
          excludedPolicies: matrix.excluded,
          exactCoveragePercent:
            matrix.total === 0
              ? 100
              : (matrix.coveredExact / matrix.total) * 100,
          totalCoveragePercent:
            matrix.total === 0
              ? 100
              : ((matrix.coveredExact + matrix.coveredIndirect) /
                  matrix.total) *
                100
        },
        tablesNotTouched: matrix.tablesNotTouched,
        uncovered: matrix.uncoveredCells,
        indirect: matrix.indirectCells,
        rpcCalls: [...scan.rpcCalls.entries()].map(([fn, files]) => ({
          fn,
          files: [...files].sort()
        }))
      },
      null,
      2
    ) + '\n'
  )
} else {
  process.stdout.write(formatTextReport(matrix, scan) + '\n')
}

if (STRICT && matrix.uncovered > 0) process.exit(1)
