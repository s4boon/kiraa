import Calendar from '@/components/calendar'
import ClientInfo from '@/components/client_info'
import { BookingModelType, TenantModelType } from '@shared/types'
import { useEffect, useState } from 'react'

type Props = {}
type RoomBooking = {
  data: BookingModelType
  tenant: TenantModelType
}

export default function rooms({}: Props) {
  const [bookings, setBookings] = useState<RoomBooking[]>([])
  useEffect(() => {
    async function getBookings(roomId) {
      try {
        const data = await window.ipcAPI.invoke('room:bookings', { roomId })
        setBookings(data.bookings)
        return
      } catch (err) {
        console.log(err)
        return
      }
    }
  }, [])
  return (
    <div className="grid gap-3 grid-cols-16 min-h-full">
      <div className="col-span-3 bg-green-400">rooms</div>
      <div className="col-span-9">
        <Calendar />
      </div>
      <div className="col-span-4 bg-yellow-50">
        <ClientInfo />
      </div>
    </div>
  )
}
