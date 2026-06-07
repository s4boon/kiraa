import { cn, toProperCase } from '@/lib/utils'
import { BookingModelType } from '@shared/types'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { isInRange, toHalfDate, useCalendar } from './context/calendar_context'

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

function dayTimestamp(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function isSameDay(a: Date, b: Date): boolean {
  return dayTimestamp(a) === dayTimestamp(b)
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

const COLORS = ['bg-green-300', 'bg-blue-300', 'bg-yellow-300', 'bg-purple-300']
function color(id: number) {
  return COLORS[id % COLORS.length]
}

const SELECTION_COLOR = 'text-black bg-teal-300'

export default function Calendar({ bookings }: { bookings?: BookingModelType[] }) {
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
    clearHover
  } = useCalendar()

  const [current, setCurrent] = useState(() => new Date())

  const bookings_ = bookings?.map((b) => ({ ...b, color: color(b.id) }))

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

  function handleHalfClick(date: Date, half: 'AM' | 'PM') {
    if (calendarState.mode === 'display') {
      setSelectedDate(date)
      return
    }
    if (calendarState.mode === 'select') {
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

          const amBooking = bookings_?.find(
            (b) =>
              b.startDate.getTime() <= amDate.getTime() && amDate.getTime() <= b.endDate.getTime()
          )
          const pmBooking = bookings_?.find(
            (b) =>
              b.startDate.getTime() <= pmDate.getTime() && pmDate.getTime() <= b.endDate.getTime()
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
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium pointer-events-none z-10 select-none">
                {cell.date.getDate()}
              </span>

              <div className="flex h-full">
                {/* AM — left half */}
                <div
                  onClick={() => !disabled && !amBooking && handleHalfClick(cell.date, 'AM')}
                  onMouseEnter={() => !disabled && !amBooking && hoverHalf(cell.date, 'AM')}
                  className={cn(
                    'flex-1 h-full',
                    disabled || amBooking
                      ? 'cursor-default'
                      : 'cursor-pointer hover:brightness-110',
                    amBooking ? amBooking.color : amInRange ? SELECTION_COLOR : '',
                    isAnchorAM && 'ring-2 ring-inset ring-teal-500'
                  )}
                />
                {/* PM — right half */}
                <div
                  onClick={() => !disabled && !pmBooking && handleHalfClick(cell.date, 'PM')}
                  onMouseEnter={() => !disabled && !pmBooking && hoverHalf(cell.date, 'PM')}
                  className={cn(
                    'flex-1 h-full',
                    disabled || pmBooking
                      ? 'cursor-default'
                      : 'cursor-pointer hover:brightness-110',
                    pmBooking ? pmBooking.color : pmInRange ? SELECTION_COLOR : '',
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
