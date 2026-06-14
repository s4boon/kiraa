import { Outlet } from 'react-router'
import Navbar from './components/navbar'

type Props = {}

export default function Layout({}: Props) {
  return (
    <main dir="rtl" className="flex h-dvh w-screen flex-col overflow-hidden">
      <Navbar />

      <div className="flex-1 min-h-0 bg-background text-foreground p-6 overflow-auto">
        <Outlet />
      </div>
    </main>
  )
}
