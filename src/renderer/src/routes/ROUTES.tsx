import { ChartColumn, House, Search, Users } from 'lucide-react'
import React from 'react'
import Home from './home'
import Rooms from './rooms'

type Route = {
  path: string
  label: string
  element: React.ReactNode
  icon: React.ReactNode
}

export const ROUTES: Route[] = [
  {
    path: '/',
    label: 'القائمة الرئيسية',
    element: <Home />,
    icon: <House />
  },
  { path: '/rooms', label: 'قائمة الغرف', element: <Rooms />, icon: <House /> },
  {
    path: '/search',
    label: 'بحث سريع',
    element: <div>Search</div>,
    icon: <Search />
  },
  {
    path: '/customers',
    label: 'قائمة الزبائن',
    element: <div>Customers</div>,
    icon: <Users />
  },
  {
    path: '/stats',
    label: 'الإحصائيات',
    element: <div>Stats</div>,
    icon: <ChartColumn />
  }
]
