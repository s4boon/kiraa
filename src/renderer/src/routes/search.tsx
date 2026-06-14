import { isInRange, isSameMonth } from '@/components/context/calendar_context'
import { InputGroup, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { queryKeys } from '@shared/query_keys'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'

type Props = {}

export default function search({}: Props) {
  const [free_days, setFree_days] = useState(1)
  const navigate = useNavigate()
  const roomQuery = queryOptions({
    queryKey: [...queryKeys.room, free_days],
    queryFn: () => window.ipcAPI.invoke('room:search', { free_days })
  })

  const rooms = useSuspenseQuery(roomQuery).data.rooms

  const freedays_ref = useRef<HTMLInputElement>(null)

  return (
    <div className="h-full min-h-0">
      <Table dir="rtl" className="table-fixed">
        <TableCaption>قائمة الغرف</TableCaption>
        <TableHeader>
          <TableRow className="*:text-right">
            <TableHead className="border-x border-border">الغرفة</TableHead>
            <TableHead className="border-x border-border">
              <div className="flex items-center justify-between">
                <span className="whitespace-nowrap">أقرب الأيام المتاحة</span>
                <InputGroup className="max-w-20">
                  <InputGroupInput
                    ref={freedays_ref}
                    defaultValue={free_days}
                    className="w-20"
                    type="number"
                  />
                  <InputGroupButton
                    variant={'default'}
                    className="cursor-pointer"
                    onClick={() => {
                      if (freedays_ref.current) {
                        setFree_days(Number(freedays_ref.current.value))
                      }
                    }}
                  >
                    <Search />
                  </InputGroupButton>
                </InputGroup>
              </div>
            </TableHead>
            <TableHead className="border-x border-border">الحالة</TableHead>
            <TableHead className="border-x border-border">زبائن الشهر</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="">
          {rooms.map((room) => {
            const nearest = room.earliest
            const occupied = room.bookings.some((b) => {
              return isInRange(new Date(), b.startDate, b.endDate)
            })
            return (
              <TableRow
                key={room.data.id}
                className="cursor-pointer"
                onClick={() => {
                  navigate(`/rooms/${room.data.name}?epoch=${room.earliest.getTime()}`)
                }}
              >
                <TableCell>{room.data.name}</TableCell>
                <TableCell className="">
                  {nearest.toLocaleDateString('ar-DZ', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell>{occupied ? 'محجوزة' : 'شاغرة'}</TableCell>
                <TableCell>
                  {
                    room.bookings.filter((b) => {
                      const current = new Date()
                      return isSameMonth(current, b.startDate) || isSameMonth(current, b.endDate)
                    }).length
                  }
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
