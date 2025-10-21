import { Home, Users, Shield, Settings, Building2, ArrowLeft, Mail, Plug, CreditCard, Receipt, Activity, FileText, ScrollText } from 'lucide-react'
import { usePage } from '@inertiajs/react'
import { useI18n } from '@/hooks/use-i18n'

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

export function AdminSidebar() {
  const { t } = useI18n()
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

  // Menu items admin
  const items = [
    {
      title: t('admin.dashboard'),
      url: '/admin',
      icon: Home,
    },
    {
      title: t('common.users'),
      url: '/admin/users',
      icon: Users,
    },
    {
      title: t('admin.emails'),
      url: '/admin/mails',
      icon: Mail,
    },
    {
      title: t('admin.roles'),
      url: '/admin/roles',
      icon: Shield,
    },
    {
      title: t('admin.organizations'),
      url: '/admin/organizations',
      icon: Building2,
    },
    {
      title: t('common.subscriptions'),
      url: '/admin/subscriptions',
      icon: Receipt,
    },
    {
      title: t('common.integrations'),
      url: '/admin/integrations',
      icon: Plug,
    },
    {
      title: t('admin.plans'),
      url: '/admin/plans',
      icon: CreditCard,
    },
    {
      title: t('admin.monitoring'),
      url: '/admin/monitoring',
      icon: Activity,
    },
    {
      title: t('admin.logs'),
      url: '/admin/logs',
      icon: FileText,
    },
    {
      title: t('admin.audit_logs.title'),
      url: '/admin/audit-logs',
      icon: ScrollText,
    },
    {
      title: t('common.settings'),
      url: '/admin/settings',
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
      <SidebarContent>
        <div>
          <h1 className="p-4 text-sm font-bold">{t('common.app_name')}</h1>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>{t('common.administration')}</SidebarGroupLabel>
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
                    <span>{t('admin.back_to_app')}</span>
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
