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

export interface BreadcrumbItemType {
  label: string
  href?: string
}

interface AppLayoutProps {
  children: ReactNode
  breadcrumbs?: BreadcrumbItemType[]
}

const AppLayout = ({ children, breadcrumbs = [] }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col flex-1 w-full">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
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
        </header>
        <div className="flex-1">{children}</div>
      </main>
    </SidebarProvider>
  )
}

export default AppLayout
