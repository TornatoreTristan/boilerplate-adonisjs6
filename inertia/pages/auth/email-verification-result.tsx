import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle } from 'lucide-react'

interface EmailVerificationResultProps {
  success: boolean
  error?: string
}

export default function EmailVerificationResult({
  success,
  error,
}: EmailVerificationResultProps) {
  return (
    <>
      <Head title={success ? 'Email vérifié' : 'Erreur de vérification'} />

      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-4 text-center">
            {success ? (
              <>
                <div className="bg-green-500/10 flex size-16 items-center justify-center rounded-full">
                  <CheckCircle2 className="size-8 text-green-500" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Email vérifié !</h1>
                  <p className="text-muted-foreground text-balance">
                    Votre adresse email a été vérifiée avec succès.
                    <br />
                    Vous allez être redirigé vers l'accueil...
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-destructive/10 flex size-16 items-center justify-center rounded-full">
                  <XCircle className="text-destructive size-8" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Erreur de vérification</h1>
                  <p className="text-muted-foreground text-balance">
                    {error || 'Une erreur est survenue lors de la vérification de votre email.'}
                  </p>
                </div>

                <div className="bg-muted w-full rounded-lg p-4">
                  <p className="text-sm">
                    <strong>Que faire ?</strong>
                    <br />
                    • Le lien peut avoir expiré (valide 24h)
                    <br />
                    • Le lien a déjà été utilisé
                    <br />• Demandez un nouveau lien de vérification
                  </p>
                </div>

                <div className="flex w-full flex-col gap-2">
                  <Button asChild>
                    <a href="/login">Retour à la connexion</a>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
