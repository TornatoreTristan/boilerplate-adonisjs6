import { Head, router, usePage } from '@inertiajs/react'
import AccountLayout from '@/components/layouts/account-layout'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
import { Monitor, Smartphone, Tablet } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Session {
  id: string
  deviceType: string
  ipAddress: string
  userAgent: string
  location?: string
  lastActiveAt: string
  endedAt?: string
  isCurrent: boolean
  isActive: boolean
}

type TabType = 'active' | 'history'

export default function Sessions() {
  const { activeSessions, inactiveSessions } = usePage<{
    activeSessions: Session[]
    inactiveSessions: Session[]
  }>().props

  const [activeTab, setActiveTab] = useState<TabType>('active')
  const [sessionToDisconnect, setSessionToDisconnect] = useState<string | null>(null)
  const [isDisconnectingAll, setIsDisconnectingAll] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return Smartphone
      case 'tablet':
        return Tablet
      default:
        return Monitor
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  const handleDisconnectSession = () => {
    if (!sessionToDisconnect) return

    setIsProcessing(true)
    router.delete(`/account/sessions/${sessionToDisconnect}`, {
      preserveScroll: true,
      onFinish: () => {
        setIsProcessing(false)
        setSessionToDisconnect(null)
      },
    })
  }

  const handleDisconnectAll = () => {
    setIsProcessing(true)
    router.delete('/account/sessions/others', {
      preserveScroll: true,
      onFinish: () => {
        setIsProcessing(false)
        setIsDisconnectingAll(false)
      },
    })
  }

  const sessions = activeTab === 'active' ? activeSessions : inactiveSessions

  return (
    <>
      <Head title="Mes sessions" />
      <AccountLayout>
        <div className="max-w-2xl space-y-6">
          {/* Onglets */}
          <div className="border-b">
            <nav className="-mb-px flex gap-6">
              <button
                onClick={() => setActiveTab('active')}
                className={cn(
                  'border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                  activeTab === 'active'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                Sessions actives
                {activeSessions.length > 0 && (
                  <span className="bg-secondary text-secondary-foreground ml-2 rounded-full px-2 py-0.5 text-xs">
                    {activeSessions.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={cn(
                  'border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                  activeTab === 'history'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                Historique
                {inactiveSessions.length > 0 && (
                  <span className="bg-secondary text-secondary-foreground ml-2 rounded-full px-2 py-0.5 text-xs">
                    {inactiveSessions.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">
              {activeTab === 'active'
                ? 'Gérez vos sessions actives sur différents appareils'
                : 'Historique de vos 20 dernières sessions fermées'}
            </p>
          </div>

          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
                {activeTab === 'active' ? 'Aucune session active' : 'Aucun historique'}
              </div>
            ) : (
              sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceType)
                return (
                  <div key={session.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="bg-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                          <DeviceIcon className="text-muted-foreground h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{session.userAgent}</p>
                            {session.isCurrent && (
                              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
                                Session actuelle
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {session.ipAddress}
                            {session.location && ` • ${session.location}`}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {session.isActive
                              ? `Dernière activité : ${formatDate(session.lastActiveAt)}`
                              : `Fermée le : ${formatDate(session.endedAt || session.lastActiveAt)}`}
                          </p>
                        </div>
                      </div>
                      {session.isActive && !session.isCurrent && (
                        <AlertDialog
                          open={sessionToDisconnect === session.id}
                          onOpenChange={(open) => {
                            if (!open) setSessionToDisconnect(null)
                          }}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSessionToDisconnect(session.id)}
                            >
                              Déconnecter
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Déconnecter cette session ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette session sera immédiatement déconnectée. L'appareil devra se
                                reconnecter pour accéder à nouveau à votre compte.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDisconnectSession}
                                disabled={isProcessing}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {isProcessing ? 'Déconnexion...' : 'Déconnecter'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                )
              })
            )}
          </div>

          {activeTab === 'active' && activeSessions.length > 1 && (
            <div className="border-destructive/50 space-y-4 rounded-lg border p-4">
              <div>
                <h4 className="text-sm font-medium">Déconnecter toutes les sessions</h4>
                <p className="text-muted-foreground mt-1 text-xs">
                  Cela vous déconnectera de tous les appareils sauf celui-ci
                </p>
              </div>
              <AlertDialog open={isDisconnectingAll} onOpenChange={setIsDisconnectingAll}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Déconnecter tout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Déconnecter toutes les sessions ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Toutes vos sessions actives seront déconnectées, sauf celle-ci. Les autres
                      appareils devront se reconnecter pour accéder à votre compte.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDisconnectAll}
                      disabled={isProcessing}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isProcessing ? 'Déconnexion...' : 'Tout déconnecter'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </AccountLayout>
    </>
  )
}
