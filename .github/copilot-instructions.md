# Copilot Instructions

## Project Context

This is **Archivist**, a Next.js companion app for tracking Kingdom Death:
Monster campaigns. The app helps players manage settlements, survivors, hunts,
showdowns, crafting, resources, timelines, and custom game content.

Kingdom Death: Monster's core loop has three major phases:

1. **Hunt Phase**: Survivors track and hunt a monster, facing events and
   challenges along the way.
2. **Showdown Phase**: Survivors confront the monster in battle using their
   skills and equipment.
3. **Settlement Phase**: Survivors return home to craft items, build structures,
   and manage resources.

User-facing copy should fit the game's tone: lanterns as hope, darkness as
danger, overwhelming odds, survival at great cost, and hard-earned victories.

### Gameplay

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

### Theme

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

## Development Commands

- Install dependencies with `npm install`.
- Do not run `npm run build`, `npm run dev`, `npm run format:write`,
  `npm run lint`, or `npm run start` unless the user specifically asks, or
  unless the task clearly requires that verification step.
- Prefer targeted checks when possible, such as `npm run test` for unit tests or
  a specific Vitest file.
- Supabase-backed integration tests require the local Supabase stack; see
  `docs/integration-tests.md`.

## General Coding Guidelines

- Follow the existing TypeScript, React, Next.js, and Supabase patterns in the
  codebase.
- Keep changes focused and minimal. Avoid broad refactors unless they are
  necessary for the task.
- Prefer maintainable, readable code over cleverness.
- Changes should maintain consistency with existing patterns and style
- Document changes clearly and thoroughly, including updates to existing
  comments when appropriate
- Use TypeScript's type system for clarity and safety.
- Keep functions focused and use descriptive names.
- Match existing error-handling and data-access patterns.
- Do not add comments that merely restate the code. Comments should explain
  intent, constraints, or non-obvious behavior.
- Update existing comments when behavior changes.
- Use descriptive variable and function names that clearly convey their purpose
- When suggesting code changes, always opt for the most maintainable approach.
  Try your best to keep the code clean and follow "Don't Repeat Yourself" (DRY)
  principles

## JSDoc Style

Use JSDoc for exported functions, components, types, classes, enums, and complex
logic when consistent with the surrounding file.

JSDoc titles should use **Capital Case**.

```ts
/**
 * Calculates Rectangle Area
 *
 * Calculates area of a rectangle and returns the result.
 *
 * @param width Rectangle Width
 * @param height Rectangle Height
 * @returns Rectangle Area
 */
function calculateArea(width: number, height: number): number {
  return width * height
}
```

For enum values and interface fields, use short Capital Case descriptions:

```ts
/**
 * Survivor Type
 *
 * Represents the types of survivors in the game.
 */
enum SurvivorType {
  /** Arc Survivor */
  ARC = 'arc',
  /** Core Survivor */
  CORE = 'core'
}
```

## Schemas And Validation

- Use `zod` for object schemas, validation, and parsing.
- Put schemas in the existing `schemas/` directory.
- Name schema files after the object or input they validate, following current
  repository conventions.
- Use `z.object` for object schemas.
- Include useful error messages on refinements.

## User Messaging

- Use `sonner`'s `toast` API for user-facing notifications.
- When a Zod parse fails, prefer the `ZodError` message in the toast.
- If no specific parse error is available, or for generic failures, show:

```plain
The darkness swallows your words. Please try again.
```

- Log errors to the console with a clear prefix that identifies the failed
  operation, for example:

```ts
console.error('Attribute Save Error:', error)
```

## Pull Request Guidance

When preparing PRs:

- Keep changes focused and minimal.
- Note dependency changes explicitly.
- Update `README.md` or docs when behavior, setup, or usage changes.
- Summaries should explain what changed and why.
- Mention relevant issues, discussions, or follow-up risks when applicable.
- Formatting checks pass
- Linting checks pass
- Unit tests pass and coverage requirements are met
- **Always** ensure that PRs include a version update in `package.json` and
  `package-lock.json`. These should follow semantic versioning principles so
  that changes are properly reflected in the version numbers.

The body of the PR should include:

- A summary of the changes
- A special note of any changes to dependencies
- A link to any relevant issues or discussions
- Any additional context that may be helpful for reviewers
