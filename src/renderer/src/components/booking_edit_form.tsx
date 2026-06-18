import { BookingModel } from '@shared/types'
import { useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { CreationAttributes } from 'sequelize'
import { toast } from 'sonner'
import { getHalf, useCalendar } from './context/calendar_context'
import { Button } from './ui/button'
import { Field, FieldLabel, FieldSeparator } from './ui/field'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'

type Props = {
  room?: string
}

export default function booking_edit_form({ room }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const { calendarState, enterDisplay } = useCalendar()
  if (calendarState.mode != 'edit') return null
  const { booking } = calendarState
  const [total, setTotal] = useState<number>(booking.total ?? 0)
  const [paid, setPaid] = useState<number>(booking.paid ?? 0)

  async function UpdateBooking(booking: Omit<CreationAttributes<BookingModel>, 'roomId'>) {
    setIsLoading(true)
    await window.ipcAPI.invoke('booking:update', { booking }).finally(() => {
      setIsLoading(false)
      enterDisplay()
    })
  }
  return (
    <form
      className="grid gap-y-1.5"
      onSubmit={async (e) => {
        e.preventDefault()

        if (paid > total) {
          toast.error('المبلغ المدفوع لا يجب أن يتعدى المبلغ الكلي', { position: 'bottom-left' })
          return
        }

        const tenant_name = e.currentTarget.tenant_name.value
        const tenant_contact = e.currentTarget.tenant_contact.value
        const notes = e.currentTarget.notes.value ?? ''
        toast.promise(
          UpdateBooking({
            ...booking,
            additionalInfo: notes,
            paid,
            total,
            tenant: tenant_name,
            contact: tenant_contact
          }),
          {
            loading: 'تحميل...',
            success: 'تم تعديل الحجز',
            error: 'فشلت العملية'
          }
        )
      }}
    >
      <Field>
        <FieldLabel htmlFor="tenant_name">إسم الزبون *</FieldLabel>
        <Input
          id="tenant_name"
          name="tanant_name"
          type="text"
          defaultValue={booking.tenant}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="tenant_contact">معلومات الإتصال</FieldLabel>
        <Input
          id="tenant_contact"
          name="tanant_contact"
          type="text"
          defaultValue={booking.contact ?? ''}
        />
      </Field>
      <div className=" text-sm text-accent-foreground">
        <div className="flex gap-x-2">
          <span>إبتداءا من:</span>
          {booking.startDate.toLocaleDateString('ar-DZ', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}
          {getHalf(booking.startDate) == 'AM' ? ' صباحا' : ' مساءا'}
        </div>

        <div className="flex gap-x-2">
          <span>إلى غاية:</span>
          {booking.endDate.toLocaleDateString('ar-DZ', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}
          {getHalf(booking.endDate) == 'AM' ? ' صباحا' : ' مساءا'}
        </div>
        <div>
          <span>الشقة:</span>
          {room}
        </div>
      </div>
      <FieldSeparator />
      <Field>
        <FieldLabel htmlFor="total">المبلغ الكلي (دج): *</FieldLabel>
        <NumericFormat
          customInput={Input}
          id="total"
          name="total"
          value={total > 0 ? total : ''}
          required
          onValueChange={(v) => {
            setTotal(Number(v.value))
          }}
          thousandSeparator
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="paid">المبلغ المدفوع (دج): *</FieldLabel>
        <NumericFormat
          customInput={Input}
          id="paid"
          name="paid"
          value={paid > 0 ? paid : ''}
          required
          onValueChange={(v) => {
            setPaid(Number(v.value))
          }}
          thousandSeparator
        />
      </Field>
      {booking.total && booking.paid && (
        <div className="text-sm">المبلغ المتبقي: {booking.total - booking.paid} دج</div>
      )}
      <FieldSeparator />
      <Field>
        <FieldLabel htmlFor="notes">ملاحظات إضافية</FieldLabel>
        <Textarea
          id="notes"
          name="notes"
          className="resize-none"
          defaultValue={booking.additionalInfo ?? ''}
        />
      </Field>
      <div className="flex space-x-2 my-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          حفظ
        </Button>
        <Button className="flex-1" variant={'destructive'} onClick={enterDisplay}>
          إلغاء
        </Button>
      </div>
    </form>
  )
}
