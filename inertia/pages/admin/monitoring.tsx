import { useState, useEffect } from 'react'
import AdminLayout from '@/components/layouts/admin-layout'
import { PageHeader } from '@/components/core/page-header'
import { Head } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Activity, Database, Disc, Mail, MemoryStick, Server, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MonitoringData {
  status: 'ok' | 'degraded' | 'down'
  timestamp: string
  uptime: number
  health: {
    database: HealthCheck
    redis: HealthCheck
    disk: HealthCheck
    email: HealthCheck
  }
  metrics: {
    process: ProcessMetrics
    system: SystemMetrics
    cache: CacheMetrics
  }
}

interface HealthCheck {
  status: 'ok' | 'degraded' | 'down'
  latency?: number
  details?: any
  error?: string
}

interface ProcessMetrics {
  cpuUsagePercent: number
  memoryUsage: {
    rss: string
    heapUsed: string
    percentage: number
  }
  uptime: number
}

interface SystemMetrics {
  platform: string
  cpuCount: number
  totalMemory: string
  freeMemory: string
}

interface CacheMetrics {
  hits: number
  misses: number
  hitRate: number
  keyCount: number
  memoryUsed: string
}

export default function Monitoring() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/data')
      const json = await response.json()
      setData(json)
      setLastUpdate(new Date())
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error)
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/admin/monitoring/history')
      if (!response.ok) {
        console.error('Failed to fetch history:', response.status)
        return
      }
      const json = await response.json()

      if (!json.history || !Array.isArray(json.history)) {
        console.warn('No history data available')
        setHistory([])
        return
      }

      const formattedHistory = json.history
        .slice(0, 50)
        .reverse()
        .map((item: any) => ({
          time: new Date(item.createdAt).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          database: item.healthData?.database?.latency || 0,
          redis: item.healthData?.redis?.latency || 0,
          cpu: item.metricsData?.process?.cpuUsagePercent || 0,
          memory: item.metricsData?.process?.memoryUsage?.percentage || 0,
          cacheHitRate: item.metricsData?.cache?.hitRate || 0,
        }))
      setHistory(formattedHistory)
    } catch (error) {
      console.error('Failed to fetch history:', error)
      setHistory([])
    }
  }

  useEffect(() => {
    fetchData()
    fetchHistory()

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData()
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      ok: 'default',
      degraded: 'secondary',
      down: 'destructive',
    }
    return (
      <Badge variant={variants[status] || 'default'} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    )
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}j ${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <>
        <Head title="System Monitoring" />
        <AdminLayout breadcrumbs={[{ label: 'Monitoring' }]}>
          <div className="flex flex-col gap-6 p-6">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </AdminLayout>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <Head title="System Monitoring" />
        <AdminLayout breadcrumbs={[{ label: 'Monitoring' }]}>
          <div className="flex flex-col gap-6 p-6">
            <Alert variant="destructive">
              <AlertDescription>Failed to load monitoring data</AlertDescription>
            </Alert>
          </div>
        </AdminLayout>
      </>
    )
  }

  const chartConfig = {
    database: { label: 'Database', color: 'hsl(var(--chart-1))' },
    redis: { label: 'Redis', color: 'hsl(var(--chart-2))' },
    cpu: { label: 'CPU', color: 'hsl(var(--chart-3))' },
    memory: { label: 'Memory', color: 'hsl(var(--chart-4))' },
    cacheHitRate: { label: 'Cache Hit Rate', color: 'hsl(var(--chart-5))' },
  }

  return (
    <>
      <Head title="System Monitoring" />
      <AdminLayout breadcrumbs={[{ label: 'Monitoring' }]}>
        <div className="flex flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <PageHeader
              title="System Monitoring"
              description={`Uptime: ${formatUptime(data.uptime)} • Status: ${data.status.toUpperCase()} • Last update: ${Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s ago`}
            />
            <Button
              onClick={() => {
                fetchData()
                fetchHistory()
              }}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Health Checks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Database
                  {getStatusBadge(data.health.database.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.health.database.latency && (
                    <div className="text-2xl font-bold">{data.health.database.latency}ms</div>
                  )}
                  {data.health.database.details?.connection && (
                    <div className="text-sm text-muted-foreground">
                      Pool: {data.health.database.details.connection.used}/
                      {data.health.database.details.connection.max}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Server className="w-4 h-4 mr-2" />
                  Redis
                  {getStatusBadge(data.health.redis.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.health.redis.latency && (
                    <div className="text-2xl font-bold">{data.health.redis.latency}ms</div>
                  )}
                  {data.health.redis.details?.memory && (
                    <div className="text-sm text-muted-foreground">
                      Memory: {data.health.redis.details.memory.used}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Disc className="w-4 h-4 mr-2" />
                  Disk Space
                  {getStatusBadge(data.health.disk.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.health.disk.details && (
                    <>
                      <div className="text-2xl font-bold">
                        {data.health.disk.details.freePercentage}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {data.health.disk.details.free} free
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Queue
                  {getStatusBadge(data.health.email.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.health.email.details && (
                    <>
                      <div className="text-2xl font-bold">{data.health.email.details.waiting}</div>
                      <div className="text-sm text-muted-foreground">
                        Pending • {data.health.email.details.failed} failed
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CPU</span>
                    <span className="font-medium">{data.metrics.process.cpuUsagePercent}%</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Memory</span>
                    <span className="font-medium">
                      {data.metrics.process.memoryUsage.percentage}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {data.metrics.process.memoryUsage.rss}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <MemoryStick className="w-4 h-4 mr-2" />
                  System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CPUs</span>
                  <span className="font-medium">{data.metrics.system.cpuCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Memory</span>
                  <span className="font-medium">{data.metrics.system.totalMemory}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Cache Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hit Rate</span>
                  <span className="font-medium">{data.metrics.cache.hitRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Keys</span>
                  <span className="font-medium">{data.metrics.cache.keyCount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {history.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Response Time (Last 24h)</CardTitle>
                  <CardDescription>Database and Redis latency over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <AreaChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="database"
                        stackId="1"
                        stroke="var(--color-database)"
                        fill="var(--color-database)"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="redis"
                        stackId="1"
                        stroke="var(--color-redis)"
                        fill="var(--color-redis)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>CPU & Memory Usage (Last 24h)</CardTitle>
                    <CardDescription>Process resource consumption over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <AreaChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="time"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={12}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={12}
                          domain={[0, 100]}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="cpu"
                          stroke="var(--color-cpu)"
                          fill="var(--color-cpu)"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="memory"
                          stroke="var(--color-memory)"
                          fill="var(--color-memory)"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cache Performance (Last 24h)</CardTitle>
                    <CardDescription>Redis cache hit rate over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <AreaChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="time"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={12}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={12}
                          domain={[0, 100]}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="cacheHitRate"
                          stroke="var(--color-cacheHitRate)"
                          fill="var(--color-cacheHitRate)"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </>
  )
}
