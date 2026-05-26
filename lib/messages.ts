import { SurvivorType } from '@/lib/enums'

/**
 * Campaign Unlocked Killenium Butcher Message
 *
 * @param unlocked Campaign Unlocked Killenium Butcher Status
 * @returns Campaign Unlocked Killenium Butcher Status Updated Message
 */
export const CAMPAIGN_UNLOCK_KILLENIUM_BUTCHER_UPDATED_MESSAGE = (
  unlocked: boolean
) =>
  unlocked
    ? 'Killenium Butcher accepts your challenge.'
    : 'Killenium Butcher retreats into the darkness.'

/**
 * Campaign Unlocked Screaming Nukalope Message
 *
 * @param unlocked Campaign Unlocked Screaming Nukalope Status
 * @returns Campaign Unlocked Screaming Nukalope Status Updated Message
 */
export const CAMPAIGN_UNLOCK_SCREAMING_NUKALOPE_UPDATED_MESSAGE = (
  unlocked: boolean
) =>
  unlocked
    ? 'Screaming Nukalope accepts your challenge.'
    : 'Screaming Nukalope retreats into the darkness.'

/**
 * Campaign Unlocked White Gigalion Message
 *
 * @param unlocked Campaign Unlocked White Gigalion Status
 * @returns Campaign Unlocked White Gigalion Status Updated Message
 */
export const CAMPAIGN_UNLOCK_WHITE_GIGALION_UPDATED_MESSAGE = (
  unlocked: boolean
) =>
  unlocked
    ? 'White Gigalion accepts your challenge.'
    : 'White Gigalion retreats into the darkness.'

/**
 * Catalog Permanent Delete Blocked
 *
 * @returns Catalog Permanent Delete Blocked Message
 */
export const CATALOG_PERMANENT_DELETE_BLOCKED_MESSAGE = () =>
  'A settlement still clings to this memory. Remove it from every settlement before deletion.'

/**
 * Endeavors Minimum Error
 *
 * @returns Endeavors Minimum Error Message
 */
export const ENDEAVORS_MINIMUM_ERROR_MESSAGE = () =>
  'Endeavors cannot be reduced below 0.'

/**
 * Error Message
 *
 * @returns Error Message
 */
export const ERROR_MESSAGE = () =>
  'The darkness swallows your words. Please try again.'

/**
 * Avatar Upload Succeeded
 *
 * @returns Avatar Upload Succeeded Message
 */
export const AVATAR_UPLOAD_SUCCESS_MESSAGE = () => 'A new face emerges.'

/**
 * Avatar Source Updated
 *
 * @returns Avatar Source Updated Message
 */
export const AVATAR_SOURCE_UPDATED_MESSAGE = () => 'Your mark has changed.'

/**
 * Avatar Invalid Type
 *
 * @returns Avatar Invalid Type Message
 */
export const AVATAR_INVALID_TYPE_MESSAGE = () =>
  'Only JPG, PNG, GIF, or WebP images can bear your mark.'

/**
 * Avatar Invalid Size
 *
 * @param maxMegabytes Maximum Allowed Size in MB
 * @returns Avatar Invalid Size Message
 */
export const AVATAR_INVALID_SIZE_MESSAGE = (maxMegabytes: number) =>
  `Avatar images must be ${maxMegabytes} MB or smaller.`

/**
 * Avatar Invalid Dimensions
 *
 * @param maxWidth Maximum Allowed Width in Pixels
 * @param maxHeight Maximum Allowed Height in Pixels
 * @returns Avatar Invalid Dimensions Message
 */
export const AVATAR_INVALID_DIMENSIONS_MESSAGE = (
  maxWidth: number,
  maxHeight: number
) => `Avatar images must be ${maxWidth}x${maxHeight} pixels or smaller.`

/**
 * Fighting Arts Max Exceeded Error
 *
 * @param survivorType Survivor Type
 * @returns Max Fighting Arts Exceeded Error Message
 */
export const FIGHTING_ARTS_MAX_EXCEEDED_ERROR_MESSAGE = (
  survivorType: SurvivorType
) =>
  survivorType === SurvivorType.ARC
    ? 'Arc survivors can only have 1 Fighting Art.'
    : 'Survivors can only have 3 total Fighting Arts and Secret Fighting Arts combined.'

/**
 * Gear Grid Settlement Required
 *
 * Surfaced when the user tries to equip gear without an underlying settlement
 * context (e.g. wanderer survivors).
 *
 * @returns Gear Grid Settlement Required Error Message
 */
export const GEAR_GRID_SETTLEMENT_REQUIRED_ERROR_MESSAGE = () =>
  'No settlement gear is within reach.'

/**
 * Embark Gear Shortage
 *
 * Surfaced when the survivors embarking on a hunt or showdown collectively
 * carry more of one or more gear items than the settlement has in storage.
 * Lists each shortfall as `Gear Name (need N, have M)` so the player can
 * adjust gear grids before retrying.
 *
 * @param shortages Per-Gear Shortage Details
 * @returns Embark Gear Shortage Error Message
 */
export const EMBARK_GEAR_SHORTAGE_ERROR_MESSAGE = (
  shortages: {
    gear_name: string
    available: number
    needed: number
  }[]
) => {
  const detail = shortages
    .map((s) => `${s.gear_name} (need ${s.needed}, have ${s.available})`)
    .join('; ')
  return `The settlement's stores cannot bear this burden — ${detail}.`
}

/**
 * Hunt Already Active Error
 *
 * @returns Hunt Already Active Error Message
 */
export const HUNT_ALREADY_ACTIVE_ERROR_MESSAGE = () =>
  'A hunt is already underway. Complete it before beginning another.'

/**
 * Insanity Minimum Error
 *
 * @returns Insanity Minimum Error Message
 */
export const INSANITY_MINIMUM_ERROR_MESSAGE = () =>
  'Insanity cannot be negative.'

/**
 * Lantern Research Level Minimum Error
 *
 * @returns Lantern Research Level Minimum Error Message
 */
export const LANTERN_RESEARCH_LEVEL_MINIMUM_ERROR_MESSAGE = () =>
  'Lantern research level cannot be reduced below 0.'

/**
 * Milestone Missing Event Error
 *
 * @returns Milestone Missing Event Error Message
 */
export const MILESTONE_MISSING_EVENT_ERROR_MESSAGE = () =>
  'A milestone must include a story event.'

/**
 * Monster Level Missing
 *
 * @returns Monster Level Missing Message
 */
export const MONSTER_LEVEL_MISSING_MESSAGE = () =>
  'At least one level is required.'

/**
 * Nameless Object Error
 *
 * @param objType Object Type
 * @returns Nameless Object Error Message
 */
export const NAMELESS_OBJECT_ERROR_MESSAGE = (objType: string) =>
  `A nameless ${objType} cannot be recorded.`

/**
 * Philosophy Rank Minimum Error
 *
 * @returns Philosophy Rank Minimum Error Message
 */
export const PHILOSOPHY_RANK_MINIMUM_ERROR_MESSAGE = () =>
  'Philosophy rank cannot be negative.'

/**
 * Not Authorized
 *
 * Used when an RLS policy, ownership trigger, or PostgREST permission check
 * rejects a mutation attempted by a collaborator on an owner-only control.
 *
 * @returns Not Authorized Message
 */
export const NOT_AUTHORIZED_MESSAGE = () =>
  'This is not yours. Speak to the keeper of this settlement.'

/**
 * Scout Conflict
 *
 * @returns Scout Conflict Message
 */
export const SCOUT_CONFLICT_MESSAGE = () =>
  'The selected scout cannot also be one of the survivors selected for the hunt.'

/**
 * Scout Required for Hunt/Showdown
 *
 * @param type Type of Activity
 * @returns Scout Required Message
 */
export const SCOUT_REQUIRED_MESSAGE = (type: 'hunt' | 'showdown') =>
  `This settlement employs scouts. A scout must be selected to begin the ${type}.`

/**
 * Settlement Created
 *
 * @returns Settlement Created Message
 */
export const SETTLEMENT_CREATED_MESSAGE = () =>
  'A lantern pierces the darkness. A new settlement is born.'

/**
 * Free-Tier Settlement Limit Reached
 *
 * Surfaced both as a tooltip on the "Found a settlement" affordance and as a
 * toast on the rare race where a free user submits the form while already at
 * the cap. Paid settlement tiers can found beyond this limit; shared
 * settlements remain unlimited.
 *
 * @param limit Maximum Settlements Allowed On The Free Tier
 * @returns Free-Tier Settlement Limit Message
 */
export const FREE_TIER_SETTLEMENT_LIMIT_MESSAGE = (limit: number) =>
  `The lantern hoard is full — free survivors may keep watch over ${limit} settlements. Light a Lantern to found more. Settlements shared with you remain unlimited.`

/**
 * Settlement Deleted
 *
 * @param settlementName Name of the settlement
 * @returns Settlement Deleted Message
 */
export const SETTLEMENT_DELETED_MESSAGE = (settlementName: string) =>
  `A wave of darkness washes over ${settlementName}. Voices cried out, and were silenced.`

/**
 * Settlement Uses Scouts Setting Updated
 *
 * @param usesScouts Uses Scouts
 * @returns Settlement Uses Scouts Setting Updated Message
 */
export const SETTLEMENT_USES_SCOUTS_SETTING_UPDATED_MESSAGE = (
  usesScouts: boolean
) =>
  usesScouts
    ? 'The settlement now employs scouts to aid in hunts.'
    : 'The settlement no longer relies on scouts for hunts.'

/**
 * Showdown Already Active Error
 *
 * @returns Showdown Already Active Error Message
 */
export const SHOWDOWN_ALREADY_ACTIVE_ERROR_MESSAGE = () =>
  'A showdown is already in progress. Survive it before facing another foe.'

/**
 * Stripe Redirect
 *
 * Shown right before the browser hands off to Stripe's hosted Checkout or
 * Customer Portal so the user understands the loader / navigation that
 * follows is intentional.
 *
 * @returns Stripe Redirect Message
 */
export const STRIPE_REDIRECT_MESSAGE = () =>
  "Stepping into the merchant's tent..."

/**
 * Stripe Checkout Success
 *
 * Shown after Stripe redirects the user back to the SPA following a
 * successful Checkout. Confirms the tier change in thematic copy without
 * waiting for the webhook-driven cache refresh to fully reflect — the
 * `useStripeReturn` hook fires the refetch in parallel.
 *
 * @returns Stripe Checkout Success Message
 */
export const STRIPE_CHECKOUT_SUCCESS_MESSAGE = () =>
  'The lantern burns brighter. Your watch begins anew.'

/**
 * Stripe Checkout Cancelled
 *
 * Shown after Stripe redirects the user back to the SPA following a
 * cancelled Checkout. Acknowledges the step-back without scolding.
 *
 * @returns Stripe Checkout Cancelled Message
 */
export const STRIPE_CHECKOUT_CANCELLED_MESSAGE = () =>
  'You step back from the merchant.'

/**
 * Stripe Checkout Already Subscribed Error
 *
 * Shown when the checkout route refuses to open a Checkout session because
 * the caller already holds a paid subscription. Tier switches must flow
 * through the Customer Portal so Stripe modifies the existing
 * Subscription in place — opening a second Checkout session would create
 * a parallel Subscription on the same Stripe Customer and silently
 * double-bill the user.
 *
 * @returns Stripe Checkout Already Subscribed Error Message
 */
export const STRIPE_CHECKOUT_ALREADY_SUBSCRIBED_ERROR_MESSAGE = () =>
  "A lantern already burns in your name. Visit the merchant's tent to change tiers."

/**
 * Survival Limit Exceeded Error
 *
 * @param survivalLimit Survival Limit
 * @returns Survival Limit Exceeded Error Message
 */
export const SURVIVAL_LIMIT_EXCEEDED_ERROR_MESSAGE = (survivalLimit: number) =>
  `Survival cannot exceed the settlement's survival limit (${survivalLimit}).`

/**
 * Survival Limit Minimum Error
 *
 * @returns Survival Limit Minimum Error Message
 */
export const SURVIVAL_LIMIT_MINIMUM_ERROR_MESSAGE = () =>
  "Settlement's survival limit cannot be reduced below 1."

/**
 * Survival Minimum Error
 *
 * @returns Survival Minimum Error Message
 */
export const SURVIVAL_MINIMUM_ERROR_MESSAGE = () =>
  'Survival cannot be negative.'

/**
 * Survivor Created
 *
 * @returns Survivor Created Message
 */
export const SURVIVOR_CREATED_MESSAGE = () =>
  'A lantern approaches. A new survivor emerges from the darkness.'

/**
 * Survivor Disorder Limit Exceeded Error
 *
 * @returns Survivor Disorder Limit Exceeded Error Message
 */
export const SURVIVOR_DISORDER_LIMIT_EXCEEDED_ERROR_MESSAGE = () =>
  'A survivor can have at most 3 disorders.'

/**
 * Survivor On Hunt Error
 *
 * @returns Survivor On Hunt Error Message
 */
export const SURVIVOR_ON_HUNT_ERROR_MESSAGE = () =>
  'The survivor cannot be erased while on a hunt.'

/**
 * Survivor On Showdown Error
 *
 * @returns Survivor On Showdown Error Message
 */
export const SURVIVOR_ON_SHOWDOWN_ERROR_MESSAGE = () =>
  'The survivor cannot be erased while in a showdown.'

/**
 * Survivor Removed
 *
 * @param survivorName Name of the survivor
 * @returns Survivor Removed Message
 */
export const SURVIVOR_REMOVED_MESSAGE = (survivorName: string | undefined) =>
  survivorName
    ? `Darkness overtook ${survivorName}. A voice cried out, and was suddenly silenced.`
    : 'A voice cried out, and was suddenly silenced.'

/**
 * Systemic Pressure Minimum Error
 *
 * @returns Systemic Pressure Minimum Error Message
 */
export const SYSTEMIC_PRESSURE_MINIMUM_ERROR_MESSAGE = () =>
  'Systemic pressure cannot be negative.'

/**
 * Timeline Event Empty Error
 *
 * @returns Timeline Event Empty Error Message
 */
export const TIMELINE_EVENT_EMPTY_ERROR_MESSAGE = () =>
  'Cannot save an empty event!'

/**
 * Timeline Event Empty Warning
 *
 * @returns Timeline Event Empty Warning Message
 */
export const TIMELINE_EVENT_EMPTY_WARNING_MESSAGE = () =>
  'Finish editing the current event before adding another.'

/**
 * Torment Minimum Error
 *
 * @returns Torment Minimum Error Message
 */
export const TORMENT_MINIMUM_ERROR_MESSAGE = () => 'Torment cannot be negative.'

/**
 * Username Rename Succeeded
 *
 * @returns Username Rename Succeeded Message
 */
export const USERNAME_RENAME_SUCCESS_MESSAGE = () =>
  'A new name spoken in the dark.'

/**
 * Username Rename Collision
 *
 * @returns Username Rename Collision Message
 */
export const USERNAME_RENAME_COLLISION_MESSAGE = () =>
  'That name is already woven into the lantern hoard.'

/**
 * Username Rename Rate Limited
 *
 * @returns Username Rename Rate Limited Message
 */
export const USERNAME_RENAME_RATE_LIMITED_MESSAGE = () =>
  'Names cannot be reshaped so soon. Wait, then try again.'

/**
 * Username Invalid Format
 *
 * @returns Username Invalid Format Message
 */
export const USERNAME_INVALID_FORMAT_MESSAGE = () =>
  'A name must be 3 to 20 letters, numbers, or underscores.'

/**
 * Settlement Share Username Not Found
 *
 * Used for both the "no such handle" and "rate-limited" outcomes — the
 * `lookup_user_by_username` RPC deliberately returns null for both so callers
 * cannot distinguish them. The toast must therefore not promise anything
 * about which case occurred.
 *
 * @returns Settlement Share Username Not Found Message
 */
export const SETTLEMENT_SHARE_USERNAME_NOT_FOUND_MESSAGE = () =>
  'No survivor by that name walks this world.'

/**
 * Settlement Share Self Invite Rejected
 *
 * @returns Settlement Share Self Invite Rejected Message
 */
export const SETTLEMENT_SHARE_SELF_INVITE_MESSAGE = () =>
  'You already keep watch over this settlement.'

/**
 * Settlement Share Duplicate Invite Rejected
 *
 * @returns Settlement Share Duplicate Invite Rejected Message
 */
export const SETTLEMENT_SHARE_DUPLICATE_INVITE_MESSAGE = () =>
  'Their lantern already burns beside yours.'

/**
 * Settlement Share Revoke Succeeded
 *
 * @returns Settlement Share Revoke Succeeded Message
 */
export const SETTLEMENT_SHARE_REVOKE_SUCCESS_MESSAGE = () =>
  'The lantern dims. They walk in darkness once more.'

/**
 * Settlement Share Revoke Blocked
 *
 * Shown to the owner when `get_unshare_blockers` returns a non-empty list:
 * the soon-to-be-revoked collaborator authored custom catalog rows that are
 * still attached to the settlement, so the revoke must be deferred until the
 * owner removes those rows.
 *
 * Used as the title / lead of the {@link UnshareBlockersDialog}; the dialog
 * lists the specific blocking items below it.
 *
 * @returns Settlement Share Revoke Blocked Message
 */
export const SETTLEMENT_SHARE_REVOKE_BLOCKED_MESSAGE = () =>
  'They have left their light here. Gather it before they walk in darkness.'

/**
 * Settlement Share Paywall Encountered
 *
 * Shown to a free-tier settlement owner when a share-creation attempt is
 * refused by the entitlement gate. The free-tier UI normally swaps the
 * invite form for the {@link UpsellModal} trigger entirely, but this
 * message remains the canonical phrasing for the "paywall encountered"
 * event per `docs/settlement-sharing-architecture.md` §7.5 — used as a
 * defensive fallback if a stale render or race lets a free user reach the
 * invite handler.
 *
 * @returns Settlement Share Paywall Encountered Message
 */
export const SETTLEMENT_SHARE_PAYWALL_MESSAGE = () =>
  'This lantern needs more oil. Subscribe to continue.'
