import { Head, Link } from '@inertiajs/react'
import AppLayout from '@/components/layouts/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface Props {
  sessionId?: string
}

const SubscriptionSuccessPage = ({ sessionId }: Props) => {
  return (
    <>
      <Head title="Abonnement activé avec succès" />
      <AppLayout>
        <div className="flex items-center justify-center min-h-[80vh] p-6">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">Abonnement activé avec succès !</CardTitle>
              <CardDescription>
                Votre paiement a été traité avec succès. Vous avez maintenant accès à toutes les
                fonctionnalités de votre plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionId && (
                <div className="text-sm text-muted-foreground text-center">
                  ID de session : <code className="text-xs">{sessionId}</code>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full" size="lg">
                  <Link href="/organizations/settings/subscriptions">
                    Voir mon abonnement
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">Retour à l'accueil</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </>
  )
}

export default SubscriptionSuccessPage
