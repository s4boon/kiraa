import { useMemo } from 'react'
import { assignColor, CalendarCell, CalendarGrid, HalfSlotStyle } from './calendar_grid'
import { dayTimestamp, isInRange, toHalfDate, useCalendar } from './context/calendar_context'
import { BookingModelType } from '@shared/types'

type CalendarEditProps = {
  cells: CalendarCell[]
  bookings: BookingModelType[]
}

/** Returns the half-day slot immediately after a given date (+12h) */
function nextHalf(date: Date): Date {
  return new Date(date.getTime() + 12 * 60 * 60 * 1000)
}

/** Returns the half-day slot immediately before a given date (-12h) */
function prevHalf(date: Date): Date {
  return new Date(date.getTime() - 12 * 60 * 60 * 1000)
}

export function CalendarEdit({ cells, bookings }: CalendarEditProps) {
  const { calendarState, hoveredHalf, grabBoundary, commitBoundary, hoverHalf, clearHover } =
    useCalendar()

  if (calendarState.mode !== 'edit') return null

  const { booking, adjusting } = calendarState
  const BOOKING_COLOR = assignColor(booking.id)

  // Other bookings excluding the one being edited
  const otherBookings = bookings.filter((b) => b.id !== booking.id)

  // Preview start/end while hovering during adjustment
  const previewStart = adjusting === 'start' && hoveredHalf ? hoveredHalf : booking.startDate
  const previewEnd = adjusting === 'end' && hoveredHalf ? hoveredHalf : booking.endDate

  // Valid range the adjusted boundary can move to
  const validRange = useMemo((): { from: Date; to: Date } | undefined => {
    if (!adjusting) return undefined

    const othersSorted = [...otherBookings].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    )

    if (adjusting === 'start') {
      // Can go back to right after the previous booking ends
      const prevBooking = [...othersSorted]
        .reverse()
        .find((b) => b.endDate.getTime() < booking.startDate.getTime())
      const lowerBound = prevBooking ? nextHalf(prevBooking.endDate) : new Date(0)

      // Can go forward up to PM of the day before the end day (min 1 full day)
      const upperBound = toHalfDate(new Date(dayTimestamp(booking.endDate) - 86400000), 'PM')

      return { from: lowerBound, to: upperBound }
    }

    // adjusting === 'end'
    // Can go back to AM of the day after the start day (min 1 full day)
    const lowerBound = toHalfDate(new Date(dayTimestamp(booking.startDate) + 86400000), 'AM')

    // Can go forward up to right before the next booking starts
    const nextBooking = othersSorted.find((b) => b.startDate.getTime() > booking.endDate.getTime())
    const upperBound = nextBooking ? prevHalf(nextBooking.startDate) : new Date(8640000000000000)

    return { from: lowerBound, to: upperBound }
  }, [adjusting, booking, otherBookings])

  function getHalfStyle(
    date: Date,
    half: 'AM' | 'PM',
    bookingSlot: (BookingModelType & { color: string }) | undefined
  ): HalfSlotStyle {
    const isCurrentMonth = date.getMonth() == cells.at(17)?.date.getMonth()
    const halfDate = toHalfDate(date, half)
    const isStart = booking.startDate.getTime() === halfDate.getTime()
    const isEnd = booking.endDate.getTime() === halfDate.getTime()
    const isInterior = !isStart && !isEnd && isInRange(halfDate, booking.startDate, booking.endDate)
    const inPreview = isInRange(halfDate, previewStart, previewEnd)
    const inValid = validRange ? isInRange(halfDate, validRange.from, validRange.to) : false

    // Boundary handles — only interactive before grabbing
    if ((isStart || isEnd) && !adjusting) {
      return {
        style: { backgroundColor: 'oklch(0.627 0.194 149.214)' },
        className: `${isCurrentMonth ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}`
      }
    }

    // Interior of edited booking
    if (isInterior && !adjusting) {
      return {
        style: { backgroundColor: 'oklch(0.696 0.143 148.162 / 60%)' },
        className: 'cursor-default'
      }
    }

    // Adjusting mode
    if (adjusting) {
      // The booking's own range (non-boundary) — show as preview or muted
      if (isStart || isEnd || isInterior) {
        return {
          style: {
            backgroundColor: inPreview
              ? 'oklch(0.696 0.143 148.162)'
              : 'oklch(0.696 0.143 148.162 / 40%)'
          },
          className: 'cursor-default'
        }
      }

      // Valid free slot
      if (inValid && !bookingSlot) {
        return {
          style: inPreview ? { backgroundColor: 'oklch(0.696 0.143 148.162)' } : undefined,
          className: `${inPreview ? 'hover:brightness-110' : 'hover:bg-teal-100'} ${isCurrentMonth ? 'cursor-pointer' : 'cursor-default'}`
        }
      }

      // Blocked — other booking or outside valid range
      return {
        style: bookingSlot ? { backgroundColor: bookingSlot.color } : undefined,
        className: 'cursor-default opacity-40'
      }
    }

    // Free or other booking — dimmed
    return {
      style: bookingSlot ? { backgroundColor: bookingSlot.color } : undefined,
      className: 'cursor-default opacity-40'
    }
  }

  function handleHalfClick(
    date: Date,
    half: 'AM' | 'PM',
    bookingSlot: BookingModelType | undefined
  ) {
    const halfDate = toHalfDate(date, half)
    const isStart = booking.startDate.getTime() === halfDate.getTime()
    const isEnd = booking.endDate.getTime() === halfDate.getTime()

    if (!adjusting) {
      if (isStart) grabBoundary('start')
      else if (isEnd) grabBoundary('end')
      return
    }

    if (validRange && isInRange(halfDate, validRange.from, validRange.to)) {
      commitBoundary(date, half)
    }
  }

  function handleHalfEnter(
    date: Date,
    half: 'AM' | 'PM',
    bookingSlot: BookingModelType | undefined
  ) {
    if (!adjusting || !validRange || bookingSlot) return
    const halfDate = toHalfDate(date, half)
    if (isInRange(halfDate, validRange.from, validRange.to)) {
      hoverHalf(date, half)
    }
  }

  return (
    <CalendarGrid
      cells={cells}
      bookings={otherBookings}
      getHalfStyle={getHalfStyle}
      onHalfClick={handleHalfClick}
      onHalfEnter={handleHalfEnter}
      onMouseLeave={clearHover}
    />
  )
}
