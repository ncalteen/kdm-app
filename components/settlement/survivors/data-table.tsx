import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table'
import { PlusIcon } from 'lucide-react'
import { ChangeEvent, useCallback, useMemo, useState } from 'react'

/**
 * Survivor Data Table Properties
 */
interface DataTableProps<TData, TValue> {
  /** Column Definitions */
  columns: ColumnDef<TData, TValue>[]
  /** Data */
  data: TData[]
  /** Initial Column Visibility */
  initialColumnVisibility?: VisibilityState
  /** On New Survivor Callback */
  onNewSurvivor?: () => void
}

/**
 * Survivor Data Table Component
 *
 * @param props Survivor Data Table Properties
 * @returns Survivor Data Table Component
 */
export function SurvivorDataTable<TData, TValue>({
  columns,
  data,
  initialColumnVisibility = {},
  onNewSurvivor
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility
  )
  const [rowSelection, setRowSelection] = useState({})

  const tableConfig = useMemo(
    () => ({
      data,
      columns,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection
      }
    }),
    [data, columns, sorting, columnFilters, columnVisibility, rowSelection]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable(tableConfig)
  const { rows } = table.getRowModel()

  /**
   * Handle Filter Change
   *
   * @param event Filter Input Change Event
   */
  const handleFilterChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      table.getColumn('survivor_name')?.setFilterValue(event.target.value),
    [table]
  )

  return (
    <div className="flex flex-col gap-2 flex-shrink-0">
      <div className="flex items-center pb-2 gap-2">
        <Input
          placeholder="Filter survivors..."
          value={
            (table.getColumn('survivor_name')?.getFilterValue() as string) ?? ''
          }
          onChange={handleFilterChange}
          className="max-w-sm"
        />

        <Button
          variant="outline"
          size="sm"
          title="Create new survivor"
          className="h-9"
          onClick={onNewSurvivor}>
          <PlusIcon className="h-4 w-4" />
          New Survivor
        </Button>
      </div>

      <div className="overflow-y-auto h-[300px] w-full rounded-md border">
        <table className="w-full">
          <thead className="sticky top-0 bg-accent">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`text-left p-2 font-bold text-sm ${
                      (header.column.columnDef.meta as { className?: string })
                        ?.className ?? ''
                    }`}>
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : '',
                        onClick: header.column.getToggleSortingHandler()
                      }}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b hover:bg-muted/50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`p-2 align-top ${
                      (cell.column.columnDef.meta as { className?: string })
                        ?.className ?? ''
                    }`}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
