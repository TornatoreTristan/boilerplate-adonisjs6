import { Toaster } from '@/components/ui/sonner'

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
