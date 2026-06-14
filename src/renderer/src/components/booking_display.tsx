import { BookingModelType } from '@shared/types'
import { FileEdit, Printer, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { assignColor } from './calendar_grid'
import { getHalf, useCalendar } from './context/calendar_context'
import { Invoice, InvoiceProps } from './print_invoice'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { Field } from './ui/field'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

export default function bookings({
  bookings,
  room
}: {
  bookings: BookingModelType[]
  room: string
}) {
  const { selectedDate } = useCalendar()
  const [activeTab, setActiveTab] = useState('0')

  useEffect(() => {
    setActiveTab('0')
  }, [selectedDate])

  return (
    <div className="grid gap-y-1">
      <div className="bg-accent text-center text-foreground py-1 rounded-sm">
        {selectedDate?.toLocaleDateString('ar-DZ', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          weekday: 'long'
        })}
      </div>
      {bookings.length > 0 ? (
        <Tabs dir="rtl" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full space-x-1.5">
            {bookings.map((b, i) => (
              <TabsTrigger
                key={i}
                value={`${i}`}
                className="data-[state=active]:border-b-2 rounded-sm"
                style={{
                  borderColor: assignColor(b.id)
                }}
              >
                {`الحجز ${i + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
          {bookings.map((b, i) => (
            <TabsContent key={i} value={`${i}`}>
              <Booking booking={b} room={room} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="py-2 text-center text-sm text-muted-foreground">
          لا توجد حجوزات هذا اليوم
        </div>
      )}
    </div>
  )
}

function Booking({ booking, room }: { booking: BookingModelType; room: string }) {
  const { enterEdit } = useCalendar()
  const [printBooking, setPrintBooking] = useState<InvoiceProps | null>(null)
  useEffect(() => {
    if (!printBooking) return

    window.print()
  }, [printBooking])
  return (
    <div className="grid gap-y-1.5">
      <div className="flex space-x-1.5">
        <Label className="text-muted-foreground">رقم الحجز:</Label>
        <div className="py-0.5" id="tenant_name">
          {booking.id}
        </div>
      </div>
      <Field>
        <Label className="text-muted-foreground" htmlFor="tenant_name">
          إسم الزبون
        </Label>
        <div className="py-0.5" id="tenant_name">
          {booking.tenant}
        </div>
      </Field>
      <Field>
        <Label className="text-muted-foreground" htmlFor="tenant_contact">
          معلومات الإتصال
        </Label>
        <div className="py-0.5 " id="tenant_contact">
          {booking.contact}
        </div>
      </Field>
      <div className="grid gap-y-0.5 text-sm text-muted-foreground">
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
      <Separator />
      <Field>
        <Label className="text-muted-foreground" htmlFor="total">
          المبلغ الكلي:
        </Label>
        <div id="total">
          {new Intl.NumberFormat('ar-DZ', {
            style: 'currency',
            currency: 'DZD',
            notation: 'standard',
            maximumFractionDigits: 0
          }).format(booking.total ?? 0)}
        </div>
      </Field>
      <Field>
        <Label className="text-muted-foreground" htmlFor="paid">
          المبلغ المدفوع:
        </Label>
        <div id="total">
          {new Intl.NumberFormat('ar-DZ', {
            style: 'currency',
            currency: 'DZD',
            notation: 'standard',
            maximumFractionDigits: 0
          }).format(booking.paid ?? 0)}
        </div>
      </Field>
      {booking.total && booking.paid ? (
        <Field>
          <Label className="text-muted-foreground" htmlFor="rest">
            المبلغ المتبقي:
          </Label>
          <div id="rest">
            {new Intl.NumberFormat('ar-DZ', {
              style: 'currency',
              currency: 'DZD',
              notation: 'standard',
              maximumFractionDigits: 0
            }).format(booking.total - booking.paid)}
          </div>
        </Field>
      ) : (
        <Field>
          <Label className="text-muted-foreground" htmlFor="rest">
            المبلغ المتبقي:
          </Label>
          <div id="rest">
            {new Intl.NumberFormat('ar-DZ', {
              style: 'currency',
              currency: 'DZD',
              notation: 'standard',
              maximumFractionDigits: 0
            }).format(0)}
          </div>
        </Field>
      )}
      <Separator />
      <Field>
        <Label className="text-muted-foreground" htmlFor="notes">
          ملاحظات إضافية
        </Label>
        <p id="notes" className="resize-none">
          {booking.additionalInfo}
        </p>
      </Field>
      <div className="flex space-x-2 my-2">
        <Button
          className="flex-1"
          onClick={() => {
            setPrintBooking({ booking: booking, roomName: room })
          }}
        >
          طبع
          <Printer />
        </Button>
        <Button className="flex-1" onClick={() => enterEdit(booking)}>
          تعديل
          <FileEdit />
        </Button>
        <DeleteBooking id={booking.id} />
      </div>

      <div id="print-area">{printBooking && <Invoice {...printBooking} />}</div>
    </div>
  )
}

function DeleteBooking({ id }: { id: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  async function DeleteBooking(id: number) {
    setIsLoading(true)
    await window.ipcAPI
      .invoke('booking:delete', { id })
      .then(() => {
        toast.success('تم حذف الحجز')
      })
      .catch(() => {
        toast.error('فشلت العملية')
      })
      .finally(() => {
        setIsLoading(false)
        setIsOpen(false)
      })
  }
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex-1" variant={'destructive'}>
          حذف
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>هل أنت متأكد؟</DialogTitle>
          <DialogDescription className="grid">
            سيتم حذف الحجز رقم: {id}
            <span className="text-destructive">لا يمكن استرجاع المعلومات بعد الحذف</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>إلغاء</Button>
          </DialogClose>
          <Button
            variant={'destructive'}
            disabled={isLoading}
            onClick={() => {
              DeleteBooking(id)
            }}
          >
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
