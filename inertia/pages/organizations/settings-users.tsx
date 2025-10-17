import { Head } from '@inertiajs/react'
import OrganizationSettingsLayout from '@/components/layouts/organization-settings-layout'

const OrganizationSettingsUsersPage = () => {
  return (
    <>
      <Head title="Utilisateurs - Paramètres" />
      <OrganizationSettingsLayout>
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Utilisateurs</h2>
          <p className="text-sm text-muted-foreground">Contenu à venir...</p>
        </div>
      </OrganizationSettingsLayout>
    </>
  )
}

export default OrganizationSettingsUsersPage
