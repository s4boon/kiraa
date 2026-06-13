import { cn } from '@/lib/utils'
import { GroupModelType, RoomModelType } from '@shared/types'
import { NavLink } from 'react-router'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

type Group = {
  data: GroupModelType
  rooms: RoomModelType[]
}

export default function rooms({ groups }: { groups: Group[] }) {
  return groups.map((group) => {
    return (
      <Collapsible key={group.data.id}>
        <CollapsibleTrigger className="px-2 py-1 w-full text-start cursor-pointer hover:brightness-110 rounded-sm border my-1 bg-accent/50">
          {group.data.name}
        </CollapsibleTrigger>
        <CollapsibleContent className="grid">
          {group.rooms.map((room) => {
            return (
              <NavLink
                key={room.id}
                className={({ isActive }) =>
                  cn(
                    isActive ? 'bg-chart-4 text-background px-3 font-semibold' : 'px-1 bg-muted/20',
                    'py-1 rounded-none border-b'
                  )
                }
                to={'/rooms/' + room.name}
              >
                {room.name}
              </NavLink>
            )
          })}
        </CollapsibleContent>
      </Collapsible>
    )
  })
}
