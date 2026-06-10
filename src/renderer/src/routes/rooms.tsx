import Calendar from '@/components/calendar'
import ClientInfo from '@/components/client_info'

type Props = {}

export default function rooms({}: Props) {
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
