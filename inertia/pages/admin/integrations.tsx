import AdminLayout from '@/components/layouts/admin-layout'
import { PageHeader } from '@/components/core/page-header'
import { Head, router, Link } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plug, CheckCircle2, Settings, LogOut } from 'lucide-react'
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

interface StripeConfig {
  isActive: boolean
  publicKey: string
  hasSecretKey: boolean
  hasWebhookSecret: boolean
}

interface IntegrationsPageProps {
  stripe: StripeConfig | null
}

interface Integration {
  id: string
  name: string
  description: string
  category: string
  isConnected: boolean
  icon: string
  iconBg: string
}

const IntegrationsPage = ({ stripe }: IntegrationsPageProps) => {
  const integrations: Integration[] = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Acceptez les paiements et gérez vos abonnements avec Stripe',
      category: 'Paiement',
      isConnected: stripe?.isActive || false,
      icon: '💳',
      iconBg: 'bg-blue-100 dark:bg-blue-900',
    },
  ]

  const categories = [...new Set(integrations.map((int) => int.category))]

  const connectedCount = integrations.filter((int) => int.isConnected).length

  const handleDisconnect = () => {
    router.post('/admin/integrations/stripe/disconnect')
  }

  return (
    <>
      <Head title="Intégrations" />
      <AdminLayout breadcrumbs={[{ label: 'Intégrations' }]}>
        <div className="flex flex-col gap-6 p-6">
          <PageHeader
            title="Intégrations"
            description={`Connectez vos outils préférés • ${connectedCount} sur ${integrations.length} active${connectedCount > 1 ? 's' : ''}`}
            icon={Plug}
          />

          {categories.map((category) => {
            const categoryIntegrations = integrations.filter((int) => int.category === category)
            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <Badge variant="outline">{categoryIntegrations.length}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryIntegrations.map((integration) => (
                    <Card key={integration.id} className="relative overflow-hidden">
                      {integration.isConnected && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="default" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Connecté
                          </Badge>
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${integration.iconBg}`}
                          >
                            {integration.icon}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <CardDescription className="mt-1 text-xs">
                              {integration.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          {integration.isConnected ? (
                            <>
                              <div className="flex-1 space-y-2">
                                <div className="text-xs text-muted-foreground">
                                  Clé publique: {stripe?.publicKey}
                                </div>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Déconnecter
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Déconnecter Stripe</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir déconnecter votre compte Stripe ? Vous
                                      devrez vous reconnecter pour accepter des paiements.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDisconnect}>
                                      Déconnecter
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          ) : (
                            <Link
                              href="/admin/integrations/stripe/connect"
                              className="w-full"
                            >
                              <Button size="sm" className="w-full">
                                <Plug className="mr-2 h-4 w-4" />
                                Connect with Stripe
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Vous ne trouvez pas votre intégration ?</CardTitle>
              <CardDescription>
                Contactez-nous pour suggérer une nouvelle intégration ou découvrez comment créer
                votre propre connecteur personnalisé.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Suggérer une intégration
                </Button>
                <Button variant="ghost" size="sm">
                  Documentation API
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  )
}

export default IntegrationsPage
