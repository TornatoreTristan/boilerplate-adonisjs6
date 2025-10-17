import { Head } from '@inertiajs/react'
import OrganizationSettingsLayout from '@/components/layouts/organization-settings-layout'

const OrganizationSettingsSubscriptionsPage = () => {
  return (
    <>
      <Head title="Abonnements - Paramètres" />
      <OrganizationSettingsLayout>
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Abonnements</h2>
          <p className="text-sm text-muted-foreground">Contenu à venir...</p>
        </div>
      </OrganizationSettingsLayout>
    </>
  )
}

export default OrganizationSettingsSubscriptionsPage
