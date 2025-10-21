import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layouts/admin-layout'
import { PageHeader } from '@/components/core/page-header'
import { Head } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertCircle, Info, AlertTriangle, XCircle, Skull, RefreshCw, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useI18n } from '@/hooks/use-i18n'

interface Log {
  id: string
  level: string
  message: string
  context: Record<string, any> | null
  userId: string | null
  ip: string | null
  userAgent: string | null
  method: string | null
  url: string | null
  statusCode: number | null
  createdAt: string
  user?: {
    id: string
    fullName: string | null
    email: string
  }
}

interface LogStats {
  total: number
  byLevel: Record<string, number>
  last24h: number
}

export default function Logs() {
  const { t } = useI18n()
  const [logs, setLogs] = useState<Log[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    level: 'all',
    search: '',
    method: 'all',
  })

  const perPage = 50

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
        ...(filters.level && filters.level !== 'all' && { level: filters.level }),
        ...(filters.search && { search: filters.search }),
        ...(filters.method && filters.method !== 'all' && { method: filters.method }),
      })

      const response = await fetch(`/api/admin/logs/list?${params}`)
      const json = await response.json()

      setLogs(json.data)
      setTotal(json.total)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/logs/stats')
      const json = await response.json()
      setStats(json)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [page, filters])

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'debug':
        return <Info className="w-4 h-4" />
      case 'info':
        return <Info className="w-4 h-4" />
      case 'warn':
        return <AlertTriangle className="w-4 h-4" />
      case 'error':
        return <XCircle className="w-4 h-4" />
      case 'fatal':
        return <Skull className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getLevelBadge = (level: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      debug: 'outline',
      info: 'default',
      warn: 'secondary',
      error: 'destructive',
      fatal: 'destructive',
    }

    return (
      <Badge variant={variants[level] || 'default'} className="flex items-center gap-1">
        {getLevelIcon(level)}
        {level.toUpperCase()}
      </Badge>
    )
  }

  const getStatusCodeBadge = (code: number | null) => {
    if (!code) return null

    let variant: 'default' | 'secondary' | 'destructive' = 'default'
    if (code >= 500) variant = 'destructive'
    else if (code >= 400) variant = 'secondary'

    return <Badge variant={variant}>{code}</Badge>
  }

  return (
    <>
      <Head title="System Logs" />
      <AdminLayout breadcrumbs={[{ label: 'Logs' }]}>
        <div className="flex flex-col gap-6 p-6">
          <PageHeader title="System Logs" description="View and search application logs" />

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Last 24h</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.last24h.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {(stats.byLevel.error || 0) + (stats.byLevel.fatal || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Warnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.byLevel.warn || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search logs..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full"
                  />
                </div>
                <Select
                  value={filters.level}
                  onValueChange={(value) => setFilters({ ...filters, level: value })}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="fatal">Fatal</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.method}
                  onValueChange={(value) => setFilters({ ...filters, method: value })}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    fetchLogs()
                    fetchStats()
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logs Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedLog(log)}
                      >
                        <TableCell>{getLevelBadge(log.level)}</TableCell>
                        <TableCell className="max-w-md truncate">{log.message}</TableCell>
                        <TableCell>
                          {log.method && <Badge variant="outline">{log.method}</Badge>}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                          {log.url}
                        </TableCell>
                        <TableCell>{getStatusCodeBadge(log.statusCode)}</TableCell>
                        <TableCell className="text-sm">
                          {log.user ? log.user.fullName || log.user.email : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((page - 1) * perPage + 1, total)} to{' '}
              {Math.min(page * perPage, total)} of {total} logs
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * perPage >= total}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getLevelBadge(selectedLog.level)}
              Log Details
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Message</h4>
                <p className="text-sm">{selectedLog.message}</p>
              </div>

              {selectedLog.url && (
                <div>
                  <h4 className="font-semibold mb-2">Request</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Method:</span> {selectedLog.method}
                    </p>
                    <p className="break-all">
                      <span className="font-medium">URL:</span> {selectedLog.url}
                    </p>
                    {selectedLog.statusCode && (
                      <p>
                        <span className="font-medium">Status:</span> {selectedLog.statusCode}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedLog.user && (
                <div>
                  <h4 className="font-semibold mb-2">User</h4>
                  <div className="text-sm space-y-1">
                    <p>{selectedLog.user.fullName || selectedLog.user.email}</p>
                    <p className="text-muted-foreground">ID: {selectedLog.user.id}</p>
                  </div>
                </div>
              )}

              {selectedLog.ip && (
                <div>
                  <h4 className="font-semibold mb-2">Client</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">IP:</span> {selectedLog.ip}
                    </p>
                    {selectedLog.userAgent && (
                      <p className="break-all">
                        <span className="font-medium">User Agent:</span> {selectedLog.userAgent}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedLog.context && Object.keys(selectedLog.context).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Context</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(selectedLog.context, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Timestamp</h4>
                <p className="text-sm">
                  {new Date(selectedLog.createdAt).toLocaleString('fr-FR', {
                    dateStyle: 'full',
                    timeStyle: 'long',
                  })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
