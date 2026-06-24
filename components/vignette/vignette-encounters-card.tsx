import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SkullIcon } from 'lucide-react'
import { ReactElement } from 'react'

/**
 * Vignette Encounters Card
 *
 * Top-level one-shot surface that is intentionally available without a selected
 * settlement.
 *
 * @returns Vignette Encounters Card
 */
export function VignetteEncountersCard(): ReactElement {
  return (
    <div className="pt-(--header-height) px-2 py-2">
      <Card className="mx-auto max-w-3xl border bg-card/70 mt-2">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-md border border-red-400/40 bg-red-500/10 text-red-400">
            <SkullIcon className="h-6 w-6" />
          </div>
          <CardTitle>Vignette Encounters</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          One-shot encounters outside of settlement play.
        </CardContent>
      </Card>
    </div>
  )
}
