import { GripVertical, House } from 'lucide-react'
import { Link } from 'react-router'
import Crumbs from './crumbs'
type Props = {}

export default function navbar({}: Props) {
  return (
    <nav className="flex gap-x-2.5 px-3 py-2 border-b border-accent-foreground/20 bg-accent items-center">
      <Link to="/" className="p-1.5 rounded-xs text-accent-foreground hover:bg-background">
        <House className="size-6 font-thin" />
      </Link>
      <GripVertical className="h-6 w-6 text-muted-foreground" />
      <Crumbs />
    </nav>
  )
}
