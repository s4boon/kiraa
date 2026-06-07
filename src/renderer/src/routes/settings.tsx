import { CreatableSelect, type CreatableSelectHandle } from '@/components/creatable_select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { GroupModelType, RoomModelType } from '@shared/types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

type Props = {}

export default function settings({}: Props) {
  const [groups, setGroups] = useState<GroupModelType[]>([])
  const groupSelectRef = useRef<CreatableSelectHandle>(null)
  useEffect(() => {
    async function getGroups() {
      try {
        const { groups } = await window.ipcAPI.invoke('group:list')
        setGroups(groups)
      } catch (error) {
        toast.error('فشل تحميل المجموعات')
      }
    }
    getGroups()
  }, [])

  const group_options = useMemo(
    () =>
      groups.map((r) => ({
        value: r.name,
        label: r.name
      })),
    [groups]
  )

  return (
    <div className="[&>section]:my-2">
      <section>
        <h2>إضافة غرفة جديدة</h2>
        <form
          className="grid gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            const group_name = e.currentTarget.groupname.value
            toast.promise<{ group?: GroupModelType }>(
              () => window.ipcAPI.invoke('group:create', { name: group_name }),
              {
                loading: 'جاري التحميل',
                success: (data) => `تم إنشاء المجموعة "${data.group?.name}"`,
                error: 'فشلت العملية'
              }
            )
          }}
        >
          <Input
            type="text"
            name="groupname"
            placeholder="Group name"
            required
            onInvalid={(e) => {
              e.currentTarget.setCustomValidity('الرجاء إدخال إسم المجموعة')
            }}
            onInput={(e) => {
              e.currentTarget.setCustomValidity('')
            }}
          />
          <Button>إنشاء</Button>
        </form>
      </section>
      <Separator />
      <section>
        <h2>إضافة غرفة جديدة</h2>
        <form
          className="grid gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            const group_name = groupSelectRef.current?.getValue()?.value
            if (!group_name) {
              toast.error('الرجاء تحديد إسم المجموعة')
              return
            }
            const room_name = e.currentTarget.roomname.value
            const room_spec = e.currentTarget.roomspec.value
            toast.promise<{ room: RoomModelType }>(
              () =>
                window.ipcAPI.invoke('room:create', {
                  group_name,
                  name: room_name,
                  capacity: room_spec
                }),
              {
                loading: 'جاري التحميل',
                success: (data) => `تم إنشاء الغرفة "${data.room.name}"`,
                error: 'فشلت العملية'
              }
            )
          }}
        >
          <CreatableSelect
            options={group_options}
            placeholder="إختر مجموعة"
            inputPlaceholder="بحث"
            createLabel="مجموعة جديدة"
            ref={groupSelectRef}
          />
          <Input type="text" name="roomname" placeholder="إسم الغرفة" required />
          <Textarea className="resize-none" rows={3} name="roomspec" placeholder="معلومات إضافية" />
          <Button>إنشاء</Button>
        </form>
      </section>
    </div>
  )
}
