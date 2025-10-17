import AdminLayout from '@/components/layouts/admin-layout'
import { PageHeader } from '@/components/core/page-header'
import { Head, Link, router } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, CreditCard, Eye, EyeOff, Check, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
  limits: Record<string, any> | null
  isActive: boolean
  isVisible: boolean
  sortOrder: number
  stripeProductId: string | null
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  activeSubscriptions: number
  createdAt: string
  updatedAt: string | null
}

interface PlansIndexProps {
  plans: Plan[]
}

const PlansIndexPage = ({ plans }: PlansIndexProps) => {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const handleDelete = (planId: string, planName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le plan "${planName}" ?`)) {
      router.delete(`/admin/plans/${planId}`)
    }
  }

  const handleSyncStripe = (planId: string) => {
    router.post(`/admin/plans/${planId}/sync-stripe`)
  }

  return (
    <>
      <Head title="Plans d'abonnement" />
      <AdminLayout breadcrumbs={[{ label: 'Plans' }]}>
        <div className="flex flex-col gap-6 p-6">
          <PageHeader
            title="Plans d'abonnement"
            description={`Gérez les plans d'abonnement de votre SaaS • ${plans.length} plan${plans.length > 1 ? 's' : ''}`}
            icon={CreditCard}
            action={
              <Link href="/admin/plans/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau plan
                </Button>
              </Link>
            }
          />

          <Card>
            <CardHeader>
              <CardTitle>Tous les plans</CardTitle>
              <CardDescription>Liste complète des plans d'abonnement</CardDescription>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Aucun plan d'abonnement</p>
                  <p className="text-sm mt-2">Commencez par créer votre premier plan</p>
                  <Link href="/admin/plans/create" className="inline-block mt-4">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un plan
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Trial</TableHead>
                      <TableHead>Abonnés</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Stripe</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{plan.name}</div>
                            <div className="text-xs text-muted-foreground">{plan.slug}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatPrice(plan.priceMonthly, plan.currency)}/mois
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatPrice(plan.priceYearly, plan.currency)}/an
                          </div>
                        </TableCell>
                        <TableCell>
                          {plan.trialDays ? (
                            <Badge variant="outline">{plan.trialDays} jours</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{plan.activeSubscriptions}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {plan.isActive ? (
                              <Badge variant="default" className="flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Actif
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <X className="h-3 w-3" />
                                Inactif
                              </Badge>
                            )}
                            {plan.isVisible ? (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                Visible
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <EyeOff className="h-3 w-3" />
                                Caché
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {plan.stripeProductId ? (
                            <Badge variant="default">Sync</Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSyncStripe(plan.id)}
                            >
                              Synchroniser
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/plans/${plan.id}`}>
                              <Button variant="ghost" size="sm">
                                Voir
                              </Button>
                            </Link>
                            <Link href={`/admin/plans/${plan.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Éditer
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(plan.id, plan.name)}
                            >
                              Supprimer
                            </Button>
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
      </AdminLayout>
    </>
  )
}

export default PlansIndexPage
