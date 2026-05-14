import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  createTestUser,
  deleteTestUser,
  seedSettlement,
  shareSettlement,
  TestUser
} from '@/__tests__/integration/helpers/supabase'

/**
 * Benchmark — `get_unshare_blockers` V1 vs V2 (issue #154)
 *
 * Opt-in. Skipped unless `RUN_BENCHMARK=1` is exported. Standard
 * integration runs (`npm run integration-test`) silently bypass this file.
 *
 * Invocation:
 *   RUN_BENCHMARK=1 ./scripts/integration.sh \
 *     __tests__/integration/benchmarks/get-unshare-blockers.bench.test.ts
 *
 * What it does:
 *   1. Seeds a realistic workload: one target settlement with 100 custom
 *      blocker attachments authored by a "target" collaborator, plus
 *      negative-noise rows (stranger-authored, stock, unattached) and 20
 *      unrelated settlements each carrying 10 attachments. The unrelated
 *      settlements are the population the V1 per-branch
 *      `s.user_id = auth.uid()` join has to scan; without them the
 *      planner trivially seeks the single target row and the comparison
 *      degenerates.
 *   2. Installs the candidate V2 sibling function from
 *      `scripts/benchmark-unshare-blockers/get_unshare_blockers_v2.sql`.
 *   3. Asserts correctness: both functions, called via psql with the
 *      owner's JWT claim, must return byte-identical row sets.
 *   4. Runs `EXPLAIN (ANALYZE, BUFFERS)` against each function 10 times
 *      (after 3 warmup runs each), parses out planning + execution time,
 *      reports median / min / max in a markdown table.
 *   5. Tears down: drops V2, deletes the test users (cascades to
 *      settlements + attachments).
 *
 * All SQL goes through `docker exec supabase_db_kdm-app psql` to avoid
 * PostgREST round-trip overhead (5–15ms) masking sub-millisecond
 * planner differences.
 */

const RUN = process.env.RUN_BENCHMARK === '1'
const CONTAINER = 'supabase_db_kdm-app'

const V2_SQL_PATH = resolve(
  fileURLToPath(import.meta.url),
  '../../../../scripts/benchmark-unshare-blockers/get_unshare_blockers_v2.sql'
)

// Workload sizing. 4 branches × 25 = 100 expected blocker rows.
const ATTACHMENTS_PER_BRANCH = 25
const NOISE_STRANGER_PER_BRANCH = 5
const NOISE_STOCK_PER_BRANCH = 5
const NOISE_SETTLEMENTS = 20
const NOISE_ROWS_PER_SETTLEMENT = 10
const EXPECTED_BLOCKER_ROWS = ATTACHMENTS_PER_BRANCH * 4

// Benchmark sample sizes.
const WARMUP_RUNS = 3
const MEASURE_RUNS = 10

/**
 * Run SQL inside the supabase_db container via docker exec.
 *
 * Returns raw stdout. Uses `psql -X -q` (no startup file, quiet) so the
 * caller can parse the body without noise.
 *
 * @param sql SQL Script
 * @returns Stdout
 */
function psql(sql: string): string {
  try {
    return execFileSync(
      'docker',
      [
        'exec',
        '-i',
        CONTAINER,
        'psql',
        '-U',
        'postgres',
        '-d',
        'postgres',
        '-X',
        '-q'
      ],
      { encoding: 'utf8', input: sql }
    )
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message: string }
    throw new Error(
      `psql failed:\n--- stdout ---\n${e.stdout ?? ''}\n--- stderr ---\n${
        e.stderr ?? ''
      }\n--- error ---\n${e.message}`
    )
  }
}

/**
 * Run SQL and capture rows as `|`-separated CSV (no header, no padding).
 *
 * @param sql SQL Query
 * @returns Pipe-separated rows
 */
function psqlRows(sql: string): string[][] {
  const out = execFileSync(
    'docker',
    [
      'exec',
      '-i',
      CONTAINER,
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-X',
      '-A',
      '-t',
      '-q',
      '-F',
      '|'
    ],
    { encoding: 'utf8', input: sql }
  )
  return out
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => line.split('|'))
}

/**
 * Run EXPLAIN (ANALYZE, BUFFERS) against a function call as the owner.
 *
 * Wraps in a transaction so we can set `request.jwt.claim.sub` locally;
 * the analyze rolls back so repeated runs don't accumulate side effects
 * (there shouldn't be any — the function is `stable` — but defensive).
 *
 * @param fnName Function Name (`get_unshare_blockers` or `_v2`)
 * @param ownerId Owner User ID
 * @param settlementId Settlement ID
 * @param collabId Collaborator User ID
 * @returns Planning + Execution Time (ms)
 */
function explainAnalyze(
  fnName: string,
  ownerId: string,
  settlementId: string,
  collabId: string
): { planning: number; execution: number } {
  const sql = `
    begin;
    set local "request.jwt.claim.sub" = '${ownerId}';
    explain (analyze, buffers, timing on)
      select * from public.${fnName}('${settlementId}'::uuid, '${collabId}'::uuid);
    rollback;
  `
  const out = psql(sql)
  const planning = parseFloat(
    out.match(/Planning Time:\s+([\d.]+)\s*ms/)?.[1] ?? 'NaN'
  )
  const execution = parseFloat(
    out.match(/Execution Time:\s+([\d.]+)\s*ms/)?.[1] ?? 'NaN'
  )
  if (Number.isNaN(planning) || Number.isNaN(execution)) {
    throw new Error(`Failed to parse EXPLAIN output for ${fnName}:\n${out}`)
  }
  return { planning, execution }
}

/**
 * Median Of Numeric Sample
 *
 * @param values Sample Values
 * @returns Median
 */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

describe.runIf(RUN)('Benchmark: get_unshare_blockers V1 vs V2', () => {
  let owner: TestUser
  let collaborator: TestUser
  let stranger: TestUser
  let settlementId: string
  const noiseUsers: TestUser[] = []

  beforeAll(async () => {
    owner = await createTestUser()
    collaborator = await createTestUser()
    stranger = await createTestUser()

    settlementId = await seedSettlement(owner.id, 'Bench Settlement')
    await shareSettlement(settlementId, collaborator.id, owner.id)

    // 20 noise users + their own settlements. Each gets 10 custom
    // attachments authored by themselves so the planner's per-branch
    // join-to-settlement isn't trivially a single-row lookup.
    for (let i = 0; i < NOISE_SETTLEMENTS; i++) {
      const user = await createTestUser()
      noiseUsers.push(user)
      const sid = await seedSettlement(user.id, `Bench Noise ${i}`)
      // Seed noise attachments via raw SQL — faster than 10 HTTP calls.
      const perBranch = Math.ceil(NOISE_ROWS_PER_SETTLEMENT / 4)
      psql(`
        with k as (
          insert into public.knowledge (knowledge_name, custom, user_id)
          select 'noise-k-${i}-' || g, true, '${user.id}'::uuid
          from generate_series(1, ${perBranch}) g
          returning id
        ),
        ak as (
          insert into public.settlement_knowledge (settlement_id, knowledge_id)
          select '${sid}'::uuid, id from k
        ),
        g as (
          insert into public.gear (gear_name, custom, user_id)
          select 'noise-g-${i}-' || g2, true, '${user.id}'::uuid
          from generate_series(1, ${perBranch}) g2
          returning id
        ),
        ag as (
          insert into public.settlement_gear (settlement_id, gear_id, quantity)
          select '${sid}'::uuid, id, 1 from g
        ),
        q as (
          insert into public.quarry (monster_name, node, custom, user_id)
          select 'noise-q-${i}-' || g3, 'NQ1'::public.monster_node, true, '${user.id}'::uuid
          from generate_series(1, ${perBranch}) g3
          returning id
        ),
        aq as (
          insert into public.settlement_quarry (settlement_id, quarry_id)
          select '${sid}'::uuid, id from q
        ),
        n as (
          insert into public.nemesis (monster_name, node, custom, user_id)
          select 'noise-n-${i}-' || g4, 'NN1'::public.monster_node, true, '${user.id}'::uuid
          from generate_series(1, ${perBranch}) g4
          returning id
        )
        insert into public.settlement_nemesis (settlement_id, nemesis_id)
        select '${sid}'::uuid, id from n;
      `)
    }

    // Target settlement attachments. 25 per branch, authored by `collaborator`.
    psql(`
      with k as (
        insert into public.knowledge (knowledge_name, custom, user_id)
        select 'target-k-' || g, true, '${collaborator.id}'::uuid
        from generate_series(1, ${ATTACHMENTS_PER_BRANCH}) g
        returning id
      ),
      ak as (
        insert into public.settlement_knowledge (settlement_id, knowledge_id)
        select '${settlementId}'::uuid, id from k
      ),
      g as (
        insert into public.gear (gear_name, custom, user_id)
        select 'target-g-' || g2, true, '${collaborator.id}'::uuid
        from generate_series(1, ${ATTACHMENTS_PER_BRANCH}) g2
        returning id
      ),
      ag as (
        insert into public.settlement_gear (settlement_id, gear_id, quantity)
        select '${settlementId}'::uuid, id, 1 from g
      ),
      q as (
        insert into public.quarry (monster_name, node, custom, user_id)
        select 'target-q-' || g3, 'NQ1'::public.monster_node, true, '${collaborator.id}'::uuid
        from generate_series(1, ${ATTACHMENTS_PER_BRANCH}) g3
        returning id
      ),
      aq as (
        insert into public.settlement_quarry (settlement_id, quarry_id)
        select '${settlementId}'::uuid, id from q
      ),
      n as (
        insert into public.nemesis (monster_name, node, custom, user_id)
        select 'target-n-' || g4, 'NN1'::public.monster_node, true, '${collaborator.id}'::uuid
        from generate_series(1, ${ATTACHMENTS_PER_BRANCH}) g4
        returning id
      )
      insert into public.settlement_nemesis (settlement_id, nemesis_id)
      select '${settlementId}'::uuid, id from n;
    `)

    // Negative-noise: stranger-authored AND stock rows attached to the
    // target settlement. Both must be filtered out by V1 and V2.
    psql(`
      with sk as (
        insert into public.knowledge (knowledge_name, custom, user_id)
        select 'stranger-k-' || g, true, '${stranger.id}'::uuid
        from generate_series(1, ${NOISE_STRANGER_PER_BRANCH}) g
        returning id
      ),
      ask as (
        insert into public.settlement_knowledge (settlement_id, knowledge_id)
        select '${settlementId}'::uuid, id from sk
      ),
      ck as (
        insert into public.knowledge (knowledge_name, custom, user_id)
        select 'stock-k-' || g2, false, '${collaborator.id}'::uuid
        from generate_series(1, ${NOISE_STOCK_PER_BRANCH}) g2
        returning id
      )
      insert into public.settlement_knowledge (settlement_id, knowledge_id)
      select '${settlementId}'::uuid, id from ck;
    `)

    // Install V2.
    const v2Sql = readFileSync(V2_SQL_PATH, 'utf8')
    psql(v2Sql)

    // Refresh planner statistics so EXPLAIN reflects real selectivity.
    psql(`analyze;`)
  }, 180_000)

  afterAll(async () => {
    try {
      psql(
        `drop function if exists public.get_unshare_blockers_v2(uuid, uuid);`
      )
    } catch {
      // Drop failures shouldn't block user cleanup.
    }
    const ids = [
      owner?.id,
      collaborator?.id,
      stranger?.id,
      ...noiseUsers.map((u) => u.id)
    ].filter((id): id is string => Boolean(id))
    for (const id of ids) {
      try {
        await deleteTestUser(id)
      } catch {
        // Best-effort.
      }
    }
  }, 180_000)

  it('V1 and V2 return identical result sets', () => {
    const project = (rows: string[][]): string =>
      rows.map((r) => r.join('|')).join('\n')

    // Pull rows via psql with the owner's JWT claim set. Sorted by the
    // function's own ORDER BY clause so this is a position-by-position
    // compare.
    const callSql = (fn: string) => `
      begin;
      set local "request.jwt.claim.sub" = '${owner.id}';
      select kind, item_name, item_id
        from public.${fn}('${settlementId}'::uuid, '${collaborator.id}'::uuid);
      rollback;
    `
    const v1 = psqlRows(callSql('get_unshare_blockers'))
    const v2 = psqlRows(callSql('get_unshare_blockers_v2'))

    // Strip blank rollback-noise lines (psqlRows already filters empty
    // lines; the `BEGIN` / `ROLLBACK` lines aren't emitted in `-t -q`
    // mode, so this is mostly just defensive).
    expect(v1.length).toBe(EXPECTED_BLOCKER_ROWS)
    expect(v2.length).toBe(EXPECTED_BLOCKER_ROWS)
    expect(project(v2)).toBe(project(v1))
  })

  it('benchmarks V1 vs V2', () => {
    const measure = (fn: string) => {
      // Warmup runs (discarded).
      for (let i = 0; i < WARMUP_RUNS; i++)
        explainAnalyze(fn, owner.id, settlementId, collaborator.id)
      // Sample.
      const planning: number[] = []
      const execution: number[] = []
      for (let i = 0; i < MEASURE_RUNS; i++) {
        const t = explainAnalyze(fn, owner.id, settlementId, collaborator.id)
        planning.push(t.planning)
        execution.push(t.execution)
      }
      return {
        planningMin: Math.min(...planning),
        planningMed: median(planning),
        planningMax: Math.max(...planning),
        executionMin: Math.min(...execution),
        executionMed: median(execution),
        executionMax: Math.max(...execution)
      }
    }

    const v1 = measure('get_unshare_blockers')
    const v2 = measure('get_unshare_blockers_v2')

    const fmt = (n: number) => n.toFixed(3).padStart(8)
    const lines = [
      '',
      '## Benchmark: `get_unshare_blockers` V1 vs V2',
      '',
      `Workload: ${EXPECTED_BLOCKER_ROWS} target blockers across 4 branches, ${NOISE_SETTLEMENTS} unrelated settlements x ${NOISE_ROWS_PER_SETTLEMENT} rows, ${MEASURE_RUNS} measurement runs after ${WARMUP_RUNS} warmups.`,
      '',
      '| Function | Planning (min / med / max ms) | Execution (min / med / max ms) |',
      '| --- | --- | --- |',
      `| V1 (current) | ${fmt(v1.planningMin)} / ${fmt(v1.planningMed)} / ${fmt(v1.planningMax)} | ${fmt(v1.executionMin)} / ${fmt(v1.executionMed)} / ${fmt(v1.executionMax)} |`,
      `| V2 (CTE-hoist) | ${fmt(v2.planningMin)} / ${fmt(v2.planningMed)} / ${fmt(v2.planningMax)} | ${fmt(v2.executionMin)} / ${fmt(v2.executionMed)} / ${fmt(v2.executionMax)} |`,
      '',
      `Δ median planning: ${(v2.planningMed - v1.planningMed).toFixed(3)} ms (${(((v2.planningMed - v1.planningMed) / v1.planningMed) * 100).toFixed(1)}%)`,
      `Δ median execution: ${(v2.executionMed - v1.executionMed).toFixed(3)} ms (${(((v2.executionMed - v1.executionMed) / v1.executionMed) * 100).toFixed(1)}%)`,
      ''
    ]
    console.log(lines.join('\n'))

    // Always passes — the benchmark is informational. The decision (ship
    // V2 vs leave V1 with a rationale comment) is made by a human reading
    // the report.
    expect(true).toBe(true)
  }, 120_000)
})
