import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import { router } from '@inertiajs/react'

export default function VerifyEmailNotice() {
  const handleResendEmail = () => {
    router.post('/auth/email/resend')
  }

  return (
    <>
      <Head title="Vérifiez votre email" />

      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
              <Mail className="text-primary size-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Vérifiez votre email</h1>
              <p className="text-muted-foreground text-balance">
                Nous avons envoyé un email de vérification à votre adresse.
                <br />
                Cliquez sur le lien dans l'email pour activer votre compte.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm">
                <strong>Vous n'avez pas reçu l'email ?</strong>
                <br />
                Vérifiez votre dossier spam ou demandez un nouvel email.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={handleResendEmail}>
                Renvoyer l'email de vérification
              </Button>

              <Button variant="ghost" asChild>
                <a href="/">Aller à l'accueil</a>
              </Button>
            </div>
          </div>

          <div className="text-muted-foreground text-center text-sm">
            <p>
              L'email expire dans <strong>24 heures</strong>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
