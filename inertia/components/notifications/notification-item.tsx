import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'
import { getTranslation } from '@/lib/translatable'
import type { TranslatableField } from '@/lib/translatable'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { Bell, Trash2 } from 'lucide-react'

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    titleI18n: TranslatableField
    messageI18n: TranslatableField
    data: Record<string, any> | null
    readAt: string | null
    createdAt: string
  }
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const { t, locale } = useI18n()
  const typedLocale = (locale || 'fr') as 'fr' | 'en'
  const dateLocale = typedLocale === 'fr' ? fr : enUS

  return (
    <div
      className={`group flex gap-6 p-6 transition-colors border-none ${
        !notification.readAt ? 'bg-accent/10 hover:bg-accent/10' : 'hover:bg-accent/5'
      }`}
    >
      <div className="relative flex-shrink-0">
        {!notification.readAt && (
          <span className="absolute -left-1 -top-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${
            !notification.readAt
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-muted/50 text-muted-foreground'
          }`}
        >
          <Bell className="h-5 w-5" />
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h4
            className={`text-sm font-semibold leading-tight ${!notification.readAt ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {getTranslation(notification.titleI18n, typedLocale)}
          </h4>
          <div className="flex items-center gap-2">
            <time className="text-xs text-muted-foreground/70 whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </time>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(notification.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground/90 leading-relaxed">
          {getTranslation(notification.messageI18n, typedLocale)}
        </p>

        {!notification.readAt && (
          <div className="pt-1">
            <Button
              size="sm"
              className="h-8 text-xs transition-opacity"
              onClick={() => onMarkAsRead(notification.id)}
            >
              {t('notifications.mark_read')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
