# `get_unshare_blockers` benchmark (issue #154)

Optional performance harness for the
`public.get_unshare_blockers(p_settlement_id, p_shared_user_id)` RPC introduced
in
[`20260511000000_get_unshare_blockers.sql`](../../supabase/migrations/20260511000000_get_unshare_blockers.sql).

## Purpose

Issue [#154](https://github.com/ncalteen/kdm-app/issues/154) called for a
benchmark to decide whether the per-table `UNION ALL` body should be rewritten
as a CTE that hoists the `s.user_id = auth.uid()` authorization join out of
every branch.

The benchmark seeds a realistic workload (100 custom blocker attachments on a
target settlement, surrounded by 20 unrelated settlements with their own
attachments) and runs `EXPLAIN (ANALYZE, BUFFERS)` against both shapes ten times
after warmup.

Result captured during the issue:

| Shape                                     | Execution (median) | Planning (median) |
| ----------------------------------------- | ------------------ | ----------------- |
| V1 (current — per-branch settlement join) | ~6.9 ms            | ~0.03 ms          |
| V2 (CTE-hoisted authorization gate)       | ~6.5 ms            | ~0.03 ms          |

Both shapes are ~14× under the 100 ms acceptance budget. V2 was not adopted
because the 6% delta sits inside run-to-run noise and the per-table UNION must
be preserved regardless (each catalog uses a different display-name column —
`knowledge_name`, `gear_name`, …, `monster_name` for both quarry and nemesis).
The rationale is documented inline in the V1 migration header.

## When to re-run

- A new catalog joins `get_unshare_blockers` (a 14th branch and beyond).
- The function shape changes (e.g. a unified transitive view becomes available
  and the per-table UNION can collapse).
- Attachment counts on real settlements grow by an order of magnitude and the
  function starts approaching the 100 ms budget.

## How to run

The benchmark lives in the integration suite but is gated by `RUN_BENCHMARK=1`
so the default `npm run integration-test` skips it.

```sh
RUN_BENCHMARK=1 ./scripts/integration.sh \
  __tests__/integration/benchmarks/get-unshare-blockers.bench.test.ts
```

Requirements:

- The local Supabase stack must be running (`npx supabase start`); the harness
  invokes `docker exec supabase_db_kdm-app psql` directly to avoid PostgREST
  round-trip overhead.
- The candidate V2 sibling function is installed from
  [`get_unshare_blockers_v2.sql`](./get_unshare_blockers_v2.sql) into the live
  database for the duration of the run and dropped in `afterAll`.
- All test users are created and torn down per run. Failure paths best-effort
  cleanup; a stray failure may leave seeded rows behind, which
  `npm run db:reset` clears.

The benchmark always reports its numbers via `console.log` as a markdown table
and the test itself passes — interpretation is a human decision, not an
automated gate.
