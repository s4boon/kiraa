import { cn, toProperCase } from '@/lib/utils'
import { BookingModelType, RoomModelType, TenantModelType } from '@shared/types'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { isInRange, isSameDay, isToday, toHalfDate, useCalendar } from './context/calendar_context'

type BookingWithTenant = {
  data: BookingModelType
  tenant: TenantModelType
}

type CalendarProps = {
  room: RoomModelType
  bookings: BookingWithTenant[]
}

type CalendarCell = {
  date: Date
  isCurrentMonth: boolean
}

const WEEKDAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

function buildCalendar(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1)
  const offset = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7

  const cells: CalendarCell[] = []
  for (let i = 0; i < totalCells; i++) {
    const date = new Date(year, month, 1 - offset + i)
    cells.push({ date, isCurrentMonth: date.getMonth() === month })
  }
  return cells
}

function assignColor(id: number) {
  const hue = (id * 137.508) % 360
  return `hsl(${hue}, 70%, 60%)`
}

const SELECTION_COLOR = 'text-black bg-teal-300'

export default function Calendar({ room, bookings }: CalendarProps) {
  const {
    calendarState,
    selectedDate,
    setSelectedDate,
    startSelection,
    endSelection,
    hoveredHalf,
    enterDisplay,
    enterSelect,
    selectHalf,
    hoverHalf,
    clearHover,
    clearSelection
  } = useCalendar()

  useEffect(() => {
    clearSelection()
  }, [room])

  const [current, setCurrent] = useState(() => new Date())

  const bookings_ = bookings.map((b) => ({ ...b, color: assignColor(b.data.id) }))

  const cells = useMemo(() => buildCalendar(current.getFullYear(), current.getMonth()), [current])

  const [rangeFrom, rangeTo] = useMemo((): [Date, Date] | [undefined, undefined] => {
    const firstSelection =
      calendarState.mode === 'select' ? calendarState.firstSelection : undefined

    if (firstSelection && hoveredHalf) {
      return firstSelection.getTime() <= hoveredHalf.getTime()
        ? [firstSelection, hoveredHalf]
        : [hoveredHalf, firstSelection]
    }
    if (startSelection && endSelection) {
      return [startSelection, endSelection]
    }
    return [undefined, undefined]
  }, [calendarState, hoveredHalf, startSelection, endSelection])

  function handleHalfClick(date: Date, half: 'AM' | 'PM', booked: boolean) {
    if (calendarState.mode === 'display') {
      setSelectedDate(date)
      return
    }
    if (calendarState.mode === 'select') {
      if (booked) return
      selectHalf(date, half)
    }
  }

  function toggleState() {
    if (calendarState.mode === 'display') enterSelect()
    else enterDisplay()
  }

  return (
    <div dir="ltr" className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex gap-x-1 items-center [&>button]:cursor-pointer">
          <button
            onClick={() => setCurrent((d) => new Date(d.getFullYear() - 1, d.getMonth(), 1))}
            className="p-1 border rounded"
          >
            <ChevronsLeft className="size-4" />
          </button>
          <button
            onClick={() => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="p-1 border rounded"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="p-1 border rounded"
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            onClick={() => setCurrent((d) => new Date(d.getFullYear() + 1, d.getMonth(), 1))}
            className="p-1 border rounded"
          >
            <ChevronsRight className="size-4" />
          </button>
        </div>

        <div className="font-semibold">
          {toProperCase(current.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }))}
        </div>

        <button onClick={toggleState}>
          {calendarState.mode === 'display' ? (
            <Edit className="size-4" />
          ) : (
            <X className="size-4" />
          )}
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 text-sm font-medium">
        {WEEKDAYS_FR.map((d) => (
          <div key={d} className="text-center py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        className="grid flex-1 gap-1 grid-cols-7"
        style={{ gridTemplateRows: `repeat(${cells.length / 7}, minmax(0, 1fr))` }}
        onMouseLeave={clearHover}
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

          const amInRange = rangeFrom && rangeTo && isInRange(amDate, rangeFrom, rangeTo)
          const pmInRange = rangeFrom && rangeTo && isInRange(pmDate, rangeFrom, rangeTo)

          const firstSelection =
            calendarState.mode === 'select' ? calendarState.firstSelection : undefined
          const isAnchorAM = firstSelection && firstSelection.getTime() === amDate.getTime()
          const isAnchorPM = firstSelection && firstSelection.getTime() === pmDate.getTime()

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
                  onClick={() =>
                    !disabled && handleHalfClick(cell.date, 'AM', amBooking != undefined)
                  }
                  onMouseEnter={() => !disabled && !amBooking && hoverHalf(cell.date, 'AM')}
                  style={
                    amBooking && {
                      background: amBooking.color
                    }
                  }
                  className={cn(
                    'flex-1 h-full',
                    disabled ? 'cursor-default' : 'cursor-pointer',
                    calendarState.mode == 'select' && 'hover:brightness-110',
                    amBooking ? amBooking.color : amInRange && SELECTION_COLOR,
                    isAnchorAM && 'ring-2 ring-inset ring-teal-500'
                  )}
                />
                {/* PM — right half */}
                <div
                  onClick={() =>
                    !disabled && handleHalfClick(cell.date, 'PM', pmBooking != undefined)
                  }
                  onMouseEnter={() => !disabled && !pmBooking && hoverHalf(cell.date, 'PM')}
                  style={
                    pmBooking && {
                      background: pmBooking.color
                    }
                  }
                  className={cn(
                    'flex-1 h-full',
                    disabled ? 'cursor-default' : 'cursor-pointer',
                    calendarState.mode == 'select' && 'hover:brightness-110',
                    pmBooking ? pmBooking.color : pmInRange && SELECTION_COLOR,
                    isAnchorPM && 'ring-2 ring-inset ring-teal-500'
                  )}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
