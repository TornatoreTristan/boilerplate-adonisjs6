import { Head, Link, router, usePage } from '@inertiajs/react'
import { useState } from 'react'
import AppLayout from '@/components/layouts/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/core/page-header'
import { cn } from '@/lib/utils'

interface Plan {
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

interface CurrentSubscription {
  plan: {
    id: string
  }
}

interface Props {
  organization: {
    id: string
    name: string
  }
  userRole: string
  availablePlans: Plan[]
  currentSubscription: CurrentSubscription | null
}

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price)
}

const OrganizationPricingPage = ({
  organization,
  userRole,
  availablePlans,
  currentSubscription,
}: Props) => {
  const canManageSubscription = ['owner', 'admin'].includes(userRole)
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')
  const [isProcessing, setIsProcessing] = useState(false)
  const page = usePage() as any

  // Calculer l'économie maximale parmi tous les plans
  const maxSavings = Math.max(
    ...availablePlans.map((plan) => {
      if (plan.priceMonthly > 0 && plan.priceYearly > 0) {
        return Math.round(
          ((plan.priceMonthly * 12 - plan.priceYearly) / (plan.priceMonthly * 12)) * 100
        )
      }
      return 0
    })
  )

  const handleSubscribe = (planId: string) => {
    setIsProcessing(true)
    router.post(
      '/organizations/subscriptions/checkout',
      {
        planId,
        billingInterval,
      },
      {
        onError: () => setIsProcessing(false),
      }
    )
  }

  return (
    <>
      <Head title="Tarifs - Plans d'abonnement" />
      <AppLayout>
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center gap-4">
            <Link href="/organizations/settings/subscriptions">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <PageHeader
              title="Plans d'abonnement"
              description="Choisissez le plan qui correspond le mieux à vos besoins"
            />
          </div>

          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-lg border bg-muted p-1">
              <button
                onClick={() => setBillingInterval('month')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  billingInterval === 'month'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingInterval('year')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  billingInterval === 'year'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Annuel
                {maxSavings > 0 && (
                  <span className="ml-1.5 text-xs text-green-600 dark:text-green-400">
                    (économisez jusqu'à {maxSavings}%)
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availablePlans.map((plan) => {
              const isCurrentPlan = currentSubscription?.plan.id === plan.id
              const displayPrice = billingInterval === 'month' ? plan.priceMonthly : plan.priceYearly
              const pricePerMonth =
                billingInterval === 'year' && plan.priceYearly > 0
                  ? plan.priceYearly / 12
                  : plan.priceMonthly
              const savings =
                billingInterval === 'year' && plan.priceMonthly > 0 && plan.priceYearly > 0
                  ? Math.round(
                      ((plan.priceMonthly * 12 - plan.priceYearly) / (plan.priceMonthly * 12)) * 100
                    )
                  : 0

              return (
                <Card key={plan.id} className={isCurrentPlan ? 'border-primary border-2' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {plan.name}
                        {isCurrentPlan && (
                          <Badge variant="default" className="bg-primary">
                            Actuel
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-bold">
                          {formatPrice(displayPrice, plan.currency)}
                        </div>
                        {billingInterval === 'year' && (
                          <span className="text-sm text-muted-foreground">/an</span>
                        )}
                        {billingInterval === 'month' && (
                          <span className="text-sm text-muted-foreground">/mois</span>
                        )}
                      </div>
                      {billingInterval === 'year' && pricePerMonth > 0 && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Soit {formatPrice(pricePerMonth, plan.currency)} par mois
                        </div>
                      )}
                      {savings > 0 && billingInterval === 'year' && (
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-2">
                          Économisez {savings}%
                        </div>
                      )}
                      {plan.trialDays && plan.trialDays > 0 && (
                        <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                          Essai gratuit de {plan.trialDays} jours
                        </div>
                      )}
                    </div>

                    {plan.features && plan.features.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-3">Fonctionnalités incluses</p>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!isCurrentPlan && (
                      <Button
                        className="w-full"
                        disabled={!canManageSubscription || isProcessing}
                        size="lg"
                        variant={plan.sortOrder === 1 ? 'default' : 'outline'}
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {isProcessing ? 'Redirection...' : 'Choisir ce plan'}
                      </Button>
                    )}
                    {isCurrentPlan && (
                      <Button className="w-full" variant="secondary" size="lg" disabled>
                        Plan actuel
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {!canManageSubscription && (
            <div className="text-center text-sm text-muted-foreground">
              Vous devez être propriétaire ou administrateur pour changer de plan
            </div>
          )}
        </div>
      </AppLayout>
    </>
  )
}

export default OrganizationPricingPage
