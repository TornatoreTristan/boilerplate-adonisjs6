import { Toaster } from '@/components/ui/sonner'
import { useEffect, useState } from 'react'

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <>
      {children}
      {isMounted && <Toaster />}
    </>
  )
}
