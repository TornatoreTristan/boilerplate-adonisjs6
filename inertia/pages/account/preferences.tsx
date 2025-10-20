import { Head } from '@inertiajs/react'
import AccountLayout from '@/components/layouts/account-layout'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'

export default function Preferences() {
  const { t } = useI18n()
  const { theme, setTheme } = useTheme()

  return (
    <>
      <Head title={t('account.preferences.title')} />
      <AccountLayout>
        <div className="max-w-2xl space-y-10">
          {/* Thème */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium">{t('account.preferences.appearance')}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('account.preferences.appearance_description')}
              </p>
            </div>

            <div className="grid gap-3">
              <Label>{t('account.preferences.theme')}</Label>
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
                  <span className="text-sm font-medium">{t('account.preferences.light')}</span>
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
                  <span className="text-sm font-medium">{t('account.preferences.dark')}</span>
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
                  <span className="text-sm font-medium">{t('account.preferences.system')}</span>
                </button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium">{t('account.preferences.notifications')}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('account.preferences.notifications_description')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('account.preferences.email_notifications')}</Label>
                  <p className="text-muted-foreground text-xs">
                    {t('account.preferences.email_notifications_description')}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('account.preferences.enabled')}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('account.preferences.push_notifications')}</Label>
                  <p className="text-muted-foreground text-xs">
                    {t('account.preferences.push_notifications_description')}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('account.preferences.disabled')}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('account.preferences.new_features')}</Label>
                  <p className="text-muted-foreground text-xs">
                    {t('account.preferences.new_features_description')}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('account.preferences.enabled')}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Communication */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium">{t('account.preferences.communication')}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('account.preferences.communication_description')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('account.preferences.newsletter')}</Label>
                  <p className="text-muted-foreground text-xs">
                    {t('account.preferences.newsletter_description')}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('account.preferences.enabled')}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('account.preferences.tips_and_tricks')}</Label>
                  <p className="text-muted-foreground text-xs">
                    {t('account.preferences.tips_and_tricks_description')}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('account.preferences.disabled')}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('account.preferences.promotional_offers')}</Label>
                  <p className="text-muted-foreground text-xs">
                    {t('account.preferences.promotional_offers_description')}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('account.preferences.disabled')}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Langue */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium">{t('account.preferences.language_region')}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{t('account.preferences.language_region_description')}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="language">{t('account.preferences.language')}</Label>
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

            <Button className="w-fit">{t('account.preferences.save')}</Button>
          </div>
        </div>
      </AccountLayout>
    </>
  )
}
