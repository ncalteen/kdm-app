'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  CatalogArchiveItem,
  CatalogPermanentDeleteBlockedError,
  getArchivedCatalogRows,
  permanentlyDeleteArchivedCatalogRow,
  restoreCatalogRow
} from '@/lib/dal/catalog-archive'
import {
  CATALOG_PERMANENT_DELETE_BLOCKED_MESSAGE,
  ERROR_MESSAGE
} from '@/lib/messages'
import { ArchiveRestoreIcon, Trash2Icon } from 'lucide-react'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

function getCatalogArchiveItemKey(
  item: Pick<CatalogArchiveItem, 'id' | 'table'>
): string {
  return `${item.table}:${item.id}`
}

/**
 * Archived Catalog Card
 *
 * Lists the current user's archived custom catalog rows and allows them to be
 * restored into the active custom content library.
 *
 * @returns Archived Catalog Card Component
 */
export function ArchivedCatalogCard(): ReactElement {
  const [items, setItems] = useState<CatalogArchiveItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingKey, setDeletingKey] = useState<string | null>(null)
  const [restoringKey, setRestoringKey] = useState<string | null>(null)

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
    []
  )

  useEffect(() => {
    let cancelled = false

    getArchivedCatalogRows()
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        console.error('Load Archived Catalog Error:', err)
        toast.error(ERROR_MESSAGE())
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  /**
   * Handle Restore
   *
   * Optimistically removes the row from the archive list, then clears its
   * archive timestamp in the database. Restores the row on failure.
   *
   * @param item Archived Catalog Item
   */
  const handleRestore = useCallback(
    (item: CatalogArchiveItem) => {
      if (restoringKey || deletingKey) return

      const itemKey = getCatalogArchiveItemKey(item)
      const previous = [...items]
      setRestoringKey(itemKey)
      setItems(
        items.filter((entry) => getCatalogArchiveItemKey(entry) !== itemKey)
      )

      restoreCatalogRow(item.table, item.id)
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Restore Catalog Row Error:', err)
          toast.error(ERROR_MESSAGE())
        })
        .finally(() => setRestoringKey(null))
    },
    [deletingKey, items, restoringKey]
  )

  /**
   * Handle Permanent Delete
   *
   * Optimistically removes the row, then asks the database to hard-delete it.
   * The delete guard returns no row when the catalog item is still attached to
   * a settlement, so the item is restored locally and a specific toast is
   * shown.
   *
   * @param item Archived Catalog Item
   */
  const handlePermanentDelete = useCallback(
    (item: CatalogArchiveItem) => {
      if (restoringKey || deletingKey) return

      const itemKey = getCatalogArchiveItemKey(item)
      const previous = [...items]
      setDeletingKey(itemKey)
      setItems(
        items.filter((entry) => getCatalogArchiveItemKey(entry) !== itemKey)
      )

      permanentlyDeleteArchivedCatalogRow(item.table, item.id)
        .catch((err: unknown) => {
          setItems(previous)
          console.error('Permanent Delete Catalog Row Error:', err)

          if (err instanceof CatalogPermanentDeleteBlockedError) {
            toast.error(CATALOG_PERMANENT_DELETE_BLOCKED_MESSAGE())
            return
          }

          toast.error(ERROR_MESSAGE())
        })
        .finally(() => setDeletingKey(null))
    },
    [deletingKey, items, restoringKey]
  )

  return (
    <Card className="p-0 border gap-0">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-md flex flex-row items-center justify-between">
          <span>Archived</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-2">
        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Peering into the darkness...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No archived custom content waits in the dark.
            </p>
          </div>
        ) : (
          <div className="max-h-100 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Archived
                  </TableHead>
                  <TableHead className="w-25 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const itemKey = getCatalogArchiveItemKey(item)
                  const isActionPending =
                    restoringKey !== null || deletingKey !== null

                  return (
                    <TableRow key={itemKey}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground sm:hidden">
                          {item.category}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {item.category}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {dateFormatter.format(new Date(item.archived_at))}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRestore(item)}
                            disabled={isActionPending}
                            title={`Restore ${item.name}`}
                            aria-label={`Restore ${item.name}`}>
                            <ArchiveRestoreIcon className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isActionPending}
                                title={`Permanently delete ${item.name}`}
                                aria-label={`Permanently delete ${item.name}`}>
                                <Trash2Icon className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Archived Item
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  The darkness hungers for {item.name}. This can
                                  only succeed once no settlement carries it,
                                  and it cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handlePermanentDelete(item)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete forever
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
