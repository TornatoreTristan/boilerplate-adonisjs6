import { Head } from '@inertiajs/react'
import AppLayout from '@/components/layouts/app-layout'
import { PageHeader } from '@/components/core/page-header'

export default function Home() {
  return (
    <>
      <Head title="Homepage" />
      <AppLayout>
        <div className="flex flex-col gap-6 p-6">
          <PageHeader title="Bienvenue" />

          <div className="grid gap-4"></div>
        </div>
      </AppLayout>
    </>
  )
}
