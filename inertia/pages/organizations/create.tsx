import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GalleryVerticalEnd } from 'lucide-react'

export default function CreateOrganization() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    website: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/organizations')
  }

  return (
    <>
      <Head title="Create Organization" />

      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              Acme Inc.
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-center">
                  <h1 className="text-2xl font-bold">Create Your Organization</h1>
                  <p className="text-balance text-muted-foreground text-sm">
                    Let's start by creating your first organization
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Acme Inc."
                      required
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && (
                      <p className="text-destructive text-sm">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="website">Website (optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      value={data.website}
                      onChange={(e) => setData('website', e.target.value)}
                    />
                    {errors.website && (
                      <p className="text-destructive text-sm">{errors.website}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Creating...' : 'Create Organization'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block"></div>
      </div>
    </>
  )
}
