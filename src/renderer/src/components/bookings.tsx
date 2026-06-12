import { BookingModelType, TenantModelType } from '@shared/types'

type Booking = {
  data: BookingModelType
  tenant: TenantModelType
}

export default function bookings({ bookings }: { bookings: Booking[] }) {
  if (bookings.length == 0) {
    return <div>لا توجد حجوزات</div>
  }
  return <div>{bookings.at(0)?.tenant.name}</div>
}
