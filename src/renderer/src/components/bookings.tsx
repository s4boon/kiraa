import { BookingModelType, TenantModelType } from '@shared/types'
import { useCalendar } from './context/calendar_context'
import { Button } from './ui/button'

type Booking = {
  data: BookingModelType
  tenant: TenantModelType
}

export default function bookings({ bookings }: { bookings: Booking[] }) {
  const { enterEdit } = useCalendar()
  if (bookings.length == 0) {
    return <div>لا توجد حجوزات</div>
  }
  const first_booking = bookings.at(0)
  return (
    <div>
      {bookings.at(0)?.tenant.name}
      {first_booking && (
        <Button
          onClick={() => {
            enterEdit(first_booking.data)
          }}
        >
          edit
        </Button>
      )}
    </div>
  )
}
