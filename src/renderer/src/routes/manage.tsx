import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { queryKeys } from '@shared/query_keys'
import { GroupModelType } from '@shared/types'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useState } from 'react'
import { toast } from 'sonner'
import ErrorBoundary from '../error_boundary'

type Group = {
  data: GroupModelType
  rooms: GroupModelType[]
}

function Page() {
  const groupsQuery = queryOptions({
    queryKey: queryKeys.group,
    queryFn: () => window.ipcAPI.invoke('group:list')
  })

  const { data } = useSuspenseQuery(groupsQuery)
  const groupnames = data.groups.map((g) => g.data.name)

  return (
    <div dir="rtl" className="h-screen flex flex-col">
      <GroupAdd />
      <RoomAdd groups={groupnames} />
    </div>
  )
}

function GroupAdd() {
  const [isLoading, setIsLoading] = useState(false)
  async function CreateGroup(name: string) {
    setIsLoading(true)
    await window.ipcAPI
      .invoke('group:create', { name })
      .then(() => {
        toast.success('created')
      })
      .catch((r) => {
        toast.error('failed', r)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }
  return (
    <form
      className="flex w-90 space-x-1.5 items-center px-2"
      onSubmit={(e) => {
        e.preventDefault()
        const name = e.currentTarget.groupname.value as string
        if (name.trim() == '') return
        CreateGroup(name)
      }}
    >
      <Input type="text" name="groupname" />
      <Button>Create</Button>
    </form>
  )
}

function RoomAdd({ groups }: { groups: string[] }) {
  const [isLoading, setIsLoading] = useState(false)
  async function CreateRoom(name: string, group: string) {
    setIsLoading(true)
    await window.ipcAPI
      .invoke('room:create', { name: name, group_name: group })
      .then(() => {
        toast.success('created')
      })
      .catch((r) => {
        toast.error('failed', r)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }
  return (
    <form
      className="flex items-center px-2 space-x-2"
      onSubmit={(e) => {
        e.preventDefault()
        const name = e.currentTarget.roomname.value as string
        const group = e.currentTarget.group.value as string
        if (name.trim() == '' || group.trim() == '') return
        CreateRoom(name, group)
      }}
    >
      <select name="group" defaultValue={groups.at(0)}>
        {groups.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <Input type="text" name="roomname" />
      <Button>Create</Button>
    </form>
  )
}

export default function PageWrapped(props: any) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <Page {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}
