import { useI18n } from '@/hooks/use-i18n'
import { Inbox } from 'lucide-react'
import { NotificationItem } from './notification-item'
import type { TranslatableField } from '@/lib/translatable'
import { format, isToday, isYesterday, startOfDay } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

interface Notification {
  id: string
  type: string
  titleI18n: TranslatableField
  messageI18n: TranslatableField
  data: Record<string, any> | null
  readAt: string | null
  createdAt: string
}

interface NotificationsListProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationsList({
  notifications,
  onMarkAsRead,
  onDelete,
}: NotificationsListProps) {
  const { t, locale } = useI18n()
  const typedLocale = (locale || 'fr') as 'fr' | 'en'
  const dateLocale = typedLocale === 'fr' ? fr : enUS

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted/50 p-6 mb-4">
          <Inbox className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground">{t('notifications.empty')}</p>
      </div>
    )
  }

  // Grouper les notifications par jour
  const groupedByDay = notifications.reduce(
    (groups, notification) => {
      const date = startOfDay(new Date(notification.createdAt))
      const dateKey = date.toISOString()

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date,
          notifications: [],
        }
      }

      groups[dateKey].notifications.push(notification)
      return groups
    },
    {} as Record<string, { date: Date; notifications: Notification[] }>
  )

  // Trier les groupes par date (plus récent en premier)
  const sortedGroups = Object.values(groupedByDay).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )

  const formatDateHeader = (date: Date): string => {
    if (isToday(date)) {
      return typedLocale === 'fr' ? "Aujourd'hui" : 'Today'
    }
    if (isYesterday(date)) {
      return typedLocale === 'fr' ? 'Hier' : 'Yesterday'
    }
    return format(date, 'EEEE d MMMM yyyy', { locale: dateLocale })
  }

  return (
    <div className="space-y-6">
      {sortedGroups.map((group) => (
        <div key={group.date.toISOString()}>
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2 mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {formatDateHeader(group.date)}
            </h3>
          </div>
          <div className="divide-y rounded-lg">
            {group.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
