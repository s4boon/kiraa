import { cn } from '@/lib/utils'
import { BookingModelType, TenantModelType } from '@shared/types'
import { isSameDay, isToday, toHalfDate } from './context/calendar_context'

export type BookingWithTenant = {
  data: BookingModelType
  tenant: TenantModelType
}

export type CalendarCell = {
  date: Date
  isCurrentMonth: boolean
}

export type HalfSlotStyle = {
  className?: string
  style?: React.CSSProperties
  anchor?: boolean
}

export type CalendarGridProps = {
  cells: CalendarCell[]
  bookings: BookingWithTenant[]
  selectedDate?: Date
  getHalfStyle: (
    date: Date,
    half: 'AM' | 'PM',
    booking: (BookingWithTenant & { color: string }) | undefined
  ) => HalfSlotStyle
  onHalfClick: (date: Date, half: 'AM' | 'PM', booking: BookingWithTenant | undefined) => void
  onHalfEnter?: (date: Date, half: 'AM' | 'PM', booking: BookingWithTenant | undefined) => void
  onMouseLeave?: () => void
}

export function assignColor(id: number): string {
  const hue = (id * 137.508) % 360
  return `hsl(${hue}, 70%, 60%)`
}

export function CalendarGrid({
  cells,
  bookings,
  selectedDate,
  getHalfStyle,
  onHalfClick,
  onHalfEnter,
  onMouseLeave
}: CalendarGridProps) {
  const bookings_ = bookings.map((b) => ({
    ...b,
    color: assignColor(b.data.id!)
  }))

  return (
    <div
      className="grid flex-1 gap-1 grid-cols-7"
      style={{ gridTemplateRows: `repeat(${cells.length / 7}, minmax(0, 1fr))` }}
      onMouseLeave={onMouseLeave}
    >
      {cells.map((cell) => {
        const amDate = toHalfDate(cell.date, 'AM')
        const pmDate = toHalfDate(cell.date, 'PM')

        const amBooking = bookings_.find(
          (b) =>
            b.data.startDate.getTime() <= amDate.getTime() &&
            amDate.getTime() <= b.data.endDate.getTime()
        )
        const pmBooking = bookings_.find(
          (b) =>
            b.data.startDate.getTime() <= pmDate.getTime() &&
            pmDate.getTime() <= b.data.endDate.getTime()
        )

        const amStyle = getHalfStyle(cell.date, 'AM', amBooking)
        const pmStyle = getHalfStyle(cell.date, 'PM', pmBooking)
        const disabled = !cell.isCurrentMonth

        return (
          <div
            key={cell.date.toISOString()}
            className={cn(
              'border rounded-md text-sm relative overflow-hidden',
              !cell.isCurrentMonth && 'opacity-50',
              disabled ? 'bg-muted text-muted-foreground' : 'bg-background',
              isToday(cell.date) && 'border-b-chart-4 border-b-2',
              selectedDate && isSameDay(cell.date, selectedDate) && 'border-chart-4'
            )}
          >
            <span className="absolute top-2 left-2 flex items-center justify-center text-lg font-medium pointer-events-none z-10 select-none">
              {cell.date.getDate()}
            </span>

            <div className="flex h-full">
              {/* AM — left half */}
              <div
                onClick={() => !disabled && onHalfClick(cell.date, 'AM', amBooking)}
                onMouseEnter={() => !disabled && onHalfEnter?.(cell.date, 'AM', amBooking)}
                style={amStyle.style}
                className={cn(
                  'flex-1 h-full',
                  disabled ? 'cursor-default' : 'cursor-pointer',
                  amStyle.className,
                  amStyle.anchor && 'ring-2 ring-inset ring-teal-500'
                )}
              />
              {/* PM — right half */}
              <div
                onClick={() => !disabled && onHalfClick(cell.date, 'PM', pmBooking)}
                onMouseEnter={() => !disabled && onHalfEnter?.(cell.date, 'PM', pmBooking)}
                style={pmStyle.style}
                className={cn(
                  'flex-1 h-full',
                  disabled ? 'cursor-default' : 'cursor-pointer',
                  pmStyle.className,
                  pmStyle.anchor && 'ring-2 ring-inset ring-teal-500'
                )}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
