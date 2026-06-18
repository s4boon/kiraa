import { BookingModelType } from '@shared/types'
import { getHalf } from './context/calendar_context'

export type InvoiceProps = {
  booking: BookingModelType
  roomName: string
  businessName?: string
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-32 shrink-0 font-medium text-gray-700">{label}</div>
      <div className="flex-1">{value}</div>
    </div>
  )
}

export function Invoice({ booking, roomName, businessName = 'إقامة الأنيس' }: InvoiceProps) {
  const remaining = Math.max(0, (booking.total ?? 0) - (booking.paid ?? 0))

  const money = (amount: number) =>
    new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      maximumFractionDigits: 0
    }).format(amount)

  const formatDate = (date: Date) =>
    date.toLocaleDateString('ar-DZ', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

  const formatWithHalf = (date: Date) => {
    const half = getHalf(date) === 'AM' ? 'صباحا' : 'مساءا'
    return `${formatDate(date)} ${half}`
  }

  return (
    <div id="print-area">
      <div dir="rtl" className="mx-auto max-w-3xl bg-white p-8 text-black">
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <div className="flex justify-between">
            <div>
              <h1 className="text-2xl font-bold">فاتورة</h1>
              <p className="text-sm text-gray-600">رقم الحجز: #{booking.id}</p>
            </div>

            <div className="text-left">
              <h2 className="font-bold">{businessName}</h2>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('ar-DZ', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Customer */}
        <section className="mb-8">
          <h3 className="mb-4 text-lg font-bold">معلومات الزبون</h3>

          <div className="space-y-3">
            <Field label="الإسم" value={booking.tenant} />
            <Field label="معلومات الإتصال" value={booking.contact} />
          </div>
        </section>

        {/* Booking */}
        <section className="mb-8">
          <h3 className="mb-4 text-lg font-bold">تفاصيل الحجز</h3>

          <div className="space-y-3">
            <Field label="الغرفة" value={roomName} />

            <Field label="من" value={formatWithHalf(booking.startDate)} />

            <Field label="إلى" value={formatWithHalf(booking.endDate)} />
          </div>
        </section>

        {/* Payment */}
        <section className="mb-8">
          <h3 className="mb-4 text-lg font-bold">المعلومات المالية</h3>

          <div className="space-y-3">
            <Field label="المبلغ الكلي" value={money(booking.total ?? 0)} />

            <Field label="المبلغ المدفوع" value={money(booking.paid ?? 0)} />

            <div className="border-t pt-3">
              <Field
                label="المبلغ المتبقي"
                value={<span className="font-bold">{money(remaining)}</span>}
              />
            </div>
          </div>
        </section>

        {/* Notes */}
        {booking.additionalInfo && (
          <section className="mb-10">
            <h3 className="mb-4 text-lg font-bold">ملاحظات</h3>

            <div className="rounded border p-4 whitespace-pre-wrap">{booking.additionalInfo}</div>
          </section>
        )}

        {/* Signature */}
        <div className="mt-16 grid grid-cols-2 gap-16">
          <div className="text-center">
            <div className="mb-14">توقيع الزبون</div>
            <div className="flex justify-center">
              <div className="w-40 border-t border-dashed border-black" />
            </div>
          </div>

          <div className="text-center">
            <div className="mb-14">الختم والتوقيع</div>
            <div className="flex justify-center">
              <div className="w-40 border-t border-dashed border-black" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
