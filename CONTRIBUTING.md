# Contributing

All contributions are welcome and greatly appreciated!

## Steps to Contribute

> [!WARNING]
>
> Check the `engine` property in [`package.json`](./package.json) to see what
> version of Node.js is required for local development. This can be different
> from the version of Node.js used on the GitHub Actions runners. Tools like
> [nodenv](https://github.com/nodenv/nodenv) can be used to manage your Node.js
> version automatically.

1. Fork this repository
1. Start your development database

   ```bash
   npx supabase start
   ```

   This will start a local instance of the database and output the connection
   details. The following are also started:
   - [Supabase Studio](http://localhost:54323/)
   - [Mailpit](http://localhost:54324/)

1. Add the following environment variables to your `.env` file, using the
   connection details from the previous step:

   <!-- secretlint-disable -->

   ```env
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<your-publishable-key>"
   NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"

   POSTGRES_DATABASE="postgres"
   POSTGRES_HOST="127.0.0.1"
   POSTGRES_PASSWORD="postgres"
   POSTGRES_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
   POSTGRES_USER="postgres"

   SUPABASE_SECRET_KEY="<your-secret-key>"
   SUPABASE_URL="http://127.0.0.1:54321"
   ```

   <!-- secretlint-enable -->

1. Start your development server

   ```bash
   npm run dev
   ```

1. Work on your changes
1. Stop the development server and database when you're done

   ```bash
   npx supabase stop
   ```

1. Open a pull request back to this repository
1. Notify the maintainers of this repository for peer review and approval
1. Merge :tada:

The maintainers of this repository will review your changes and provide any
feedback. Once approved, they will be merged in and a new version of the site
will be deployed. You'll also be able to see your GitHub profile tagged in the
contributors list for any pages you contribute to!

## Database Schema Updates

This project uses Supabase for its database needs. If you need to make changes
to the database schema, please follow these steps:

> [!NOTE]
>
> Please make sure to add any necessary seed data to the `supabase/seed`
> directory as well, and update the seeding scripts if needed.

1. Create a new migration file

   ```bash
   npx supabase migration new <migration-name>
   ```

   This will create a new SQL file in the `supabase/migrations` directory.

1. Add your SQL statements to the new migration file
1. Run the migration to apply the changes to your local database

   ```bash
   npx supabase migration up
   ```

1. Test your changes locally
1. Regenerate the TypeScript types

   ```bash
   # If you want to generate types directly from the remote database
   npx supabase gen types typescript \
      --project-id "$PROJECT_REF" --schema public > lib/database.types.ts

   # If you want to generate types from your local database
   npx supabase gen types typescript --local > lib/database.types.ts
   ```

## Stripe Integration

To test the Stripe integration locally you need three things: the project's
test-mode `STRIPE_*` env vars, the Stripe CLI installed on your machine, and a
running `stripe listen` process forwarding webhook events into the dev server.

See [Stripe Setup](./docs/stripe-setup.md) for the one-time account / product /
env-var configuration. The steps below cover the contributor-side workflow.

### 1. Install the Stripe CLI

The [Stripe CLI](https://docs.stripe.com/stripe-cli) is required to forward
test-mode webhook events to your local dev server.

```bash
brew install stripe/stripe-cli/stripe
```

Verify the install:

```bash
stripe --version
```

> [!NOTE]
>
> The full install matrix (Docker image, additional Linux distros, ARM builds)
> is documented at <https://docs.stripe.com/stripe-cli/install>.

### 2. Authenticate the CLI

Run this once per machine. The CLI will open a browser and pair against the
Stripe account it should manage in test mode:

```bash
stripe login
```

Press Enter at the pairing-code prompt to launch the browser, then approve the
request in the Stripe Dashboard. The CLI stores its credentials in
`~/.config/stripe/config.toml`; no Stripe keys need to be added to your shell
environment for the CLI itself.

> [!IMPORTANT]
>
> Always authenticate against a **test-mode** Stripe account — never live. The
> dev server's webhook handler verifies signatures against
> `STRIPE_WEBHOOK_SECRET`, and the secret printed by `stripe listen` is only
> valid for the test-mode events forwarded during that session.

### 3. Forward Webhooks To Your Local Dev Server

In one terminal, start the dev server:

```bash
npm run dev
```

In a second terminal, start the webhook forwarder:

```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

On startup the CLI prints a line like:

```text
Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

Copy that value into `STRIPE_WEBHOOK_SECRET` in your `.env.local` and restart
`npm run dev` so the handler picks it up. The signing secret is **distinct
from** the dashboard webhook's signing secret and is valid only while
`stripe listen` is running — closing the process invalidates it.

You can scope forwarding to just the events the app handles to keep the output
readable:

```bash
stripe listen \
  --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted \
  --forward-to localhost:3000/api/billing/webhook
```

### 4. Trigger Test Events

With `stripe listen` running, use `stripe trigger` from a third terminal to
replay specific events end-to-end without clicking through Checkout:

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

Each trigger appears in the `stripe listen` output with its forwarded response
code; the handler logs are visible in the `npm run dev` terminal. For full
end-to-end testing (real Checkout flow, Customer Portal plan switching, real
card numbers), follow the smoke test in
[docs/stripe-setup.md §7](./docs/stripe-setup.md#7-smoke-test).
