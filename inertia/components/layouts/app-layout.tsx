import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/core/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/core/theme-toggle'
import { useFlashMessages } from '@/hooks/use-flash-messages'

export interface BreadcrumbItemType {
  label: string
  href?: string
}

interface AppLayoutProps {
  children: ReactNode
  breadcrumbs?: BreadcrumbItemType[]
}

const AppLayout = ({ children, breadcrumbs = [] }: AppLayoutProps) => {
  useFlashMessages()

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col flex-1 w-full">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/40 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="font-medium">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {item.href ? (
                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ThemeToggle />
        </header>
        <div className="flex-1">{children}</div>
      </main>
    </SidebarProvider>
  )
}

export default AppLayout
