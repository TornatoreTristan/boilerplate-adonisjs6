import { Head, router } from '@inertiajs/react'
import AppLayout from '@/components/layouts/app-layout'
import { PageHeader } from '@/components/core/page-header'
import { Button } from '@/components/ui/button'

export default function Home() {
  const testNotification = () => {
    router.post(
      '/api/notifications/test',
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          console.log('Test notification sent!')
        },
        onError: (errors) => {
          console.error('Failed to send test notification:', errors)
        },
      }
    )
  }

  return (
    <>
      <Head title="Homepage" />
      <AppLayout>
        <div className="flex flex-col gap-6 p-6">
          <PageHeader title="Bienvenue" />

          <div className="grid gap-4">
            <Button onClick={testNotification}>Test Notification</Button>
          </div>
        </div>
      </AppLayout>
    </>
  )
}
