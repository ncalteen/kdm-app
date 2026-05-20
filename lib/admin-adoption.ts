/**
 * Admin Adoption Totals
 *
 * High-level counters for the app adoption dashboard.
 */
export interface AdminAdoptionTotals {
  /** Total Users */
  users: number
  /** Confirmed Users */
  confirmed_users: number
  /** Users With At Least One Settlement */
  settlement_creators: number
  /** Users With At Least One Survivor */
  survivor_creators: number
  /** Total Settlements */
  settlements: number
  /** Total Survivors */
  survivors: number
  /** Settlements Shared With At Least One User */
  shared_settlements: number
  /** Sharing Relationships */
  sharing_relationships: number
  /** Users Added As Collaborators */
  collaborating_users: number
  /** Active Or Trialing Subscriptions */
  active_subscriptions: number
  /** Active Or Trialing Paid Subscriptions */
  paid_subscriptions: number
}

/**
 * Admin Adoption Recent Counts
 *
 * Rolling creation windows for the newest adoption signals.
 */
export interface AdminAdoptionRecentCounts {
  /** New Users Last 7 Days */
  new_users_7d: number
  /** New Users Last 30 Days */
  new_users_30d: number
  /** New Settlements Last 7 Days */
  new_settlements_7d: number
  /** New Settlements Last 30 Days */
  new_settlements_30d: number
  /** New Survivors Last 7 Days */
  new_survivors_7d: number
  /** New Survivors Last 30 Days */
  new_survivors_30d: number
}

/**
 * Admin Adoption Activity Counts
 *
 * Sign-in based activity counters.
 */
export interface AdminAdoptionActivityCounts {
  /** Active Users Last 7 Days */
  active_users_7d: number
  /** Active Users Last 30 Days */
  active_users_30d: number
  /** Users Without A Sign-In Timestamp */
  never_signed_in_users: number
}

/**
 * Admin Adoption Depth Metrics
 *
 * Measures how deeply users are building settlements after signup.
 */
export interface AdminAdoptionDepthMetrics {
  /** Average Settlements Per Settlement Creator */
  average_settlements_per_creator: number | null
  /** Average Survivors Per Settlement */
  average_survivors_per_settlement: number | null
  /** Maximum Survivors In One Settlement */
  max_survivors_in_settlement: number
  /** Settlements With Four Or More Survivors */
  settlements_with_four_plus_survivors: number
}

/**
 * Admin Adoption Timing Metrics
 *
 * Average time from signup to meaningful campaign creation.
 */
export interface AdminAdoptionTimingMetrics {
  /** Average Days To First Settlement */
  average_days_to_first_settlement: number | null
  /** Average Days To First Survivor */
  average_days_to_first_survivor: number | null
}

/**
 * Admin Adoption Daily Point
 */
export interface AdminAdoptionDailyPoint {
  /** Date */
  date: string
  /** Signups */
  signups: number
  /** Settlements */
  settlements: number
  /** Survivors */
  survivors: number
}

/**
 * Admin Adoption Campaign Point
 */
export interface AdminAdoptionCampaignPoint {
  /** Campaign Type */
  campaign_type: string
  /** Settlement Count */
  settlement_count: number
}

/**
 * Admin Adoption Subscription Point
 */
export interface AdminAdoptionSubscriptionPoint {
  /** Plan ID */
  plan_id: string
  /** Subscription Status */
  status: string
  /** User Count */
  user_count: number
}

/**
 * Admin Adoption Metrics
 */
export interface AdminAdoptionMetrics {
  /** Generated At */
  generated_at: string
  /** Totals */
  totals: AdminAdoptionTotals
  /** Recent Counts */
  recent: AdminAdoptionRecentCounts
  /** Activity Counts */
  activity: AdminAdoptionActivityCounts
  /** Depth Metrics */
  depth: AdminAdoptionDepthMetrics
  /** Timing Metrics */
  timing: AdminAdoptionTimingMetrics
  /** Daily Series */
  daily_series: AdminAdoptionDailyPoint[]
  /** Campaign Mix */
  campaign_mix: AdminAdoptionCampaignPoint[]
  /** Subscription Mix */
  subscription_mix: AdminAdoptionSubscriptionPoint[]
}

/**
 * Admin Adoption Metrics Response
 */
export interface AdminAdoptionMetricsResponse {
  /** Metrics */
  metrics: AdminAdoptionMetrics
}

/**
 * Get Admin Adoption Metrics
 *
 * Fetches aggregate adoption metrics from the protected admin endpoint.
 *
 * @returns Admin Adoption Metrics
 */
export async function getAdminAdoptionMetrics(): Promise<AdminAdoptionMetrics> {
  const response = await fetch('/api/admin/adoption', { cache: 'no-store' })

  if (!response.ok) {
    const message = await extractErrorMessage(response)

    throw new Error(`Error Fetching Admin Adoption Metrics: ${message}`)
  }

  const body = (await response.json()) as Partial<AdminAdoptionMetricsResponse>

  if (!body.metrics)
    throw new Error('Error Fetching Admin Adoption Metrics: Empty response')

  return body.metrics
}

/**
 * Extract Error Message
 *
 * Pulls a human-readable message out of an error JSON body returned by admin
 * routes. Falls back to the HTTP status text when the body cannot be parsed.
 *
 * @param response Non-OK Fetch Response
 * @returns Error Message
 */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string }

    if (body.error) return body.error
  } catch {
    // Body was not valid JSON — fall through to statusText.
  }

  return response.statusText || `Request failed (${response.status})`
}
