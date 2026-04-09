# Built-In vs. Custom Content Data Storage

## Status

Approved

> [!NOTE]
>
> This document will be amended as the application evolves to reflect the
> current approach to data storage for built-in and custom content.

## Context

Across the core game and various expansions, are _thousands_ of cards in Kingdom
Death: Monster, each with unique data that could potentially be tracked in the
application.

A core tenet in the design of Archivist is that, for any content produced by the
official game and its expansions, the player should physically own and make use
of the content in order to play the game.

## Challenge

The amount of data being tracked within the application itself could potentially
result in removal of the need for the player to physically own the game cards,
which is not the intended experience.

## Goals

- Ensure that the application does not provide full data for non-custom content,
  maintaining the need for players to physically own the game cards.
- Make locating the physical game cards and their relationships straightforward
  for the player.
- Allow full tracking of custom content created by the player, as it may not
  exist physically and should be shareable within the application.

## Risks

The primary risk of tracking data for custom or non-custom content is that it
could potentially allow for players to access all game data without having
purchased it. For example, if Archivist allows creation of custom content that
replicates official gear cards, it could be used to bypass the need to
physically own those cards.

## Decision

- For each of the content categories listed in the remainder of this document,
  the application will automatically include the minimum necessary data for
  **non-custom content**.

  > This is denoted in the following tables with a :white_check_mark: for
  > tracked data and a :x: for data that is not tracked.

- For **custom content**, the application will track **all** data associated
  with the content. This ensures that players can fully utilize the application
  to manage their custom game content.
- In order to reduce the impact of the above-mentioned risks, **creation of
  custom content must be done manually by the player.** There will never be a
  user-facing API that would allow automated creation of custom content within
  the application.
- Publicly available content, such as the
  [living glossary](https://kingdomdeath.com/rules/living-glossary), will be
  referenced for additional information but may or may not be fully tracked
  within the application.

## Consequences

- Players will still need to physically own the official game cards to access
  their full data.
- Custom content can be fully tracked within the application, providing
  flexibility for player-created content.
- The application will not provide full data for non-custom content, maintaining
  the intended physical card experience.

## Data Tracking Outline

The following data is tracked as part of various game components. For additional
information, refer to the
[living glossary](https://kingdomdeath.com/rules/living-glossary).

> This refers to the _eventual_ data that will be tracked for each content type,
> and may not reflect the current state of the application.

### Ability or Impairment

| Name                    | Tracked            |
| ----------------------- | ------------------ |
| Ability/Impairment Name | :white_check_mark: |
| Rules                   | :x:                |

### Armor Set

| Name           | Tracked            |
| -------------- | ------------------ |
| Armor Set Name | :white_check_mark: |
| Bonuses        | :x:                |
| Gear Pieces    | :white_check_mark: |

### Character

| Name           | Tracked            |
| -------------- | ------------------ |
| Character Name | :white_check_mark: |
| Rules          | :x:                |

### Collective Cognition Milestone

| Name                                | Tracked            |
| ----------------------------------- | ------------------ |
| Collective Cognition Milestone Name | :white_check_mark: |
| Rules                               | :x:                |

### Collective Cognition Reward

| Name                             | Tracked            |
| -------------------------------- | ------------------ |
| Collective Cognition Reward Name | :white_check_mark: |
| Collective Cognition Value       | :white_check_mark: |
| Rules                            | :x:                |

### Constellation

| Name               | Tracked            |
| ------------------ | ------------------ |
| Constellation Name | :white_check_mark: |
| Rules              | :x:                |

### Disorder

| Name          | Tracked            |
| ------------- | ------------------ |
| Disorder Name | :white_check_mark: |
| Rules         | :x:                |

### Encounter Monster

| Name                                                           | Tracked            |
| -------------------------------------------------------------- | ------------------ |
| Encounter Monster Name                                         | :white_check_mark: |
| [Terrain](#terrain-card)                                       | :white_check_mark: |
| [Trait](#monster-trait)                                        | :white_check_mark: |
| Basic Action                                                   | :x:                |
| Instinct                                                       | :x:                |
| [Level Data](#encounter-monster-level-data)                    | :white_check_mark: |
| [Counter Cardss](#encounter-monster-counter-card)              | :x:                |
| [Opportunity Cards](#encounter-monster-opportunity-card)       | :x:                |
| [Critical Wound Cards](#encounter-monster-critical-wound-card) | :x:                |

#### Encounter Monster Counter Card

| Name              | Tracked            |
| ----------------- | ------------------ |
| Counter Card Name | :white_check_mark: |
| Rules             | :x:                |

#### Encounter Monster Critical Wound Card

| Name                     | Tracked            |
| ------------------------ | ------------------ |
| Critical Wound Card Name | :white_check_mark: |
| Rules                    | :x:                |

#### Encounter Monster Level Data

| Name                    | Tracked            |
| ----------------------- | ------------------ |
| Level                   | :white_check_mark: |
| Life                    | :white_check_mark: |
| Movement                | :white_check_mark: |
| Toughness               | :white_check_mark: |
| Speed                   | :white_check_mark: |
| Damage                  | :white_check_mark: |
| Accuracy                | :white_check_mark: |
| Evasion                 | :white_check_mark: |
| Luck                    | :white_check_mark: |
| [Trait](#monster-trait) | :white_check_mark: |
| [Moods](#monster-mood)  | :white_check_mark: |

#### Encounter Monster Opportunity Card

| Name                  | Tracked            |
| --------------------- | ------------------ |
| Opportunity Card Name | :white_check_mark: |
| Rules                 | :x:                |

### Fighting Art

| Name              | Tracked            |
| ----------------- | ------------------ |
| Fighting Art Name | :white_check_mark: |
| Rules             | :x:                |

### Gear

| Name                        | Tracked            |
| --------------------------- | ------------------ |
| Gear Name                   | :white_check_mark: |
| Accuracy                    | :x:                |
| Affinities                  | :white_check_mark: |
| Puzzle Affinities           | :white_check_mark: |
| Affinity Bonus              | :x:                |
| Armor Points                | :x:                |
| Armor Location              | :x:                |
| Keywords                    | :x:                |
| [Location](#location)       | :white_check_mark: |
| Crafting Recipe             | :white_check_mark: |
| Special Rules               | :x:                |
| Speed                       | :x:                |
| Strength                    | :x:                |
| [Weapon Type](#weapon-type) | :white_check_mark: |

### Gear Grid

| Name             | Tracked            |
| ---------------- | ------------------ |
| [Gear](#gear)    | :white_check_mark: |
| Position         | :white_check_mark: |
| Total Affinities | :white_check_mark: |

### Hunt

| Name                                 | Tracked            |
| ------------------------------------ | ------------------ |
| Monster Level                        | :white_check_mark: |
| Current Survivor Hunt Board Position | :white_check_mark: |

#### Hunt Event Card

| Name                | Tracked |
| ------------------- | ------- |
| Hunt Event Name     | :x:     |
| Rules               | :x:     |
| [Monster](#monster) | :x:     |

#### Hunt Monster Details

| Name                        | Tracked            |
| --------------------------- | ------------------ |
| Current Hunt Board Position | :white_check_mark: |
| Attributes                  | :white_check_mark: |
| Attribute Tokens            | :white_check_mark: |
| AI Deck Remaining           | :white_check_mark: |
| Knocked Down                | :white_check_mark: |
| [Moods](#monster-mood)      | :white_check_mark: |
| [Traits](#monster-trait)    | :white_check_mark: |
| Wounds                      | :white_check_mark: |

### Innovation

| Name            | Tracked            |
| --------------- | ------------------ |
| Innovation Name | :white_check_mark: |
| Rules           | :x:                |
| Consequences    | :x:                |
| Benefits        | :x:                |

### Knowledge

| Name                          | Tracked            |
| ----------------------------- | ------------------ |
| Knowledge Name                | :white_check_mark: |
| Philosophy                    | :white_check_mark: |
| Rules                         | :x:                |
| Observation Conditions        | :x:                |
| Observation Rank Up Milestone | :x:                |

### Location

| Name          | Tracked            |
| ------------- | ------------------ |
| Location Name | :white_check_mark: |
| Rules         | :x:                |
| [Gear](#gear) | :white_check_mark: |

### Milestone

| Name           | Tracked            |
| -------------- | ------------------ |
| Milestone Name | :white_check_mark: |
| Requirements   | :x:                |
| Rules          | :x:                |

### Minion

| Name         | Tracked            |
| ------------ | ------------------ |
| Minion Name  | :white_check_mark: |
| Life         | :white_check_mark: |
| Movement     | :white_check_mark: |
| Toughness    | :white_check_mark: |
| Basic Action | :x:                |
| Reward       | :x:                |

### Monster

Applies to both quarries and nemeses.

| Name                         | Tracked            |
| ---------------------------- | ------------------ |
| Monster Name                 | :white_check_mark: |
| Instinct                     | :x:                |
| [Location](#location)        | :white_check_mark: |
| Multi-Monster                | :white_check_mark: |
| Basic Action                 | :x:                |
| Blind Spot                   | :x:                |
| Defeat Outcome               | :x:                |
| Deployment Rules             | :x:                |
| Hunt Board Layout            | :white_check_mark: |
| Node Level                   | :white_check_mark: |
| Prologue                     | :white_check_mark: |
| [Terrain](#terrain-card)     | :white_check_mark: |
| [Timeline Events](#timeline) | :white_check_mark: |
| Type (Quarry/Nemesis)        | :white_check_mark: |
| Alternate Monster            | :white_check_mark: |
| Vignette Monster             | :white_check_mark: |

In multi-monster encounters, sub-monsters will use the same data structure as
the main monster, with the following additional information:

| Name             | Tracked            |
| ---------------- | ------------------ |
| Sub-Monster Name | :white_check_mark: |

#### Monster AI Card

| Name                                                        | Tracked |
| ----------------------------------------------------------- | ------- |
| Type (**B**asic, **A**dvanced, **L**egendary, **O**vertone) | :x:     |
| AI Card Name                                                | :x:     |
| Rules                                                       | :x:     |
| Attributes                                                  | :x:     |

> Attributes include the following (not an exhaustive list):
>
> - Duration
> - Harmony
> - Repeat

#### Monster Collective Cognition Reward

| Name                                                        | Tracked            |
| ----------------------------------------------------------- | ------------------ |
| [Collective Cognition Reward](#collective-cognition-reward) | :white_check_mark: |

#### Monster Hit Location Card

| Name              | Tracked |
| ----------------- | ------- |
| Hit Location Name | :x:     |
| Rules             | :x:     |
| Reactions         | :x:     |
| Critical Wound    | :x:     |
| Attributes        | :x:     |
| Persistent Injury | :x:     |

> Attributes include the following:
>
> - First Strike
> - Impervious
> - Super-Dense
> - Parry
> - Vasodialted (Crimson Crocodile)

Coagulated hit location cards (Crimson Crocodile) have additional rules that
differ from standard hit location cards.

| Name                        | Tracked |
| --------------------------- | ------- |
| Automatic Failure Locations | :x:     |

#### Monster Level Data

Depending on the level, the following details may vary:

| Name                                           | Tracked            |
| ---------------------------------------------- | ------------------ |
| AI Deck Card Count (per Type)                  | :white_check_mark: |
| Attributes                                     | :white_check_mark: |
| Attribute Tokens                               | :white_check_mark: |
| Level                                          | :white_check_mark: |
| Life (Nemesis)                                 | :white_check_mark: |
| [Moods](#monster-mood)                         | :white_check_mark: |
| [Traits](#monster-trait)                       | :white_check_mark: |
| [Survivor Statuses](#survivor-status)          | :white_check_mark: |
| Monster Hunt Board Starting Position (Quarry)  | :white_check_mark: |
| Survivor Hunt Board Starting Position (Quarry) | :white_check_mark: |
| Victory Rewards                                | :x:                |

#### Monster Mood

| Name      | Tracked            |
| --------- | ------------------ |
| Mood Name | :white_check_mark: |
| Rules     | :x:                |

#### Monster Trait

| Name       | Tracked            |
| ---------- | ------------------ |
| Trait Name | :white_check_mark: |
| Rules      | :x:                |

#### Monster Trap Card

| Name      | Tracked |
| --------- | ------- |
| Trap Name | :x:     |
| Rules     | :x:     |

#### Monster Fart Card

Currently only applies to Frogdog and Bullfrogdog.

| Name      | Tracked |
| --------- | ------- |
| Fart Name | :x:     |
| Rules     | :x:     |

#### Song Card

Currently only applies to Smog Singers.

| Name                                | Tracked |
| ----------------------------------- | ------- |
| Song Name                           | :x:     |
| Rules                               | :x:     |
| [Survivor Status](#survivor-status) | :x:     |

#### Survivor Role

Currently only applies to Lion Knight.

| Name      | Tracked            |
| --------- | ------------------ |
| Role Name | :white_check_mark: |
| Rules     | :x:                |

#### Survivor Status

| Name                 | Tracked            |
| -------------------- | ------------------ |
| Survivor Status Name | :white_check_mark: |
| Rules                | :x:                |

#### Sword Craft

Currently only applies to Atnas the Child Eater.

| Name             | Tracked |
| ---------------- | ------- |
| Sword Craft Name | :x:     |
| Rules            | :x:     |

### Neurosis

| Name          | Tracked            |
| ------------- | ------------------ |
| Neurosis Name | :white_check_mark: |
| Rules         | :x:                |

### Pattern

| Name                       | Tracked            |
| -------------------------- | ------------------ |
| Pattern Name               | :white_check_mark: |
| [Gear Cost](#gear)         | :white_check_mark: |
| [Resource Cost](#resource) | :white_check_mark: |
| Crafting Limit             | :white_check_mark: |
| [Gear](#gear)              | :white_check_mark: |
| [Innovations](#innovation) | :white_check_mark: |
| Endeavors                  | :white_check_mark: |

### Philosophy

| Name                          | Tracked            |
| ----------------------------- | ------------------ |
| Philosophy Name               | :white_check_mark: |
| Tier                          | :x:                |
| [Neurosis](#neurosis)         | :white_check_mark: |
| [Tenet Knowledge](#knowledge) | :white_check_mark: |
| Hunt XP Milestones            | :x:                |

#### Philosophy Rank

| Name                   | Tracked            |
| ---------------------- | ------------------ |
| Philosophy Rank Number | :white_check_mark: |
| Rules                  | :x:                |

### Principle

| Name         | Tracked            |
| ------------ | ------------------ |
| Condition    | :white_check_mark: |
| Option Names | :white_check_mark: |
| Option Rules | :x:                |

### Recipe Card

| Name                              | Tracked            |
| --------------------------------- | ------------------ |
| Recipe Name                       | :white_check_mark: |
| Benefits                          | :x:                |
| Cooking Rules (Flavor Text)       | :x:                |
| [Ingredient Resources](#resource) | :white_check_mark: |
| Keywords                          | :x:                |

### Resource

| Name               | Tracked            |
| ------------------ | ------------------ |
| Resource Name      | :white_check_mark: |
| Resource Types     | :white_check_mark: |
| Category           | :white_check_mark: |
| Keywords           | :x:                |
| [Quarry](#monster) | :white_check_mark: |
| Rules              | :x:                |

Indomitable resource cards track additional information beyond the basic
resource cards.

| Name                | Tracked            |
| ------------------- | ------------------ |
| [Pattern](#pattern) | :white_check_mark: |

### Scout Discovery

| Name                 | Tracked |
| -------------------- | ------- |
| Scout Discovery Name | :x:     |
| Rules                | :x:     |

### Secret Fighting Art

| Name                     | Tracked            |
| ------------------------ | ------------------ |
| Secret Fighting Art Name | :white_check_mark: |
| Rules                    | :x:                |

### Seed Pattern

| Name                       | Tracked            |
| -------------------------- | ------------------ |
| Seed Pattern Name          | :white_check_mark: |
| [Gear Cost](#gear)         | :white_check_mark: |
| [Resource Cost](#resource) | :white_check_mark: |
| Crafting Limit             | :white_check_mark: |
| Crafting Steps             | :x:                |
| Era                        | :white_check_mark: |
| [Gear](#gear)              | :white_check_mark: |
| Keywords                   | :x:                |
| Ingredients                | :white_check_mark: |
| Requirements               | :white_check_mark: |

### Settlement

| Name                      | Tracked            |
| ------------------------- | ------------------ |
| Settlement Name           | :white_check_mark: |
| Arrival Bonuses           | :white_check_mark: |
| Lantern Year              | :white_check_mark: |
| Departing Bonuses         | :white_check_mark: |
| Lantern Research Level    | :white_check_mark: |
| Monster Volumes           | :white_check_mark: |
| Survival Limit            | :white_check_mark: |
| Survivor Type (Arc, Core) | :white_check_mark: |
| Uses Scouts               | :white_check_mark: |
| Endeavors                 | :white_check_mark: |

#### Settlement Collective Cognition Reward

| Name                                                        | Tracked            |
| ----------------------------------------------------------- | ------------------ |
| [Collective Cognition Reward](#collective-cognition-reward) | :white_check_mark: |
| Unlocked                                                    | :white_check_mark: |

#### Settlement Gear

| Name          | Tracked            |
| ------------- | ------------------ |
| [Gear](#gear) | :white_check_mark: |
| Quantity      | :white_check_mark: |

#### Settlement Innovation

| Name                      | Tracked            |
| ------------------------- | ------------------ |
| [Innovation](#innovation) | :white_check_mark: |

#### Settlement Knowledge

| Name                    | Tracked            |
| ----------------------- | ------------------ |
| [Knowledge](#knowledge) | :white_check_mark: |

#### Settlement Location

| Name                  | Tracked            |
| --------------------- | ------------------ |
| [Location](#location) | :white_check_mark: |
| Unlocked              | :white_check_mark: |

#### Settlement Milestone

| Name                    | Tracked            |
| ----------------------- | ------------------ |
| [Milestone](#milestone) | :white_check_mark: |
| Complete                | :white_check_mark: |

#### Settlement Nemesis

| Name                             | Tracked            |
| -------------------------------- | ------------------ |
| [Nemesis](#monster)              | :white_check_mark: |
| Collective Cognition (per Level) | :white_check_mark: |
| Defeated (per Level)             | :white_check_mark: |
| Unlocked                         | :white_check_mark: |

#### Settlement Pattern

| Name                | Tracked            |
| ------------------- | ------------------ |
| [Pattern](#pattern) | :white_check_mark: |

#### Settlement Philosophy

| Name                      | Tracked            |
| ------------------------- | ------------------ |
| [Philosophy](#philosophy) | :white_check_mark: |

#### Settlement Principle

| Name                    | Tracked            |
| ----------------------- | ------------------ |
| [Principle](#principle) | :white_check_mark: |
| Selected Option         | :white_check_mark: |

#### Settlement Quarry

| Name                             | Tracked            |
| -------------------------------- | ------------------ |
| [Quarry](#monster)               | :white_check_mark: |
| Collective Cognition (per Level) | :white_check_mark: |
| Unlocked                         | :white_check_mark: |

#### Settlement Resource

| Name                  | Tracked            |
| --------------------- | ------------------ |
| [Resource](#resource) | :white_check_mark: |
| Quantity              | :white_check_mark: |

#### Settlement Seed Pattern

| Name                          | Tracked            |
| ----------------------------- | ------------------ |
| [Seed Pattern](#seed-pattern) | :white_check_mark: |

#### Settlement Timeline

| Name        | Tracked            |
| ----------- | ------------------ |
| Year Number | :white_check_mark: |
| Entries     | :white_check_mark: |
| Completed   | :white_check_mark: |

### Settlement Event

| Name                  | Tracked |
| --------------------- | ------- |
| Settlement Event Name | :x:     |
| Rules                 | :x:     |

### Settlement Phase

| Name                       | Tracked            |
| -------------------------- | ------------------ |
| Settlement Phase Step Name | :white_check_mark: |
| Rules                      | :x:                |

### Severe Injury

| Name               | Tracked            |
| ------------------ | ------------------ |
| Severe Injury Name | :white_check_mark: |
| Rules              | :x:                |

### Showdown

| Name                                      | Tracked            |
| ----------------------------------------- | ------------------ |
| Ambush (Monster, Survivor, None)          | :white_check_mark: |
| Monster Level                             | :white_check_mark: |
| Showdown Type (Special, Nemesis, Regular) | :white_check_mark: |
| Current Turn (Monster, Survivor)          | :white_check_mark: |

#### Showdown Monster Details

| Name                     | Tracked            |
| ------------------------ | ------------------ |
| Attributes               | :white_check_mark: |
| Attribute Tokens         | :white_check_mark: |
| AI Card Drawn (per Turn) | :white_check_mark: |
| Knocked Down             | :white_check_mark: |
| [Moods](#monster-mood)   | :white_check_mark: |
| [Traits](#monster-trait) | :white_check_mark: |
| Wound Count              | :white_check_mark: |

### Strain Milestone

| Name                  | Tracked            |
| --------------------- | ------------------ |
| Strain Milestone Name | :white_check_mark: |
| Milestone Condition   | :x:                |
| Permanent Effect      | :x:                |

Certain strain milestones can result in the unlock of additional monsters. These
are tracked as part of user settings.

- Killenium Butcher
- Screaming Nukalope
- White Gigalion

### Survivor

| Name                                                | Tracked            |
| --------------------------------------------------- | ------------------ |
| Survivor Name                                       | :white_check_mark: |
| [Abilities and Impairments](#ability-or-impairment) | :white_check_mark: |
| Attributes                                          | :white_check_mark: |
| Can Dash                                            | :white_check_mark: |
| Can Dodge                                           | :white_check_mark: |
| Can Fist Pump                                       | :white_check_mark: |
| Can Encourage                                       | :white_check_mark: |
| Can Spend Survival                                  | :white_check_mark: |
| Can Surge                                           | :white_check_mark: |
| Can Use Fighting Arts/Knowledges                    | :white_check_mark: |
| Constellations (PotStars)                           | :white_check_mark: |
| Courage                                             | :white_check_mark: |
| Courage Milestone                                   | :white_check_mark: |
| [Cursed Gear](#gear)                                | :white_check_mark: |
| Dead                                                | :white_check_mark: |
| Disposition (Wanderer)                              | :white_check_mark: |
| [Disorders](#disorder)                              | :white_check_mark: |
| [Fighting Arts](#fighting-art)                      | :white_check_mark: |
| Gender                                              | :white_check_mark: |
| Hunt XP                                             | :white_check_mark: |
| Hunt XP Rank Up Milestones                          | :white_check_mark: |
| Insanity                                            | :white_check_mark: |
| [Knowledges](#knowledge)                            | :white_check_mark: |
| Knowledge Observation Conditions                    | :white_check_mark: |
| Knowledge Observation Rank Up Milestones            | :white_check_mark: |
| Knowledge Rules                                     | :white_check_mark: |
| Lumi                                                | :white_check_mark: |
| [Neurosis](#neurosis)                               | :white_check_mark: |
| Next Departure Bonuses                              | :white_check_mark: |
| Once Per Lifetime Bonuses                           | :white_check_mark: |
| Once Per Lifetime Reroll Used                       | :white_check_mark: |
| [Philosophy](#philosophy)                           | :white_check_mark: |
| Philosophy Rank                                     | :white_check_mark: |
| Retired                                             | :white_check_mark: |
| [Secret Fighting Arts](#secret-fighting-art)        | :white_check_mark: |
| [Severe Injuries](#severe-injury)                   | :white_check_mark: |
| Skip Next Hunt                                      | :white_check_mark: |
| State (Aenas)                                       | :white_check_mark: |
| Survival                                            | :white_check_mark: |
| Suspicion (Squires of the Citadel)                  | :white_check_mark: |
| Systemic Pressure                                   | :white_check_mark: |
| Torment                                             | :white_check_mark: |
| Understanding                                       | :white_check_mark: |
| Understanding Milestone                             | :white_check_mark: |
| [Weapon Proficiency Type](#weapon-type)             | :white_check_mark: |
| Weapon Proficiency Level                            | :white_check_mark: |

#### Survivor Encounter Details

| Name               | Tracked            |
| ------------------ | ------------------ |
| Armor Points       | :white_check_mark: |
| Attribute Tokens   | :white_check_mark: |
| Bleeding Tokens    | :white_check_mark: |
| Light/Heavy Damage | :white_check_mark: |

#### Survivor Hunt Details

| Name                | Tracked            |
| ------------------- | ------------------ |
| Armor Points        | :white_check_mark: |
| Attribute Tokens    | :white_check_mark: |
| Bleeding Tokens     | :white_check_mark: |
| Light/Heavy Damage  | :white_check_mark: |
| Hunt Board Position | :white_check_mark: |
| Insanity Tokens     | :white_check_mark: |
| Survival Tokens     | :white_check_mark: |

#### Survivor Showdown Details

| Name                       | Tracked            |
| -------------------------- | ------------------ |
| Armor Points               | :white_check_mark: |
| Attribute Tokens           | :white_check_mark: |
| Bleeding Tokens            | :white_check_mark: |
| Block Tokens               | :white_check_mark: |
| Deflect Tokens             | :white_check_mark: |
| Insanity Tokens            | :white_check_mark: |
| Knocked Down               | :white_check_mark: |
| Light/Heavy Damage         | :white_check_mark: |
| Activation Used (per Turn) | :white_check_mark: |
| Movement Used (per Turn)   | :white_check_mark: |
| Priority Target            | :white_check_mark: |
| Survival Tokens            | :white_check_mark: |

### Timeline

| Name        | Tracked            |
| ----------- | ------------------ |
| Year Number | :white_check_mark: |
| Event Names | :white_check_mark: |

### Tactics Card

| Name        | Tracked |
| ----------- | ------- |
| Tactic Name | :x:     |
| Rules       | :x:     |

### Terrain Card

| Name         | Tracked             |
| ------------ | ------------------- |
| Terrain Name | :xwhite_check_mark: |
| Rules        | :x:                 |
| Properties   | :x:                 |
| Activations  | :x:                 |

### Wanderers

| Name                       | Tracked            |
| -------------------------- | ------------------ |
| Wanderer Name              | :white_check_mark: |
| Abilities and Impairments  | :white_check_mark: |
| Attributes                 | :white_check_mark: |
| Courage                    | :white_check_mark: |
| Disposition                | :white_check_mark: |
| Fighting Arts              | :white_check_mark: |
| Gender                     | :white_check_mark: |
| Hunt XP                    | :white_check_mark: |
| Hunt XP Rank Up Milestones | :white_check_mark: |
| Insanity                   | :white_check_mark: |
| Lumi                       | :white_check_mark: |
| Movement                   | :white_check_mark: |
| Permanent Injuries         | :white_check_mark: |
| Survival                   | :white_check_mark: |
| Systemic Pressure          | :white_check_mark: |
| Timeline Events            | :white_check_mark: |
| Torment                    | :white_check_mark: |
| Understanding              | :white_check_mark: |

### Weapon Type

| Name                         | Tracked            |
| ---------------------------- | ------------------ |
| Weapon Type Name             | :white_check_mark: |
| Master Proficiency Rules     | :x:                |
| Specialist Proficiency Rules | :x:                |
