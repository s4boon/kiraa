import {
  ArrowLeft,
  ArrowRight,
  EllipsisVertical,
  Fullscreen,
  GripVertical,
  House
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import Crumbs from './crumbs'
import Theme from './theme'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
type Props = {}

export default function navbar({}: Props) {
  const navigate = useNavigate()
  return (
    <nav className="flex gap-x-2.5 px-3 py-2 border-b border-accent-foreground/20 bg-accent items-center justify-between">
      <div className="flex gap-x-2.5 items-center">
        <Button
          variant={'secondary'}
          className="cursor-pointer"
          onClick={() => {
            window.ipcAPI.invoke('window:togglefullscreen')
          }}
        >
          <Fullscreen />
        </Button>
        <Button
          variant={'secondary'}
          className="cursor-pointer"
          onClick={() => {
            navigate('/')
          }}
        >
          <House className="size-5" />
        </Button>
        <GripVertical className="h-6 w-6 text-muted-foreground" />
        <Crumbs />
      </div>
      <div className="flex gap-x-2.5 items-center">
        <Button
          variant={'secondary'}
          className="cursor-pointer"
          onClick={() => {
            navigate(+1)
          }}
        >
          <ArrowRight />
        </Button>
        <Button
          variant={'secondary'}
          className="cursor-pointer"
          onClick={() => {
            navigate(-1)
          }}
        >
          <ArrowLeft />
        </Button>
        <Theme />
        <Backup />
      </div>
    </nav>
  )
}

function Backup() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="cursor-pointer">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-sm"
            onClick={async () => {
              toast.promise(window.ipcAPI.invoke('db:export'), {
                loading: 'جاري النسخ...',
                success: (data) => {
                  if (data.filepath) {
                    return `تم نسخ قاعدة البياتات إلى "${data.filepath}"`
                  }
                  return 'تم إلغاء العملية'
                },
                error: 'فشلت العملية'
              })
            }}
          >
            نسخ البيانات
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
