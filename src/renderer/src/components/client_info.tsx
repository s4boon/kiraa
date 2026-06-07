import { BookingModelType, TenantModelType } from '@shared/types'
import { isInRange, useCalendar } from './context/calendar_context'

type Props = {
  data?: {
    booking: BookingModelType
    tenant: TenantModelType
  }[]
}

export default function Info({ data }: Props) {
  const { selectedDate, calendarState, startSelection, endSelection } = useCalendar()
  const item = data?.find((d) => {
    if (selectedDate) {
      return isInRange(selectedDate, d.booking.startDate, d.booking.endDate)
    }
  })
  const tenant = item?.tenant
  switch (calendarState.mode) {
    case 'display':
      return <Display tenant={tenant} />

    case 'select':
      let period: { start: Date; end: Date } | undefined = undefined
      if (startSelection && endSelection) {
        period = { start: startSelection, end: endSelection }
      }
      return <Input tenant={tenant} period={period} />
  }
}

type DisplayProps = {
  tenant?: TenantModelType
}
function Display({ tenant }: DisplayProps) {
  return tenant ? <div>{tenant.name}</div> : <div>لا توجد حجوزات</div>
}

type InputProps = {
  tenant?: TenantModelType
  period?: {
    start: Date
    end: Date
  }
}
function Input({ tenant, period }: InputProps) {
  return (
    <form>
      <input type="text" name="" id="" defaultValue={tenant?.name} />
    </form>
  )
}
