import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import AppLayout from '@/components/layouts/app-layout'

export default function Home() {
  return (
    <>
      <Head title="Homepage" />
      <AppLayout>
        <div className="flex justify-center items-center p-8">
          <h1 className="text-3xl">Boilerplate</h1>
          <div>
            <Button>test</Button>
          </div>
        </div>
      </AppLayout>
    </>
  )
}
