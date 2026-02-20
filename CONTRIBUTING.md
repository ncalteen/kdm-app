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
   details.

1. Add the following environment variables to your `.env` file, using the
   connection details from the previous step:

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

TODO
