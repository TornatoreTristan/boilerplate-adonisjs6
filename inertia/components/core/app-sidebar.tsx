import { Home } from 'lucide-react'
import { usePage } from '@inertiajs/react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NavUser } from './nav-user'
import { OrganizationSwitcher, type Organization } from './organization-switcher'

// Menu items.
const items = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
  },
]

export function AppSidebar() {
  const { auth, organizations } = usePage<{
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
    organizations: {
      current: Organization | null
      list: Organization[]
    } | null
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
      <SidebarHeader>
        {organizations && organizations.list.length > 0 && (
          <OrganizationSwitcher
            organizations={organizations.list}
            currentOrganization={organizations.current}
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Nom de l'app</SidebarGroupLabel>
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
        {userData && <NavUser user={userData} isSuperAdmin={auth.user?.isSuperAdmin} />}
      </SidebarFooter>
    </Sidebar>
  )
}
