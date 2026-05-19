import { beforeEach, describe, expect, it, vi } from 'vitest'

// Stub `server-only`. Its real module body throws when loaded outside the
// React Server Component bundle, which would block Vitest from importing the
// route under test.
vi.mock('server-only', () => ({}))

// Hoisted mocks must be declared before any imports that wire them up.
const { mockAdminFrom, mockCreateAdminClient } = vi.hoisted(() => ({
  mockAdminFrom: vi.fn(),
  mockCreateAdminClient: vi.fn()
}))

const { mockSubscriptionsRetrieve, mockWebhooksConstructEvent, MockStripe } =
  vi.hoisted(() => {
    const subscriptionsRetrieve = vi.fn()
    const webhooksConstructEvent = vi.fn()
    class Stripe {
      subscriptions = { retrieve: subscriptionsRetrieve }
      webhooks = { constructEvent: webhooksConstructEvent }
    }
    return {
      mockSubscriptionsRetrieve: subscriptionsRetrieve,
      mockWebhooksConstructEvent: webhooksConstructEvent,
      MockStripe: Stripe
    }
  })

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: mockCreateAdminClient
}))

vi.mock('stripe', () => ({
  default: MockStripe
}))

import { NextRequest } from 'next/server'

const { POST } = await import('@/app/api/billing/webhook/route')

/**
 * Build A Webhook Request
 *
 * Stripe webhook requests carry a raw JSON body and a `stripe-signature`
 * header. The route reads the body via `request.text()` and the signature
 * via `request.headers.get('stripe-signature')`; the body content itself is
 * irrelevant because `constructEvent` is mocked.
 */
function buildRequest(options?: { body?: string; signature?: string | null }) {
  const headers: Record<string, string> = {
    'content-type': 'application/json'
  }

  const signature =
    options?.signature === undefined ? 't=1,v1=sig' : options.signature

  if (signature !== null) headers['stripe-signature'] = signature

  return new NextRequest('https://archivist.test/api/billing/webhook', {
    method: 'POST',
    headers,
    body: options?.body ?? '{}'
  })
}

/**
 * Subscription Item Fixture
 *
 * Captures the shape the route reads off `subscription.items.data[0]` —
 * `price.id` (drives `plan_id`) and `current_period_end` (Unix seconds, as
 * Stripe ships it).
 */
function buildSubscriptionItem(options: {
  priceId: string
  currentPeriodEnd: number
}) {
  return {
    id: 'si_test',
    price: { id: options.priceId },
    current_period_end: options.currentPeriodEnd
  }
}

/**
 * Build A Stripe Subscription Fixture
 */
function buildSubscription(options: {
  id?: string
  customer?: string | null
  status?: string
  priceId?: string
  currentPeriodEnd?: number
  userId?: string | null
  cancelAtPeriodEnd?: boolean
}) {
  return {
    id: options.id ?? 'sub_test',
    customer: options.customer ?? 'cus_test',
    status: options.status ?? 'active',
    cancel_at_period_end: options.cancelAtPeriodEnd ?? false,
    metadata:
      options.userId === null ? {} : { user_id: options.userId ?? 'user-1' },
    items: {
      data: [
        buildSubscriptionItem({
          priceId: options.priceId ?? 'price_lantern',
          currentPeriodEnd: options.currentPeriodEnd ?? 1_900_000_000
        })
      ]
    }
  }
}

/**
 * Wire The Admin Client
 *
 * The webhook calls three different shapes against `user_subscription`:
 *   - `.update(...).eq('user_id', ...)` — used by the update/delete handlers.
 *   - `.upsert(...)` — used by the checkout-completed handler.
 *   - `.select('user_id').eq('stripe_customer_id', ...).maybeSingle()` — used
 *     when subscription metadata is missing.
 *
 * Returning all three matchers from `from('user_subscription')` lets a single
 * mock cover every event handler.
 */
function setupAdmin(options?: {
  upsertError?: { message: string } | null
  updateError?: { message: string } | null
  lookupUserId?: string | null
  lookupError?: { message: string } | null
}) {
  const upsert = vi
    .fn()
    .mockResolvedValue({ error: options?.upsertError ?? null })
  const updateEq = vi
    .fn()
    .mockResolvedValue({ error: options?.updateError ?? null })
  const update = vi.fn().mockReturnValue({ eq: updateEq })
  const maybeSingle = vi.fn().mockResolvedValue({
    data: options?.lookupUserId ? { user_id: options.lookupUserId } : null,
    error: options?.lookupError ?? null
  })
  const lookupEq = vi.fn().mockReturnValue({ maybeSingle })
  const select = vi.fn().mockReturnValue({ eq: lookupEq })

  mockAdminFrom.mockReturnValue({ upsert, update, select })
  mockCreateAdminClient.mockReturnValue({ from: mockAdminFrom })

  return { upsert, update, updateEq, select, lookupEq, maybeSingle }
}

describe('POST /api/billing/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    process.env.STRIPE_PRICE_ID_LANTERN = 'price_lantern'
    process.env.STRIPE_PRICE_ID_LANTERN_HOARD = 'price_lantern_hoard'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
    process.env.SUPABASE_SECRET_KEY = 'service-role-key'
  })

  it('returns 400 when the stripe-signature header is missing', async () => {
    setupAdmin()

    const response = await POST(buildRequest({ signature: null }))
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('Invalid Signature')
    expect(mockWebhooksConstructEvent).not.toHaveBeenCalled()
    expect(mockCreateAdminClient).not.toHaveBeenCalled()
  })

  it('returns 400 when STRIPE_WEBHOOK_SECRET is not configured', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET
    setupAdmin()

    const response = await POST(buildRequest())

    expect(response.status).toBe(400)
    expect(mockWebhooksConstructEvent).not.toHaveBeenCalled()
  })

  it('returns 400 when signature verification throws', async () => {
    setupAdmin()
    mockWebhooksConstructEvent.mockImplementation(() => {
      throw new Error('Bad signature')
    })

    const response = await POST(buildRequest())
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('Invalid Signature')
    expect(mockCreateAdminClient).not.toHaveBeenCalled()
  })

  describe('checkout.session.completed', () => {
    it('upserts an active lantern subscription using metadata.user_id', async () => {
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test',
            metadata: { user_id: 'user-1' },
            client_reference_id: null,
            subscription: 'sub_test'
          }
        }
      })
      mockSubscriptionsRetrieve.mockResolvedValue(
        buildSubscription({
          customer: 'cus_test',
          priceId: 'price_lantern',
          currentPeriodEnd: 1_900_000_000
        })
      )

      const response = await POST(buildRequest())

      expect(response.status).toBe(200)
      expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith('sub_test')
      expect(mockAdminFrom).toHaveBeenCalledWith('user_subscription')
      expect(admin.upsert).toHaveBeenCalledTimes(1)

      const [payload, options] = admin.upsert.mock.calls[0]
      expect(payload).toMatchObject({
        user_id: 'user-1',
        plan_id: 'lantern',
        status: 'active',
        cancel_at_period_end: false,
        stripe_customer_id: 'cus_test',
        stripe_subscription_id: 'sub_test'
      })
      expect(payload.current_period_end).toBe(
        new Date(1_900_000_000 * 1000).toISOString()
      )
      expect(options).toEqual({ onConflict: 'user_id' })
    })

    it('falls back to client_reference_id when metadata is absent', async () => {
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test',
            metadata: {},
            client_reference_id: 'user-fallback',
            subscription: 'sub_test'
          }
        }
      })
      mockSubscriptionsRetrieve.mockResolvedValue(
        buildSubscription({ priceId: 'price_lantern' })
      )

      const response = await POST(buildRequest())

      expect(response.status).toBe(200)
      const payload = admin.upsert.mock.calls[0][0]
      expect(payload.user_id).toBe('user-fallback')
    })

    it('writes plan_id = "lantern_hoard" when the session price matches the hoard env', async () => {
      // The user clarified that subscription handlers must cope with plan
      // alternation. checkout.session.completed therefore derives plan_id
      // from the price rather than hardcoding "lantern" — a subscriber who
      // chooses Lantern Hoard at checkout should land on that tier directly.
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test',
            metadata: { user_id: 'user-1' },
            client_reference_id: null,
            subscription: 'sub_test'
          }
        }
      })
      mockSubscriptionsRetrieve.mockResolvedValue(
        buildSubscription({ priceId: 'price_lantern_hoard' })
      )

      await POST(buildRequest())

      expect(admin.upsert.mock.calls[0][0].plan_id).toBe('lantern_hoard')
    })

    it('mirrors cancel_at_period_end when the Checkout subscription already carries the flag', async () => {
      // Unusual but valid edge case: a Stripe Checkout-completed event can
      // arrive on a subscription that already has `cancel_at_period_end: true`
      // (e.g. an admin staged a cancellation on the Dashboard before the
      // webhook fired, or the API consumer scheduled it as part of the
      // subscription_data). The upsert must persist the incoming value so
      // the UI does not show a healthy renewal on a sub that is already
      // winding down.
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test',
            metadata: { user_id: 'user-1' },
            client_reference_id: null,
            subscription: 'sub_test'
          }
        }
      })
      mockSubscriptionsRetrieve.mockResolvedValue(
        buildSubscription({
          priceId: 'price_lantern',
          cancelAtPeriodEnd: true
        })
      )

      await POST(buildRequest())

      expect(admin.upsert.mock.calls[0][0].cancel_at_period_end).toBe(true)
    })

    it('skips the write and returns 200 when user_id cannot be resolved', async () => {
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test',
            metadata: {},
            client_reference_id: null,
            subscription: 'sub_test'
          }
        }
      })

      const response = await POST(buildRequest())

      expect(response.status).toBe(200)
      expect(mockSubscriptionsRetrieve).not.toHaveBeenCalled()
      expect(admin.upsert).not.toHaveBeenCalled()
    })

    it('skips the write when the session has no subscription id', async () => {
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test',
            metadata: { user_id: 'user-1' },
            client_reference_id: null,
            subscription: null
          }
        }
      })

      const response = await POST(buildRequest())

      expect(response.status).toBe(200)
      expect(mockSubscriptionsRetrieve).not.toHaveBeenCalled()
      expect(admin.upsert).not.toHaveBeenCalled()
    })

    it('skips the write when the subscription price is not a configured plan', async () => {
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test',
            metadata: { user_id: 'user-1' },
            subscription: 'sub_test'
          }
        }
      })
      mockSubscriptionsRetrieve.mockResolvedValue(
        buildSubscription({ priceId: 'price_unknown' })
      )

      const response = await POST(buildRequest())

      expect(response.status).toBe(200)
      expect(admin.upsert).not.toHaveBeenCalled()
    })

    it('returns 500 when retrieving the subscription from Stripe fails', async () => {
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test',
            metadata: { user_id: 'user-1' },
            subscription: 'sub_test'
          }
        }
      })
      mockSubscriptionsRetrieve.mockRejectedValue(new Error('Stripe down'))

      const response = await POST(buildRequest())

      expect(response.status).toBe(500)
      expect(admin.upsert).not.toHaveBeenCalled()
    })

    it('returns 500 when the upsert fails', async () => {
      const admin = setupAdmin({ upsertError: { message: 'fk violation' } })
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test',
            metadata: { user_id: 'user-1' },
            subscription: 'sub_test'
          }
        }
      })
      mockSubscriptionsRetrieve.mockResolvedValue(
        buildSubscription({ priceId: 'price_lantern' })
      )

      const response = await POST(buildRequest())

      expect(response.status).toBe(500)
      expect(admin.upsert).toHaveBeenCalledTimes(1)
    })
  })

  describe('customer.subscription.updated', () => {
    it('updates status and current_period_end on a normal renewal', async () => {
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: buildSubscription({
            id: 'sub_test',
            status: 'active',
            priceId: 'price_lantern',
            currentPeriodEnd: 1_950_000_000
          })
        }
      })

      const response = await POST(buildRequest())

      expect(response.status).toBe(200)
      expect(admin.update).toHaveBeenCalledTimes(1)
      const updatePayload = admin.update.mock.calls[0][0]
      expect(updatePayload).toMatchObject({
        plan_id: 'lantern',
        status: 'active',
        cancel_at_period_end: false,
        stripe_subscription_id: 'sub_test'
      })
      expect(updatePayload.current_period_end).toBe(
        new Date(1_950_000_000 * 1000).toISOString()
      )
      expect(admin.updateEq).toHaveBeenCalledWith('user_id', 'user-1')
      expect(admin.upsert).not.toHaveBeenCalled()
    })

    it('mirrors cancel_at_period_end so the UI can surface pending cancellation', async () => {
      // The Customer Portal lets a subscriber schedule a cancellation that
      // takes effect at `current_period_end` without ending entitlement
      // immediately. Stripe keeps `status: 'active'` and only flips
      // `cancel_at_period_end: true`. The webhook must persist the flag so
      // the SubscriptionCard can swap the renewal copy for a "watch ends
      // on …" treatment instead of implying the subscription is healthy.
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: buildSubscription({
            id: 'sub_test',
            status: 'active',
            priceId: 'price_lantern',
            cancelAtPeriodEnd: true
          })
        }
      })

      const response = await POST(buildRequest())

      expect(response.status).toBe(200)
      expect(admin.update.mock.calls[0][0].cancel_at_period_end).toBe(true)
    })

    it('clears cancel_at_period_end when the subscriber resumes before the period ends', async () => {
      // Stripe emits a second `subscription.updated` event when the user
      // clicks "Renew subscription" in the Portal. The flag flips back to
      // false on the same row.
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: buildSubscription({
            id: 'sub_test',
            status: 'active',
            priceId: 'price_lantern',
            cancelAtPeriodEnd: false
          })
        }
      })

      await POST(buildRequest())

      expect(admin.update.mock.calls[0][0].cancel_at_period_end).toBe(false)
    })

    it('switches plan_id when the active price moves between Lantern and Lantern Hoard', async () => {
      // The Customer Portal lets subscribers alternate between paid tiers.
      // Each switch arrives as a customer.subscription.updated event with a
      // new price; the webhook must re-derive plan_id so the column doesn't
      // drift.
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: buildSubscription({
            priceId: 'price_lantern_hoard',
            status: 'active'
          })
        }
      })

      await POST(buildRequest())

      expect(admin.update.mock.calls[0][0].plan_id).toBe('lantern_hoard')
    })

    it('maps each documented Stripe status to its column value', async () => {
      const cases: Array<[string, string]> = [
        ['active', 'active'],
        ['trialing', 'trialing'],
        ['past_due', 'past_due'],
        ['canceled', 'canceled'],
        ['incomplete', 'incomplete']
      ]

      for (const [stripeStatus, expected] of cases) {
        const admin = setupAdmin()
        mockWebhooksConstructEvent.mockReturnValue({
          type: 'customer.subscription.updated',
          data: {
            object: buildSubscription({
              status: stripeStatus,
              priceId: 'price_lantern'
            })
          }
        })

        await POST(buildRequest())

        expect(admin.update.mock.calls[0][0].status).toBe(expected)
      }
    })

    it('skips the write for unmapped Stripe statuses', async () => {
      // `paused`, `unpaid`, and `incomplete_expired` are valid Stripe states
      // with no representation in our schema's CHECK constraint. Skip the
      // write rather than emit a value the DB would reject.
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: { object: buildSubscription({ status: 'paused' }) }
      })

      const response = await POST(buildRequest())

      expect(response.status).toBe(200)
      expect(admin.update).not.toHaveBeenCalled()
    })

    it('resolves user_id via stripe_customer_id when metadata is absent', async () => {
      const admin = setupAdmin({ lookupUserId: 'user-by-customer' })
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: buildSubscription({
            userId: null,
            customer: 'cus_known',
            priceId: 'price_lantern'
          })
        }
      })

      await POST(buildRequest())

      expect(admin.select).toHaveBeenCalledWith('user_id')
      expect(admin.lookupEq).toHaveBeenCalledWith(
        'stripe_customer_id',
        'cus_known'
      )
      expect(admin.updateEq).toHaveBeenCalledWith('user_id', 'user-by-customer')
    })

    it('skips the write when no user_id can be resolved', async () => {
      const admin = setupAdmin({ lookupUserId: null })
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: {
          object: buildSubscription({
            userId: null,
            customer: 'cus_unknown'
          })
        }
      })

      const response = await POST(buildRequest())

      expect(response.status).toBe(200)
      expect(admin.update).not.toHaveBeenCalled()
    })

    it('skips the write when the active price is not a configured plan', async () => {
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: { object: buildSubscription({ priceId: 'price_unknown' }) }
      })

      const response = await POST(buildRequest())

      expect(response.status).toBe(200)
      expect(admin.update).not.toHaveBeenCalled()
    })

    it('returns 500 when the update fails', async () => {
      const admin = setupAdmin({ updateError: { message: 'rls denied' } })
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.subscription.updated',
        data: { object: buildSubscription({ priceId: 'price_lantern' }) }
      })

      const response = await POST(buildRequest())

      expect(response.status).toBe(500)
      expect(admin.update).toHaveBeenCalledTimes(1)
    })
  })

  describe('customer.subscription.deleted', () => {
    it('flips the row back to free / canceled', async () => {
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: { object: buildSubscription({ status: 'canceled' }) }
      })

      const response = await POST(buildRequest())

      expect(response.status).toBe(200)
      expect(admin.update).toHaveBeenCalledTimes(1)
      const payload = admin.update.mock.calls[0][0]
      expect(payload).toMatchObject({
        plan_id: 'free',
        status: 'canceled',
        cancel_at_period_end: false
      })
      expect(admin.updateEq).toHaveBeenCalledWith('user_id', 'user-1')
    })

    it('resets cancel_at_period_end to false even when the incoming subscription still carries true', async () => {
      // When a pending cancellation reaches its `current_period_end`,
      // Stripe transitions the subscription to `canceled` and emits
      // `customer.subscription.deleted`. The incoming payload may still
      // carry `cancel_at_period_end: true` (it was true right up to the
      // moment of deletion). The handler must hardcode `false` so the
      // free-tier row that replaces the paid one does not carry a stale
      // pending-cancel flag that the UI would misinterpret.
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: {
          object: buildSubscription({
            status: 'canceled',
            cancelAtPeriodEnd: true
          })
        }
      })

      await POST(buildRequest())

      expect(admin.update.mock.calls[0][0].cancel_at_period_end).toBe(false)
    })

    it('resolves user_id via stripe_customer_id when metadata is absent', async () => {
      const admin = setupAdmin({ lookupUserId: 'user-by-customer' })
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: {
          object: buildSubscription({
            userId: null,
            customer: 'cus_known'
          })
        }
      })

      await POST(buildRequest())

      expect(admin.updateEq).toHaveBeenCalledWith('user_id', 'user-by-customer')
    })

    it('skips the write when no user_id can be resolved', async () => {
      const admin = setupAdmin({ lookupUserId: null })
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: {
          object: buildSubscription({
            userId: null,
            customer: 'cus_unknown'
          })
        }
      })

      const response = await POST(buildRequest())

      expect(response.status).toBe(200)
      expect(admin.update).not.toHaveBeenCalled()
    })
  })

  describe('unhandled events', () => {
    it('acknowledges unrelated event types with 200 and writes nothing', async () => {
      const admin = setupAdmin()
      mockWebhooksConstructEvent.mockReturnValue({
        type: 'invoice.paid',
        data: { object: { id: 'in_test' } }
      })

      const response = await POST(buildRequest())

      expect(response.status).toBe(200)
      expect(admin.upsert).not.toHaveBeenCalled()
      expect(admin.update).not.toHaveBeenCalled()
    })
  })
})
