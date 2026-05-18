# Stripe Setup

This guide walks the Stripe account owner through the one-time setup required to
enable paid features in Archivist. Follow it end-to-end before any code that
reads `STRIPE_*` env vars is deployed.

The product model is intentionally minimal — two recurring plans, each tied to a
single feature unlock:

- **Lantern** — `$1 / mo USD`. Unlocks unlimited settlements for the subscribed
  user. Free accounts are capped at 5 owned settlements.
- **Lantern Hoard** — `$5 / mo USD`. Unlocks settlement sharing on top of the
  unlimited-settlements benefit.

There are no seats, no add-ons, and no usage-based pricing — a customer is on
exactly one of `free`, `lantern`, or `lantern_hoard` at any time. Lantern
subscribers can upgrade to Lantern Hoard (and vice-versa) through the Customer
Portal.

For background on _why_ paid sharing exists and how entitlement is enforced in
the database, see
[docs/settlement-sharing-architecture.md](./settlement-sharing-architecture.md)
§9. This document is operations-only; you do not need to read the architecture
doc to complete the steps below.

## Table of Contents

- [Stripe Setup](#stripe-setup)
  - [Table of Contents](#table-of-contents)
  - [1. Stripe Account Checklist](#1-stripe-account-checklist)
  - [2. Create The Subscription Products](#2-create-the-subscription-products)
    - [2.1 Lantern — $1 / mo](#21-lantern--1--mo)
    - [2.2 Lantern Hoard — $5 / mo](#22-lantern-hoard--5--mo)
  - [3. Configure The Customer Portal](#3-configure-the-customer-portal)
  - [4. Create The Webhook Endpoint](#4-create-the-webhook-endpoint)
  - [5. Required Environment Variables](#5-required-environment-variables)
  - [6. Local Development With `stripe listen`](#6-local-development-with-stripe-listen)
  - [7. Smoke Test](#7-smoke-test)

---

## 1. Stripe Account Checklist

Complete these steps in the Stripe Dashboard before creating products or keys.
The Stripe account must be in **Live mode** for production traffic; do all
initial work in **Test mode** and promote afterwards.

- [x] **Business profile** — Settings → Business → Public details
  - Public business name: `Archivist`
  - Statement descriptor: `ARCHIVIST` (≤ 22 chars, no special characters)
  - Support email and support URL set to the project's contact channels.
- [x] **Branding** — Settings → Branding
  - Logo and icon uploaded (use `public/` assets).
  - Brand color set to match the app's primary accent.
- [x] **Payout details** — Settings → Payouts
  - Bank account verified.
  - Payout schedule chosen (Stripe default daily is fine).
- [x] **Tax** — Settings → Tax (optional)
  - Stripe Tax can be enabled later. Both plans are flat-rate digital
    subscriptions; consult your accountant before toggling.
- [x] **Team access** — Settings → Team
  - Add at least one additional admin with `Developer` or `Administrator` role
    so the account is not single-keyholder.

## 2. Create The Subscription Products

The app expects **exactly two products**, each with **exactly one recurring
price**. Multiple prices on the same product, or any additional products, will
cause webhook handlers to ignore unknown `price` ids.

| Product         | Price ID env var                | Price       | Unlocks                                  |
| --------------- | ------------------------------- | ----------- | ---------------------------------------- |
| `Lantern`       | `STRIPE_PRICE_ID_LANTERN`       | `$1.00 USD` | Unlimited settlements for the subscriber |
| `Lantern Hoard` | `STRIPE_PRICE_ID_LANTERN_HOARD` | `$5.00 USD` | Settlement sharing                       |

Repeat the steps below once per product.

### 2.1 Lantern — $1 / mo

1. Products → **Add product**.
1. Product details:
   - **Name:** `Lantern`
   - **Description:**
     `Carry your own lantern. Track unlimited settlements without sharing.`
   - **Image:** optional; the in-app upsell does not pull from Stripe.
1. Pricing:
   - **Pricing model:** Standard pricing.
   - **Price:** `$1.00 USD`.
   - **Billing period:** `Monthly`.
   - **Usage is metered:** off.
   - **Include tax in price:** leave off unless Stripe Tax is configured.
1. Save the product. Copy the generated **Price ID** — it starts with `price_`
   and is the value you will paste into `STRIPE_PRICE_ID_LANTERN`.

### 2.2 Lantern Hoard — $5 / mo

1. Products → **Add product**.
1. Product details:
   - **Name:** `Lantern Hoard`
   - **Description:**
     `Light another lantern. Share your settlement with a fellow survivor.`
   - **Image:** optional.
1. Pricing:
   - **Pricing model:** Standard pricing.
   - **Price:** `$5.00 USD`.
   - **Billing period:** `Monthly`.
   - **Usage is metered:** off.
   - **Include tax in price:** leave off unless Stripe Tax is configured.
1. Save the product. Copy the generated **Price ID** into
   `STRIPE_PRICE_ID_LANTERN_HOARD`.

> [!IMPORTANT] Test mode and Live mode each have their own price IDs. Capture
> **all four** (test + live × Lantern + Lantern Hoard) and keep them in your
> secrets store. Do not share live price IDs across environments — preview /
> staging deployments must point at the test-mode prices so trial subscriptions
> never charge real cards.

## 3. Configure The Customer Portal

The Customer Portal is how subscribers manage their own billing. The app links
to it from the in-app subscription page; the app never re-implements
cancellation or invoice download.

Settings → Billing → **Customer portal**:

- [ ] **Functionality**
  - [x] Cancel subscriptions — **on**. Choose **Cancel immediately** _or_
        **Cancel at period end** based on your refund policy; the app reads the
        resulting state from the webhook either way. The default recommendation
        is **Cancel at period end** so the customer retains sharing for the time
        they paid for.
  - [x] Update payment method — **on**.
  - [x] View invoice history — **on**.
  - [x] **Switch plans** — **on**, scoped to the two prices captured in §2
        (Lantern and Lantern Hoard). This lets customers self-serve upgrades
        between the two plans. Do not expose any other products; every visible
        price must map to a value the webhook handler understands. -
        **Proration:** _Prorate and charge immediately_ on upgrade, _Prorate and
        credit_ on downgrade. This matches the `customer.subscription.updated`
        semantics the handler relies on.
  - [ ] **Update quantities** — **off**. Neither plan has a seat dimension.
  - [ ] **Pause subscriptions** — **off** unless you explicitly want to support
        pauses. Pauses produce `customer.subscription.paused` events that the
        webhook does not yet handle.
- [x] **Business information**
  - Headline: `Manage your Archivist subscription`.
  - Terms of service URL and privacy policy URL set to the published app URLs.
- [x] **Branding** — inherits from §1.
- [x] Save and publish the portal configuration.

## 4. Create The Webhook Endpoint

Webhooks are how Stripe tells the app that a subscription was created, renewed,
or cancelled. The app keeps `user_subscription` in sync from these events; no
other code path writes to that table.

Developers → Webhooks → **Add endpoint**:

- **Endpoint URL:** `https://<your-domain>/api/billing/webhook`
  - Production: `https://archivist.monster/api/billing/webhook`.
  - Preview / staging: the Vercel preview URL for that deployment.
- **Events to send:**
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- **API version:** leave the webhook endpoint at the account default. The
  checkout, portal, and webhook routes pin their own request version
  (`2026-04-22.dahlia`) in code so the contract does not depend on Dashboard
  state. When intentionally upgrading, update the `STRIPE_API_VERSION` constant
  in `lib/common.ts` and this doc together.
- Save the endpoint. Reveal the **Signing secret** (starts with `whsec_`) — this
  is the value you paste into `STRIPE_WEBHOOK_SECRET`.

> [!IMPORTANT] Each environment (production, each preview, local) needs its
> **own** webhook endpoint with its **own** signing secret. Never reuse a
> signing secret across environments; a leaked secret cannot be revoked
> selectively.

## 5. Required Environment Variables

The app reads six env vars at runtime. Add them to `.env.local` for local
development and to the matching Vercel project (Production, Preview, and
Development) for deployed environments.

| Variable                             | Source                                                                   | Scope            | Notes                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`                  | Developers → API keys → **Secret key** (`sk_test_…` or `sk_live_…`)      | Server only      | Never expose to the browser. Rotate if accidentally committed.                  |
| `STRIPE_WEBHOOK_SECRET`              | Developers → Webhooks → endpoint → **Signing secret** (`whsec_…`)        | Server only      | One per endpoint. Local dev uses the value printed by `stripe listen` (see §6). |
| `STRIPE_PRICE_ID_LANTERN`            | Products → Lantern → **Price ID** (`price_…`)                            | Server only      | Distinct values for test and live modes. Maps to `plan_id = 'lantern'`.         |
| `STRIPE_PRICE_ID_LANTERN_HOARD`      | Products → Lantern Hoard → **Price ID** (`price_…`)                      | Server only      | Distinct values for test and live modes. Maps to `plan_id = 'lantern_hoard'`.   |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Developers → API keys → **Publishable key** (`pk_test_…` or `pk_live_…`) | Server + browser | Safe to expose; this is what Stripe.js loads with on the client.                |
| `NEXT_PUBLIC_SITE_URL`               | Canonical site origin (e.g. `https://archivist.example.com`)             | Server + browser | **Required in production.** Builds absolute Stripe Checkout redirect URLs.      |

`.env.local` template:

```bash
# Stripe — see docs/stripe-setup.md
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
STRIPE_PRICE_ID_LANTERN=price_replace_me
STRIPE_PRICE_ID_LANTERN_HOARD=price_replace_me
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_me
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Vercel project settings (Settings → Environment Variables):

- Add each variable to **Production**, **Preview**, and **Development**.
- Production uses live-mode values; Preview and Development use test-mode
  values.
- Mark `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` as **Sensitive** so
  Vercel masks them in the UI and build logs.

> [!WARNING] Only `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is safe to ship to the
> browser. The other four values must never appear in client bundles, log
> output, or error messages. The webhook handler should reject any request whose
> signature it cannot verify against `STRIPE_WEBHOOK_SECRET`.

## 6. Local Development With `stripe listen`

The Stripe CLI forwards live test-mode webhook events to a local URL so the
handler can be exercised end-to-end without exposing the dev server to the
internet.

1. Install the CLI: `brew install stripe/stripe-cli/stripe` (macOS) or follow
   <https://stripe.com/docs/stripe-cli> for other platforms.
1. Authenticate once per machine: `stripe login`. This opens a browser to link
   the CLI to your Stripe account.
1. Start the dev server in another terminal: `npm run dev`.
1. Start the forwarder:

   ```bash
   stripe listen --forward-to localhost:3000/api/billing/webhook
   ```

1. The CLI prints a webhook signing secret on startup, e.g.
   `Ready! Your webhook signing secret is whsec_…`. **Copy this value into
   `STRIPE_WEBHOOK_SECRET` in `.env.local`** and restart `npm run dev` so the
   handler picks it up. This secret is distinct from the dashboard webhook's
   signing secret and is valid only while `stripe listen` is running.
1. To replay events for development, use `stripe trigger`. The webhook resolves
   the target user via `metadata.user_id` first, with a fallback to the row
   keyed by `stripe_customer_id`. For synthetic events, pass an `--override` so
   the metadata reaches the handler:

   ```bash
   stripe trigger checkout.session.completed \
     --override "checkout_session:metadata[user_id]=<supabase-user-id>"
   stripe trigger customer.subscription.updated
   stripe trigger customer.subscription.deleted
   ```

Leave `stripe listen` running for the duration of the dev session; closing it
invalidates the local signing secret.

## 7. Smoke Test

Once §1–§6 are complete, verify each plan end-to-end with a test-mode card. Run
the Lantern flow first; then upgrade to Lantern Hoard from the Customer Portal
so both paths exercise the webhook handler.

1. Open the deployed (or local) app and sign in as a user with no subscription.
1. Trigger the **Lantern** upgrade flow (e.g. "Unlock unlimited settlements").
1. Complete checkout with Stripe's test card `4242 4242 4242 4242`, any future
   expiry, any CVC, any ZIP.
1. Confirm in the Stripe Dashboard that:
   - A new Customer was created.
   - A subscription on the **Lantern** price is `active`.
   - The webhook endpoint shows `200` responses for `checkout.session.completed`
     and `customer.subscription.updated`.
1. Confirm in the app's database that the user's `user_subscription` row now has
   `plan_id = 'lantern'`, `status = 'active'`, and populated
   `stripe_customer_id` / `stripe_subscription_id`.
1. Open the Customer Portal from the app and **switch plan** to Lantern Hoard.
   Confirm the resulting `customer.subscription.updated` event is delivered
   `200` and the database row updates to `plan_id = 'lantern_hoard'`.
1. From the Customer Portal, cancel the subscription. Confirm the
   `customer.subscription.deleted` (or `.updated` with
   `cancel_at_period_end = true`) event is delivered and the database row
   reflects the new status.

If any step fails, check the webhook endpoint's **Event deliveries** tab in
Stripe for the response body — the handler logs structured error reasons there.

---

_The lantern needs oil to burn. Tend to it carefully._
