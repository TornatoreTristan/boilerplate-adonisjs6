import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  subMonths,
  subQuarters,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'

export type DateRangePreset =
  | 'all'
  | 'today'
  | 'thisWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'

interface DateRangeFilterProps {
  value?: DateRange
  onChange: (range: DateRange | undefined) => void
  className?: string
}

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  const [preset, setPreset] = useState<DateRangePreset>('all')
  const [date, setDate] = useState<DateRange | undefined>(value)

  const getDateRangeFromPreset = (preset: DateRangePreset): DateRange | undefined => {
    const now = new Date()

    switch (preset) {
      case 'all':
        return undefined
      case 'today':
        return { from: startOfDay(now), to: endOfDay(now) }
      case 'thisWeek':
        return { from: startOfWeek(now, { locale: fr }), to: endOfWeek(now, { locale: fr }) }
      case 'thisMonth':
        return { from: startOfMonth(now), to: endOfMonth(now) }
      case 'lastMonth': {
        const lastMonth = subMonths(now, 1)
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
      }
      case 'thisQuarter':
        return { from: startOfQuarter(now), to: endOfQuarter(now) }
      case 'lastQuarter': {
        const lastQuarter = subQuarters(now, 1)
        return { from: startOfQuarter(lastQuarter), to: endOfQuarter(lastQuarter) }
      }
      default:
        return undefined
    }
  }

  const handlePresetChange = (newPreset: DateRangePreset) => {
    setPreset(newPreset)
    const range = getDateRangeFromPreset(newPreset)
    setDate(range)
    onChange(range)
  }

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      return 'Sélectionner une période'
    }
    if (!range.to) {
      return format(range.from, 'dd MMM yyyy', { locale: fr })
    }
    return `${format(range.from, 'dd MMM', { locale: fr })} - ${format(range.to, 'dd MMM yyyy', { locale: fr })}`
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tout</SelectItem>
          <SelectItem value="today">Aujourd'hui</SelectItem>
          <SelectItem value="thisWeek">Cette semaine</SelectItem>
          <SelectItem value="thisMonth">Ce mois-ci</SelectItem>
          <SelectItem value="lastMonth">Le mois dernier</SelectItem>
          <SelectItem value="thisQuarter">Ce trimestre</SelectItem>
          <SelectItem value="lastQuarter">Le trimestre dernier</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[280px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate)
              onChange(newDate)
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
