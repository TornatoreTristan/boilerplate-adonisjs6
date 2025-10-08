import { usePage } from '@inertiajs/react'
import { useEffect } from 'react'
import { toast } from 'sonner'

interface FlashMessages {
  success?: string
  error?: string
  info?: string
  warning?: string
}

/**
 * Hook pour afficher automatiquement les messages flash depuis le backend
 */
export function useFlashMessages() {
  const { props } = usePage<{ flash?: FlashMessages }>()
  const flash = props.flash

  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success)
    }
    if (flash?.error) {
      toast.error(flash.error)
    }
    if (flash?.info) {
      toast.info(flash.info)
    }
    if (flash?.warning) {
      toast.warning(flash.warning)
    }
  }, [flash])
}
