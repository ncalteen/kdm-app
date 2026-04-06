'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SettlementDetail } from '@/lib/types'
import { BeefIcon } from 'lucide-react'
import { ReactElement, useMemo } from 'react'

/**
 * Resource Overview Card Properties
 */
interface ResourceOverviewCardProps {
  /** Selected Settlement */
  selectedSettlement: SettlementDetail | null
}

/**
 * Resource Overview Card
 *
 * Displays total resource quantity by category and resource type.
 * If a resource category includes multiple values, each value is counted.
 *
 * @param props Resource Overview Card Properties
 * @returns Resource Overview Card
 */
export function ResourceOverviewCard({
  selectedSettlement
}: ResourceOverviewCardProps): ReactElement {
  const { categoryTotals, typeTotals } = useMemo(() => {
    const categories: Record<string, number> = {}
    const types: Record<string, number> = {}

    for (const resource of selectedSettlement?.resources ?? []) {
      const quantity = resource.quantity ?? 0

      categories[resource.category] =
        (categories[resource.category] ?? 0) + quantity

      for (const resourceType of resource.resource_types ?? [])
        types[resourceType] = (types[resourceType] ?? 0) + quantity
    }

    return {
      categoryTotals: Object.entries(categories).sort((a, b) =>
        a[0].localeCompare(b[0])
      ),
      typeTotals: Object.entries(types).sort((a, b) => a[0].localeCompare(b[0]))
    }
  }, [selectedSettlement?.resources])

  return (
    <Card className="p-0 border-1 gap-0">
      <CardHeader className="px-2 pt-2 pb-1">
        <CardTitle className="text-md flex flex-row items-center gap-1 h-8">
          <BeefIcon className="h-4 w-4" />
          Resource Overview
        </CardTitle>
      </CardHeader>

      <CardContent className="px-2 pb-2 pt-1 space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Categories
          </p>
          {categoryTotals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No category totals yet
            </p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {categoryTotals.map(([category, total]) => (
                <Badge key={category} variant="default" className="text-xs">
                  {category}: {total}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Types</p>
          {typeTotals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No type totals yet</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {typeTotals.map(([resourceType, total]) => (
                <Badge
                  key={resourceType}
                  variant="secondary"
                  className="text-xs">
                  {resourceType}: {total}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
