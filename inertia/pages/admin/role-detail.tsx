import AdminLayout from '@/components/layouts/admin-layout'
import { PageHeader } from '@/components/core/page-header'
import { Head, Link } from '@inertiajs/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Key, Lock, FileText } from 'lucide-react'
import { Separator } from '#inertia/components/ui/separator'

interface Role {
  id: string
  name: string
  slug: string
  description: string | null
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

interface Permission {
  id: string
  name: string
  slug: string
  description: string | null
  resource: string
  action: string
}

interface RoleDetailPageProps {
  role: Role
  permissions: Permission[]
}

const getResourceIcon = (resource: string) => {
  return <FileText className="h-4 w-4" />
}

const getActionBadge = (action: string) => {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' }> = {
    read: { variant: 'outline' },
    write: { variant: 'secondary' },
    edit: { variant: 'secondary' },
    delete: { variant: 'default' },
    create: { variant: 'default' },
  }

  const config = variants[action.toLowerCase()] || { variant: 'outline' as const }

  return (
    <Badge variant={config.variant} className="text-xs">
      {action}
    </Badge>
  )
}

const RoleDetailPage = ({ role, permissions }: RoleDetailPageProps) => {
  const permissionsByResource = permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = []
      }
      acc[permission.resource].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>
  )

  return (
    <>
      <Head title={`Rôle - ${role.name}`} />
      <AdminLayout breadcrumbs={[{ label: 'Rôles', href: '/admin/roles' }, { label: role.name }]}>
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/roles">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  {role.isSystem ? (
                    <Lock className="h-6 w-6 text-primary" />
                  ) : (
                    <Shield className="h-6 w-6 text-primary" />
                  )}
                </div>
                <PageHeader
                  title={role.name}
                  description={role.slug}
                  separator={false}
                />
              </div>
            </div>
            {role.isSystem && (
              <Badge variant="default" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Rôle système
              </Badge>
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ID</span>
                    <span className="font-mono text-xs">{role.id}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Slug</span>
                    <span className="font-mono">{role.slug}</span>
                  </div>

                  {role.description && (
                    <div className="flex flex-col gap-2 text-sm">
                      <span className="text-muted-foreground">Description</span>
                      <p className="text-sm">{role.description}</p>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    {role.isSystem ? (
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Système
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Personnalisé
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Créé le</span>
                    <span>
                      {new Intl.DateTimeFormat('fr-FR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(role.createdAt))}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dernière mise à jour</span>
                    <span>
                      {new Intl.DateTimeFormat('fr-FR', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(role.updatedAt))}
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
                  <span className="text-sm text-muted-foreground">Permissions totales</span>
                  <span className="font-semibold">{permissions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Ressources</span>
                  <span className="font-semibold">{Object.keys(permissionsByResource).length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permissions par ressource */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions ({permissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune permission associée à ce rôle
                </p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(permissionsByResource).map(([resource, resourcePermissions]) => (
                    <div key={resource} className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource)}
                        <h4 className="font-medium capitalize">{resource}</h4>
                        <Badge variant="outline" className="ml-auto">
                          {resourcePermissions.length}
                        </Badge>
                      </div>
                      <div className="space-y-2 pl-6">
                        {resourcePermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-start justify-between border border-border/80 rounded-md p-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">{permission.name}</span>
                                {getActionBadge(permission.action)}
                              </div>
                              <p className="text-xs text-muted-foreground pl-6">
                                {permission.slug}
                              </p>
                              {permission.description && (
                                <p className="text-xs text-muted-foreground pl-6">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
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

export default RoleDetailPage
