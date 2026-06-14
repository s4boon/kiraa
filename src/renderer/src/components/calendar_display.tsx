import { BookingModelType } from '@shared/types'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { CalendarCell, CalendarGrid, HalfSlotStyle } from './calendar_grid'
import { useCalendar } from './context/calendar_context'

type CalendarDisplayProps = {
  cells: CalendarCell[]
  bookings: BookingModelType[]
}

export function CalendarDisplay({ cells, bookings }: CalendarDisplayProps) {
  const { selectedDate, setSelectedDate } = useCalendar()
  let [searchParams] = useSearchParams()

  function getHalfStyle(
    _date: Date,
    _half: 'AM' | 'PM',
    booking: (BookingModelType & { color: string }) | undefined
  ): HalfSlotStyle {
    return {
      style: booking ? { backgroundColor: booking.color } : undefined
    }
  }

  function handleHalfClick(date: Date, _half: 'AM' | 'PM', _booking: BookingModelType | undefined) {
    setSelectedDate(date)
  }

  useEffect(() => {
    const epoch = searchParams.get('epoch')
    if (epoch) {
      const target_date = new Date(Number(searchParams.get('epoch')))
      setSelectedDate(target_date)
    }
  }, [])

  return (
    <CalendarGrid
      cells={cells}
      bookings={bookings}
      selectedDate={selectedDate}
      getHalfStyle={getHalfStyle}
      onHalfClick={handleHalfClick}
    />
  )
}
