import { useMemo } from 'react'
import { CalendarCell, CalendarGrid, HalfSlotStyle } from './calendar_grid'
import { getHalf, isInRange, isSameDay, toHalfDate, useCalendar } from './context/calendar_context'
import { BookingModelType } from '@shared/types'

type CalendarSelectProps = {
  cells: CalendarCell[]
  bookings: BookingModelType[]
}

export function CalendarSelect({ cells, bookings }: CalendarSelectProps) {
  const {
    calendarState,
    startSelection,
    endSelection,
    hoveredHalf,
    selectHalf,
    hoverHalf,
    clearHover
  } = useCalendar()

  const firstSelection = calendarState.mode === 'select' ? calendarState.firstSelection : undefined

  const [rangeFrom, rangeTo] = useMemo((): [Date, Date] | [undefined, undefined] => {
    // Compute tentative end — enforce minimum 1 full day
    let effectiveHover = hoveredHalf
    if (firstSelection && hoveredHalf) {
      const [tentStart, tentEnd] =
        firstSelection.getTime() <= hoveredHalf.getTime()
          ? [firstSelection, hoveredHalf]
          : [hoveredHalf, firstSelection]
      // If same day and same half, no valid range yet
      if (isSameDay(tentStart, tentEnd) && getHalf(tentStart) === getHalf(tentEnd)) {
        effectiveHover = undefined
      }
    }

    if (firstSelection && effectiveHover) {
      return firstSelection.getTime() <= effectiveHover.getTime()
        ? [firstSelection, effectiveHover]
        : [effectiveHover, firstSelection]
    }
    if (startSelection && endSelection) {
      return [startSelection, endSelection]
    }
    return [undefined, undefined]
  }, [firstSelection, hoveredHalf, startSelection, endSelection])

  function getHalfStyle(
    date: Date,
    half: 'AM' | 'PM',
    booking: (BookingModelType & { color: string }) | undefined
  ): HalfSlotStyle {
    const halfDate = toHalfDate(date, half)
    const inRange = rangeFrom && rangeTo && isInRange(halfDate, rangeFrom, rangeTo)
    const isAnchor = firstSelection && firstSelection.getTime() === halfDate.getTime()

    return {
      style: booking ? { backgroundColor: booking.color, opacity: 0.4 } : undefined,
      className: booking
        ? 'cursor-default'
        : inRange
          ? 'bg-teal-300 text-black hover:brightness-110'
          : 'hover:brightness-110',
      anchor: !!isAnchor
    }
  }

  function handleHalfClick(date: Date, half: 'AM' | 'PM', booking: BookingModelType | undefined) {
    if (booking) return
    selectHalf(date, half)
  }

  function handleHalfEnter(date: Date, half: 'AM' | 'PM', booking: BookingModelType | undefined) {
    if (booking) return
    hoverHalf(date, half)
  }

  return (
    <CalendarGrid
      cells={cells}
      bookings={bookings}
      getHalfStyle={getHalfStyle}
      onHalfClick={handleHalfClick}
      onHalfEnter={handleHalfEnter}
      onMouseLeave={clearHover}
    />
  )
}
