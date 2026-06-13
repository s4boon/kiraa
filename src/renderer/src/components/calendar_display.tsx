import { BookingWithTenant, CalendarCell, CalendarGrid, HalfSlotStyle } from './calendar_grid'
import { useCalendar } from './context/calendar_context'

type CalendarDisplayProps = {
  cells: CalendarCell[]
  bookings: BookingWithTenant[]
}

export function CalendarDisplay({ cells, bookings }: CalendarDisplayProps) {
  const { selectedDate, setSelectedDate } = useCalendar()

  function getHalfStyle(
    _date: Date,
    _half: 'AM' | 'PM',
    booking: (BookingWithTenant & { color: string }) | undefined
  ): HalfSlotStyle {
    return {
      style: booking ? { backgroundColor: booking.color } : undefined
    }
  }

  function handleHalfClick(
    date: Date,
    _half: 'AM' | 'PM',
    _booking: BookingWithTenant | undefined
  ) {
    setSelectedDate(date)
  }

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
