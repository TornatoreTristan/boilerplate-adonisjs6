import AdminLayout from '@/components/layouts/admin-layout'
import { PageHeader } from '@/components/core/page-header'
import { Head, Link, useForm } from '@inertiajs/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Monitor,
  Smartphone,
  Tablet,
  Pencil,
  Save,
  X,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState } from 'react'
import { toast } from 'sonner'
import { Separator } from '#inertia/components/ui/separator'

interface User {
  id: string
  fullName: string | null
  email: string
  avatarUrl: string | null
  googleId: string | null
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface Session {
  id: string
  ipAddress: string
  userAgent: string
  startedAt: string
  lastActivity: string
  endedAt: string | null
  isActive: boolean
  country: string | null
  city: string | null
  deviceType: string | null
  os: string | null
  browser: string | null
}

interface UserDetailPageProps {
  user: User
  sessions: Session[]
}

const getDeviceIcon = (deviceType: string | null) => {
  if (!deviceType) return <Monitor className="h-4 w-4" />
  if (deviceType.toLowerCase().includes('mobile')) return <Smartphone className="h-4 w-4" />
  if (deviceType.toLowerCase().includes('tablet')) return <Tablet className="h-4 w-4" />
  return <Monitor className="h-4 w-4" />
}

const UserDetailPage = ({ user, sessions }: UserDetailPageProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const { data, setData, put, processing, errors } = useForm({
    fullName: user.fullName || '',
    email: user.email,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(`/admin/users/${user.id}`, {
      onSuccess: () => {
        setIsEditing(false)
        toast.success('Utilisateur mis à jour avec succès')
      },
      onError: () => {
        toast.error('Erreur lors de la mise à jour')
      },
    })
  }

  return (
    <>
      <Head title={`Utilisateur - ${user.fullName || user.email}`} />
      <AdminLayout
        breadcrumbs={[
          { label: 'Utilisateurs', href: '/admin/users' },
          { label: user.fullName || user.email },
        ]}
      >
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/users">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <PageHeader
                title={user.fullName || 'Sans nom'}
                description={user.email}
                separator={false}
              />
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={processing}>
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={processing}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              </div>
            )}
          </div>
          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatarUrl || ''} alt={user.fullName || ''} />
                    <AvatarFallback>
                      {user.fullName
                        ? user.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                        : user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={data.fullName}
                          onChange={(e) => setData('fullName', e.target.value)}
                          placeholder="Nom complet"
                        />
                        {errors.fullName && (
                          <p className="text-sm text-destructive">{errors.fullName}</p>
                        )}
                      </div>
                    ) : (
                      <p className="font-medium">{user.fullName || 'Sans nom'}</p>
                    )}
                    {isEditing ? (
                      <div className="space-y-2 mt-2">
                        <Input
                          value={data.email}
                          onChange={(e) => setData('email', e.target.value)}
                          placeholder="Email"
                          type="email"
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ID</span>
                    <span className="font-mono">{user.id}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type de compte</span>
                    {user.googleId ? (
                      <Badge variant="secondary">Google</Badge>
                    ) : (
                      <Badge variant="outline">Email</Badge>
                    )}
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email vérifié</span>
                    {user.isEmailVerified ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Oui</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-600">
                        <XCircle className="h-4 w-4" />
                        <span>Non</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Inscription</span>
                    <span>
                      {new Intl.DateTimeFormat('fr-FR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(user.createdAt))}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dernière mise à jour</span>
                    <span>
                      {new Intl.DateTimeFormat('fr-FR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(user.updatedAt))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sessions totales</span>
                  <span className="font-semibold">{sessions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sessions actives</span>
                  <span className="font-semibold">{sessions.filter((s) => s.isActive).length}</span>
                </div>
                {sessions.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dernière activité</span>
                    <span className="text-sm">
                      Il y a{' '}
                      {formatDistanceToNow(new Date(sessions[0].lastActivity), { locale: fr })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Sessions ({sessions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune session enregistrée
                </p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-start justify-between border border-border/80 rounded-md p-4"
                    >
                      <div className="flex gap-3">
                        <div className="text-muted-foreground mt-1">
                          {getDeviceIcon(session.deviceType)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {session.browser || 'Navigateur inconnu'} sur{' '}
                              {session.os || 'OS inconnu'}
                            </span>
                            {session.isActive && (
                              <Badge variant="secondary" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {session.ipAddress}
                            {session.city && session.country && (
                              <>
                                {' '}
                                · {session.city}, {session.country}
                              </>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dernière activité: Il y a{' '}
                            {formatDistanceToNow(new Date(session.lastActivity), { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  )
}

export default UserDetailPage
