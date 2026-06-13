import { TenantModel } from '@shared/types'
import { useState } from 'react'
import { CreationAttributes } from 'sequelize'
import { toast } from 'sonner'
import { getHalf, useCalendar } from './context/calendar_context'
import { Button } from './ui/button'
import { Input } from './ui/input'

type Props = {
  room: string
}

const formatter = new Intl.DateTimeFormat('ar-DZ', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

export default function booking_form({ room }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const { startSelection, endSelection } = useCalendar()
  async function CreateBooking(
    checkin: Date,
    checkout: Date,
    total: number,
    paid: number,
    room_name: string,
    tenant: CreationAttributes<TenantModel>,
    additional?: string
  ) {
    setIsLoading(true)
    if (total < paid) {
      toast.error('المبلغ المدفوع لايمكن أن يتعدى المبلغ الكلي')
      return
    }
    await window.ipcAPI
      .invoke('booking:create', {
        checkin,
        checkout,
        paid,
        room_name,
        tenant,
        total,
        additional
      })
      .then(() => toast.success('تم الحجز'))
      .catch(() => toast.error('فشلت العملية'))
      .finally(() => setIsLoading(false))
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!startSelection || !endSelection) return
        const tenant_name = e.currentTarget.tenant_name.value
        const tenant_contact = e.currentTarget.tenant_contact.value
        const total = Number(e.currentTarget.total.value)
        const paid = Number(e.currentTarget.paid.value)
        await CreateBooking(startSelection, endSelection, total ?? 0, paid ?? 0, room, {
          name: tenant_name,
          contactInfo: tenant_contact
        })
      }}
    >
      <Input type="text" name="tenant_name" placeholder="إسم الزبون" required />
      <Input type="text" name="tenant_contact" placeholder="معلومات الإتصال" />
      {startSelection && (
        <div>
          من: {formatter.format(startSelection)}{' '}
          {getHalf(startSelection) == 'AM' ? 'صباحا' : 'مساء'}
        </div>
      )}{' '}
      {endSelection && (
        <div>
          إلى: {formatter.format(endSelection)} {getHalf(endSelection) == 'AM' ? 'صباحا' : 'مساء'}
        </div>
      )}
      <Input type="number" name="total" placeholder="السعر الكلي" required />
      <Input type="number" name="paid" placeholder="المبلغ المدفوع" required />
      <div>
        {' '}
        المتبقي:
        <div>0</div>
        <Button disabled={!startSelection || !endSelection || isLoading}>حفظ</Button>
      </div>
    </form>
  )
}
