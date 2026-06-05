import { Outlet } from 'react-router'

type Props = {}

export default function layout({}: Props) {
  return (
    <div dir="rtl" className="w-full min-h-dvh bg-background text-foreground">
      <div>
        <Outlet />
      </div>
    </div>
  )
}
