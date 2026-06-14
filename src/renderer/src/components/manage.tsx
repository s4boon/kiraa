import { Settings2 } from 'lucide-react'
import { Button } from './ui/button'

type Props = {}

export default function manage({}: Props) {
  return (
    <Button
      className="rounded-sm cursor-pointer"
      variant={'secondary'}
      onClick={() => {
        window.ipcAPI.invoke('window:newchild', { route: '/manage' })
      }}
    >
      <Settings2 className="size-5" />
    </Button>
  )
}
