import AdminLayout from '@/components/layouts/admin-layout'
import { PageHeader } from '@/components/core/page-header'
import { Head, router } from '@inertiajs/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { DateRangeFilter, type DateRange } from '@/components/ui/date-range-filter'
import { useState, useMemo } from 'react'
import { isWithinInterval, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface User {
  id: string
  fullName: string | null
  email: string
  avatarUrl: string | null
  googleId: string | null
  isEmailVerified: boolean
  createdAt: string
  lastActivity: string | null
}

interface UsersPageProps {
  users: User[]
}

const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Sélectionner tout"
      />
    ),
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Sélectionner la ligne"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'fullName',
    header: 'Utilisateur',
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl || ''} alt={user.fullName || ''} />
            <AvatarFallback>
              {user.fullName
                ? user.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                : user.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.fullName || 'Sans nom'}</p>
            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <span className="text-sm">{row.getValue('email')}</span>,
  },
  {
    accessorKey: 'isEmailVerified',
    header: 'Statut',
    cell: ({ row }) => {
      const isVerified = row.getValue('isEmailVerified')
      return isVerified ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm">Vérifié</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-orange-600">
          <XCircle className="h-4 w-4" />
          <span className="text-sm">Non vérifié</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'googleId',
    header: 'Type',
    cell: ({ row }) => {
      const googleId = row.getValue('googleId')
      return googleId ? (
        <Badge variant="secondary">Google</Badge>
      ) : (
        <Badge variant="outline">Email</Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Inscription',
    cell: ({ row }) => {
      const dateString = row.getValue('createdAt') as string
      const date = new Date(dateString)
      return (
        <span className="text-sm text-muted-foreground">
          {new Intl.DateTimeFormat('fr-FR', {
            dateStyle: 'medium',
          }).format(date)}
        </span>
      )
    },
  },
  {
    accessorKey: 'lastActivity',
    header: 'Dernière connexion',
    cell: ({ row }) => {
      const dateString = row.getValue('lastActivity') as string | null
      if (!dateString) {
        return <span className="text-sm text-muted-foreground">Jamais</span>
      }
      const date = new Date(dateString)
      return (
        <span className="text-sm text-muted-foreground">
          Il y a {formatDistanceToNow(date, { locale: fr })}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const user = row.original
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.visit(`/admin/users/${user.id}`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]

const UsersPage = ({ users }: UsersPageProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const filteredUsers = useMemo(() => {
    if (!dateRange?.from) {
      return users
    }

    return users.filter((user) => {
      const userDate = new Date(user.createdAt)

      if (dateRange.from && dateRange.to) {
        return isWithinInterval(userDate, { start: dateRange.from, end: dateRange.to })
      }

      if (dateRange.from) {
        return userDate >= dateRange.from
      }

      return true
    })
  }, [users, dateRange])

  return (
    <>
      <Head title="Utilisateurs" />
      <AdminLayout breadcrumbs={[{ label: 'Utilisateurs' }]}>
        <div className="flex flex-col gap-6 p-6">
          <PageHeader
            title="Utilisateurs"
            description={`${filteredUsers.length} utilisateur${filteredUsers.length > 1 ? 's' : ''} inscrit${filteredUsers.length > 1 ? 's' : ''}`}
          />

          <DataTable
            columns={columns}
            data={filteredUsers}
            searchKey="email"
            searchPlaceholder="Rechercher par email..."
            customFilters={<DateRangeFilter value={dateRange} onChange={setDateRange} />}
            getRowId={(row) => row.id}
            onRowClick={(user) => router.visit(`/admin/users/${user.id}`)}
          />
        </div>
      </AdminLayout>
    </>
  )
}

export default UsersPage
