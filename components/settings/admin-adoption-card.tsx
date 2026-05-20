'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ChartConfig } from '@/components/ui/chart'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { useLocal } from '@/contexts/local-context'
import {
  AdminAdoptionCampaignPoint,
  AdminAdoptionMetrics,
  getAdminAdoptionMetrics
} from '@/lib/admin-adoption'
import type { LucideIcon } from 'lucide-react'
import {
  ChartBarIcon,
  ClockIcon,
  FlameKindlingIcon,
  Loader2Icon,
  RefreshCwIcon,
  Share2Icon,
  SkullIcon,
  UsersIcon
} from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis
} from 'recharts'
import { toast } from 'sonner'

const momentumChartConfig = {
  signups: {
    label: 'Signups',
    color: 'hsl(var(--chart-1))'
  },
  settlements: {
    label: 'Settlements',
    color: 'hsl(var(--chart-2))'
  },
  survivors: {
    label: 'Survivors',
    color: 'hsl(var(--chart-4))'
  }
} satisfies ChartConfig

const funnelChartConfig = {
  users: {
    label: 'Users',
    color: 'hsl(var(--chart-3))'
  }
} satisfies ChartConfig

const campaignChartConfig = {
  settlement_count: {
    label: 'Settlements',
    color: 'hsl(var(--chart-5))'
  }
} satisfies ChartConfig

interface MetricTileProps {
  /** Detail */
  detail: string
  /** Icon */
  icon: LucideIcon
  /** Title */
  title: string
  /** Value */
  value: string
}

interface SignalRowProps {
  /** Detail */
  detail?: string
  /** Label */
  label: string
  /** Progress Percentage */
  progress: number
  /** Value */
  value: string
}

interface FunnelPoint {
  /** Stage */
  stage: string
  /** Users */
  users: number
}

interface CampaignChartPoint {
  /** Campaign Name */
  campaign: string
  /** Settlement Count */
  settlement_count: number
}

/**
 * Admin Adoption Card Component
 *
 * Displays aggregate signup, settlement, survivor, sharing, and subscription
 * metrics for app admins without exporting events to an external analytics
 * host.
 *
 * @returns Admin Adoption Card Component
 */
export function AdminAdoptionCard(): ReactElement {
  const { isAdmin } = useLocal()
  const [metrics, setMetrics] = useState<AdminAdoptionMetrics | null>(null)
  const [hasLoadedMetrics, setHasLoadedMetrics] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const loadMetrics = useCallback(() => {
    if (!isAdmin) return

    setIsLoading(true)

    getAdminAdoptionMetrics()
      .then(setMetrics)
      .catch((err: unknown) => {
        console.error('Admin Adoption Metrics Fetch Error:', err)
        toast.error('The lanterns cannot read the adoption ledger yet.')
      })
      .finally(() => {
        setHasLoadedMetrics(true)
        setIsLoading(false)
      })
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return

    let isCancelled = false

    getAdminAdoptionMetrics()
      .then((nextMetrics) => {
        if (isCancelled) return

        setMetrics(nextMetrics)
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        console.error('Admin Adoption Metrics Fetch Error:', err)
        toast.error('The lanterns cannot read the adoption ledger yet.')
      })
      .finally(() => {
        if (isCancelled) return

        setHasLoadedMetrics(true)
        setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [isAdmin])

  if (!isAdmin) return <></>

  const isMetricsLoading = isLoading || !hasLoadedMetrics

  return (
    <div className="flex flex-col gap-4 pt-12 px-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-normal">Adoption</h2>
          <p className="text-sm text-muted-foreground">
            Lantern-side signals for signup, settlement creation, and survivor
            momentum.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadMetrics}
          disabled={isMetricsLoading}>
          {isMetricsLoading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCwIcon className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {isMetricsLoading && !metrics ? (
        <Card className="p-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Reading adoption signals...
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!isMetricsLoading && !metrics ? (
        <Card className="p-0">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              The adoption ledger is quiet. Try the lantern again.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {metrics ? <AdoptionDashboard metrics={metrics} /> : null}
    </div>
  )
}

/**
 * Adoption Dashboard
 *
 * @param props Dashboard Properties
 * @returns Adoption Dashboard
 */
function AdoptionDashboard({
  metrics
}: {
  /** Metrics */
  metrics: AdminAdoptionMetrics
}): ReactElement {
  const signupToSettlementRate = getRate(
    metrics.totals.settlement_creators,
    metrics.totals.users
  )
  const settlementToSurvivorRate = getRate(
    metrics.totals.survivor_creators,
    metrics.totals.settlement_creators
  )
  const activeThirtyDayRate = getRate(
    metrics.activity.active_users_30d,
    metrics.totals.users
  )
  const paidRate = getRate(
    metrics.totals.paid_subscriptions,
    metrics.totals.users
  )
  const funnelData = buildFunnelData(metrics)
  const campaignData = buildCampaignData(metrics.campaign_mix)

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          icon={ClockIcon}
          title="First Settlement"
          value={formatDays(metrics.timing.average_days_to_first_settlement)}
          detail="Average from signup"
        />
        <MetricTile
          icon={SkullIcon}
          title="First Survivor"
          value={formatDays(metrics.timing.average_days_to_first_survivor)}
          detail="Average from signup"
        />
        <MetricTile
          icon={Share2Icon}
          title="Collaborators"
          value={formatCount(metrics.totals.collaborating_users)}
          detail="Users invited into settlements"
        />
        <MetricTile
          icon={ChartBarIcon}
          title="Last Read"
          value={formatDateTime(metrics.generated_at)}
          detail="Service-role Postgres aggregate"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          icon={UsersIcon}
          title="Signed Survivors"
          value={formatCount(metrics.totals.users)}
          detail={`${formatCount(metrics.recent.new_users_30d)} in 30 days`}
        />
        <MetricTile
          icon={FlameKindlingIcon}
          title="Settlements Founded"
          value={formatCount(metrics.totals.settlements)}
          detail={`${formatPercent(signupToSettlementRate)} signup conversion`}
        />
        <MetricTile
          icon={SkullIcon}
          title="Survivors Recorded"
          value={formatCount(metrics.totals.survivors)}
          detail={`${formatPercent(settlementToSurvivorRate)} creator conversion`}
        />
        <MetricTile
          icon={ClockIcon}
          title="Active In 30 Days"
          value={formatCount(metrics.activity.active_users_30d)}
          detail={`${formatPercent(activeThirtyDayRate)} of all users`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card className="p-0">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-amber-400/90" />
              Momentum
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ChartContainer
              config={momentumChartConfig}
              className="min-h-72 w-full">
              <AreaChart
                accessibilityLayer
                data={metrics.daily_series}
                margin={{ left: 8, right: 16, top: 12 }}>
                <defs>
                  <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-signups)"
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-signups)"
                      stopOpacity={0.04}
                    />
                  </linearGradient>
                  <linearGradient
                    id="fillSettlements"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-settlements)"
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-settlements)"
                      stopOpacity={0.04}
                    />
                  </linearGradient>
                  <linearGradient
                    id="fillSurvivors"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-survivors)"
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-survivors)"
                      stopOpacity={0.04}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={28}
                  tickFormatter={formatShortDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                  width={32}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  dataKey="signups"
                  type="monotone"
                  fill="url(#fillSignups)"
                  fillOpacity={0.4}
                  stroke="var(--color-signups)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="settlements"
                  type="monotone"
                  fill="url(#fillSettlements)"
                  fillOpacity={0.4}
                  stroke="var(--color-settlements)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="survivors"
                  type="monotone"
                  fill="url(#fillSurvivors)"
                  fillOpacity={0.4}
                  stroke="var(--color-survivors)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <FlameKindlingIcon className="h-5 w-5 text-amber-400/90" />
              Activation Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ChartContainer config={funnelChartConfig} className="min-h-72">
              <BarChart
                accessibilityLayer
                data={funnelData}
                layout="vertical"
                margin={{ left: 12, right: 16, top: 12 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="stage"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={88}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="users"
                  fill="var(--color-users)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-0">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-amber-400/90" />
              Campaign Mix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {campaignData.length > 0 ? (
              <ChartContainer config={campaignChartConfig} className="min-h-64">
                <BarChart
                  accessibilityLayer
                  data={campaignData}
                  layout="vertical"
                  margin={{ left: 12, right: 16, top: 12 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="campaign"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={116}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="settlement_count"
                    fill="var(--color-settlement_count)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                No settlements have breached the dark yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <SkullIcon className="h-5 w-5 text-amber-400/90" />
              Campaign Depth
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <SignalRow
              label="Signup to settlement"
              value={formatPercent(signupToSettlementRate)}
              progress={signupToSettlementRate}
              detail={`${formatCount(metrics.totals.settlement_creators)} users founded at least one settlement`}
            />
            <SignalRow
              label="Settlement to survivor"
              value={formatPercent(settlementToSurvivorRate)}
              progress={settlementToSurvivorRate}
              detail={`${formatCount(metrics.totals.survivor_creators)} users recorded survivors`}
            />
            <SignalRow
              label="Four-survivor settlements"
              value={formatCount(
                metrics.depth.settlements_with_four_plus_survivors
              )}
              progress={getRate(
                metrics.depth.settlements_with_four_plus_survivors,
                metrics.totals.settlements
              )}
              detail={`${formatMetricNumber(metrics.depth.average_survivors_per_settlement)} survivors per settlement on average`}
            />
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="px-4 pt-3 pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2Icon className="h-5 w-5 text-amber-400/90" />
              Durable Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <SignalRow
              label="30-day activity"
              value={formatPercent(activeThirtyDayRate)}
              progress={activeThirtyDayRate}
              detail={`${formatCount(metrics.activity.active_users_7d)} active in 7 days`}
            />
            <SignalRow
              label="Sharing adoption"
              value={formatCount(metrics.totals.shared_settlements)}
              progress={getRate(
                metrics.totals.shared_settlements,
                metrics.totals.settlements
              )}
              detail={`${formatCount(metrics.totals.sharing_relationships)} collaborator links`}
            />
            <SignalRow
              label="Paid plan adoption"
              value={formatPercent(paidRate)}
              progress={paidRate}
              detail={`${formatCount(metrics.totals.paid_subscriptions)} paid active or trialing`}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

/**
 * Metric Tile
 *
 * @param props Metric Tile Properties
 * @returns Metric Tile
 */
function MetricTile({
  detail,
  icon: Icon,
  title,
  value
}: MetricTileProps): ReactElement {
  return (
    <Card className="p-0">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground">{title}</div>
            <div className="mt-1 truncate text-2xl font-semibold tabular-nums">
              {value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
          </div>
          <Icon className="h-5 w-5 shrink-0 text-amber-400/90" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Signal Row
 *
 * @param props Signal Row Properties
 * @returns Signal Row
 */
function SignalRow({
  detail,
  label,
  progress,
  value
}: SignalRowProps): ReactElement {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono tabular-nums">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm bg-muted">
        <div
          className="h-full rounded-sm bg-amber-400/80"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {detail ? (
        <p className="text-xs text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  )
}

/**
 * Build Funnel Data
 *
 * @param metrics Adoption Metrics
 * @returns Funnel Points
 */
function buildFunnelData(metrics: AdminAdoptionMetrics): FunnelPoint[] {
  return [
    { stage: 'Signed up', users: metrics.totals.users },
    { stage: 'Confirmed', users: metrics.totals.confirmed_users },
    { stage: 'Settlement', users: metrics.totals.settlement_creators },
    { stage: 'Survivor', users: metrics.totals.survivor_creators }
  ]
}

/**
 * Build Campaign Data
 *
 * @param campaignMix Campaign Mix
 * @returns Campaign Chart Points
 */
function buildCampaignData(
  campaignMix: AdminAdoptionCampaignPoint[]
): CampaignChartPoint[] {
  return campaignMix.map((campaign) => ({
    campaign: formatCampaignType(campaign.campaign_type),
    settlement_count: campaign.settlement_count
  }))
}

/**
 * Format Campaign Type
 *
 * @param value Campaign Type
 * @returns Formatted Campaign Type
 */
function formatCampaignType(value: string): string {
  const knownCampaigns: Record<string, string> = {
    CUSTOM: 'Custom',
    PEOPLE_OF_THE_DREAM_KEEPER: 'Dream Keeper',
    PEOPLE_OF_THE_LANTERN: 'Lantern',
    PEOPLE_OF_THE_STARS: 'Stars',
    PEOPLE_OF_THE_SUN: 'Sun',
    SQUIRES_OF_THE_CITADEL: 'Citadel'
  }

  if (knownCampaigns[value]) return knownCampaigns[value]

  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format Count
 *
 * @param value Count
 * @returns Formatted Count
 */
function formatCount(value: number): string {
  return value.toLocaleString()
}

/**
 * Format Metric Number
 *
 * @param value Metric Number
 * @returns Formatted Metric Number
 */
function formatMetricNumber(value: number | null): string {
  if (value === null) return 'No signal'

  return value.toLocaleString(undefined, { maximumFractionDigits: 1 })
}

/**
 * Format Days
 *
 * @param value Day Count
 * @returns Formatted Day Count
 */
function formatDays(value: number | null): string {
  if (value === null) return 'No signal'

  return `${formatMetricNumber(value)} days`
}

/**
 * Format Percent
 *
 * @param value Percentage
 * @returns Formatted Percentage
 */
function formatPercent(value: number): string {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`
}

/**
 * Get Rate
 *
 * @param numerator Numerator
 * @param denominator Denominator
 * @returns Percentage Rate
 */
function getRate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0

  return Math.round((numerator / denominator) * 1000) / 10
}

/**
 * Format Short Date
 *
 * @param value Date String
 * @returns Short Date
 */
function formatShortDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

/**
 * Format Date Time
 *
 * @param value ISO Date String
 * @returns Formatted Date Time
 */
function formatDateTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Unknown'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}
