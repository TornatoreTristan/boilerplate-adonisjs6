import AdminLayout from '#inertia/components/layouts/admin-layout'

interface AdminIndexProps {
  user: {
    id: string
    fullName: string | null
    email: string
  }
}

const Index = ({ user }: AdminIndexProps) => {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-lg font-bold">Hello {user.fullName || user.email}</h1>
        <p className="text-muted-foreground mt-2">Bienvenue dans l'interface d'administration</p>
      </div>
    </AdminLayout>
  )
}

export default Index
