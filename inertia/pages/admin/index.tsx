import AdminLayout from '@/components/layouts/admin-layout'
import { PageHeader } from '@/components/core/page-header'
import { Head } from '@inertiajs/react'

interface AdminIndexProps {
  user: {
    id: string
    fullName: string | null
    email: string
  }
}

const Index = ({ user }: AdminIndexProps) => {
  return (
    <>
      <Head title="Administration" />
      <AdminLayout>
        <div className="flex flex-col gap-6 p-6">
          <PageHeader
            title="Administration"
            description={`Bienvenue ${user.fullName || user.email}`}
          />

          <div className="grid gap-4">
            {/* Contenu de l'administration */}
          </div>
        </div>
      </AdminLayout>
    </>
  )
}

export default Index
