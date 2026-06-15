import { BookingModelType } from '@shared/types'
import { getHalf } from './context/calendar_context'

export type InvoiceProps = {
  booking: BookingModelType
  roomName: string
  businessName?: string
}

export function Invoice({ booking, roomName, businessName = 'إسم المؤسسة' }: InvoiceProps) {
  const remaining = Math.max(0, (booking.total ?? 0) - (booking.paid ?? 0))

  const money = (amount: number) =>
    new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      maximumFractionDigits: 0
    }).format(amount)

  return (
    <div id="print-area">
      <div dir="rtl" className="mx-auto w-full max-w-3xl bg-white text-black p-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold">فاتورة</h1>
            <p className="text-sm text-gray-600">رقم الحجز: #{booking.id}</p>
          </div>

          <div className="text-left">
            <h2 className="font-bold">{businessName}</h2>
            <p className="text-sm text-gray-600">
              تاريخ الإصدار: {new Date().toLocaleDateString('ar-DZ')}
            </p>
          </div>
        </div>

        {/* Customer */}
        <div className="mb-6">
          <h3 className="mb-2 font-bold">معلومات الزبون</h3>

          <div className="grid grid-cols-2 gap-y-2">
            <div>الإسم:</div>
            <div>{booking.tenant}</div>

            <div>معلومات الإتصال:</div>
            <div>{booking.contact}</div>
          </div>
        </div>

        {/* Booking */}
        <div className="mb-6">
          <h3 className="mb-2 font-bold">تفاصيل الحجز</h3>

          <div className="grid grid-cols-2 gap-y-2">
            <div>الغرفة:</div>
            <div>{roomName}</div>

            <div>من:</div>
            <div>
              {booking.startDate.toLocaleDateString('ar-DZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                weekday: 'long'
              })}
              {getHalf(booking.startDate) == 'AM' ? ' صباحا' : ' مساءا'}
            </div>

            <div>إلى:</div>
            <div>
              {booking.endDate.toLocaleDateString('ar-DZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                weekday: 'long'
              })}
              {getHalf(booking.endDate) == 'AM' ? ' صباحا' : ' مساءا'}
            </div>
          </div>
        </div>

        {/* Amounts */}
        <table className="mb-6 w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">البيان</th>
              <th className="border p-2">المبلغ</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border p-2">المبلغ الكلي</td>
              <td className="border p-2">{money(booking.total ?? 0)}</td>
            </tr>

            <tr>
              <td className="border p-2">المبلغ المدفوع</td>
              <td className="border p-2">{money(booking.paid ?? 0)}</td>
            </tr>

            <tr>
              <td className="border p-2 font-bold">المبلغ المتبقي</td>
              <td className="border p-2 font-bold">{money(remaining)}</td>
            </tr>
          </tbody>
        </table>

        {/* Notes */}
        {booking.additionalInfo && (
          <div className="mb-8">
            <h3 className="mb-2 font-bold">ملاحظات</h3>
            <p className="whitespace-pre-wrap">{booking.additionalInfo}</p>
          </div>
        )}

        {/* Signature */}
        <div className="mt-16 flex justify-between">
          <div className="text-center">
            <div className="mb-12">توقيع الزبون</div>
            <div>________________</div>
          </div>

          <div className="text-center">
            <div className="mb-12">الختم والتوقيع</div>
            <div>________________</div>
          </div>
        </div>
      </div>
    </div>
  )
}
