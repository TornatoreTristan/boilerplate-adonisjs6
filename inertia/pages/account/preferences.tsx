import { Head } from '@inertiajs/react'
import AccountLayout from '@/components/layouts/account-layout'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

export default function Preferences() {
  const { theme, setTheme } = useTheme()

  return (
    <>
      <Head title="Mes préférences" />
      <AccountLayout>
        <div className="max-w-2xl space-y-10">
          {/* Thème */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium">Apparence</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Personnalisez l'apparence de l'interface
              </p>
            </div>

            <div className="grid gap-3">
              <Label>Thème</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                    theme === 'light'
                      ? 'border-primary bg-secondary'
                      : 'border-transparent hover:bg-secondary/50'
                  )}
                >
                  <Sun className="h-5 w-5" />
                  <span className="text-sm font-medium">Clair</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                    theme === 'dark'
                      ? 'border-primary bg-secondary'
                      : 'border-transparent hover:bg-secondary/50'
                  )}
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-sm font-medium">Sombre</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                    theme === 'system'
                      ? 'border-primary bg-secondary'
                      : 'border-transparent hover:bg-secondary/50'
                  )}
                >
                  <Monitor className="h-5 w-5" />
                  <span className="text-sm font-medium">Système</span>
                </button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium">Notifications</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Gérez vos préférences de notifications
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications par email</Label>
                  <p className="text-muted-foreground text-xs">
                    Recevoir des emails pour les mises à jour importantes
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Activé
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications push</Label>
                  <p className="text-muted-foreground text-xs">
                    Recevoir des notifications dans le navigateur
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Désactivé
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouvelles fonctionnalités</Label>
                  <p className="text-muted-foreground text-xs">
                    Être notifié des nouvelles fonctionnalités
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Activé
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Communication */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium">Communication</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Gérez vos préférences de communication
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Newsletter</Label>
                  <p className="text-muted-foreground text-xs">
                    Recevoir la newsletter hebdomadaire
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Activé
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Conseils et astuces</Label>
                  <p className="text-muted-foreground text-xs">
                    Recevoir des conseils pour mieux utiliser l'application
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Désactivé
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Offres promotionnelles</Label>
                  <p className="text-muted-foreground text-xs">
                    Recevoir des offres et promotions exclusives
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Désactivé
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Langue */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium">Langue et région</h3>
              <p className="text-muted-foreground mt-1 text-sm">Personnalisez votre langue</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="language">Langue</Label>
              <select
                id="language"
                className="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <Button className="w-fit">Enregistrer</Button>
          </div>
        </div>
      </AccountLayout>
    </>
  )
}
