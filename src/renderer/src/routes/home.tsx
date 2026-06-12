import { ChartColumn, House, Search, Users } from 'lucide-react'
import { Link } from 'react-router'

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
  },
  {
    path: '/stats',
    label: 'الإحصائيات',
    icon: <ChartColumn />
  }
]

export default function App({}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 w-full gap-x-4 gap-y-6 [&>div]:rounded-sm">
      {ROUTES.map((route) => {
        if (route.path !== '/') {
          return (
            <Link
              to={route.path}
              key={route.path}
              className="relative bg-accent text-primary min-h-36 p-4 text-2xl font-semibold"
            >
              {route.label}
              <div className="absolute left-4 bottom-4 [&>svg]:size-20 text-background">
                {route.icon}
              </div>
            </Link>
          )
        }
        return
      })}
    </div>
  )
}
