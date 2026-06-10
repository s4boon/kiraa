import { ChevronDown, Edit, Plus, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'

type Props = {
  name: string
  parent?: boolean
}

export default function edit({ name, parent }: Props) {
  return (
    <div className="flex justify-between">
      <div>
        <Input disabled defaultValue={name} />
      </div>
      <div className="[&>button]:rounded-sm">
        <Button>
          <Plus />
        </Button>
        <Button>
          <Edit />
        </Button>
        <Button variant={'destructive'}>
          <Trash2 />
        </Button>
        <Button variant={'ghost'}>
          <ChevronDown />
        </Button>
      </div>
    </div>
  )
}
