import { BookingModelType } from '@shared/types'
import { useMemo } from 'react'
import { CalendarCell, CalendarGrid, HalfSlotStyle } from './calendar_grid'
import { getHalf, isInRange, isSameDay, toHalfDate, useCalendar } from './context/calendar_context'

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

  // Once an anchor is picked, clamp the selectable range to the nearest
  // bookings on either side so the range can never overlap them
  const validRange = useMemo((): { from: Date; to: Date } | undefined => {
    if (!firstSelection) return undefined

    const sorted = [...bookings].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

    const prevBooking = [...sorted]
      .reverse()
      .find((b) => b.endDate.getTime() < firstSelection.getTime())
    const nextBooking = sorted.find((b) => b.startDate.getTime() > firstSelection.getTime())

    // Lower bound: the half right after the previous booking ends (+12h)
    const from = prevBooking
      ? new Date(prevBooking.endDate.getTime() + 12 * 60 * 60 * 1000)
      : new Date(0)

    // Upper bound: the half right before the next booking starts (-12h)
    const to = nextBooking
      ? new Date(nextBooking.startDate.getTime() - 12 * 60 * 60 * 1000)
      : new Date(8640000000000000)

    return { from, to }
  }, [firstSelection, bookings])

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
    const isBlocked =
      firstSelection && validRange && !isInRange(halfDate, validRange.from, validRange.to)

    return {
      style: booking ? { backgroundColor: booking.color, opacity: 0.4 } : undefined,
      className: booking
        ? 'cursor-default'
        : isBlocked
          ? 'cursor-default opacity-60 bg-muted'
          : inRange
            ? 'bg-green-500 hover:brightness-105'
            : 'hover:brightness-110',
      anchor: !!isAnchor
    }
  }

  function handleHalfClick(date: Date, half: 'AM' | 'PM', booking: BookingModelType | undefined) {
    if (booking) return
    const halfDate = toHalfDate(date, half)
    // Once an anchor exists, reject clicks outside the valid range
    if (firstSelection && validRange && !isInRange(halfDate, validRange.from, validRange.to)) {
      return
    }
    selectHalf(date, half)
  }

  function handleHalfEnter(date: Date, half: 'AM' | 'PM', booking: BookingModelType | undefined) {
    if (booking) return
    const halfDate = toHalfDate(date, half)
    if (firstSelection && validRange && !isInRange(halfDate, validRange.from, validRange.to)) {
      return
    }
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
