import { House, Search, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

type Props = {}

type Route = {
  path: string
  label: string
  icon: React.ReactNode
}

export const ROUTES: Route[] = [
  {
    path: '/',
    label: 'القائمة الرئيسية',
    icon: <House />
  },
  {
    path: '/rooms/',
    label: 'قائمة الغرف',
    icon: <House />
  },
  {
    path: '/search',
    label: 'بحث سريع',
    icon: <Search />
  },
  {
    path: '/customers',
    label: 'قائمة الزبائن',
    icon: <Users />
  }
]

import { queryKeys } from '@shared/query_keys'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { BedDouble } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  const dataQuery = queryOptions({
    queryKey: queryKeys.booking,
    queryFn: () => window.ipcAPI.invoke('data:list')
  })

  const { booking_count, recent_bookings, rooms, todays_bookings } =
    useSuspenseQuery(dataQuery).data

  const actions = [
    {
      to: '/rooms',
      label: 'قائمة الغرف',
      sub: 'غرفة متاحة',
      icon: <BedDouble className="size-6" />,
      color: 'chart-1',
      value: rooms.length
    },
    {
      to: '/search',
      label: 'بحث سريع',
      sub: 'حجوزات نشطة',
      icon: <Search className="size-6" />,
      color: 'chart-2',
      value: todays_bookings
    },
    {
      to: '/tenants',
      label: 'الزبائن',
      sub: 'عميل مسجل',
      icon: <Users className="size-6" />,
      color: 'chart-3',
      value: booking_count
    }
  ]

  return (
    <div className="space-y-6 h-full">
      {/* ACTION CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="
    group relative overflow-hidden
    rounded-xl border bg-card p-6
    min-h-40
    transition-all duration-200

    hover:-translate-y-0.5
    hover:shadow-md
  "
          >
            {/* background tint */}
            <div
              className="
      absolute inset-0 opacity-0
      transition-opacity duration-200
      group-hover:opacity-100
    "
            />

            {/* colored overlay per card */}
            <div
              className={`
      absolute inset-0 opacity-0 transition-opacity duration-200
      group-hover:opacity-100
      ${a.color === 'chart-1' ? 'bg-chart-1/10' : ''}
      ${a.color === 'chart-2' ? 'bg-chart-2/10' : ''}
      ${a.color === 'chart-3' ? 'bg-chart-3/10' : ''}
    `}
            />

            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-lg font-medium">{a.label}</div>

                <div className="mt-1 text-sm text-muted-foreground">{a.sub}</div>
              </div>

              {/* ICON */}
              <div
                className={`
        rounded-md p-2 transition-colors
        ${a.color === 'chart-1' ? 'text-chart-1 group-hover:text-chart-1' : ''}
        ${a.color === 'chart-2' ? 'text-chart-2 group-hover:text-chart-2' : ''}
        ${a.color === 'chart-3' ? 'text-chart-3 group-hover:text-chart-3' : ''}
      `}
              >
                {a.icon}
              </div>
            </div>

            {/* VALUE */}
            <div
              className={`
      relative mt-6 text-4xl font-bold
      ${a.color === 'chart-1' ? 'text-chart-1' : ''}
      ${a.color === 'chart-2' ? 'text-chart-2' : ''}
      ${a.color === 'chart-3' ? 'text-chart-3' : ''}
    `}
            >
              {a.value}
            </div>
          </Link>
        ))}
      </div>

      {/* RECENT BOOKINGS */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-4 py-3">
          <h2 className="font-medium">آخر الحجوزات</h2>
        </div>

        <div className="divide-y">
          {recent_bookings.map((b, i) => {
            const room = rooms.find((r) => r.id == b.roomId)?.name ?? ''

            return (
              <div
                key={i}
                className="
                flex items-center justify-between
                px-4 py-3
                transition-colors
                hover:bg-muted/40
                cursor-pointer
              "
                onClick={() => {
                  navigate(`/rooms/${room}?epoch=${b.endDate.getTime()}`)
                }}
              >
                <div>
                  <div className="font-medium">{b.tenant}</div>
                  <div className="text-sm text-muted-foreground">{room}</div>
                </div>

                <div className="text-sm text-muted-foreground">
                  {b.startDate.toLocaleString('ar-DZ', {
                    day: '2-digit',
                    year: 'numeric',
                    month: '2-digit'
                  })}{' '}
                  ←{' '}
                  {b.endDate.toLocaleString('ar-DZ', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
