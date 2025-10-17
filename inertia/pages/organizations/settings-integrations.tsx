import { Head } from '@inertiajs/react'
import OrganizationSettingsLayout from '@/components/layouts/organization-settings-layout'

const OrganizationSettingsIntegrationsPage = () => {
  return (
    <>
      <Head title="Integrations - Paramètres" />
      <OrganizationSettingsLayout>
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Integrations</h2>
          <p className="text-sm text-muted-foreground">Contenu à venir...</p>
        </div>
      </OrganizationSettingsLayout>
    </>
  )
}

export default OrganizationSettingsIntegrationsPage
