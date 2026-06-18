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
  room: string
}

export default function booking_form({ room }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [paid, setPaid] = useState(0)
  const [total, setTotal] = useState(0)
  const { startSelection, endSelection, enterDisplay, setSelectedDate } = useCalendar()

  async function CreateBooking(
    booking: Omit<CreationAttributes<BookingModel>, 'roomId'>,
    room_name: string
  ) {
    setIsLoading(true)
    const b = await window.ipcAPI.invoke('booking:create', { booking, room_name }).finally(() => {
      setIsLoading(false)
      enterDisplay()
    })
    return b
  }
  return (
    <form
      className="grid gap-y-1.5"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!startSelection || !endSelection) {
          toast.error('الرجاء تحديد مدة الحجز')
          return
        }
        if (paid > total) {
          toast.error('المبلغ المدفوع لا يجب أن يتعدى المبلغ الكلي')
          return
        }
        const tenant_name = e.currentTarget.tenant_name.value
        const tenant_contact = e.currentTarget.tenant_contact.value
        const notes = e.currentTarget.notes.value
        toast.promise(
          CreateBooking(
            {
              startDate: startSelection,
              endDate: endSelection,
              tenant: tenant_name,
              contact: tenant_contact,
              paid,
              total,
              additionalInfo: notes
            },
            room
          ),
          {
            loading: 'تحميل...',
            success: (b) => {
              setSelectedDate(b.booking.startDate)
              return 'تم الحجز'
            },
            error: 'فشلت العملية'
          }
        )
      }}
    >
      <Field>
        <FieldLabel htmlFor="tenant_name">إسم الزبون *</FieldLabel>
        <Input id="tenant_name" name="tanant_name" type="text" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="tenant_contact">معلومات الإتصال</FieldLabel>
        <Input id="tenant_contact" name="tanant_contact" type="text" />
      </Field>
      <div className=" text-sm text-accent-foreground">
        <div className="flex gap-x-2">
          <span>إبتداءا من:</span>
          {startSelection &&
            startSelection.toLocaleDateString('ar-DZ', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          {startSelection && getHalf(startSelection) == 'AM' ? ' صباحا' : ' مساءا'}
        </div>

        <div className="flex gap-x-2">
          <span>إلى غاية:</span>
          {endSelection &&
            endSelection.toLocaleDateString('ar-DZ', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          {endSelection && getHalf(endSelection) == 'AM' ? ' صباحا' : ' مساءا'}
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
          value={total > 0 ? total : ''}
          id="total"
          required
          onValueChange={(v) => {
            setTotal(Number(v.value))
          }}
          allowNegative={false}
          // allowLeadingZeros={false}
          thousandSeparator
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="paid">المبلغ المدفوع (دج): *</FieldLabel>
        <NumericFormat
          customInput={Input}
          value={paid > 0 ? paid : ''}
          max={total}
          id="paid"
          required
          onValueChange={(v) => {
            setPaid(Number(v.value))
          }}
          allowNegative={false}
          allowLeadingZeros={false}
          thousandSeparator
        />
      </Field>
      {<div className="text-sm">المبلغ المتبقي: {total - paid} دج</div>}
      <FieldSeparator />
      <Field>
        <FieldLabel htmlFor="notes">ملاحظات إضافية</FieldLabel>
        <Textarea id="notes" name="notes" className="resize-none" />
      </Field>
      <div className="flex space-x-2 my-2">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          حفظ
        </Button>
        <Button className="flex-1" variant={'destructive'} onClick={enterDisplay}>
          إلغاء
        </Button>
      </div>
    </form>
  )
}
