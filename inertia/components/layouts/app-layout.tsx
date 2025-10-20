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
import { ReactNode, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/core/theme-toggle'
import { useFlashMessages } from '@/hooks/use-flash-messages'
import { SearchCommand } from '@/components/core/search-command'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

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
  const [searchOpen, setSearchOpen] = useState(false)

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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4 xl:mr-2" />
              <span className="hidden xl:inline-flex">Rechercher...</span>
              <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </main>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </SidebarProvider>
  )
}

export default AppLayout
