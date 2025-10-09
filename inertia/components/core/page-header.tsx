import { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'

export interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  separator: boolean
}

export function PageHeader({ title, description, actions, separator }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {separator ? <Separator /> : ''}
    </div>
  )
}
