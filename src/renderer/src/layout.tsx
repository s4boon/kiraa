import { Outlet } from 'react-router'
import Navbar from './components/navbar'

type Props = {}

export default function Layout() {
  return (
    <main dir="rtl" className="flex h-dvh w-screen flex-col">
      <Navbar />

      <div className="flex-1 overflow-y-auto bg-background text-foreground p-6">
        <Outlet />
      </div>
    </main>
  )
}
