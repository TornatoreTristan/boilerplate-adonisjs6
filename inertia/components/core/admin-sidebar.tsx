import { Home, Users, Shield, Settings, Building2, ArrowLeft, Mail } from 'lucide-react'
import { usePage } from '@inertiajs/react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NavUser } from './nav-user'

// Menu items admin
const items = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Home,
  },
  {
    title: 'Utilisateurs',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Emails',
    url: '/admin/mails',
    icon: Mail,
  },
  {
    title: 'Rôles',
    url: '/admin/roles',
    icon: Shield,
  },
  {
    title: 'Organisations',
    url: '/admin/organizations',
    icon: Building2,
  },
  {
    title: 'Paramètres',
    url: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const { auth } = usePage<{
    auth: {
      user: {
        id: string
        fullName: string | null
        email: string
        avatarUrl: string | null
        isEmailVerified: boolean
        isSuperAdmin: boolean
      } | null
    }
  }>().props

  // Mapper les données user pour NavUser
  const userData = auth.user
    ? {
        name: auth.user.fullName || 'Utilisateur',
        email: auth.user.email,
        avatar: auth.user.avatarUrl || '',
      }
    : null

  return (
    <Sidebar>
      <SidebarContent>
        <div>
          <h1 className="p-4 text-sm font-bold">Nom de l'application</h1>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {' '}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/">
                    <ArrowLeft />
                    <span>Retour à l'app</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {userData && <NavUser user={userData} isSuperAdmin={auth.user?.isSuperAdmin} />}
      </SidebarFooter>
    </Sidebar>
  )
}
