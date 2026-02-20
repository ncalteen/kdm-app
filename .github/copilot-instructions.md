# Copilot Instructions

## Development

- Do not run `npm run build`, `npm run dev`, `npm run format` , `npm run lint`,
  or `npm run start` commands unless you are specifically asked to do so. These
  commands are used to check and format the code, but they can be time-consuming
  and may not be necessary for your task.

## Environment Setup

Install dependencies by running:

```bash
npm install
```

## General Coding Guidelines

- Follow standard TypeScript and JavaScript coding conventions and best
  practices
- Changes should maintain consistency with existing patterns and style
- Document changes clearly and thoroughly, including updates to existing
  comments when appropriate
- Do not include basic, unnecessary comments that simply restate what the code
  is doing (focus on explaining _why_, not _what_)
- Use consistent error handling patterns throughout the codebase
- Use TypeScript's type system to ensure type safety and clarity
- Keep functions focused and manageable
- Use descriptive variable and function names that clearly convey their purpose
- Use JSDoc comments to document functions, classes, and complex logic
- When suggesting code changes, always opt for the most maintainable approach.
  Try your best to keep the code clean and follow "Don't Repeat Yourself" (DRY)
  principles
- Avoid unnecessary complexity and always consider the long-term maintainability
  of the code

## Object Schemas

- All object schemas should be created using the `zod` library.
- All object schemas should be created in the `src/schemas` directory.
- All object schemas should be created in a file named after the object schema.
  For example, the `Survivor` schema should be created in
  `src/schemas/survivor.ts`.
- All object schemas should be created using the `z.object` function.
- Validation and parsing should be done using the `zod` library.
- All refinements should include appropriate error messages.

## User Messaging

- All user messaging should be done using the `sonner` library's `toast`
  function.
- If an error occurs while parsing an input value against the Zod schema, the
  error message from the raised `ZodError` should be used in the toast
  notification. If no error message is provided, the following message should be
  displayed using the `toast.error` function.

  ```plain
  The darkness swallows your words. Please try again.
  ```

- If an error occurs, the following message should be displayed using the
  `toast.error` function.

  ```plain
  The darkness swallows your words. Please try again.
  ```

- If an error occurs, it should be logged to the console with appropriate
  leading information to identify it. For example,
  `console.error('Attribute Save Error:', error)`.

## Theme

Use the following text as thematic inspiration for any user-facing notifications
and text.

```plain
Kingdom Death's world is immensely deep and brutally challenging. It will
captivate the imagination and stoke the fires of obsession.

In a place of stone faces, nameless survivors stand together. They have nothing.
Only a lantern to light their struggle.
```

Other terms and phrases that can be used to describe the game include:

- Lanterns as a source of light and hope.
- Darkness as a source of fear and despair.
- Overwhelming odds.
- Struggle for survival.
- Victory rarely achieved, and at great cost.

## Gameplay

Kingdom Death: Monster, is a tabletop game focused around a group of survivors
building and expanding a settlement. The core gameplay loop is broken down into
three parts:

1. **Hunt Phase**: Survivors track and hunt a monster, facing various challenges
   and events along the way.
1. **Showdown Phase**: Survivors confront the monster in a battle, using their
   skills and equipment to defeat it.
1. **Settlement Phase**: Survivors return to their settlement, where they can
   craft items, build structures, and manage their resources.

The purpose of this application is to act as a companion tool where players can
keep track of their settlement and survivors. Additionally, they can switch
between the various phases (above), which will surface relevant information and
functionality.

## Pull Request Guidelines

When creating a pull request (PR), please ensure that:

- Keep changes focused and minimal (avoid large changes, or consider breaking
  them into separate, smaller PRs)
- Formatting checks pass
- Linting checks pass
- Unit tests pass and coverage requirements are met
- The action has been transpiled to JavaScript and the `dist` directory is
  up-to-date with the latest changes in the `src` directory
- If necessary, the `README.md` file is updated to reflect any changes in
  functionality or usage

The body of the PR should include:

- A summary of the changes
- A special note of any changes to dependencies
- A link to any relevant issues or discussions
- Any additional context that may be helpful for reviewers
