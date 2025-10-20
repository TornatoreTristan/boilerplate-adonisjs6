import AdminLayout from '@/components/layouts/admin-layout'
import { PageHeader } from '@/components/core/page-header'
import { Head, router } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  ArrowRight,
  Calendar,
  Users,
  DollarSign,
  Check,
  Building2,
  AlertCircle,
  MoreVertical,
  Eye,
  Pause,
  XCircle,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  priceYearly: number
  currency: string
  trialDays: number | null
  features: string[] | null
  isActive: boolean
  isVisible: boolean
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  stripeProductId: string | null
}

interface Subscription {
  id: string
  organizationId: string
  organizationName: string
  status: string
  billingInterval: 'month' | 'year'
  stripePriceId: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  createdAt: string
}

interface Props {
  plan: Plan
  subscriptions: Subscription[]
}

const ShowPlanPage = ({ plan, subscriptions }: Props) => {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      trialing: 'secondary',
      past_due: 'destructive',
      canceled: 'outline',
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  const handleMigrateSubscription = (subscriptionId: string) => {
    if (
      confirm(
        'Voulez-vous vraiment migrer cet abonnement vers le nouveau prix ?\n\nLe nouveau prix s\'appliquera à la prochaine période de facturation (pas de prorata).'
      )
    ) {
      router.post(`/admin/plans/${plan.id}/subscriptions/${subscriptionId}/migrate`)
    }
  }

  const handleViewSubscription = (subscriptionId: string, organizationId: string) => {
    router.visit(`/admin/organizations/${organizationId}`)
  }

  const handlePauseSubscription = (subscriptionId: string) => {
    if (
      confirm(
        'Voulez-vous vraiment mettre en pause cet abonnement ?\n\nL\'organisation n\'aura plus accès aux fonctionnalités jusqu\'à la reprise.'
      )
    ) {
      router.post(`/admin/subscriptions/${subscriptionId}/pause`)
    }
  }

  const handleResumeSubscription = (subscriptionId: string) => {
    if (
      confirm(
        'Voulez-vous reprendre cet abonnement en pause ?\n\nLes factures recommenceront à être générées.'
      )
    ) {
      router.post(`/admin/subscriptions/${subscriptionId}/resume`)
    }
  }

  const handleCancelSubscription = (subscriptionId: string) => {
    if (
      confirm(
        'Voulez-vous vraiment annuler cet abonnement ?\n\nL\'abonnement restera actif jusqu\'à la fin de la période en cours, puis sera annulé.'
      )
    ) {
      router.post(`/admin/subscriptions/${subscriptionId}/cancel`)
    }
  }

  const handleReactivateSubscription = (subscriptionId: string) => {
    if (
      confirm(
        'Voulez-vous réactiver cet abonnement annulé ?\n\nL\'annulation sera annulée et l\'abonnement continuera normalement.'
      )
    ) {
      router.post(`/admin/subscriptions/${subscriptionId}/reactivate`)
    }
  }

  // Détecter si des abonnements utilisent un ancien prix
  const hasOutdatedSubscriptions = subscriptions.some((sub) => {
    const expectedPriceId =
      sub.billingInterval === 'month' ? plan.stripePriceIdMonthly : plan.stripePriceIdYearly
    return sub.stripePriceId !== expectedPriceId
  })

  return (
    <>
      <Head title={`Plan ${getTranslation(plan.nameI18n)}`} />
      <AdminLayout
        breadcrumbs={[
          { label: 'Plans', href: '/admin/plans' },
          { label: plan.name },
        ]}
      >
        <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
          <PageHeader
            title={getTranslation(plan.nameI18n)}
            description={plan.description || `Détails du plan ${getTranslation(plan.nameI18n)}`}
            icon={CreditCard}
            actions={
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.visit(`/admin/plans/${plan.id}/edit`)}
                >
                  Modifier
                </Button>
                <Button onClick={() => router.visit('/admin/plans')}>Retour à la liste</Button>
              </div>
            }
          />

          {/* Informations du plan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <CardTitle>Tarification</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold">
                      {formatPrice(plan.priceMonthly, plan.currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">par mois</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {formatPrice(plan.priceYearly, plan.currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">par an</div>
                  </div>
                  {plan.trialDays && (
                    <Badge variant="secondary">
                      <Calendar className="mr-1 h-3 w-3" />
                      {plan.trialDays} jours d'essai
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Abonnements</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{subscriptions.length}</div>
                  <div className="text-sm text-muted-foreground">
                    {subscriptions.filter((s) => s.status === 'active').length} actifs
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <CardTitle>État</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  {plan.isActive ? (
                    <Badge variant="default">Actif</Badge>
                  ) : (
                    <Badge variant="outline">Inactif</Badge>
                  )}
                  {plan.isVisible ? (
                    <Badge variant="secondary">Visible</Badge>
                  ) : (
                    <Badge variant="outline">Caché</Badge>
                  )}
                </div>
                {plan.stripeProductId && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>M: {plan.stripePriceIdMonthly?.substring(0, 15)}...</div>
                    <div>A: {plan.stripePriceIdYearly?.substring(0, 15)}...</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fonctionnalités */}
          {plan.features && plan.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités incluses</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Alerte si prix obsolète */}
          {hasOutdatedSubscriptions && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Certains abonnements utilisent un ancien prix. Vous pouvez les migrer
                manuellement vers le nouveau prix.
              </AlertDescription>
            </Alert>
          )}

          {/* Liste des abonnements */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle>Abonnements actifs ({subscriptions.length})</CardTitle>
              </div>
              <CardDescription>
                Organisations ayant souscrit à ce plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun abonnement pour ce plan
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Prix actuel</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Depuis</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => {
                      const expectedPriceId =
                        subscription.billingInterval === 'month'
                          ? plan.stripePriceIdMonthly
                          : plan.stripePriceIdYearly
                      const isOutdated = subscription.stripePriceId !== expectedPriceId
                      return (
                        <TableRow key={subscription.id}>
                          <TableCell className="font-medium">
                            {subscription.organizationName}
                          </TableCell>
                          <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isOutdated ? (
                                <>
                                  <Badge variant="outline">Ancien prix</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {subscription.stripePriceId?.substring(0, 15)}...
                                  </span>
                                </>
                              ) : (
                                <Badge variant="default">Prix actuel</Badge>
                              )}
                              <Badge variant="secondary">
                                {subscription.billingInterval === 'month' ? 'Mensuel' : 'Annuel'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(subscription.currentPeriodStart)} →{' '}
                            {formatDate(subscription.currentPeriodEnd)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(subscription.createdAt)}
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

                                {/* Voir l'organisation - Toujours disponible */}
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleViewSubscription(subscription.id, subscription.organizationId)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir l'organisation
                                </DropdownMenuItem>

                                {/* Migrer vers nouveau prix - Si ancien prix et actif/trial */}
                                {isOutdated &&
                                  (subscription.status === 'active' ||
                                    subscription.status === 'trialing') && (
                                    <DropdownMenuItem
                                      onClick={() => handleMigrateSubscription(subscription.id)}
                                    >
                                      <ArrowRight className="mr-2 h-4 w-4" />
                                      Migrer vers nouveau prix
                                    </DropdownMenuItem>
                                  )}

                                {/* Actions pour abonnements actifs/trial */}
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

                                {/* Reprendre - Si en pause */}
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

                                {/* Réactiver - Si annulé mais pas encore terminé */}
                                {subscription.status === 'canceled' && subscription.currentPeriodEnd && (
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

export default ShowPlanPage
