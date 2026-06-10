import Edit from '@/components/edit'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { queryKeys } from '@shared/query_keys'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { ChevronsUpDown, EditIcon, Plus, Save, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

type Props = {}

export default function page({}: Props) {
  const groupsQuery = queryOptions({
    queryKey: queryKeys.group,
    queryFn: () => window.ipcAPI.invoke('group:list')
  })
  const { data } = useSuspenseQuery(groupsQuery)

  return (
    <div dir="rtl" className="h-screen flex flex-col">
      <h1 className="mx-auto my-2.5 text-2xl w-fit">قائمة الغرف:</h1>
      <div className="w-[60%] max-h-[80%] overflow-y-scroll mx-auto flex-1 px-2">
        <GroupAdd />
        {data.groups.map((g) => {
          return (
            <GroupEdit key={g.data.id} name={g.data.name}>
              {g.rooms.map((r) => {
                return <Edit key={r.id} name={r.name} />
              })}
            </GroupEdit>
          )
        })}
      </div>
    </div>
  )
}

type GroupProps = {
  name: string
  children?: React.ReactNode
}

function GroupAdd() {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  async function createGroup() {
    setIsLoading(true)
    return await window.ipcAPI
      .invoke('group:create', { name })
      .then(() => true)
      .catch((r) => {
        console.log(r)
        return false
      })
      .finally(() => {
        setIsLoading(false)
      })
  }
  return (
    <div className="flex justify-between gap-x-3 my-2 items-center">
      <Input
        value={name}
        onChange={(e) => {
          setName(e.currentTarget.value)
        }}
      />
      <div className="flex gap-x-1.5 [&>button]:rounded-sm [&>button]:cursor-pointer">
        <Button
          disabled={isLoading}
          onClick={async () => {
            const success = await createGroup()
            if (success) {
              toast.success(`تم إنشاء المجموعة "${name}".`)
            } else {
              toast.error('فشلت العملية.')
            }
          }}
          variant={'outline'}
          size={'icon-sm'}
        >
          <Save />
        </Button>
      </div>
    </div>
  )
}

function GroupEdit({ name, children }: GroupProps) {
  const [newName, setNewName] = useState(name)
  const [isEditing, setIsEditing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Collapsible dir="rtl" className="my-2 px-2.5 py-1 rounded border border-border" open={isOpen}>
      <div className="flex justify-between gap-x-3 my-2 items-center">
        <Input
          value={newName}
          onChange={(e) => {
            setNewName(e.currentTarget.value)
          }}
          disabled={!isEditing}
        />
        <div className="flex gap-x-1.5 [&>button]:rounded-sm [&>button]:cursor-pointer">
          {isEditing ? (
            <Button
              variant={'outline'}
              size={'icon-sm'}
              onClick={() => {
                setIsEditing(false)
                setNewName(name)
              }}
            >
              <X />
            </Button>
          ) : (
            <Button variant={'outline'} size={'icon-sm'}>
              <Plus />
            </Button>
          )}
          {isEditing ? (
            <Button
              variant={'outline'}
              size={'icon-sm'}
              onClick={() => {
                //TODO change
                setIsEditing(false)
              }}
            >
              <Save />
            </Button>
          ) : (
            <Button
              variant={'outline'}
              size={'icon-sm'}
              onClick={() => {
                setIsEditing(true)
              }}
            >
              <EditIcon />
            </Button>
          )}
          <GroupDelete name={name} />
          <CollapsibleTrigger asChild>
            <Button
              variant={'ghost'}
              size={'icon-sm'}
              className="mr-2"
              onClick={() => {
                setIsOpen((prev) => !prev)
              }}
            >
              <ChevronsUpDown />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent className="mr-4 px-2.5 py-1 border-r border-border">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

function GroupDelete({ name }: GroupProps) {
  const close = useRef<HTMLButtonElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  async function deleteGroup() {
    setIsLoading(true)
    const affected = await window.ipcAPI
      .invoke('group:delete', { name })
      .then(({ affected }) => affected)
      .catch(() => 0)
      .finally(() => {
        setIsLoading(false)
      })
    console.log(`${affected} rows affected`)
    return affected
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'destructive'} size={'icon-sm'}>
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>هل أنت متأكد؟</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <div>سيتم حذف المجموعة {`"${name}"`} وجميع الغرف التابعة لها.</div>
              <div className="text-destructive">
                يشمل الحذف جميع البيانات المتعلفة بالمجموعات والغرف, لا يمكن استرجاع البيانات
                المحذوفة بعد التأكيد.
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex [&>button]:cursor-pointer">
          <DialogClose asChild>
            <Button className="w-20" variant={'ghost'} ref={close}>
              إلغاء
            </Button>
          </DialogClose>
          <Button
            disabled={isLoading}
            onClick={async () => {
              const affected = await deleteGroup()
              if (affected == 0) {
                toast.error('فشلت العملية')
              } else {
                toast.success('تم حذف المجموعة' + `"${name}"`)
              }
              close.current?.click()
            }}
            className="flex items-center w-20"
            variant={'destructive'}
          >
            حذف
            <Trash2 className="size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type RoomEditProps = {}
function RoomEdit({}) {}
