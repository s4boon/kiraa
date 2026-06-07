import { createContext, ReactNode, useContext, useState } from 'react'

// --- State machine types ---

type DisplayState = { mode: 'display' }
type SelectState = { mode: 'select'; firstSelection?: Date }

export type CalendarState = DisplayState | SelectState

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
  selectHalf: (date: Date, half: 'AM' | 'PM') => void
  hoverHalf: (date: Date, half: 'AM' | 'PM') => void
  clearHover: () => void
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>
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

  function selectHalf(date: Date, half: 'AM' | 'PM') {
    if (calendarState.mode !== 'select') return
    const clicked = toHalfDate(date, half)

    if (!calendarState.firstSelection) {
      setCalendarState({ mode: 'select', firstSelection: clicked })
      return
    }

    const [start, end] = halfBefore(calendarState.firstSelection, clicked)
      ? [calendarState.firstSelection, clicked]
      : [clicked, calendarState.firstSelection]

    setStartSelection(start)
    setEndSelection(end)
    setCalendarState({ mode: 'select' })
    setHoveredHalf(undefined)
  }

  function hoverHalf(date: Date, half: 'AM' | 'PM') {
    if (calendarState.mode === 'select' && calendarState.firstSelection) {
      setHoveredHalf(toHalfDate(date, half))
    }
  }

  function clearHover() {
    setHoveredHalf(undefined)
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
        selectHalf,
        hoverHalf,
        clearHover,
        setSelectedDate
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
