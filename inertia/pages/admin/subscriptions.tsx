import AdminLayout from '@/components/layouts/admin-layout'
import { PageHeader } from '@/components/core/page-header'
import { Head, router } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Receipt,
  MoreVertical,
  Eye,
  ArrowRight,
  Pause,
  XCircle,
  Check,
  Search,
  Filter,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

interface Subscription {
  id: string
  status: string
  billingInterval: 'month' | 'year'
  stripePriceId: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  canceledAt: string | null
  createdAt: string
  organizationId: string
  organizationName: string
  planId: string
  planName: string
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  subscriptionPrice: number
  subscriptionCurrency: string
  priceMonthly: number
  priceYearly: number
  planCurrency: string
}

interface Plan {
  id: string
  name: string
}

interface Stats {
  total: number
  active: number
  trialing: number
  paused: number
  canceled: number
  pastDue: number
}

interface Props {
  subscriptions: Subscription[]
  stats: Stats
  plans: Plan[]
  filters: {
    status?: string
    planId?: string
    search?: string
  }
}

const SubscriptionsPage = ({ subscriptions, stats, plans, filters }: Props) => {
  const [searchInput, setSearchInput] = useState(filters.search || '')

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const getTimeSinceCreation = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - created.getTime()
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44))

    if (diffMonths === 0) return 'Moins d\'1 mois'
    if (diffMonths === 1) return '1 mois'
    return `${diffMonths} mois`
  }

  const calculateTotalRevenue = (subscription: Subscription) => {
    const price = subscription.subscriptionPrice

    // Si on est en période d'essai (status = trialing), pas encore de CA
    if (subscription.status === 'trialing') {
      return 0
    }

    const created = new Date(subscription.createdAt)
    const now = new Date()
    const diffMs = now.getTime() - created.getTime()

    if (subscription.billingInterval === 'month') {
      // Calculer le nombre de mois écoulés et ajouter 1 pour inclure le mois en cours
      const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44))
      return price * (months + 1) // +1 car le premier paiement a déjà eu lieu
    } else {
      // Pour annuel, si on a payé au moins une fois, on compte 1 an minimum
      const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25))
      return price * (years + 1) // +1 car le premier paiement a déjà eu lieu
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      active: { variant: 'default', label: 'Actif' },
      trialing: { variant: 'secondary', label: 'Essai' },
      paused: { variant: 'outline', label: 'En pause' },
      canceled: { variant: 'destructive', label: 'Annulé' },
      past_due: { variant: 'destructive', label: 'Impayé' },
    }
    const config = variants[status] || { variant: 'outline' as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleFilterStatus = (value: string) => {
    const url = new URL(window.location.href)
    if (value === 'all') {
      url.searchParams.delete('status')
    } else {
      url.searchParams.set('status', value)
    }
    router.visit(url.toString())
  }

  const handleFilterPlan = (value: string) => {
    const url = new URL(window.location.href)
    if (value === 'all') {
      url.searchParams.delete('planId')
    } else {
      url.searchParams.set('planId', value)
    }
    router.visit(url.toString())
  }

  const handleSearch = () => {
    const url = new URL(window.location.href)
    if (searchInput) {
      url.searchParams.set('search', searchInput)
    } else {
      url.searchParams.delete('search')
    }
    router.visit(url.toString())
  }

  const handleViewOrganization = (organizationId: string) => {
    router.visit(`/admin/organizations/${organizationId}`)
  }

  const handleMigrateSubscription = (subscriptionId: string, planId: string) => {
    if (
      confirm(
        'Voulez-vous migrer cet abonnement vers le nouveau prix ?\n\nLe nouveau prix s\'appliquera à la prochaine période de facturation.'
      )
    ) {
      router.post(`/admin/plans/${planId}/subscriptions/${subscriptionId}/migrate`)
    }
  }

  const handlePauseSubscription = (subscriptionId: string) => {
    if (
      confirm(
        'Voulez-vous vraiment mettre en pause cet abonnement ?\n\nL\'organisation n\'aura plus accès aux fonctionnalités.'
      )
    ) {
      router.post(`/admin/subscriptions/${subscriptionId}/pause`)
    }
  }

  const handleResumeSubscription = (subscriptionId: string) => {
    if (confirm('Voulez-vous reprendre cet abonnement ?')) {
      router.post(`/admin/subscriptions/${subscriptionId}/resume`)
    }
  }

  const handleCancelSubscription = (subscriptionId: string) => {
    if (
      confirm(
        'Voulez-vous annuler cet abonnement ?\n\nL\'abonnement restera actif jusqu\'à la fin de la période en cours.'
      )
    ) {
      router.post(`/admin/subscriptions/${subscriptionId}/cancel`)
    }
  }

  const handleReactivateSubscription = (subscriptionId: string) => {
    if (confirm('Voulez-vous réactiver cet abonnement annulé ?')) {
      router.post(`/admin/subscriptions/${subscriptionId}/reactivate`)
    }
  }

  return (
    <>
      <Head title="Abonnements" />
      <AdminLayout breadcrumbs={[{ label: 'Abonnements' }]}>
        <div className="flex flex-col gap-6 p-6">
          <PageHeader
            title="Abonnements"
            description={`Gérez tous les abonnements • ${stats.total} total`}
            icon={Receipt}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Actifs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Essai</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.trialing}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>En pause</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.paused}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Annulés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.canceled}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Impayés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.pastDue}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <CardTitle>Filtres</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Recherche */}
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Rechercher une organisation..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {/* Filtre Statut */}
                <Select value={filters.status || 'all'} onValueChange={handleFilterStatus}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="trialing">Essai</SelectItem>
                    <SelectItem value="paused">En pause</SelectItem>
                    <SelectItem value="canceled">Annulé</SelectItem>
                    <SelectItem value="past_due">Impayé</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtre Plan */}
                <Select value={filters.planId || 'all'} onValueChange={handleFilterPlan}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Tous les plans" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les plans</SelectItem>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {getTranslation(plan.nameI18n)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table des abonnements */}
          <Card>
            <CardHeader>
              <CardTitle>Tous les abonnements ({subscriptions.length})</CardTitle>
              <CardDescription>Liste complète des abonnements avec filtres</CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Aucun abonnement trouvé</p>
                  <p className="text-sm mt-2">Essayez de modifier les filtres</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>CA Total</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Depuis</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => {
                      const expectedPriceId =
                        subscription.billingInterval === 'month'
                          ? subscription.stripePriceIdMonthly
                          : subscription.stripePriceIdYearly
                      const isOutdated = subscription.stripePriceId !== expectedPriceId
                      const planPrice = subscription.billingInterval === 'month'
                        ? subscription.priceMonthly
                        : subscription.priceYearly
                      const totalRevenue = calculateTotalRevenue(subscription)

                      return (
                        <TableRow key={subscription.id}>
                          <TableCell className="font-medium">
                            {subscription.organizationName}
                          </TableCell>
                          <TableCell>
                            {subscription.planName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="w-fit">
                              {subscription.billingInterval === 'month' ? 'Mensuel' : 'Annuel'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">
                                {formatPrice(subscription.subscriptionPrice, subscription.subscriptionCurrency)}
                              </span>
                              {isOutdated && (
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="w-fit text-orange-600 text-xs">
                                    Nouveau prix: {formatPrice(planPrice, subscription.planCurrency)}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatPrice(totalRevenue, subscription.subscriptionCurrency)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(subscription.currentPeriodStart)} →{' '}
                            {formatDate(subscription.currentPeriodEnd)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {getTimeSinceCreation(subscription.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => handleViewOrganization(subscription.organizationId)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir l'organisation
                                </DropdownMenuItem>

                                {isOutdated &&
                                  (subscription.status === 'active' ||
                                    subscription.status === 'trialing') && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleMigrateSubscription(subscription.id, subscription.planId)
                                      }
                                    >
                                      <ArrowRight className="mr-2 h-4 w-4" />
                                      Migrer vers nouveau prix
                                    </DropdownMenuItem>
                                  )}

                                {(subscription.status === 'active' ||
                                  subscription.status === 'trialing') && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handlePauseSubscription(subscription.id)}
                                    >
                                      <Pause className="mr-2 h-4 w-4" />
                                      Mettre en pause
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() => handleCancelSubscription(subscription.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Annuler l'abonnement
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {subscription.status === 'paused' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleResumeSubscription(subscription.id)}
                                    >
                                      <ArrowRight className="mr-2 h-4 w-4" />
                                      Reprendre l'abonnement
                                    </DropdownMenuItem>
                                  </>
                                )}

                                {subscription.status === 'canceled' &&
                                  subscription.currentPeriodEnd && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleReactivateSubscription(subscription.id)}
                                      >
                                        <Check className="mr-2 h-4 w-4" />
                                        Réactiver l'abonnement
                                      </DropdownMenuItem>
                                    </>
                                  )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  )
}

export default SubscriptionsPage
