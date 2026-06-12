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
        <CollapsibleTrigger className="bg-accent px-2 py-1 rounded-xs w-full text-start">
          {group.data.name}
        </CollapsibleTrigger>
        <CollapsibleContent className="grid">
          {group.rooms.map((room) => {
            return (
              <NavLink
                key={room.id}
                className={({ isActive }) =>
                  cn(
                    isActive ? 'bg-chart-4 text-background px-3 font-semibold' : 'px-1',
                    'py-0.5 rounded-xs '
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
