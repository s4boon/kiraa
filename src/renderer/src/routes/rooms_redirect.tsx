import { queryKeys } from '@shared/query_keys'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router'

export default function RoomsRedirect() {
  const groupsQuery = queryOptions({
    queryKey: queryKeys.group,
    queryFn: () => window.ipcAPI.invoke('group:list')
  })

  const groups = useSuspenseQuery(groupsQuery).data.groups

  const firstRoom = groups.at(0)?.rooms.at(0)

  if (!firstRoom) {
    return <div>لا توجد غرف حاليا</div>
  }

  return <Navigate to={`/rooms/${firstRoom.name}`} replace />
}
