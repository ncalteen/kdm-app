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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ColorChoice, Gender } from '@/lib/enums'
import { SurvivorDetail } from '@/lib/types'
import { getColorStyle } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDownIcon,
  ShieldOffIcon,
  SkullIcon,
  Trash2Icon,
  UserRoundSearchIcon,
  UserXIcon
} from 'lucide-react'

/**
 * Column Configuration Properties
 */
export interface ColumnProps {
  /** Delete ID */
  deleteId: string | undefined
  /** Is Delete Dialog Open */
  isDeleteDialogOpen: boolean
  /** Handle Delete Survivor */
  handleDeleteSurvivor: (survivorId: string) => void
  /** Set Delete ID */
  setDeleteId: (id: string | undefined) => void
  /** Set Is Delete Dialog Open */
  setIsDeleteDialogOpen: (open: boolean) => void
  /** Set Selected Survivor */
  setSelectedSurvivor: (survivor: SurvivorDetail) => void
}

/**
 * Create Column Definitions for the Survivor Data Table
 *
 * @param props Column Configuration Properties
 * @returns Column definitions
 */
export const createColumns = ({
  deleteId,
  isDeleteDialogOpen,
  handleDeleteSurvivor,
  setDeleteId,
  setIsDeleteDialogOpen,
  setSelectedSurvivor
}: ColumnProps): ColumnDef<SurvivorDetail>[] => {
  return [
    {
      accessorKey: 'survivor_name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            type="button"
            className="font-bold">
            Name
            <ArrowUpDownIcon />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex gap-2 justify-start items-center">
          <Button
            variant="outline"
            size="sm"
            title="View survivor"
            onClick={() => setSelectedSurvivor(row.original)}>
            <UserRoundSearchIcon className="h-4 w-4" />
          </Button>
          <AlertDialog
            open={isDeleteDialogOpen && deleteId === row.original.id}
            onOpenChange={(open) => {
              setIsDeleteDialogOpen(open)
              if (!open) setDeleteId(undefined)
            }}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={row.original.embarked}
                onClick={() => {
                  if (!row.original.embarked) {
                    setDeleteId(row.original.id)
                    setIsDeleteDialogOpen(true)
                  }
                }}
                title={
                  row.original.embarked
                    ? 'Cannot delete survivor - they are currently on a hunt'
                    : 'Delete survivor'
                }>
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Survivor</AlertDialogTitle>
                <AlertDialogDescription>
                  The darkness hungers for{' '}
                  {row.original.survivor_name ?? 'the survivor'}.{' '}
                  <strong>Once consumed, they cannot return.</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteSurvivor(row.original.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="text-left text-sm pl-2 flex gap-2 items-center">
            <Avatar
              className={`h-6 w-6 ${getColorStyle(row.original.color as ColorChoice, 'bg')}`}>
              <AvatarFallback className="bg-transparent">
                {(row.original.dead && <SkullIcon className="h-3 w-3" />) ||
                  (row.original.retired && !row.original.dead && (
                    <UserXIcon className="h-3 w-3" />
                  ))}
              </AvatarFallback>
            </Avatar>
            {row.original.survivor_name}
          </div>
          {row.original.wanderer && (
            <Badge variant="outline" className="text-xs">
              Wanderer
            </Badge>
          )}
        </div>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const nameA = rowA.getValue(columnId) as string
        const nameB = rowB.getValue(columnId) as string
        return nameA.toLowerCase().localeCompare(nameB.toLowerCase())
      }
    },
    {
      accessorKey: 'gender',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            type="button"
            className="font-bold">
            Gender
            <ArrowUpDownIcon />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-sm hidden md:block">
          <Badge variant="outline">{Gender[row.original.gender]}</Badge>
        </div>
      ),
      meta: {
        className: 'hidden md:table-cell'
      }
    },
    {
      accessorKey: 'hunt_xp',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            type="button"
            className="font-bold">
            Hunt XP
            <ArrowUpDownIcon />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-sm">
          <Badge variant="outline">{row.original.hunt_xp}</Badge>
        </div>
      )
    },
    {
      accessorKey: 'philosophy',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            type="button"
            className="font-bold">
            Philosophy
            <ArrowUpDownIcon />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="text-left text-sm hidden md:block">
          {row.getValue('philosophy')}
        </div>
      ),
      meta: {
        className: 'hidden md:table-cell'
      }
    },
    {
      accessorKey: 'retired',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            type="button"
            className="font-bold">
            Retired
            <ArrowUpDownIcon />
          </Button>
        )
      },
      cell: ({ row }) =>
        row.getValue('retired') && (
          <Badge variant="secondary" className="text-sm h-8 w-8">
            <ShieldOffIcon />
          </Badge>
        )
    },
    {
      accessorKey: 'dead',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            type="button"
            className="font-bold">
            Dead
            <ArrowUpDownIcon />
          </Button>
        )
      },
      cell: ({ row }) =>
        row.getValue('dead') && (
          <Badge variant="destructive" className="text-sm h-8 w-8">
            <SkullIcon />
          </Badge>
        )
    }
  ]
}
