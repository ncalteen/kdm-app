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
1. Work on your changes
1. Preview your changes (`npm run dev`)
1. Open a pull request back to this repository
1. Notify the maintainers of this repository for peer review and approval
1. Merge :tada:

The maintainers of this repository will review your changes and provide any
feedback. Once approved, they will be merged in and a new version of the site
will be deployed. You'll also be able to see your GitHub profile tagged in the
contributors list for any pages you contribute to!

## Schema Updates

If you intend to add, remove, or change the [schemas](./src/schemas/) used in
this project, please ensure that your changes adhere to the following
guidelines:

- All changes must be backwards-compatible
- Existing user data must be automatically migrated to the new schema
