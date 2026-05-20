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
import { Badge } from '@/components/ui/badge'
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
import { useLocal } from '@/contexts/local-context'
import {
  AdminUserListEntry,
  deleteAdminUser,
  getAdminUsers,
  sendAdminUserPasswordReset
} from '@/lib/admin-users'
import {
  KeyRoundIcon,
  Loader2Icon,
  RefreshCwIcon,
  Trash2Icon,
  UsersIcon
} from 'lucide-react'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

/**
 * Format Date Time
 *
 * @param value ISO Date String
 * @returns Formatted Date Time
 */
function formatDateTime(value: string | null): string {
  if (!value) return 'Never'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

/**
 * Get User Label
 *
 * @param user Admin User List Entry
 * @returns User Label
 */
function getUserLabel(user: AdminUserListEntry): string {
  return user.email ?? user.phone ?? user.id
}

/**
 * Admin User Management Card Component
 *
 * Displays Supabase Auth users from `auth.users` and exposes privileged admin
 * actions for account recovery and deletion.
 *
 * @returns Admin User Management Card Component
 */
export function AdminUserManagementCard(): ReactElement {
  const { isAdmin } = useLocal()
  const [users, setUsers] = useState<AdminUserListEntry[]>([])
  const [hasLoadedUsers, setHasLoadedUsers] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [resettingUserId, setResettingUserId] = useState<string | null>(null)

  const loadUsers = useCallback(() => {
    if (!isAdmin) return

    setIsLoading(true)

    getAdminUsers()
      .then(setUsers)
      .catch((err: unknown) => {
        console.error('Admin Users Fetch Error:', err)
        toast.error('The darkness hides the user ledger. Please try again.')
      })
      .finally(() => {
        setHasLoadedUsers(true)
        setIsLoading(false)
      })
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return

    let isCancelled = false

    getAdminUsers()
      .then((nextUsers) => {
        if (isCancelled) return

        setUsers(nextUsers)
      })
      .catch((err: unknown) => {
        if (isCancelled) return

        console.error('Admin Users Fetch Error:', err)
        toast.error('The darkness hides the user ledger. Please try again.')
      })
      .finally(() => {
        if (isCancelled) return

        setHasLoadedUsers(true)
      })

    return () => {
      isCancelled = true
    }
  }, [isAdmin])

  if (!isAdmin) return <></>

  const isUserListLoading = isLoading || !hasLoadedUsers

  /**
   * Handle Delete User
   *
   * @param user User To Delete
   */
  const handleDeleteUser = (user: AdminUserListEntry) => {
    setDeletingUserId(user.id)

    deleteAdminUser(user.id)
      .then(() => {
        setUsers((currentUsers) =>
          currentUsers.filter((currentUser) => currentUser.id !== user.id)
        )
        toast.success(`${getUserLabel(user)} has been cast into the dark.`)
      })
      .catch((err: unknown) => {
        console.error('Admin User Delete Error:', err)
        toast.error('The darkness refuses this offering. Please try again.')
      })
      .finally(() => setDeletingUserId(null))
  }

  /**
   * Handle Send Password Reset
   *
   * @param user User To Reset
   */
  const handleSendPasswordReset = (user: AdminUserListEntry) => {
    if (!user.email) {
      toast.error('This survivor has no email for the lantern to find.')
      return
    }

    setResettingUserId(user.id)

    sendAdminUserPasswordReset(user.id)
      .then(() => {
        toast.success(`A password reset lantern was sent to ${user.email}.`)
      })
      .catch((err: unknown) => {
        console.error('Admin Password Reset Error:', err)
        toast.error('The reset lantern failed to light. Please try again.')
      })
      .finally(() => setResettingUserId(null))
  }

  return (
    <div className="flex flex-col gap-4 pt-12 px-2">
      <Card className="p-0">
        <CardHeader className="px-4 pt-3 pb-0">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-amber-400/90" />
              User Management
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              disabled={isUserListLoading}>
              {isUserListLoading ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCwIcon className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {isUserListLoading && users.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Reading the user ledger...
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No users have stepped into the lantern light yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Providers</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Sign-In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">
                          {getUserLabel(user)}
                        </span>
                        <span className="max-w-64 truncate text-xs text-muted-foreground">
                          {user.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{user.role ?? 'unknown'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.providers.length > 0 ? (
                          user.providers.map((provider) => (
                            <Badge
                              key={`${user.id}-${provider}`}
                              variant="secondary">
                              {provider}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(user.created_at)}</TableCell>
                    <TableCell>
                      {formatDateTime(user.last_sign_in_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendPasswordReset(user)}
                          disabled={!user.email || resettingUserId === user.id}>
                          {resettingUserId === user.id ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                          ) : (
                            <KeyRoundIcon className="h-4 w-4" />
                          )}
                          Reset Password
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deletingUserId === user.id}>
                              {deletingUserId === user.id ? (
                                <Loader2Icon className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2Icon className="h-4 w-4" />
                              )}
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Delete {getUserLabel(user)} from Auth users. The
                                lantern will not remember them.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
