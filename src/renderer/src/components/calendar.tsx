import { RoomModelType } from '@shared/types'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CalendarDisplay } from './calendar_display'
import { CalendarEdit } from './calendar_edit'
import { BookingWithTenant, CalendarCell } from './calendar_grid'
import { CalendarSelect } from './calendar_select'
import { useCalendar } from './context/calendar_context'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'

type CalendarProps = {
  room: RoomModelType
  bookings: BookingWithTenant[]
}

const WEEKDAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

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

export default function Calendar({ room, bookings }: CalendarProps) {
  const { calendarState, enterDisplay, enterSelect, clearSelection } = useCalendar()

  useEffect(() => {
    clearSelection()
  }, [room])

  const [current, setCurrent] = useState(() => new Date())

  const cells = useMemo(() => buildCalendar(current.getFullYear(), current.getMonth()), [current])

  function toggleState() {
    if (calendarState.mode === 'display') enterSelect()
    else enterDisplay()
  }

  return (
    <div dir="ltr" className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex gap-x-1 items-center [&>button]:cursor-pointer">
          <Button
            variant={'ghost'}
            size={'icon'}
            onClick={() => setCurrent((d) => new Date(d.getFullYear() - 1, d.getMonth(), 1))}
            className="p-1 border rounded"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant={'ghost'}
            size={'icon'}
            onClick={() => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="p-1 border rounded"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant={'ghost'}
            size={'icon'}
            onClick={() => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="p-1 border rounded"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant={'ghost'}
            size={'icon'}
            onClick={() => setCurrent((d) => new Date(d.getFullYear() + 1, d.getMonth(), 1))}
            className="p-1 border rounded"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>

        <div dir="rtl" className="font-semibold flex space-x-1.5">
          <div>{current.toLocaleDateString('ar-DZ', { month: 'long' })}</div>
          <div>{current.toLocaleString('ar-DZ', { year: 'numeric' })}</div>
        </div>

        {calendarState.mode === 'display' ? (
          <Button className="cursor-pointer w-fit p" onClick={toggleState}>
            حجز جديد
            <Plus className="size-4" />
          </Button>
        ) : (
          <Button onClick={enterDisplay}>
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 text-sm font-medium">
        {WEEKDAYS_AR.map((d) => (
          <div key={d} className="text-center py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Mode-specific grid */}
      {calendarState.mode === 'display' ? (
        <CalendarDisplay cells={cells} bookings={bookings} />
      ) : calendarState.mode === 'select' ? (
        <CalendarSelect cells={cells} bookings={bookings} />
      ) : (
        <CalendarEdit cells={cells} bookings={bookings} />
      )}
    </div>
  )
}

function MonthSelect({ current }: { current: Date }) {
  return (
    <Select>
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
