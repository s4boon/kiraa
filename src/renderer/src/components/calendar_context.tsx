import { createContext, ReactNode, useContext, useState } from 'react'

type CalendarContextType = {
  state: 'display' | 'select'
  setState: React.Dispatch<React.SetStateAction<'display' | 'select'>>
  currentDate: Date
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>
  count: number
  setCount: (value: number) => void
  inc: () => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0)
  const [state, setState] = useState<'display' | 'select'>('display')
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  function inc() {
    setCount((c) => c + 1)
  }

  return (
    <CalendarContext.Provider
      value={{ count, setCount, inc, state, setState, currentDate, setCurrentDate }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const ctx = useContext(CalendarContext)

  if (!ctx) {
    throw new Error('useCalendar must be used inside CalendarProvider')
  }

  return ctx
}
