import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
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
        placeholder="Rechercher dans l'application..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect('/')}>
            <Home className="mr-2 h-4 w-4" />
            <span>Accueil</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/organizations')}>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Organisations</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/notifications')}>
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Paramètres">
          <CommandItem onSelect={() => handleSelect('/account')}>
            <User className="mr-2 h-4 w-4" />
            <span>Mon compte</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/account/security')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Sécurité</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/account/sessions')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Sessions actives</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Organisation">
          <CommandItem onSelect={() => handleSelect('/organizations/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres de l'organisation</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/organizations/settings/users')}>
            <Users className="mr-2 h-4 w-4" />
            <span>Gestion des utilisateurs</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/organizations/settings/subscriptions')}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Abonnements</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              onOpenChange(false)
              router.post('/logout')
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Se déconnecter</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
