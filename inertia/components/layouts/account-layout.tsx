import { ReactNode } from 'react'
import { Link, usePage } from '@inertiajs/react'
import AppLayout from '@/components/layouts/app-layout'
import { PageHeader } from '@/components/core/page-header'
import { User, Monitor, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccountLayoutProps {
  children: ReactNode
}

const menuItems = [
  {
    title: 'Mes informations',
    href: '/account/profile',
    icon: User,
  },
  {
    title: 'Mes sessions',
    href: '/account/sessions',
    icon: Monitor,
  },
  {
    title: 'Mes préférences',
    href: '/account/preferences',
    icon: Settings,
  },
]

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { url } = usePage()
  const currentPath = url

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-6">
        <PageHeader title="Mon compte" description="Gérez vos informations et vos préférences" />

        <div className="flex gap-6">
          {/* Menu de navigation */}
          <nav className="w-48 shrink-0">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = currentPath === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-secondary text-secondary-foreground font-medium'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Contenu */}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </AppLayout>
  )
}
