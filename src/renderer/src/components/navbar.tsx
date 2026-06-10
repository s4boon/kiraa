import { GripVertical, House } from 'lucide-react'
import { Link } from 'react-router'
import Crumbs from './crumbs'
import Manage from './manage'
import Theme from './theme'
type Props = {}

export default function navbar({}: Props) {
  return (
    <nav className="flex gap-x-2.5 px-3 py-2 border-b border-accent-foreground/20 bg-accent items-center justify-between">
      <div className="flex gap-x-2.5 items-center">
        <Link to="/" className="p-1.5 rounded-xs text-accent-foreground hover:bg-background">
          <House className="size-5 font-thin" />
        </Link>
        <GripVertical className="h-6 w-6 text-muted-foreground" />
        <Crumbs />
      </div>
      <div className="flex gap-x-2.5 items-center">
        <Manage />
        <Theme />
      </div>
    </nav>
  )
}
