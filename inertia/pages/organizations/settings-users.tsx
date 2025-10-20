import { Head, useForm, router } from '@inertiajs/react'
import OrganizationSettingsLayout from '@/components/layouts/organization-settings-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, UserPlus, Trash2, Shield, Clock, X, Eye } from 'lucide-react'
import { useState } from 'react'
import { usePage } from '@inertiajs/react'

interface Member {
  id: string
  fullName: string | null
  email: string
  avatarUrl: string | null
  role: string
  joinedAt: string
}

interface Invitation {
  id: string
  email: string
  role: string
  expiresAt: string
  createdAt: string
}

interface Organization {
  id: string
  name: string
}

interface OrganizationSettingsUsersPageProps {
  organization: Organization
  userRole: string
  members: Member[]
  invitations: Invitation[]
}

const OrganizationSettingsUsersPage = ({
  organization,
  userRole,
  members,
  invitations,
}: OrganizationSettingsUsersPageProps) => {
  const { auth } = usePage().props as any
  const currentUserId = auth?.user?.id

  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    role: 'member',
  })

  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)
  const [memberToView, setMemberToView] = useState<Member | null>(null)
  const [changingRoleFor, setChangingRoleFor] = useState<string | null>(null)

  const canManageMembers = ['owner', 'admin'].includes(userRole)
  const isAdmin = ['owner', 'admin'].includes(userRole)

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/organizations/settings/users/invite', {
      onSuccess: () => reset(),
    })
  }

  const handleRoleChange = (userId: string, newRole: string) => {
    setChangingRoleFor(userId)
    router.put(
      `/organizations/settings/users/${userId}/role`,
      { userId, role: newRole },
      {
        onFinish: () => setChangingRoleFor(null),
      }
    )
  }

  const handleDeleteMember = () => {
    if (!memberToDelete) return

    router.delete(`/organizations/settings/users/${memberToDelete.id}`, {
      data: { userId: memberToDelete.id },
      onFinish: () => setMemberToDelete(null),
    })
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Propriétaire'
      case 'admin':
        return 'Administrateur'
      case 'member':
        return 'Membre'
      default:
        return role
    }
  }

  return (
    <>
      <Head title="Utilisateurs - Paramètres" />
      <OrganizationSettingsLayout>
        <div className="max-w-4xl space-y-8">
          <div>
            <h2 className="text-lg font-semibold">Gestion des utilisateurs</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Invitez et gérez les membres de votre organisation
            </p>
          </div>

          {canManageMembers && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Inviter un membre
                </CardTitle>
                <CardDescription>
                  Invitez des utilisateurs par email, même s'ils n'ont pas encore de compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInviteSubmit} className="flex gap-4">
                  <div className="flex-1 grid gap-2">
                    <Label htmlFor="email">Email de l'utilisateur</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      placeholder="utilisateur@exemple.fr"
                      required
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="w-48 grid gap-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Membre</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="owner">Propriétaire</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label className="invisible">Action</Label>
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Invitation...' : 'Inviter'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {canManageMembers && invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Invitations en attente
                </CardTitle>
                <CardDescription>{invitations.length} invitation(s) en attente</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Expire le</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">{invitation.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(invitation.role)}>
                            {getRoleLabel(invitation.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(invitation.expiresAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (
                                confirm(
                                  `Êtes-vous sûr de vouloir annuler l'invitation pour ${invitation.email} ?`
                                )
                              ) {
                                router.delete(
                                  `/organizations/settings/users/invitations/${invitation.id}`
                                )
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Membres de l'organisation</CardTitle>
              <CardDescription>{members.length} membre(s) actif(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Membre depuis</TableHead>
                    {canManageMembers && <TableHead className="w-[70px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const isCurrentUser = member.id === currentUserId
                    const isChangingRole = changingRoleFor === member.id

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatarUrl || ''} alt={member.fullName || ''} />
                              <AvatarFallback>
                                {member.fullName?.charAt(0) || member.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {member.fullName || member.email}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs text-muted-foreground">(vous)</span>
                                )}
                              </div>
                              {member.fullName && (
                                <div className="text-sm text-muted-foreground">{member.email}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            {getRoleLabel(member.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(member.joinedAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </TableCell>
                        {canManageMembers && (
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isChangingRole}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setMemberToView(member)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir
                                </DropdownMenuItem>
                                {isAdmin && !isCurrentUser && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setMemberToDelete(member)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {!isCurrentUser && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                                      Modifier le rôle
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => handleRoleChange(member.id, 'member')}
                                      disabled={member.role === 'member'}
                                    >
                                      <Shield className="mr-2 h-4 w-4" />
                                      Définir comme Membre
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleRoleChange(member.id, 'admin')}
                                      disabled={member.role === 'admin'}
                                    >
                                      <Shield className="mr-2 h-4 w-4" />
                                      Définir comme Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleRoleChange(member.id, 'owner')}
                                      disabled={member.role === 'owner'}
                                    >
                                      <Shield className="mr-2 h-4 w-4" />
                                      Définir comme Propriétaire
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <AlertDialog open={!!memberToView} onOpenChange={() => setMemberToView(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Détails de l'utilisateur</AlertDialogTitle>
            </AlertDialogHeader>
            {memberToView && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={memberToView.avatarUrl || ''} alt={memberToView.fullName || ''} />
                    <AvatarFallback className="text-xl">
                      {memberToView.fullName?.charAt(0) || memberToView.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{memberToView.fullName || memberToView.email}</h3>
                    <p className="text-sm text-muted-foreground">{memberToView.email}</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium">Rôle</span>
                    <Badge variant={getRoleBadgeVariant(memberToView.role)}>
                      {getRoleLabel(memberToView.role)}
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium">Membre depuis</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(memberToView.joinedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium">ID utilisateur</span>
                    <span className="text-sm text-muted-foreground font-mono">{memberToView.id}</span>
                  </div>
                </div>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Fermer</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir retirer{' '}
                <strong>{memberToDelete?.fullName || memberToDelete?.email}</strong> de
                l'organisation ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteMember} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </OrganizationSettingsLayout>
    </>
  )
}

export default OrganizationSettingsUsersPage
