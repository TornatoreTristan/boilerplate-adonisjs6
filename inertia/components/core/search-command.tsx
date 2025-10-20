import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { useI18n } from '@/hooks/use-i18n'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Home,
  Settings,
  Users,
  Building2,
  CreditCard,
  FileText,
  User,
  Bell,
  LogOut,
  Search,
} from 'lucide-react'

interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const handleSelect = (path: string) => {
    onOpenChange(false)
    router.visit(path)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={t('common.search_placeholder')}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>{t('common.no_results')}</CommandEmpty>

        <CommandGroup heading={t('common.navigation')}>
          <CommandItem onSelect={() => handleSelect('/')}>
            <Home className="mr-2 h-4 w-4" />
            <span>{t('common.home')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/organizations')}>
            <Building2 className="mr-2 h-4 w-4" />
            <span>{t('admin.organizations')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/notifications')}>
            <Bell className="mr-2 h-4 w-4" />
            <span>{t('common.notifications')}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('common.settings')}>
          <CommandItem onSelect={() => handleSelect('/account')}>
            <User className="mr-2 h-4 w-4" />
            <span>{t('common.my_account')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/account/security')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('common.security')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/account/sessions')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>{t('common.active_sessions')}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('common.organization')}>
          <CommandItem onSelect={() => handleSelect('/organizations/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('common.organization_settings')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/organizations/settings/users')}>
            <Users className="mr-2 h-4 w-4" />
            <span>{t('common.user_management')}</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/organizations/settings/subscriptions')}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>{t('common.subscriptions')}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('common.actions')}>
          <CommandItem
            onSelect={() => {
              onOpenChange(false)
              router.post('/logout')
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('auth.logout')}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
