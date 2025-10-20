import { Head, Link, router } from '@inertiajs/react'
import OrganizationSettingsLayout from '@/components/layouts/organization-settings-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  AlertCircle,
  Calendar,
  CreditCard,
  FileText,
  Download,
  ExternalLink,
  ArrowUpCircle,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useState } from 'react'

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  priceYearly: number
  currency: string
  features: string[] | null
}

interface CurrentSubscription {
  id: string
  status: string
  billingInterval: 'month' | 'year'
  quantity: number
  userCount: number
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  trialEndsAt: string | null
  canceledAt: string | null
  plan: Plan
}

interface AvailablePlan {
  id: string
  name: string
  slug: string
  description: string | null
  priceMonthly: number
  priceYearly: number
  currency: string
  pricingModel: string
  features: string[] | null
  trialDays: number | null
  sortOrder: number
}

interface Invoice {
  id: string
  number: string | null
  status: string | null
  amountDue: number
  amountPaid: number
  currency: string
  created: number
  dueDate: number | null
  invoicePdf: string | null
  hostedInvoiceUrl: string | null
}

interface Props {
  organization: {
    id: string
    name: string
  }
  userRole: string
  currentSubscription: CurrentSubscription | null
  availablePlans: AvailablePlan[]
  invoices: Invoice[]
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  trialing: 'bg-blue-500',
  past_due: 'bg-yellow-500',
  canceled: 'bg-red-500',
  incomplete: 'bg-gray-500',
  incomplete_expired: 'bg-gray-500',
}

const statusLabels: Record<string, string> = {
  active: 'Actif',
  trialing: "Période d'essai",
  past_due: 'En retard',
  canceled: 'Annulé',
  incomplete: 'Incomplet',
  incomplete_expired: 'Expiré',
}

const invoiceStatusColors: Record<string, string> = {
  paid: 'bg-green-500',
  open: 'bg-blue-500',
  void: 'bg-gray-500',
  uncollectible: 'bg-red-500',
  draft: 'bg-yellow-500',
}

const invoiceStatusLabels: Record<string, string> = {
  paid: 'Payée',
  open: 'Ouverte',
  void: 'Annulée',
  uncollectible: 'Impayée',
  draft: 'Brouillon',
}

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price)
}

const OrganizationSettingsSubscriptionsPage = ({
  userRole,
  currentSubscription,
  availablePlans,
  invoices,
}: Props) => {
  const canManageSubscription = ['owner', 'admin'].includes(userRole)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCancelSubscription = () => {
    if (!currentSubscription) return

    setIsProcessing(true)
    router.delete(`/organizations/subscriptions/${currentSubscription.id}`, {
      preserveScroll: true,
      onFinish: () => {
        setIsProcessing(false)
        setIsCancelDialogOpen(false)
      },
    })
  }

  const handleReactivateSubscription = () => {
    if (!currentSubscription) return

    setIsProcessing(true)
    router.post(`/organizations/subscriptions/${currentSubscription.id}/reactivate`, {}, {
      preserveScroll: true,
      onFinish: () => {
        setIsProcessing(false)
      },
    })
  }

  return (
    <>
      <Head title="Abonnements - Paramètres" />
      <OrganizationSettingsLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Gestion des abonnements</h2>
            <p className="text-sm text-muted-foreground">
              Gérez votre abonnement et consultez les plans disponibles
            </p>
          </div>

          {currentSubscription ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {currentSubscription.plan.name}
                      <Badge className={statusColors[currentSubscription.status]}>
                        {statusLabels[currentSubscription.status] || currentSubscription.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{currentSubscription.plan.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {formatPrice(
                        currentSubscription.billingInterval === 'month'
                          ? currentSubscription.plan.priceMonthly
                          : currentSubscription.plan.priceYearly,
                        currentSubscription.plan.currency
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      par {currentSubscription.billingInterval === 'month' ? 'mois' : 'an'}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {currentSubscription.currentPeriodStart &&
                    currentSubscription.currentPeriodEnd && (
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Période de facturation</p>
                          <p className="text-sm text-muted-foreground">
                            Du {formatDate(new Date(currentSubscription.currentPeriodStart))} au{' '}
                            {formatDate(new Date(currentSubscription.currentPeriodEnd))}
                          </p>
                        </div>
                      </div>
                    )}

                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Utilisateurs</p>
                      <p className="text-sm text-muted-foreground">
                        {currentSubscription.userCount} utilisateur(s)
                      </p>
                    </div>
                  </div>
                </div>

                {currentSubscription.trialEndsAt && !currentSubscription.canceledAt && (
                  <div className="flex items-center gap-2 rounded-md bg-blue-50 dark:bg-blue-950 p-3">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Période d'essai jusqu'au{' '}
                      {formatDate(new Date(currentSubscription.trialEndsAt))}
                    </p>
                  </div>
                )}

                {currentSubscription.canceledAt && currentSubscription.status !== 'canceled' && (
                  <div className="rounded-md bg-orange-50 dark:bg-orange-950 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                          Abonnement en cours d'annulation
                        </p>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                          Votre abonnement a été annulé le {formatDate(new Date(currentSubscription.canceledAt))}.
                          {currentSubscription.currentPeriodEnd && (
                            <>
                              {' '}
                              Vous conservez l'accès à toutes les fonctionnalités jusqu'au{' '}
                              <span className="font-semibold">
                                {formatDate(new Date(currentSubscription.currentPeriodEnd))}
                              </span>.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    {canManageSubscription && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReactivateSubscription}
                        disabled={isProcessing}
                        className="bg-white dark:bg-gray-900 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900"
                      >
                        Réactiver l'abonnement
                      </Button>
                    )}
                  </div>
                )}

                {currentSubscription.status === 'canceled' && (
                  <div className="flex items-start gap-3 rounded-md bg-red-50 dark:bg-red-950 p-4">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        Abonnement expiré
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        Votre abonnement est arrivé à expiration. Souscrivez à nouveau pour retrouver l'accès aux fonctionnalités premium.
                      </p>
                    </div>
                  </div>
                )}

                {canManageSubscription &&
                  ['active', 'trialing'].includes(currentSubscription.status) &&
                  !currentSubscription.canceledAt && (
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" asChild>
                        <Link href="/organizations/pricing">
                          <ArrowUpCircle className="h-4 w-4 mr-2" />
                          Changer de plan
                        </Link>
                      </Button>
                      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Annuler l'abonnement
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Annuler votre abonnement ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Votre abonnement {currentSubscription.plan.name} sera annulé à la fin de la période de facturation.
                              {currentSubscription.currentPeriodEnd && (
                                <>
                                  {' '}
                                  Vous conserverez l'accès jusqu'au{' '}
                                  <span className="font-semibold text-foreground">
                                    {formatDate(new Date(currentSubscription.currentPeriodEnd))}
                                  </span>.
                                </>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isProcessing}>
                              Non, garder mon abonnement
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelSubscription}
                              disabled={isProcessing}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Oui, annuler l'abonnement
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Aucun abonnement actif</CardTitle>
                <CardDescription>
                  Choisissez un plan pour commencer à utiliser toutes les fonctionnalités
                </CardDescription>
              </CardHeader>
              <CardContent>
                {canManageSubscription && availablePlans.length > 0 && (
                  <Button asChild>
                    <Link href="/organizations/pricing">
                      <ArrowUpCircle className="h-4 w-4 mr-2" />
                      Voir les plans disponibles
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {invoices.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Historique des factures</h3>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {invoice.number || `Facture ${invoice.id.substring(0, 8)}`}
                              </p>
                              {invoice.status && (
                                <Badge
                                  className={invoiceStatusColors[invoice.status] || 'bg-gray-500'}
                                >
                                  {invoiceStatusLabels[invoice.status] || invoice.status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(new Date(invoice.created * 1000))}
                              {invoice.dueDate && invoice.status !== 'paid' && (
                                <> • Échéance : {formatDate(new Date(invoice.dueDate * 1000))}</>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatPrice(invoice.amountDue / 100, invoice.currency)}
                            </p>
                            {invoice.status === 'paid' && invoice.amountPaid > 0 && (
                              <p className="text-sm text-green-600 dark:text-green-400">Payée</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {invoice.hostedInvoiceUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={invoice.hostedInvoiceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {invoice.invoicePdf && (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={invoice.invoicePdf}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </OrganizationSettingsLayout>
    </>
  )
}

export default OrganizationSettingsSubscriptionsPage
