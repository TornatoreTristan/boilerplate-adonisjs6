import AdminLayout from '@/components/layouts/admin-layout'
import { PageHeader } from '@/components/core/page-header'
import { Head, router } from '@inertiajs/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  MousePointerClick,
  Paperclip,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface EmailLog {
  id: string
  userId: string | null
  recipient: string
  subject: string
  category: string
  status:
    | 'pending'
    | 'sent'
    | 'delivered'
    | 'delivery_delayed'
    | 'bounced'
    | 'complained'
    | 'opened'
    | 'clicked'
    | 'failed'
    | 'received'
  providerId: string | null
  errorMessage: string | null
  opensCount: number
  clicksCount: number
  openedAt: string | null
  clickedAt: string | null
  sentAt: string | null
  deliveredAt: string | null
  failedAt: string | null
  createdAt: string
  hasAttachments: boolean
}

interface EmailLogsStats {
  total: number
  sent: number
  failed: number
  delivered: number
  pending: number
  byCategory: { category: string; count: number }[]
}

interface MailsPageProps {
  logs: {
    data: EmailLog[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
  stats: EmailLogsStats
  filters: {
    status?: string
    category?: string
    search?: string
  }
}

const getStatusBadge = (status: EmailLog['status']) => {
  const variants: Record<
    EmailLog['status'],
    { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any; label: string }
  > = {
    sent: { variant: 'default', icon: Send, label: 'Envoyé' },
    delivered: { variant: 'default', icon: CheckCircle2, label: 'Livré' },
    opened: { variant: 'secondary', icon: Eye, label: 'Ouvert' },
    clicked: { variant: 'secondary', icon: MousePointerClick, label: 'Cliqué' },
    failed: { variant: 'destructive', icon: XCircle, label: 'Échec' },
    bounced: { variant: 'destructive', icon: XCircle, label: 'Rebond' },
    complained: { variant: 'destructive', icon: XCircle, label: 'Spam' },
    pending: { variant: 'outline', icon: Clock, label: 'En attente' },
    received: { variant: 'outline', icon: Clock, label: 'Reçu' },
    delivery_delayed: { variant: 'outline', icon: Clock, label: 'Retardé' },
  }

  const config = variants[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="flex items-center gap-1.5 w-fit">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

const columns: ColumnDef<EmailLog>[] = [
  {
    accessorKey: 'recipient',
    header: 'Destinataire',
    cell: ({ row }) => {
      const email = row.original
      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-sm">{email.recipient}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[300px]">
            {email.subject}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'category',
    header: 'Catégorie',
    cell: ({ row }) => {
      const category = row.getValue('category') as string
      return <Badge variant="outline">{category}</Badge>
    },
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => getStatusBadge(row.getValue('status')),
  },
  {
    id: 'engagement',
    header: 'Engagement',
    cell: ({ row }) => {
      const email = row.original
      if (email.opensCount === 0 && email.clicksCount === 0) {
        return <span className="text-xs text-muted-foreground">-</span>
      }
      return (
        <div className="flex items-center gap-3 text-xs">
          {email.opensCount > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{email.opensCount}</span>
            </div>
          )}
          {email.clicksCount > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MousePointerClick className="h-3 w-3" />
              <span>{email.clicksCount}</span>
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'attachments',
    header: '',
    cell: ({ row }) => {
      if (!row.original.hasAttachments) return null
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Paperclip className="h-4 w-4" />
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      const dateString = row.getValue('createdAt') as string
      const date = new Date(dateString)
      return (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(date, { locale: fr, addSuffix: true })}
        </span>
      )
    },
  },
]

const MailsPage = ({ logs, stats, filters }: MailsPageProps) => {
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all')
  const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all')
  const [searchQuery, setSearchQuery] = useState(filters.search || '')

  const handleFilterChange = (status: string, category: string, search: string) => {
    const params = new URLSearchParams()
    if (status && status !== 'all') params.set('status', status)
    if (category && category !== 'all') params.set('category', category)
    if (search) params.set('search', search)

    router.get(`/admin/mails?${params.toString()}`, {}, { preserveState: true })
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
    if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter)
    if (searchQuery) params.set('search', searchQuery)

    router.get(`/admin/mails?${params.toString()}`, {}, { preserveState: true })
  }

  const successRate = stats.total > 0 ? ((stats.sent + stats.delivered) / stats.total) * 100 : 0

  return (
    <>
      <Head title="Logs Emails" />
      <AdminLayout breadcrumbs={[{ label: 'Emails' }]}>
        <div className="flex flex-col gap-6 p-6">
          <PageHeader
            title="Logs Emails"
            description={`${stats.total} email${stats.total > 1 ? 's' : ''} envoyé${stats.total > 1 ? 's' : ''}`}
            icon={Mail}
          />

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Emails envoyés</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Envoyés</CardTitle>
                <Send className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.sent + stats.delivered}</div>
                <p className="text-xs text-muted-foreground">
                  {successRate.toFixed(1)}% de succès
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Échecs</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.failed}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(1) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Livrés</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.delivered}</div>
                <p className="text-xs text-muted-foreground">Avec confirmation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En attente</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Non traités</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par destinataire..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  const timer = setTimeout(() => {
                    handleFilterChange(statusFilter, categoryFilter, e.target.value)
                  }, 500)
                  return () => clearTimeout(timer)
                }}
                className="max-w-sm"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                handleFilterChange(value, categoryFilter, searchQuery)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="sent">Envoyé</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
                <SelectItem value="failed">Échec</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="opened">Ouvert</SelectItem>
                <SelectItem value="clicked">Cliqué</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value)
                handleFilterChange(statusFilter, value, searchQuery)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {stats.byCategory.map((cat) => (
                  <SelectItem key={cat.category} value={cat.category}>
                    {cat.category} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={logs.data}
            getRowId={(row) => row.id}
            pagination={{
              pageIndex: logs.meta.currentPage - 1,
              pageSize: logs.meta.perPage,
            }}
            pageCount={logs.meta.lastPage}
            onPaginationChange={(updater) => {
              if (typeof updater === 'function') {
                const newState = updater({
                  pageIndex: logs.meta.currentPage - 1,
                  pageSize: logs.meta.perPage,
                })
                handlePageChange(newState.pageIndex + 1)
              }
            }}
            manualPagination
          />
        </div>
      </AdminLayout>
    </>
  )
}

export default MailsPage
