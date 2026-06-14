import { BookingModelType } from '@shared/types'
import { createContext, ReactNode, useContext, useState } from 'react'

// --- State machine types ---

type DisplayState = { mode: 'display' }
type SelectState = { mode: 'select'; firstSelection?: Date }
type EditState = {
  mode: 'edit'
  booking: BookingModelType
  adjusting?: 'start' | 'end'
}

export type CalendarState = DisplayState | SelectState | EditState

// --- Half-day helpers ---

export function toHalfDate(date: Date, half: 'AM' | 'PM'): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), half === 'AM' ? 0 : 12)
}

export function getHalf(date: Date): 'AM' | 'PM' {
  return date.getHours() < 12 ? 'AM' : 'PM'
}

export function halfBefore(a: Date, b: Date): boolean {
  return a.getTime() <= b.getTime()
}

export function isInRange(date: Date, from: Date, to: Date): boolean {
  return from.getTime() <= date.getTime() && date.getTime() <= to.getTime()
}

export function dayTimestamp(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function isSameDay(a: Date, b: Date): boolean {
  return dayTimestamp(a) === dayTimestamp(b)
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function isDayInRange(date: Date, from: Date, to: Date): boolean {
  const d = dayTimestamp(date)
  return dayTimestamp(from) <= d && d <= dayTimestamp(to)
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

// --- Context ---

type CalendarContextType = {
  calendarState: CalendarState
  selectedDate: Date | undefined
  startSelection: Date | undefined
  endSelection: Date | undefined
  hoveredHalf: Date | undefined

  // transitions
  enterDisplay: () => void
  enterSelect: () => void
  enterEdit: (booking: BookingModelType) => void
  selectHalf: (date: Date, half: 'AM' | 'PM') => void
  hoverHalf: (date: Date, half: 'AM' | 'PM') => void
  grabBoundary: (which: 'start' | 'end') => void
  commitBoundary: (date: Date, half: 'AM' | 'PM') => void
  clearHover: () => void
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>
  clearSelection: () => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [calendarState, setCalendarState] = useState<CalendarState>({ mode: 'display' })
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [startSelection, setStartSelection] = useState<Date | undefined>(undefined)
  const [endSelection, setEndSelection] = useState<Date | undefined>(undefined)
  const [hoveredHalf, setHoveredHalf] = useState<Date | undefined>(undefined)

  function enterDisplay() {
    setCalendarState({ mode: 'display' })
    setStartSelection(undefined)
    setEndSelection(undefined)
    setHoveredHalf(undefined)
  }

  function enterSelect() {
    setCalendarState({ mode: 'select' })
    setStartSelection(undefined)
    setEndSelection(undefined)
    setHoveredHalf(undefined)
  }

  function enterEdit(booking: BookingModelType) {
    setCalendarState({ mode: 'edit', booking })
    setStartSelection(undefined)
    setEndSelection(undefined)
    setHoveredHalf(undefined)
  }

  // --- select mode ---

  function selectHalf(date: Date, half: 'AM' | 'PM') {
    if (calendarState.mode !== 'select') return
    const clicked = toHalfDate(date, half)

    if (!calendarState.firstSelection) {
      setCalendarState({ mode: 'select', firstSelection: clicked })
      return
    }

    // Enforce minimum 1 full day (start must be AM, end must be PM, on different days
    // or same day only if start=AM and end=PM)
    const first = calendarState.firstSelection
    const [tentativeStart, tentativeEnd] = halfBefore(first, clicked)
      ? [first, clicked]
      : [clicked, first]

    // Minimum: start day AM to end day PM — reject if same half on same day
    if (
      isSameDay(tentativeStart, tentativeEnd) &&
      getHalf(tentativeStart) === getHalf(tentativeEnd)
    ) {
      return
    }

    setStartSelection(tentativeStart)
    setEndSelection(tentativeEnd)
    setCalendarState({ mode: 'select' })
    setHoveredHalf(undefined)
  }

  function hoverHalf(date: Date, half: 'AM' | 'PM') {
    if (calendarState.mode === 'select' && calendarState.firstSelection) {
      setHoveredHalf(toHalfDate(date, half))
    }
    if (calendarState.mode === 'edit' && calendarState.adjusting) {
      setHoveredHalf(toHalfDate(date, half))
    }
  }

  // --- edit mode ---

  function grabBoundary(which: 'start' | 'end') {
    if (calendarState.mode !== 'edit') return
    setCalendarState({ ...calendarState, adjusting: which })
    setHoveredHalf(undefined)
  }

  function commitBoundary(date: Date, half: 'AM' | 'PM') {
    if (calendarState.mode !== 'edit' || !calendarState.adjusting) return
    const { booking, adjusting } = calendarState
    const clicked = toHalfDate(date, half)

    const newBooking: BookingModelType = {
      ...booking,
      startDate: adjusting === 'start' ? clicked : booking.startDate,
      endDate: adjusting === 'end' ? clicked : booking.endDate
    }

    setCalendarState({ mode: 'edit', booking: newBooking })
    setHoveredHalf(undefined)
  }

  function clearHover() {
    setHoveredHalf(undefined)
  }

  function clearSelection() {
    setStartSelection(undefined)
    setEndSelection(undefined)
    setHoveredHalf(undefined)
    setCalendarState({ mode: 'display' })
  }

  return (
    <CalendarContext.Provider
      value={{
        calendarState,
        selectedDate,
        startSelection,
        endSelection,
        hoveredHalf,
        enterDisplay,
        enterSelect,
        enterEdit,
        selectHalf,
        hoverHalf,
        grabBoundary,
        commitBoundary,
        clearHover,
        setSelectedDate,
        clearSelection
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const ctx = useContext(CalendarContext)
  if (!ctx) throw new Error('useCalendar must be used inside CalendarProvider')
  return ctx
}
