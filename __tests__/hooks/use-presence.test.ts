import { describe, expect, it } from 'vitest'

import { reducePresenceState } from '@/hooks/use-presence'

describe('reducePresenceState', () => {
  it('returns an empty list for an empty presence state', () => {
    expect(reducePresenceState({})).toEqual([])
  })

  it('flattens single-meta keys into the output list', () => {
    const result = reducePresenceState({
      'user-1': [
        {
          user_id: 'user-1',
          username: 'lantern_keeper',
          avatar_url: 'https://example.test/a.png',
          online_at: '2026-05-19T00:00:00.000Z'
        }
      ]
    })

    expect(result).toEqual([
      {
        user_id: 'user-1',
        username: 'lantern_keeper',
        avatar_url: 'https://example.test/a.png',
        online_at: '2026-05-19T00:00:00.000Z'
      }
    ])
  })

  it('collapses multiple metas for the same user to the earliest online_at', () => {
    const result = reducePresenceState({
      'user-a': [
        {
          user_id: 'user-a',
          username: 'survivor_a',
          avatar_url: null,
          online_at: '2026-05-19T00:00:05.000Z'
        },
        {
          user_id: 'user-a',
          username: 'survivor_a',
          avatar_url: null,
          online_at: '2026-05-19T00:00:01.000Z'
        },
        {
          user_id: 'user-a',
          username: 'survivor_a',
          avatar_url: null,
          online_at: '2026-05-19T00:00:03.000Z'
        }
      ]
    })

    expect(result).toHaveLength(1)
    expect(result[0].online_at).toBe('2026-05-19T00:00:01.000Z')
  })

  it('orders the output by online_at ascending', () => {
    const result = reducePresenceState({
      late: [
        {
          user_id: 'late',
          username: 'late_arrival',
          avatar_url: null,
          online_at: '2026-05-19T00:00:10.000Z'
        }
      ],
      early: [
        {
          user_id: 'early',
          username: 'first_watch',
          avatar_url: null,
          online_at: '2026-05-19T00:00:00.000Z'
        }
      ],
      middle: [
        {
          user_id: 'middle',
          username: 'mid_watch',
          avatar_url: null,
          online_at: '2026-05-19T00:00:05.000Z'
        }
      ]
    })

    expect(result.map((u) => u.user_id)).toEqual(['early', 'middle', 'late'])
  })

  it('drops metas missing required fields', () => {
    const result = reducePresenceState({
      good: [
        {
          user_id: 'good',
          username: 'real_user',
          avatar_url: null,
          online_at: '2026-05-19T00:00:00.000Z'
        }
      ],
      'missing-username': [
        {
          user_id: 'missing-username',
          avatar_url: null,
          online_at: '2026-05-19T00:00:01.000Z'
        }
      ],
      'missing-online-at': [
        {
          user_id: 'missing-online-at',
          username: 'no_timestamp',
          avatar_url: null
        }
      ],
      'missing-user-id': [
        {
          username: 'no_id',
          avatar_url: null,
          online_at: '2026-05-19T00:00:02.000Z'
        }
      ]
    })

    expect(result).toHaveLength(1)
    expect(result[0].user_id).toBe('good')
  })

  it('coerces non-string avatar_url values to null', () => {
    const result = reducePresenceState({
      'user-1': [
        {
          user_id: 'user-1',
          username: 'survivor',
          // Producer published `undefined` (or a non-string sentinel)
          // for the avatar URL; we should normalise to `null`.
          avatar_url: undefined,
          online_at: '2026-05-19T00:00:00.000Z'
        }
      ]
    })

    expect(result[0].avatar_url).toBeNull()
  })
})
