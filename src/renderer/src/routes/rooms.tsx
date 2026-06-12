import BookingForm from '@/components/booking_form'
import Bookings from '@/components/bookings'
import Calendar from '@/components/calendar'
import { isDayInRange, useCalendar } from '@/components/context/calendar_context'
import Rooms from '@/components/rooms'
import { queryKeys } from '@shared/query_keys'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

type Props = {}

export default function RoomsPage({}: Props) {
  const roomName = useParams().name

  if (!roomName) {
    throw new Error('room name missing')
  }

  const groupsQuery = queryOptions({
    queryKey: queryKeys.group,
    queryFn: () => window.ipcAPI.invoke('group:list')
  })

  const roomQuery = queryOptions({
    queryKey: [...queryKeys.room, roomName],
    queryFn: () =>
      window.ipcAPI.invoke('room:bookings', {
        name: roomName
      })
  })

  const groups = useSuspenseQuery(groupsQuery).data.groups
  const { room, bookings } = useSuspenseQuery(roomQuery).data

  const { selectedDate, calendarState } = useCalendar()
  return (
    <div className="grid h-full gap-3 grid-cols-16">
      <div className="col-span-3 overflow-y-auto">
        <Rooms groups={groups} />
      </div>

      <div className="col-span-9">
        <Calendar room={room} bookings={bookings} />
      </div>

      <div className="col-span-4">
        {calendarState.mode == 'display' ? (
          <Bookings
            bookings={bookings.filter(
              (b) => selectedDate && isDayInRange(selectedDate, b.data.startDate, b.data.endDate)
            )}
          />
        ) : (
          <BookingForm room={roomName} />
        )}
      </div>
    </div>
  )
}
