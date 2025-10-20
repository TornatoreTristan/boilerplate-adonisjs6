import { Home, Settings } from 'lucide-react'
import { usePage } from '@inertiajs/react'
import { useI18n } from '@/hooks/use-i18n'

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

export function AppSidebar() {
  const { t } = useI18n()
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

  // Menu items
  const items = [
    {
      title: t('common.home'),
      url: '/',
      icon: Home,
    },
  ]

  const organizationItems = [
    {
      title: t('common.settings'),
      url: '/organizations/settings',
      icon: Settings,
    },
  ]

  // Mapper les données user pour NavUser
  const userData = auth.user
    ? {
        name: auth.user.fullName || t('common.user'),
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
          <SidebarGroupLabel>{t('common.application')}</SidebarGroupLabel>
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
        {organizations && organizations.current && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('common.organization')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {organizationItems.map((item) => (
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
        )}
      </SidebarContent>
      <SidebarFooter>
        {userData && <NavUser user={userData} isSuperAdmin={auth.user?.isSuperAdmin} />}
      </SidebarFooter>
    </Sidebar>
  )
}
