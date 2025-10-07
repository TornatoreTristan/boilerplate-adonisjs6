import { Home } from 'lucide-react'
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

// Menu items.
const items = [
  {
    title: 'Home',
    url: '/',
    icon: Home,
  },
]

export function AppSidebar() {
  const { auth } = usePage<{
    auth: {
      user: {
        id: string
        fullName: string | null
        email: string
        avatarUrl: string | null
        isEmailVerified: boolean
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
      <SidebarFooter>{userData && <NavUser user={userData} />}</SidebarFooter>
    </Sidebar>
  )
}
