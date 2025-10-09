import AdminLayout from '@/components/layouts/admin-layout'
import { PageHeader } from '@/components/core/page-header'
import { Head } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Label } from 'recharts'
import { Users, Activity, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useMemo } from 'react'

interface AdminIndexProps {
  user: {
    id: string
    fullName: string | null
    email: string
  }
  stats: {
    usersGrowth: Array<{ date: string; count: number }>
    sessionsGrowth: Array<{ date: string; count: number }>
    avgSessionsPerUser: number
    activeUsers: number
    inactiveUsers: number
    totalUsers: number
  }
}

const Index = ({ user, stats }: AdminIndexProps) => {
  const usersChartConfig = {
    count: {
      label: 'Utilisateurs',
      color: 'hsl(var(--chart-1))',
    },
  }

  const sessionsChartConfig = {
    count: {
      label: 'Sessions',
      color: 'hsl(var(--chart-2))',
    },
  }

  const activeUsersData = useMemo(
    () => [
      { name: 'Actifs', value: stats.activeUsers, fill: 'hsl(var(--chart-1))' },
      { name: 'Inactifs', value: stats.inactiveUsers, fill: 'hsl(var(--chart-3))' },
    ],
    [stats.activeUsers, stats.inactiveUsers]
  )

  const totalActivePercentage = useMemo(
    () => Math.round((stats.activeUsers / stats.totalUsers) * 100),
    [stats.activeUsers, stats.totalUsers]
  )

  return (
    <>
      <Head title="Administration" />
      <AdminLayout>
        <div className="flex flex-col gap-6 p-6">
          <PageHeader
            title="Administration"
            description={`Bienvenue ${user.fullName || user.email}`}
            separator={true}
          />

          {/* Statistiques principales */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} actifs · {stats.inactiveUsers} inactifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions moyennes</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgSessionsPerUser}</div>
                <p className="text-xs text-muted-foreground">Par utilisateur</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux d'activité</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalActivePercentage}%</div>
                <p className="text-xs text-muted-foreground">Utilisateurs actifs (30j)</p>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Évolution des utilisateurs */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des utilisateurs</CardTitle>
                <CardDescription>Nouveaux utilisateurs sur les 30 derniers jours</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={usersChartConfig}>
                  <AreaChart data={stats.usersGrowth}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => format(new Date(value), 'dd MMM', { locale: fr })}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) =>
                            format(new Date(value as string), 'dd MMMM yyyy', { locale: fr })
                          }
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Évolution des sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des sessions</CardTitle>
                <CardDescription>Nouvelles sessions sur les 30 derniers jours</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={sessionsChartConfig}>
                  <AreaChart data={stats.sessionsGrowth}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => format(new Date(value), 'dd MMM', { locale: fr })}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) =>
                            format(new Date(value as string), 'dd MMMM yyyy', { locale: fr })
                          }
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Utilisateurs actifs vs inactifs */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Répartition des utilisateurs</CardTitle>
                <CardDescription>
                  Utilisateurs actifs vs inactifs (inactif = aucune activité depuis 30 jours)
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ChartContainer config={{}} className="mx-auto aspect-square max-h-[300px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie data={activeUsersData} dataKey="value" nameKey="name" innerRadius={60}>
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-3xl font-bold"
                                >
                                  {totalActivePercentage}%
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground"
                                >
                                  Actifs
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}

export default Index
