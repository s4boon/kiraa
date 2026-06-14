import { useNavbar } from '@/components/context/navbar_context'
import { Invoice, InvoiceProps } from '@/components/print_invoice'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Printer,
  Search
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Props = {}

export default function search({}: Props) {
  const PRE_PAGE = 8
  const [tenant, setTenant] = useState('')
  const [contact, setContact] = useState('')
  const [room, setRoom] = useState('')
  const [page, setPage] = useState(0)

  const bookingQuery = queryOptions({
    queryKey: [...queryKeys.booking, tenant, contact, page, PRE_PAGE, room],
    queryFn: () =>
      window.ipcAPI.invoke('booking:search', { tenant, contact, page, per_page: PRE_PAGE, room })
  })

  const groupQuery = queryOptions({
    queryKey: queryKeys.group,
    queryFn: () => window.ipcAPI.invoke('group:list')
  })

  const { bookings, total } = useSuspenseQuery(bookingQuery).data
  const MAX_PAGES = Math.floor(total / PRE_PAGE)
  const groups = useSuspenseQuery(groupQuery).data.groups

  const rooms = groups.flatMap((g) => g.rooms)

  const tenant_ref = useRef<HTMLInputElement>(null)
  const contact_ref = useRef<HTMLInputElement>(null)

  const [printBooking, setPrintBooking] = useState<InvoiceProps | null>(null)

  useEffect(() => {
    if (!printBooking) return

    window.print()
  }, [printBooking])

  const { setCrumbs } = useNavbar()
  useEffect(() => {
    setCrumbs('الزبائن')
  }, [])

  return (
    <div className="h-full min-h-0">
      <Table dir="rtl" className="">
        <TableCaption>{total} نتيجة</TableCaption>
        <TableHeader>
          <TableRow className="*:text-right">
            <TableHead className="border-x border-border">
              <div className="flex items-center justify-between">
                <span className="whitespace-nowrap">الإسم</span>
                <InputGroup className="max-w-40">
                  <InputGroupInput placeholder="بحث..." type="text" ref={tenant_ref} />
                  <InputGroupButton
                    onClick={() => {
                      if (tenant_ref.current) {
                        setTenant(tenant_ref.current.value)
                      }
                    }}
                  >
                    <Search />
                  </InputGroupButton>
                </InputGroup>
              </div>
            </TableHead>
            <TableHead className="border-x border-border">
              <div className="flex items-center justify-between max-w-80">
                <span className="whitespace-nowrap">معلومات الإتصال</span>
                <InputGroup className="max-w-40">
                  <InputGroupInput placeholder="بحث..." type="text" ref={contact_ref} />
                  <InputGroupButton
                    onClick={() => {
                      if (contact_ref.current) {
                        setContact(contact_ref.current.value)
                      }
                    }}
                  >
                    <Search />
                  </InputGroupButton>
                </InputGroup>
              </div>
            </TableHead>
            <TableHead className="border-x border-border">
              <Select
                onValueChange={(v) => {
                  setRoom(v)
                }}
              >
                <SelectTrigger className="max-w-25">
                  <SelectValue placeholder="الغرفة" />
                </SelectTrigger>
                <SelectContent dir="rtl" className="max-w-20">
                  <SelectGroup>
                    <SelectItem value="*">الكل</SelectItem>
                  </SelectGroup>
                  {groups.map((group) => {
                    return (
                      <SelectGroup key={group.data.id}>
                        <SelectLabel>{group.data.name}</SelectLabel>
                        {group.rooms.map((room) => {
                          return (
                            <SelectItem key={room.id} value={room.name}>
                              {room.name}
                            </SelectItem>
                          )
                        })}
                      </SelectGroup>
                    )
                  })}
                </SelectContent>
              </Select>
            </TableHead>

            <TableHead className="border-x border-border">يوم الدخول</TableHead>
            <TableHead className="border-x border-border">يوم الخروج</TableHead>
            <TableHead className="border-x border-border">الفاتورة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="">
          {bookings.map((booking) => {
            return (
              <TableRow key={booking.id}>
                <TableCell>{booking.tenant}</TableCell>
                <TableCell className="">{booking.contact}</TableCell>
                <TableCell className="">
                  {rooms.find((r) => r.id == booking.roomId)?.name ?? ''}
                </TableCell>
                <TableCell>
                  {booking.startDate.toLocaleString('ar-DZ', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell>
                  {booking.endDate.toLocaleString('ar-DZ', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      const roomName = rooms.find((r) => r.id == booking.roomId)?.name ?? ''
                      setPrintBooking({ booking, roomName })
                    }}
                  >
                    <Printer />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <div className="flex items-center w-fit mx-auto">
        <Button
          variant={'secondary'}
          size={'icon'}
          disabled={page == 0}
          onClick={() => {
            setPage(0)
          }}
        >
          <ChevronsRight />
        </Button>
        <Button
          variant={'secondary'}
          size={'icon'}
          disabled={page == 0}
          onClick={() => {
            setPage((prev) => prev - 1)
          }}
        >
          <ChevronRight />
        </Button>
        <div className="flex items-center mx-1.5 w-fit">
          {page + 1}/{MAX_PAGES + 1}
        </div>
        <Button
          variant={'secondary'}
          size={'icon'}
          disabled={page == MAX_PAGES}
          onClick={() => {
            setPage((prev) => prev + 1)
          }}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant={'secondary'}
          size={'icon'}
          disabled={page == MAX_PAGES}
          onClick={() => {
            setPage(MAX_PAGES)
          }}
        >
          <ChevronsLeft />
        </Button>
      </div>
      <div id="print-area">{printBooking && <Invoice {...printBooking} />}</div>
    </div>
  )
}
